import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Declare Deno global for TypeScript/linting
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const payload = await req.json();
    const {
      user_id: userId,
      email,
      full_name: fullName,
      username,
      phone,
      role,
      sponsor_name: sponsorName,
      date_of_birth: dateOfBirth,
      address,
      country,
      state,
      city
    } = payload ?? {};

    if (!userId || !email || !fullName || !username || !role) {
      return new Response(JSON.stringify({
        error: 'Missing required fields for user profile.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email: email.toLowerCase(),
        full_name: fullName,
        username: username.toLowerCase(),
        phone,
        role,
        sponsor_username: sponsorName,
        date_of_birth: dateOfBirth || null,
        address: address || null,
        country: country || null,
        state: state || null,
        city: city || null
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('❌ Failed to upsert user profile:', profileError);
      return new Response(JSON.stringify({ error: 'Failed to create user profile.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (role === 'student') {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      const { error: studentError } = await supabase
        .from('student_profiles')
        .upsert({
          id: userId,
          subscription_plan: 'free_trial',
          trial_end_date: trialEndDate.toISOString(),
          has_active_subscription: false
        }, {
          onConflict: 'id'
        });

      if (studentError) {
        console.error('❌ Failed to upsert student profile:', studentError);
        return new Response(JSON.stringify({ error: 'Failed to create student profile.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('❌ create-user-profile error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});