import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Declare Deno types for runtime environment
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ✅ CRITICAL FIX: Use service role for bypassing RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ✅ NEW: Extract user from JWT token (recommended approach)
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // ✅ NEW: Validate JWT and extract user
    const token = authHeader.replace('Bearer ', '')
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('❌ Auth validation failed:', authError?.message || 'Invalid token')
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // ✅ NEW: Use authenticated user ID from JWT
    const userId = user.id
    console.log(`🔵 Fetching stats for authenticated user: ${userId}`)

    // ✅ Query student_profiles table with correct column names
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('xp, gold, streak, current_level, aura_points')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('❌ Profile query error:', profileError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch user profile',
          details: profileError.message 
        }), 
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // ✅ Count enrollments from course_enrollments table
    const { data: enrollments, error: enrollError } = await supabase
      .from('course_enrollments')
      .select('is_completed')
      .eq('student_id', userId)

    if (enrollError) {
      console.error('⚠️ Enrollments query error:', enrollError)
      // Don't fail completely - return profile data with 0 enrollments
    }

    const enrolledCount = enrollments?.length || 0
    const completedCount = enrollments?.filter(e => e.is_completed === true).length || 0

    const response = {
      aura_points: profile?.aura_points || 0,
      level: profile?.current_level || 1,
      streak: profile?.streak || 0,
      xp: profile?.xp || 0,
      gold: profile?.gold || 0,
      enrolled_courses: enrolledCount,
      completed_courses: completedCount
    }

    console.log('✅ Stats fetched successfully:', response)

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (err: any) {
    console.error('💥 Unexpected error in user-stats function:', err)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: err.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})