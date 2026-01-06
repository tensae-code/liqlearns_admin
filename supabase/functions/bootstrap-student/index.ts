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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user ID from header or auth token
    const userId = req.headers.get("x-user-id");
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing user ID' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔵 Bootstrap request for user:', userId);

    // 1️⃣ Ensure student_profiles row exists (auto-create if missing)
    const { data: existingProfile, error: checkError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      // Profile doesn't exist - create initial profile
      console.log('📝 Creating new student profile for:', userId);
      
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
          JSON.stringify({ error: 'Failed to initialize profile', details: insertError }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Profile created successfully');
    } else if (checkError) {
      console.error('❌ Error checking profile:', checkError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: checkError }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2️⃣ Fetch complete student stats (REAL DATA ONLY)
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('xp, gold, streak, current_level, aura_points, level_name, rank_title')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Failed to fetch profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile', details: profileError }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3️⃣ Fetch enrollments for courses count
    const { data: enrollments, error: enrollError } = await supabase
      .from('course_enrollments')
      .select('is_completed')
      .eq('student_id', userId);

    if (enrollError) {
      console.error('❌ Failed to fetch enrollments:', enrollError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch enrollments', details: enrollError }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4️⃣ Fetch recent activities
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select('id, title, xp_earned, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (activitiesError) {
      console.error('⚠️ Failed to fetch activities:', activitiesError);
      // Non-critical - continue without activities
    }

    // 5️⃣ Return REAL data (no fallbacks)
    const response = {
      stats: {
        xp: profile.xp || 0,
        gold: profile.gold || 0,
        streak: profile.streak || 0,
        level: profile.current_level || 1,
        auraPoints: profile.aura_points || 0,
        levelName: profile.level_name || 'Novice Explorer',
        rankTitle: profile.rank_title || 'Beginner',
        enrolledCourses: enrollments?.length || 0,
        completedCourses: enrollments?.filter(e => e.is_completed).length || 0
      },
      activities: activities || [],
      status: 'online',
      timestamp: new Date().toISOString()
    };

    console.log('✅ Bootstrap successful:', response);

    return new Response(
      JSON.stringify(response), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Bootstrap error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});