import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req?.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Add this block - Declare Deno as a global variable
    declare const Deno: {
      env: {
        get: (key: string) => string | undefined;
      };
    };
    
    const supabaseClient = createClient(
      Deno?.env?.get('SUPABASE_URL') ?? '',
      Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authorization header
    const authHeader = req?.headers?.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient?.auth?.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user?.id;
    
    // Get request body
    const { missionId } = await req?.json();
    
    if (!missionId) {
      return new Response(
        JSON.stringify({ error: 'Missing missionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get quest details
    const { data: quest, error: questError } = await supabaseClient?.from('daily_missions')?.select('xp_reward, gold_reward, mission_date')?.eq('id', missionId)?.single();

    if (questError || !quest) {
      return new Response(
        JSON.stringify({ error: 'Quest not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already completed
    const { data: progress } = await supabaseClient?.from('student_mission_progress')?.select('is_completed')?.eq('student_id', userId)?.eq('mission_id', missionId)?.single();

    if (progress?.is_completed) {
      return new Response(
        JSON.stringify({ error: 'Quest already completed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current profile
    const { data: profile, error: profileError } = await supabaseClient?.from('student_profiles')?.select('xp, gold, streak, last_quest_date, aura_points')?.eq('id', userId)?.single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const today = new Date()?.toISOString()?.slice(0, 10);
    const lastQuestDate = profile?.last_quest_date;
    
    // Calculate new streak
    let newStreak = profile?.streak || 0;
    const yesterday = new Date();
    yesterday?.setDate(yesterday?.getDate() - 1);
    const yesterdayStr = yesterday?.toISOString()?.slice(0, 10);

    if (!lastQuestDate || lastQuestDate === yesterdayStr) {
      // Continue streak
      newStreak += 1;
    } else if (lastQuestDate === today) {
      // Already completed today, keep same streak
      newStreak = profile?.streak;
    } else {
      // Streak broken, reset
      newStreak = 1;
    }

    // Update quest progress
    const { error: updateProgressError } = await supabaseClient?.from('student_mission_progress')?.update({
        is_completed: true,
        completed_at: new Date()?.toISOString()
      })?.eq('student_id', userId)?.eq('mission_id', missionId);

    if (updateProgressError) {
      throw updateProgressError;
    }

    // Update student profile with rewards
    const newXp = (profile?.xp || 0) + quest?.xp_reward;
    const newGold = (profile?.gold || 0) + quest?.gold_reward;
    const newAuraPoints = (profile?.aura_points || 0) + Math.floor(quest?.xp_reward / 2);

    const { data: updatedProfile, error: updateError } = await supabaseClient?.from('student_profiles')?.update({
        xp: newXp,
        gold: newGold,
        aura_points: newAuraPoints,
        streak: newStreak,
        last_quest_date: today
      })?.eq('id', userId)?.select()?.single();

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        rewards: {
          xp: quest.xp_reward,
          gold: quest.gold_reward,
          streak: newStreak
        },
        profile: updatedProfile,
        message: `Quest completed! +${quest.xp_reward} XP, +${quest.gold_reward} Gold`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});