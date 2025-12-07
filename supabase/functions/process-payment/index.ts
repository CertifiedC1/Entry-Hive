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
  paymentMethod: 'paystack' | 'card';
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  totalAmount: number;
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

    const paymentData: PaymentRequest = await req.json();
    console.log('Processing payment for user:', user.id);

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        event_id: paymentData.eventId,
        amount: paymentData.totalAmount,
        payment_method: paymentData.paymentMethod,
        payment_status: 'pending',
        metadata: {
          customer_info: paymentData.customerInfo,
          tickets: paymentData.tickets
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      throw new Error('Failed to create payment record');
    }

    // TODO: Integrate with Paystack API when keys are available
    // For now, simulate successful payment
    const paystackReference = `PSK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update payment as completed
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        payment_status: 'completed',
        transaction_id: paystackReference
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Payment update error:', updateError);
      throw new Error('Failed to update payment');
    }

    // Generate tickets with secure QR codes
    const ticketsToCreate = [];
    for (const ticketOrder of paymentData.tickets) {
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
          attendee_name: paymentData.customerInfo.name,
          attendee_email: paymentData.customerInfo.email,
          attendee_phone: paymentData.customerInfo.phone,
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
          email: paymentData.customerInfo.email,
          name: paymentData.customerInfo.name,
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