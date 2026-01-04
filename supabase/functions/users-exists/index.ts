import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}; // Add missing semicolon

serve(async (req) => {
  // Handle CORS preflight requests
  if (req?.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const username = url?.searchParams?.get('u')

    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username parameter is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno?.env?.get('SUPABASE_URL') ?? '',
      Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if sponsor username exists and get role for validation
    const { data, error } = await supabaseClient?.from('user_profiles')?.select('id, username, role')?.eq('username', username?.toLowerCase())?.maybeSingle()

    if (error) {
      throw error
    }

    // Check if user exists and is eligible to be a sponsor
    const eligibleRoles = ['student', 'teacher', 'tutor', 'ceo']
    const exists = !!data
    const isEligibleSponsor = exists && eligibleRoles?.includes(data?.role?.toLowerCase())

    return new Response(
      JSON.stringify({
        exists,
        isEligibleSponsor,
        role: data?.role || null
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})