import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req?.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user ID from query parameters
    const url = new URL(req.url);
    const userId = url?.searchParams?.get('id');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Create Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch student profile data
    const { data: studentProfile, error: profileError } = await supabase?.from('student_profiles')?.select('xp, gold, streak, current_level, aura_points')?.eq('id', userId)?.maybeSingle();

    // If profile doesn't exist, return default values
    if (profileError || !studentProfile) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({
          aura_points: 0,
          level: 1,
          streak: 0,
          xp: 0,
          gold: 0,
          enrolled_courses: 0,
          completed_courses: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Fetch enrollment data
    const { data: enrollments, error: enrollmentError } = await supabase?.from('course_enrollments')?.select('id, is_completed')?.eq('student_id', userId);

    if (enrollmentError) {
      console.error('Enrollment fetch error:', enrollmentError);
    }

    // Calculate enrollment statistics
    const enrolledCourses = enrollments?.length || 0;
    const completedCourses = enrollments?.filter(e => e?.is_completed === true)?.length || 0;

    // Return combined real data
    return new Response(
      JSON.stringify({
        aura_points: studentProfile.aura_points || 0,
        level: studentProfile.current_level || 1,
        streak: studentProfile.streak || 0,
        xp: studentProfile.xp || 0,
        gold: studentProfile.gold || 0,
        enrolled_courses: enrolledCourses,
        completed_courses: completedCourses
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    
    // Return default values on any error to prevent UI crashes
    return new Response(
      JSON.stringify({
        aura_points: 0,
        level: 1,
        streak: 0,
        xp: 0,
        gold: 0,
        enrolled_courses: 0,
        completed_courses: 0,
        error: 'Failed to fetch user stats'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }
});