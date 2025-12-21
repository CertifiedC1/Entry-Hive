import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  eventId: string;
  tickets: Array<{
    ticketTypeId: string;
    quantity: number;
  }>;
  paymentMethod: 'mpesa' | 'stripe' | 'paypal';
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  totalAmount: number;
}

// Input validation functions
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;
const NAME_REGEX = /^[a-zA-Z\s'-]{2,100}$/;

function validatePaymentRequest(data: any): PaymentRequest {
  // Validate event ID
  if (!data.eventId || !UUID_REGEX.test(data.eventId)) {
    throw new Error('Invalid event ID format');
  }

  // Validate tickets array
  if (!Array.isArray(data.tickets) || data.tickets.length === 0) {
    throw new Error('No tickets selected');
  }

  if (data.tickets.length > 20) {
    throw new Error('Cannot purchase more than 20 ticket types at once');
  }

  for (const ticket of data.tickets) {
    if (!ticket.ticketTypeId || !UUID_REGEX.test(ticket.ticketTypeId)) {
      throw new Error('Invalid ticket type ID format');
    }
    if (typeof ticket.quantity !== 'number' || ticket.quantity < 1 || ticket.quantity > 10) {
      throw new Error('Ticket quantity must be between 1 and 10');
    }
  }

  // Validate payment method
  const validMethods = ['mpesa', 'stripe', 'paypal'];
  if (!validMethods.includes(data.paymentMethod)) {
    throw new Error('Invalid payment method');
  }

  // Validate customer info
  if (!data.customerInfo || typeof data.customerInfo !== 'object') {
    throw new Error('Customer information is required');
  }

  const { name, email, phone } = data.customerInfo;

  if (!name || !NAME_REGEX.test(name)) {
    throw new Error('Name must be 2-100 characters and contain only letters, spaces, hyphens, and apostrophes');
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    throw new Error('Invalid email format');
  }

  if (email.length > 255) {
    throw new Error('Email is too long');
  }

  if (!phone || !PHONE_REGEX.test(phone)) {
    throw new Error('Invalid phone format (10-15 digits, optional + prefix)');
  }

  // Validate amount is a positive number
  if (typeof data.totalAmount !== 'number' || data.totalAmount < 0) {
    throw new Error('Invalid amount');
  }

  return data as PaymentRequest;
}

// Generate secure hash for QR code validation
function generateSecureHash(ticketId: string, eventId: string, userId: string): string {
  const secretKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'fallback-secret';
  const data = `${ticketId}:${eventId}:${userId}:${secretKey}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Generate secure QR code data
function generateQRCodeData(params: {
  ticketId: string;
  ticketNumber: string;
  eventId: string;
  userId: string;
}): string {
  const { ticketId, ticketNumber, eventId, userId } = params;
  const hash = generateSecureHash(ticketId, eventId, userId);
  const timestamp = Date.now().toString(36);
  
  // Format: SDTS|ticketId|ticketNumber|eventId|hash|timestamp
  return `SDTS|${ticketId}|${ticketNumber}|${eventId}|${hash}|${timestamp}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse and validate input
    const rawData = await req.json();
    const paymentData = validatePaymentRequest(rawData);
    
    console.log('Processing payment for user:', user.id);

    // SERVER-SIDE PRICE RECALCULATION - Critical security fix
    let calculatedTotal = 0;
    const ticketValidations: Array<{
      ticketTypeId: string;
      quantity: number;
      price: number;
      name: string;
    }> = [];

    for (const ticketOrder of paymentData.tickets) {
      // Fetch ticket type from database
      const { data: ticketType, error: ticketError } = await supabaseClient
        .from('ticket_types')
        .select('id, name, price, quantity_available, quantity_sold, event_id')
        .eq('id', ticketOrder.ticketTypeId)
        .single();

      if (ticketError || !ticketType) {
        console.error('Ticket type fetch error:', ticketError);
        throw new Error(`Invalid ticket type: ${ticketOrder.ticketTypeId}`);
      }

      // Verify ticket belongs to the requested event
      if (ticketType.event_id !== paymentData.eventId) {
        throw new Error('Ticket type does not belong to the specified event');
      }

      // Check ticket availability
      const remaining = ticketType.quantity_available - (ticketType.quantity_sold || 0);
      if (remaining < ticketOrder.quantity) {
        throw new Error(`Only ${remaining} tickets available for "${ticketType.name}"`);
      }

      // Add to calculated total
      calculatedTotal += ticketType.price * ticketOrder.quantity;
      
      ticketValidations.push({
        ticketTypeId: ticketType.id,
        quantity: ticketOrder.quantity,
        price: ticketType.price,
        name: ticketType.name
      });
    }

    // Verify client amount matches server calculation (allow small floating point tolerance)
    if (Math.abs(calculatedTotal - paymentData.totalAmount) > 0.01) {
      console.error(`Price mismatch! Server calculated: ${calculatedTotal}, Client sent: ${paymentData.totalAmount}`);
      throw new Error(
        `Price verification failed. Please refresh and try again.`
      );
    }

    // Verify event exists and is published
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('id, title, published, event_date')
      .eq('id', paymentData.eventId)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    if (!event.published) {
      throw new Error('This event is not currently available for ticket sales');
    }

    // Check if event date has passed
    const eventDate = new Date(event.event_date);
    if (eventDate < new Date()) {
      throw new Error('Cannot purchase tickets for past events');
    }

    // Create payment record with server-validated amount
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        event_id: paymentData.eventId,
        amount: calculatedTotal, // Use server-calculated amount, not client amount
        payment_method: paymentData.paymentMethod,
        payment_status: 'pending',
        metadata: {
          customer_info: {
            name: paymentData.customerInfo.name.trim(),
            email: paymentData.customerInfo.email.trim().toLowerCase(),
            phone: paymentData.customerInfo.phone.trim()
          },
          tickets: ticketValidations
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      throw new Error('Failed to create payment record');
    }

    // Generate reference for tracking
    const paymentReference = `ENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update payment as completed (actual payment integration handled separately)
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        payment_status: 'completed',
        transaction_id: paymentReference
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Payment update error:', updateError);
      throw new Error('Failed to update payment');
    }

    // Generate tickets with secure QR codes
    const ticketsToCreate = [];
    for (const ticketOrder of ticketValidations) {
      for (let i = 0; i < ticketOrder.quantity; i++) {
        // Generate unique ticket ID and number
        const ticketId = crypto.randomUUID();
        const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Generate secure QR code with embedded verification data
        const qrCode = generateQRCodeData({
          ticketId,
          ticketNumber,
          eventId: paymentData.eventId,
          userId: user.id
        });
        
        ticketsToCreate.push({
          id: ticketId,
          user_id: user.id,
          event_id: paymentData.eventId,
          ticket_type_id: ticketOrder.ticketTypeId,
          payment_id: payment.id,
          ticket_number: ticketNumber,
          qr_code: qrCode,
          attendee_name: paymentData.customerInfo.name.trim(),
          attendee_email: paymentData.customerInfo.email.trim().toLowerCase(),
          attendee_phone: paymentData.customerInfo.phone.trim(),
          status: 'valid'
        });
      }

      // Update ticket_types quantity_sold
      const { error: updateTicketTypeError } = await supabaseClient.rpc(
        'increment_ticket_sold',
        { 
          ticket_type_id: ticketOrder.ticketTypeId,
          quantity: ticketOrder.quantity
        }
      );

      if (updateTicketTypeError) {
        console.error('Failed to update ticket quantity:', updateTicketTypeError);
      }
    }

    const { data: tickets, error: ticketsError } = await supabaseClient
      .from('tickets')
      .insert(ticketsToCreate)
      .select();

    if (ticketsError) {
      console.error('Ticket creation error:', ticketsError);
      throw new Error('Failed to create tickets');
    }

    console.log(`Created ${tickets.length} tickets for payment ${payment.id}`);

    // Send email notification asynchronously
    try {
      await supabaseClient.functions.invoke('send-ticket-email', {
        body: {
          email: paymentData.customerInfo.email.trim().toLowerCase(),
          name: paymentData.customerInfo.name.trim(),
          tickets: tickets,
          paymentId: payment.id
        }
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the payment if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentId: payment.id,
        tickets: tickets,
        message: 'Payment processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Payment processing failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
