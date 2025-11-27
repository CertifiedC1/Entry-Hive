import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  email: string;
  name: string;
  tickets: Array<{
    ticket_number: string;
    qr_code: string;
    event_id: string;
  }>;
  paymentId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, tickets, paymentId }: EmailRequest = await req.json();
    
    console.log(`Sending ticket email to ${email} for ${tickets.length} tickets`);

    // TODO: Integrate with Resend when API key is available
    // const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    // Placeholder: Log email details
    const emailContent = {
      to: email,
      subject: 'Your Event Tickets - SDTS',
      html: `
        <h1>Hello ${name}!</h1>
        <p>Thank you for your purchase. Your tickets are ready!</p>
        <h2>Your Tickets:</h2>
        <ul>
          ${tickets.map(ticket => `
            <li>
              <strong>Ticket #:</strong> ${ticket.ticket_number}<br>
              <strong>QR Code:</strong> ${ticket.qr_code}
            </li>
          `).join('')}
        </ul>
        <p>Please present these tickets at the venue entrance.</p>
        <p>Payment ID: ${paymentId}</p>
      `
    };

    console.log('Email content prepared:', emailContent);

    // When Resend is integrated:
    /*
    const resend = new Resend(RESEND_API_KEY);
    const emailResponse = await resend.emails.send({
      from: 'SDTS <noreply@sdts.com>',
      to: [email],
      subject: emailContent.subject,
      html: emailContent.html,
    });
    */

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email notification queued (placeholder mode)',
        emailContent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Email error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Email sending failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});