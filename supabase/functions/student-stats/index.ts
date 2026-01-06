import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user ID from query parameter (for polling endpoints)
    const url = new URL(req.url);
    const userId = url.searchParams.get('id');
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📊 Stats request for user:', userId);

    // Fetch student stats (creates row if missing)
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('xp, gold, streak, current_level, aura_points, level_name, rank_title')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist - create it
      console.log('📝 Creating new profile for:', userId);
      
      const { error: insertError } = await supabase
        .from('student_profiles')
        .insert({
          id: userId,
          xp: 0,
          gold: 0,
          streak: 0,
          current_level: 1,
          aura_points: 0,
          level_name: 'Novice Explorer',
          rank_title: 'Beginner',
          has_active_subscription: false
        });

      if (insertError) {
        console.error('❌ Failed to create profile:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create profile' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Return default stats
      return new Response(
        JSON.stringify({
          xp: 0,
          gold: 0,
          streak: 0,
          level: 1,
          auraPoints: 0,
          levelName: 'Novice Explorer',
          rankTitle: 'Beginner'
        }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profileError) {
      console.error('❌ Failed to fetch profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return real stats
    const response = {
      xp: profile.xp || 0,
      gold: profile.gold || 0,
      streak: profile.streak || 0,
      level: profile.current_level || 1,
      auraPoints: profile.aura_points || 0,
      levelName: profile.level_name || 'Novice Explorer',
      rankTitle: profile.rank_title || 'Beginner'
    };

    console.log('✅ Stats fetched:', response);

    return new Response(
      JSON.stringify(response), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Stats error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});