import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EmailRequest {
  to: string;
  code: string;
}

// Declare Deno namespace for type safety
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// 🚨 START LOGGING: Edge Function invoked
console.log('='.repeat(80));
console.log(`[EDGE FUNCTION STARTED] send-email-otp (Resend API) initialized at ${new Date().toISOString()}`);
console.log('='.repeat(80));

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`\n[REQUEST ${requestId}] ${req.method} ${req.url}`);
  console.log(`[REQUEST ${requestId}] Headers:`, JSON.stringify([...req.headers.entries()]));

  // ✅ CORS preflight
  if (req.method === "OPTIONS") {
    console.log(`[REQUEST ${requestId}] CORS preflight request`);
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log(`[REQUEST ${requestId}] Parsing request body...`);
    let requestBody: any;
    
    try {
      requestBody = await req.json();
      console.log(`[REQUEST ${requestId}] Request body received with to: ${requestBody?.to || 'MISSING'}, code: ${requestBody?.code ? '[PRESENT]' : 'MISSING'}`);
    } catch (parseError: any) {
      console.error(`[REQUEST ${requestId}] Failed to parse request body:`, parseError.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON in request body',
          details: parseError.message,
          requestId,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { to, code }: EmailRequest = requestBody;

    // Validate inputs
    if (!to || !code) {
      console.error(`[REQUEST ${requestId}] Missing required fields - to: ${!!to}, code: ${!!code}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: to and code',
          requestId,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      console.error(`[REQUEST ${requestId}] Invalid email format: ${to}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid email format',
          requestId,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    console.log(`[REQUEST ${requestId}] Environment check - RESEND_API_KEY: ${resendApiKey ? '[SET]' : '[MISSING]'}`);

    if (!resendApiKey) {
      console.error(`[REQUEST ${requestId}] Missing RESEND_API_KEY environment variable`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email service configuration missing. Please ensure RESEND_API_KEY is set.',
          requestId,
          troubleshooting: [
            'Go to https://resend.com/api-keys',
            'Create a new API key',
            'Set RESEND_API_KEY environment variable in Supabase Edge Functions settings',
            'Ensure your Resend account has a verified domain',
          ],
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[REQUEST ${requestId}] Preparing to send email to: ${to}`);

    // Create HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #ffffff;
          }
          .header { 
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content { 
            background: #f9fafb; 
            padding: 30px; 
            border-radius: 0 0 10px 10px;
          }
          .content h2 {
            color: #1f2937;
            font-size: 20px;
            margin-top: 0;
          }
          .code-box { 
            background: white; 
            border: 2px dashed #f97316; 
            border-radius: 8px; 
            padding: 20px; 
            text-align: center; 
            margin: 20px 0;
          }
          .code { 
            font-size: 36px; 
            font-weight: bold; 
            letter-spacing: 10px; 
            color: #f97316;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 15px 0;
            border-radius: 4px;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #6b7280; 
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 LiqLearns Email Verification</h1>
          </div>
          <div class="content">
            <h2>Welcome to LiqLearns!</h2>
            <p>You have requested email verification. Please use the code below to verify your email address:</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <div class="warning">
              <strong>⏰ This code will expire in 10 minutes.</strong>
            </div>
            <p>If you did not request this code, please ignore this email or contact our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} LiqLearns. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create plain text version as fallback
    const textContent = `
LiqLearns Email Verification

Welcome to LiqLearns!

You have requested email verification. Please use the code below to verify your email address:

Verification Code: ${code}

⚠️ This code will expire in 10 minutes.

If you did not request this code, please ignore this email.

© ${new Date().getFullYear()} LiqLearns. All rights reserved.
This is an automated message, please do not reply.
    `.trim();

    try {
      console.log(`[REQUEST ${requestId}] Calling Resend API...`);
      
      // Call Resend API
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'noreply@liqlearns.com',
          to: [to],
          subject: `Your LiqLearns Verification Code: ${code}`,
          html: htmlContent,
          text: textContent,
        }),
      });

      console.log(`[REQUEST ${requestId}] Resend API response status: ${resendResponse.status}`);

      const resendData = await resendResponse.json();
      console.log(`[REQUEST ${requestId}] Resend API response data:`, JSON.stringify(resendData));

      if (!resendResponse.ok) {
        console.error(`[REQUEST ${requestId}] ❌ Resend API error:`, resendData);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to send email via Resend API',
            details: resendData.message || 'Unknown error occurred with Resend service',
            statusCode: resendResponse.status,
            requestId,
            timestamp: new Date().toISOString(),
            troubleshooting: [
              'Ensure RESEND_API_KEY is correctly set in Supabase Edge Functions secrets',
              'Verify your Resend account has a verified domain',
              'Check that the from address domain is verified in Resend',
              'Ensure your Resend account has sufficient credits',
              'Check Resend dashboard for more details: https://resend.com/emails',
            ],
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log(`[REQUEST ${requestId}] ✅ Email sent successfully via Resend`);
      console.log(`[REQUEST ${requestId}] Resend email ID: ${resendData.id || 'N/A'}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Verification code sent successfully via Resend',
          emailId: resendData.id,
          from: 'noreply@liqlearns.com',
          to: to,
          requestId,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (resendError: any) {
      console.error(`[REQUEST ${requestId}] ❌ Resend API error:`, resendError);
      console.error(`[REQUEST ${requestId}] Error stack:`, resendError.stack);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send email via Resend API',
          details: resendError.message || 'Unknown error occurred with Resend service',
          errorType: resendError.name || 'UnknownError',
          requestId,
          timestamp: new Date().toISOString(),
          troubleshooting: [
            'Check network connectivity to Resend API',
            'Ensure RESEND_API_KEY is correctly set',
            'Verify Resend account status',
            'Check Resend dashboard for rate limits or issues',
          ],
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: any) {
    console.error(`[REQUEST ${requestId}] ❌ Fatal error in send-email-otp function:`, error);
    console.error(`[REQUEST ${requestId}] Error stack:`, error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message || 'An unexpected error occurred',
        errorType: error.name || 'UnknownError',
        requestId,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});