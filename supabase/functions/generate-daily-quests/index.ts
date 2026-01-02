import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Add this block - Declare Deno namespace for type checking
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DailyQuest {
  title: string;
  description: string;
  quest_type: 'learn' | 'share' | 'recruit';
  reward_xp: number;
  reward_gold: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  category: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    const today = new Date().toISOString().slice(0, 10);

    // Check streak status and update if needed
    const { data: profile } = await supabaseClient
      .from('student_profiles')
      .select('last_quest_date, streak')
      .eq('id', userId)
      .single();

    if (profile) {
      const lastQuestDate = profile.last_quest_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      // Reset streak if user missed yesterday
      if (lastQuestDate && lastQuestDate < yesterdayStr) {
        await supabaseClient
          .from('student_profiles')
          .update({ streak: 0 })
          .eq('id', userId);
      }
    }

    // Delete any unfinished quests from previous days
    await supabaseClient
      .from('student_mission_progress')
      .delete()
      .eq('student_id', userId)
      .eq('is_completed', false)
      .lt('created_at', today);

    // Check if today's quests already exist
    const { data: existingQuests } = await supabaseClient
      .from('daily_missions')
      .select(`
        *,
        student_mission_progress!inner(
          student_id,
          is_completed,
          completed_at
        )
      `)
      .eq('student_mission_progress.student_id', userId)
      .gte('mission_date', today)
      .limit(3);

    if (existingQuests && existingQuests.length > 0) {
      return new Response(
        JSON.stringify({ 
          quests: existingQuests,
          message: 'Today\'s quests already generated' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Quest pool with variety
    const questPool: DailyQuest[] = [
      {
        title: 'Complete 1 Video Lesson',
        description: 'Watch and finish any video lesson to earn rewards',
        quest_type: 'learn',
        reward_xp: 100,
        reward_gold: 50,
        difficulty_level: 'easy',
        category: 'education'
      },
      {
        title: 'Finish 3 Quiz Questions',
        description: 'Answer 3 quiz questions correctly',
        quest_type: 'learn',
        reward_xp: 150,
        reward_gold: 75,
        difficulty_level: 'medium',
        category: 'education'
      },
      {
        title: 'Share Course on Social Media',
        description: 'Post your course progress on social media',
        quest_type: 'share',
        reward_xp: 150,
        reward_gold: 75,
        difficulty_level: 'easy',
        category: 'social'
      },
      {
        title: 'Recruit 1 New Student',
        description: 'Invite a friend to join the platform',
        quest_type: 'recruit',
        reward_xp: 200,
        reward_gold: 100,
        difficulty_level: 'hard',
        category: 'social'
      },
      {
        title: 'Study for 30 Minutes',
        description: 'Spend 30 minutes learning',
        quest_type: 'learn',
        reward_xp: 120,
        reward_gold: 60,
        difficulty_level: 'medium',
        category: 'education'
      },
      {
        title: 'Complete 1 Assignment',
        description: 'Submit any course assignment',
        quest_type: 'learn',
        reward_xp: 180,
        reward_gold: 90,
        difficulty_level: 'hard',
        category: 'education'
      }
    ];

    // Randomly select 3 quests
    const shuffled = questPool.sort(() => Math.random() - 0.5);
    const selectedQuests = shuffled.slice(0, 3);

    // Insert quests into daily_missions
    const { data: insertedQuests, error: insertError } = await supabaseClient
      .from('daily_missions')
      .insert(
        selectedQuests.map(q => ({
          title: q.title,
          description: q.description,
          category: q.category,
          difficulty_level: q.difficulty_level,
          xp_reward: q.reward_xp,
          gold_reward: q.reward_gold,
          mission_date: today,
          is_active: true
        }))
      )
      .select();

    if (insertError) {
      throw insertError;
    }

    // Create progress entries for the user
    const progressEntries = insertedQuests!.map(quest => ({
      student_id: userId,
      mission_id: quest.id,
      is_completed: false
    }));

    const { error: progressError } = await supabaseClient
      .from('student_mission_progress')
      .insert(progressEntries);

    if (progressError) {
      throw progressError;
    }

    // Fetch complete quest data with progress
    const { data: finalQuests } = await supabaseClient
      .from('daily_missions')
      .select(`
        *,
        student_mission_progress!inner(
          student_id,
          is_completed,
          completed_at
        )
      `)
      .eq('student_mission_progress.student_id', userId)
      .gte('mission_date', today);

    return new Response(
      JSON.stringify({ 
        quests: finalQuests,
        message: 'Daily quests generated successfully'
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