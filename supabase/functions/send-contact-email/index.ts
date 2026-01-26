import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone: string;
  company?: string;
  subject: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, company, subject, message }: ContactEmailRequest = await req.json();

    // Validate required fields
    if (!name || !email || !phone || !subject) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build email content
    const emailContent = `
New Contact Form Submission from EntryHive

From: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company || 'Not provided'}

Subject: ${subject}

Message:
${message || 'No message provided'}
    `.trim();

    console.log("Sending contact email to ndungueliud2021@gmail.com");

    // Call the external email API
    const response = await fetch("https://www.fixafrica.co.ke/carenthusiast/api/email/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: `EntryHive Contact: ${subject}`,
        content: emailContent,
        recipient: "ndungueliud2021@gmail.com",
        from_name: "EntryHive Contact Form",
        reply_to: email,
        reply_name: name,
      }),
    });

    const result = await response.json();
    console.log("Email API response:", result);

    if (result.success) {
      return new Response(
        JSON.stringify({ success: true, message: "Email sent successfully" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      console.error("Email API error:", result.message);
      return new Response(
        JSON.stringify({ success: false, message: result.message || "Failed to send email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  } catch (error: unknown) {
    console.error("Error in send-contact-email function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
