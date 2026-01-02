import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-lipana-signature',
};

// Generate secure hash for QR code validation
function generateSecureHash(ticketId: string, eventId: string, userId: string, secretKey: string): string {
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
  secretKey: string;
}): string {
  const { ticketId, ticketNumber, eventId, userId, secretKey } = params;
  const hash = generateSecureHash(ticketId, eventId, userId, secretKey);
  const timestamp = Date.now().toString(36);
  return `ENTRY|${ticketId}|${ticketNumber}|${eventId}|${hash}|${timestamp}`;
}

// Verify Lipana webhook signature
async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );
    
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Received Lipana webhook');

  try {
    const WEBHOOK_SECRET = Deno.env.get('LIPANA_WEBHOOK_SECRET');
    if (!WEBHOOK_SECRET) {
      console.error('LIPANA_WEBHOOK_SECRET not configured');
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    console.log('Webhook payload:', rawBody);

    // Verify signature
    const signature = req.headers.get('x-lipana-signature') || req.headers.get('X-Lipana-Signature');
    
    if (signature) {
      const isValid = await verifySignature(rawBody, signature, WEBHOOK_SECRET);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.log('Webhook signature verified');
    } else {
      console.log('No signature provided - proceeding without verification (dev mode)');
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    console.log('Webhook event:', event);
    console.log('Webhook data:', JSON.stringify(data));

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle payment events
    if (event === 'payment.success' || event === 'transaction.success') {
      const transactionId = data.transactionId || data.transaction_id;
      const checkoutRequestId = data.checkoutRequestID || data.checkout_request_id;
      
      console.log('Processing successful payment:', transactionId);

      // Find the payment by transaction ID or checkout request ID
      let paymentQuery = supabaseClient
        .from('payments')
        .select('*')
        .eq('payment_status', 'pending');

      // Try to match by transaction_id stored in metadata
      const { data: payments, error: fetchError } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching payments:', fetchError);
        throw new Error('Failed to fetch payments');
      }

      // Find matching payment
      let payment = null;
      for (const p of payments || []) {
        const metadata = p.metadata as any;
        if (
          p.transaction_id === transactionId ||
          metadata?.lipana_transaction_id === transactionId ||
          metadata?.checkout_request_id === checkoutRequestId
        ) {
          payment = p;
          break;
        }
      }

      if (!payment) {
        console.log('No matching pending payment found for transaction:', transactionId);
        return new Response(JSON.stringify({ received: true, message: 'No matching payment' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Found matching payment:', payment.id);

      // Update payment status
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({
          payment_status: 'completed',
          transaction_id: transactionId,
          metadata: {
            ...payment.metadata,
            mpesa_receipt: data.mpesaReceiptNumber || data.receipt_number,
            completed_at: new Date().toISOString()
          }
        })
        .eq('id', payment.id);

      if (updateError) {
        console.error('Failed to update payment:', updateError);
        throw new Error('Failed to update payment status');
      }

      console.log('Payment marked as completed');

      // Generate tickets
      const metadata = payment.metadata as any;
      const ticketValidations = metadata?.tickets || [];
      const customerInfo = metadata?.customer_info || {};
      const SECRET_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

      const ticketsToCreate = [];
      for (const ticketOrder of ticketValidations) {
        for (let i = 0; i < ticketOrder.quantity; i++) {
          const ticketId = crypto.randomUUID();
          const ticketNumber = `ENT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          
          const qrCode = generateQRCodeData({
            ticketId,
            ticketNumber,
            eventId: payment.event_id,
            userId: payment.user_id,
            secretKey: SECRET_KEY
          });
          
          ticketsToCreate.push({
            id: ticketId,
            user_id: payment.user_id,
            event_id: payment.event_id,
            ticket_type_id: ticketOrder.ticketTypeId,
            payment_id: payment.id,
            ticket_number: ticketNumber,
            qr_code: qrCode,
            attendee_name: customerInfo.name || '',
            attendee_email: customerInfo.email || '',
            attendee_phone: customerInfo.phone || '',
            status: 'valid'
          });
        }

        // Update ticket quantities
        const { error: updateTicketError } = await supabaseClient.rpc(
          'increment_ticket_sold',
          { 
            ticket_type_id: ticketOrder.ticketTypeId,
            quantity: ticketOrder.quantity
          }
        );

        if (updateTicketError) {
          console.error('Failed to update ticket quantity:', updateTicketError);
        }
      }

      if (ticketsToCreate.length > 0) {
        const { data: tickets, error: ticketsError } = await supabaseClient
          .from('tickets')
          .insert(ticketsToCreate)
          .select();

        if (ticketsError) {
          console.error('Ticket creation error:', ticketsError);
        } else {
          console.log(`Created ${tickets?.length || 0} tickets`);

          // Send email notification
          try {
            await supabaseClient.functions.invoke('send-ticket-email', {
              body: {
                email: customerInfo.email,
                name: customerInfo.name,
                tickets: tickets,
                paymentId: payment.id,
                eventTitle: metadata?.event_title
              }
            });
            console.log('Ticket email sent');
          } catch (emailError) {
            console.error('Email sending failed:', emailError);
          }
        }
      }

      return new Response(JSON.stringify({ received: true, status: 'success' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (event === 'payment.failed' || event === 'transaction.failed') {
      const transactionId = data.transactionId || data.transaction_id;
      console.log('Processing failed payment:', transactionId);

      // Find and update the failed payment
      const { data: payments } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('payment_status', 'pending');

      for (const p of payments || []) {
        const metadata = p.metadata as any;
        if (
          p.transaction_id === transactionId ||
          metadata?.lipana_transaction_id === transactionId
        ) {
          await supabaseClient
            .from('payments')
            .update({
              payment_status: 'failed',
              metadata: { ...metadata, failure_reason: data.reason || 'Payment failed' }
            })
            .eq('id', p.id);
          
          console.log('Payment marked as failed:', p.id);
          break;
        }
      }

      return new Response(JSON.stringify({ received: true, status: 'failed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Unknown event type
    console.log('Unknown webhook event:', event);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
