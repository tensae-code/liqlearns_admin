import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();
    
    // Log the request for debugging
    console.log('🔵 check-sponsor called:', { username });
    
    if (!username) {
      return new Response(
        JSON.stringify({ exists: false, allowed: false }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('username, role')
      .eq('username', username.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('🔴 Database error:', error);
      return new Response(
        JSON.stringify({ exists: false, allowed: false, error: error.message }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    const exists = !!data;
    
    // FIXED: CEO should be allowed to sponsor - only block admin and support roles
    const userRole = data?.role?.toLowerCase() || '';
    const blockedRoles = ['admin', 'support'];
    const allowed = exists && !blockedRoles.includes(userRole);

    console.log('🟢 check-sponsor result:', { 
      exists, 
      allowed, 
      role: data?.role,
      normalizedRole: userRole,
      isBlocked: blockedRoles.includes(userRole)
    });

    return new Response(
      JSON.stringify({ exists, allowed }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (err) {
    console.error('🔴 Function error:', err);
    return new Response(
      JSON.stringify({ 
        exists: false, 
        allowed: false,
        error: err.message || 'Internal server error' 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});