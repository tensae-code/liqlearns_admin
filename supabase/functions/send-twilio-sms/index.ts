declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const TWILIO_ACCOUNT_SID = Deno?.env?.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno?.env?.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno?.env?.get('TWILIO_PHONE_NUMBER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TwilioRequest {
  to: string;
  message: string;
}

// Validate phone number format (E.164 format)
function validatePhoneNumber(phone: string): { valid: boolean; formatted?: string; error?: string } {
  // Remove all non-numeric characters except + at start
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If doesn't start with +, assume US number and add +1
  if (!cleaned.startsWith('+')) {
    cleaned = '+1' + cleaned;
  }
  
  // E.164 format: + followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  
  if (!e164Regex.test(cleaned)) {
    return {
      valid: false,
      error: `Invalid phone format. Expected E.164 format (e.g., +1234567890). Received: ${phone}`
    };
  }
  
  return { valid: true, formatted: cleaned };
}

Deno?.serve(async (req) => {
  // Handle CORS preflight requests
  if (req?.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body with error handling
    let requestBody: TwilioRequest;
    try {
      requestBody = await req?.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      // FIXED: Return 200 with error details instead of 400
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request body',
          message: 'Request body must be valid JSON',
        }),
        {
          status: 200, // Changed from 400 to 200
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { to, message } = requestBody;
    
    // Validate required fields
    if (!to || !message) {
      console.error('Missing required fields:', { to: !!to, message: !!message });
      // FIXED: Return 200 with error details instead of 400
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields',
          message: 'Both "to" and "message" fields are required',
        }),
        {
          status: 200, // Changed from 400 to 200
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // NEW: Validate phone number format
    const phoneValidation = validatePhoneNumber(to);
    if (!phoneValidation.valid) {
      console.error('Invalid phone format:', phoneValidation.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid phone number format',
          message: phoneValidation.error,
          hint: 'Phone number must be in E.164 format (e.g., +1234567890)',
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Validate Twilio credentials
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Twilio credentials not configured:', {
        hasAccountSid: !!TWILIO_ACCOUNT_SID,
        hasAuthToken: !!TWILIO_AUTH_TOKEN,
        hasPhoneNumber: !!TWILIO_PHONE_NUMBER,
      });
      // FIXED: Return 200 with error details instead of 500
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Twilio service not configured',
          message: 'Missing Twilio credentials in environment variables',
          hint: 'Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER',
        }),
        {
          status: 200, // Changed from 500 to 200
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('Attempting to send SMS:', {
      to: phoneValidation.formatted,
      from: TWILIO_PHONE_NUMBER,
      messageLength: message.length,
    });

    // Create Twilio request
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    
    // NEW: Use validated/formatted phone number
    const formData = new URLSearchParams({
      To: phoneValidation.formatted!,
      From: TWILIO_PHONE_NUMBER,
      Body: message,
    });

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const data = await response?.json();

    if (!response?.ok) {
      console.error('Twilio API error:', {
        status: response.status,
        statusText: response.statusText,
        twilioError: data,
      });
      // IMPORTANT: Still return 200 OK so the app doesn't crash
      // But include detailed error info for debugging
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Twilio API error',
          message: data?.message || 'Failed to send SMS via Twilio',
          details: {
            code: data?.code,
            moreInfo: data?.more_info,
            status: data?.status,
          },
          twilioStatus: response.status,
        }),
        {
          status: 200, // Changed: Always return 200 to prevent app crashes
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('SMS sent successfully:', {
      sid: data?.sid,
      status: data?.status,
      to: phoneValidation.formatted,
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        messageSid: data?.sid,
        status: data?.status,
        to: phoneValidation.formatted,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Unexpected error in send-twilio-sms function:', error);
    // FIXED: Return 200 with error details instead of 500
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        type: error instanceof Error ? error.name : 'UnknownError',
      }),
      {
        status: 200, // Changed from 500 to 200
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});