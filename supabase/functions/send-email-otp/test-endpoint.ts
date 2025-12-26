// Test endpoint to verify Edge Function is working
// Call this endpoint to test email sending without going through the full app flow

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method === "GET") {
    // Simple health check endpoint
    return new Response(
      JSON.stringify({
        status: 'ok',
        message: 'Test endpoint is working',
        timestamp: new Date().toISOString(),
        instructions: {
          method: 'POST',
          body: {
            email: 'test@example.com',
          },
          description: 'Send a test email to verify Edge Function is working'
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  if (req.method === "POST") {
    try {
      const { email } = await req.json();

      if (!email) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Email address is required',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Generate test OTP code
      const testCode = Math.floor(100000 + Math.random() * 900000).toString();

      console.log(`[TEST] Calling send-email-otp Edge Function with email: ${email}`);

      // Call the actual send-email-otp Edge Function
      // @ts-ignore: Deno is a global in Deno runtime
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      // @ts-ignore: Deno is a global in Deno runtime
      const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!supabaseUrl || !supabaseServiceRoleKey) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Missing Supabase environment variables',
            details: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set',
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-email-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceRoleKey}`,
          },
          body: JSON.stringify({
            to: email,
            code: testCode,
          }),
        }
      );

      const result = await response.json();

      console.log(`[TEST] Response from send-email-otp:`, result);

      return new Response(
        JSON.stringify({
          success: response.ok,
          testCode: testCode,
          edgeFunctionResponse: result,
          message: response.ok 
            ? `Test email sent successfully to ${email}` 
            : 'Failed to send test email',
        }),
        {
          status: response.ok ? 200 : 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error: any) {
      console.error('[TEST] Error:', error);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Test endpoint error',
          details: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  return new Response(
    JSON.stringify({
      error: 'Method not allowed',
    }),
    {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});