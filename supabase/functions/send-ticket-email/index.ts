import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TicketData {
  ticket_number: string;
  qr_code: string;
  ticket_type: string;
  price: number;
}

interface EmailRequest {
  email: string;
  name: string;
  phone: string;
  tickets: TicketData[];
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventLocation: string;
  totalAmount: number;
  transactionId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      name, 
      phone,
      tickets, 
      eventTitle,
      eventDate,
      eventVenue,
      eventLocation,
      totalAmount,
      transactionId
    }: EmailRequest = await req.json();
    
    console.log(`Sending ticket email to ${email} for ${tickets.length} tickets`);

    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const ticketRows = tickets.map((ticket, index) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="background: linear-gradient(135deg, #d4a017, #f4c542); color: #1a1a1a; padding: 8px 15px; border-radius: 5px; font-weight: bold;">
              TICKET ${index + 1}
            </div>
            <div>
              <p style="margin: 0; font-weight: 600; color: #333;">${ticket.ticket_type}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666; font-family: monospace;">${ticket.ticket_number}</p>
            </div>
          </div>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: right;">
          <p style="margin: 0; font-weight: 600; color: #d4a017;">KES ${ticket.price.toLocaleString()}</p>
        </td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your EntryHive Tickets</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1a1a1a, #2d2d2d); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: #d4a017; font-size: 28px;">🐝 EntryHive</h1>
            <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px;">Your Digital Ticketing Partner</p>
          </div>
          
          <!-- Thank You Message -->
          <div style="padding: 30px; text-align: center; background: linear-gradient(135deg, #d4a017, #f4c542);">
            <h2 style="margin: 0; color: #1a1a1a; font-size: 24px;">Thank You for Your Purchase! 🎉</h2>
            <p style="margin: 15px 0 0 0; color: #333;">Your tickets are ready and waiting for you!</p>
          </div>

          <!-- Attendee Info -->
          <div style="padding: 25px; background: #fafafa; border-bottom: 1px solid #e0e0e0;">
            <h3 style="margin: 0 0 15px 0; color: #d4a017; font-size: 14px; text-transform: uppercase;">Attendee Information</h3>
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">${name}</p>
            <p style="margin: 5px 0; color: #666;">${email}</p>
            <p style="margin: 5px 0; color: #666;">${phone}</p>
          </div>

          <!-- Event Details -->
          <div style="padding: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #d4a017; font-size: 14px; text-transform: uppercase;">Event Details</h3>
            <h2 style="margin: 0; color: #333; font-size: 22px;">${eventTitle}</h2>
            <p style="margin: 10px 0; color: #666;">
              📅 ${formattedDate}
            </p>
            <p style="margin: 10px 0; color: #666;">
              📍 ${eventVenue}, ${eventLocation}
            </p>
          </div>

          <!-- Tickets -->
          <div style="padding: 0 25px 25px 25px;">
            <h3 style="margin: 0 0 15px 0; color: #d4a017; font-size: 14px; text-transform: uppercase;">Your Tickets</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${ticketRows}
            </table>
          </div>

          <!-- Total -->
          <div style="padding: 20px 25px; background: #1a1a1a;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #999; font-size: 14px;">Total Amount Paid</span>
              <span style="color: #d4a017; font-size: 24px; font-weight: bold;">KES ${totalAmount.toLocaleString()}</span>
            </div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Transaction ID: ${transactionId}</p>
          </div>

          <!-- Instructions -->
          <div style="padding: 25px; background: #fff9e6; border-left: 4px solid #d4a017;">
            <h3 style="margin: 0 0 10px 0; color: #333;">📱 How to Use Your Tickets</h3>
            <ol style="margin: 0; padding-left: 20px; color: #666; line-height: 1.8;">
              <li>Save this email or download your tickets from the EntryHive app</li>
              <li>Present the QR code at the venue entrance</li>
              <li>The organizer will scan your ticket to validate entry</li>
              <li>Enjoy the event!</li>
            </ol>
          </div>

          <!-- Important Note -->
          <div style="padding: 25px; text-align: center; background: #fafafa;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              ⚠️ Each ticket can only be used once. Keep your QR codes secure and don't share them.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding: 25px; text-align: center; background: #1a1a1a;">
            <p style="margin: 0; color: #d4a017; font-size: 16px; font-weight: 600;">🐝 EntryHive</p>
            <p style="margin: 10px 0; color: #999; font-size: 12px;">Your Trusted Digital Ticketing Platform</p>
            <p style="margin: 15px 0 0 0; color: #666; font-size: 11px;">
              Need help? Contact us at support@entryhive.com | +254 711 653 881
            </p>
            <p style="margin: 10px 0 0 0; color: #444; font-size: 11px;">
              © ${new Date().getFullYear()} EntryHive. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "EntryHive <onboarding@resend.dev>",
        to: [email],
        subject: `🎟️ Your Tickets for ${eventTitle} - EntryHive`,
        html: emailHtml,
      }),
    });

    const emailResponse = await res.json();
    
    if (!res.ok) {
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ticket email sent successfully',
        emailId: emailResponse.id
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
