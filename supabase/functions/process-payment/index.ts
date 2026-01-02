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
  paymentMethod: 'mpesa';
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
  if (!data.eventId || !UUID_REGEX.test(data.eventId)) {
    throw new Error('Invalid event ID format');
  }

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

  if (data.paymentMethod !== 'mpesa') {
    throw new Error('Only M-Pesa payment is supported');
  }

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

  if (!phone || !PHONE_REGEX.test(phone.replace(/[\s-]/g, ''))) {
    throw new Error('Invalid phone format');
  }

  if (typeof data.totalAmount !== 'number' || data.totalAmount < 10) {
    throw new Error('Minimum amount is KES 10');
  }

  return data as PaymentRequest;
}

// Format phone number for M-Pesa (254XXXXXXXXX format)
function formatPhoneForMpesa(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  } else if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  }
  
  // Ensure it starts with 254
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  
  return '+' + cleaned;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LIPANA_SECRET_KEY = Deno.env.get('LIPANA_SECRET_KEY');
    if (!LIPANA_SECRET_KEY) {
      console.error('LIPANA_SECRET_KEY not configured');
      throw new Error('Payment service not configured');
    }

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

    const rawData = await req.json();
    const paymentData = validatePaymentRequest(rawData);
    
    console.log('Processing M-Pesa payment for user:', user.id);

    // SERVER-SIDE PRICE RECALCULATION
    let calculatedTotal = 0;
    const ticketValidations: Array<{
      ticketTypeId: string;
      quantity: number;
      price: number;
      name: string;
    }> = [];

    for (const ticketOrder of paymentData.tickets) {
      const { data: ticketType, error: ticketError } = await supabaseClient
        .from('ticket_types')
        .select('id, name, price, quantity_available, quantity_sold, event_id')
        .eq('id', ticketOrder.ticketTypeId)
        .single();

      if (ticketError || !ticketType) {
        console.error('Ticket type fetch error:', ticketError);
        throw new Error(`Invalid ticket type: ${ticketOrder.ticketTypeId}`);
      }

      if (ticketType.event_id !== paymentData.eventId) {
        throw new Error('Ticket type does not belong to the specified event');
      }

      const remaining = ticketType.quantity_available - (ticketType.quantity_sold || 0);
      if (remaining < ticketOrder.quantity) {
        throw new Error(`Only ${remaining} tickets available for "${ticketType.name}"`);
      }

      calculatedTotal += ticketType.price * ticketOrder.quantity;
      
      ticketValidations.push({
        ticketTypeId: ticketType.id,
        quantity: ticketOrder.quantity,
        price: ticketType.price,
        name: ticketType.name
      });
    }

    if (Math.abs(calculatedTotal - paymentData.totalAmount) > 0.01) {
      console.error(`Price mismatch! Server: ${calculatedTotal}, Client: ${paymentData.totalAmount}`);
      throw new Error('Price verification failed. Please refresh and try again.');
    }

    // Verify event
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

    const eventDate = new Date(event.event_date);
    if (eventDate < new Date()) {
      throw new Error('Cannot purchase tickets for past events');
    }

    // Create pending payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        event_id: paymentData.eventId,
        amount: calculatedTotal,
        payment_method: 'mpesa',
        payment_status: 'pending',
        metadata: {
          customer_info: {
            name: paymentData.customerInfo.name.trim(),
            email: paymentData.customerInfo.email.trim().toLowerCase(),
            phone: paymentData.customerInfo.phone.trim()
          },
          tickets: ticketValidations,
          event_title: event.title
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      throw new Error('Failed to create payment record');
    }

    console.log('Created pending payment:', payment.id);

    // Format phone number for M-Pesa
    const formattedPhone = formatPhoneForMpesa(paymentData.customerInfo.phone);
    console.log('Initiating STK push to:', formattedPhone);

    // Call Lipana STK Push API
    const stkResponse = await fetch('https://api.lipana.dev/v1/transactions/push-stk', {
      method: 'POST',
      headers: {
        'x-api-key': LIPANA_SECRET_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: formattedPhone,
        amount: Math.round(calculatedTotal) // Ensure integer amount
      })
    });

    const stkResult = await stkResponse.json();
    console.log('Lipana STK response:', JSON.stringify(stkResult));

    if (!stkResponse.ok || !stkResult.success) {
      // Update payment as failed
      await supabaseClient
        .from('payments')
        .update({ payment_status: 'failed' })
        .eq('id', payment.id);
      
      throw new Error(stkResult.message || 'Failed to initiate M-Pesa payment');
    }

    // Store transaction details for webhook matching
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        transaction_id: stkResult.data?.transactionId || null,
        metadata: {
          ...payment.metadata,
          checkout_request_id: stkResult.data?.checkoutRequestID,
          lipana_transaction_id: stkResult.data?.transactionId
        }
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Failed to update payment with transaction ID:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentId: payment.id,
        message: stkResult.data?.message || 'STK push sent. Please check your phone to complete payment.',
        transactionId: stkResult.data?.transactionId,
        checkoutRequestId: stkResult.data?.checkoutRequestID
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
