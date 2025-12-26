import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const { username } = await req.json();
  if (!username) {
    return new Response(
      JSON.stringify({ exists: false, allowed: false }), 
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, role')
    .eq('username', username.trim())
    .single()

  if (error || !data) {
    return new Response(
      JSON.stringify({ exists: false, allowed: false }), 
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  const sponsorAllowedRoles = ['student', 'teacher', 'affiliate']
  const allowed = sponsorAllowedRoles.includes(data.role)

  return new Response(
    JSON.stringify({ exists: true, allowed }), 
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  )
})