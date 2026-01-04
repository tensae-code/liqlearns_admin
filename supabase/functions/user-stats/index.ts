import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req?.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const userId = url?.searchParams?.get('id');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch student profile stats
    const { data: profile, error: profileError } = await supabase?.from('student_profiles')?.select('xp, gold, streak, current_level, aura_points')?.eq('id', userId)?.single()

    if (profileError) {
      throw profileError
    }

    // Fetch enrollments to count enrolled and completed courses
    const { data: enrollments, error: enrollmentsError } = await supabase?.from('course_enrollments')?.select('is_completed')?.eq('student_id', userId)

    if (enrollmentsError) {
      throw enrollmentsError
    }

    const enrolledCourses = enrollments?.length || 0
    const completedCourses = enrollments?.filter(e => e?.is_completed)?.length || 0

    // Return dashboard stats
    return new Response(
      JSON.stringify({
        aura_points: profile?.aura_points || 0,
        level: profile?.current_level || 1,
        streak: profile?.streak || 0,
        xp: profile?.xp || 0,
        gold: profile?.gold || 0,
        enrolled_courses: enrolledCourses,
        completed_courses: completedCourses
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
});