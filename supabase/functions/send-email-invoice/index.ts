import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvoiceRequest {
  to: string;
  userId: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  additionalInfo?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { to, userId, planName, billingCycle, amount, currency, additionalInfo }: InvoiceRequest = await req.json();

    // Get user details
    const { data: userData, error: userError } = await supabaseClient
      .from('user_profiles')
      .select('full_name, username')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Generate invoice ID
    const invoiceId = `INV-${Date.now()}-${userId.slice(0, 8).toUpperCase()}`;

    // Email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Invoice - LiqLearns</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #9333ea 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">LiqLearns</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Payment Invoice</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Hi <strong>${userData.full_name}</strong>,
            </p>
            
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 30px;">
              Thank you for choosing LiqLearns! Below is your payment invoice for the subscription plan you selected.
            </p>
            
            <div style="background: #f9fafb; border: 2px solid #f97316; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #1f2937;">Invoice Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Invoice ID:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1f2937;">${invoiceId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Plan:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1f2937;">${planName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Billing Cycle:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1f2937; text-transform: capitalize;">${billingCycle}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 15px 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">Total Amount:</td>
                  <td style="padding: 15px 0 8px 0; text-align: right; font-size: 20px; font-weight: bold; color: #f97316;">${currency} $${amount}</td>
                </tr>
              </table>
            </div>
            
            ${additionalInfo ? `
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>Additional Notes:</strong></p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #1e40af;">${additionalInfo}</p>
              </div>
            ` : ''}
            
            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #92400e;">Payment Instructions</h3>
              <ol style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
                <li>Use the invoice ID above for payment reference</li>
                <li>Make payment to our designated account</li>
                <li>Send payment confirmation to support@liqlearns.com</li>
                <li>Your account will be activated within 24 hours</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:support@liqlearns.com?subject=Invoice%20${invoiceId}%20Payment%20Confirmation" 
                 style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #9333ea 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                Confirm Payment
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Questions? Contact us at <a href="mailto:support@liqlearns.com" style="color: #f97316; text-decoration: none;">support@liqlearns.com</a>
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">
                © 2025 LiqLearns. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'LiqLearns <noreply@liqlearns.com>',
        to: [to],
        subject: `Payment Invoice - ${planName} Plan`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Failed to send email: ${errorText}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invoice email sent successfully',
        invoiceId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in send-email-invoice:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to send invoice email',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});