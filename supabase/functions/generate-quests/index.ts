import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuestTemplate {
  title: string;
  type: 'learn' | 'share' | 'recruit';
  reward_xp: number;
  reward_gold: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const today = new Date().toISOString().slice(0, 10);

    // Delete old incomplete quests from previous days
    const { error: deleteError } = await supabase
      .from('quests')
      .delete()
      .eq('user_id', userId)
      .eq('is_completed', false)
      .lt('created_at', today);

    if (deleteError) {
      console.error('Error deleting old quests:', deleteError);
    }

    // Check if today's quests already exist
    const { data: existingQuests, error: fetchError } = await supabase
      .from('quests')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', today);

    if (fetchError) {
      throw fetchError;
    }

    if (existingQuests && existingQuests.length > 0) {
      return new Response(
        JSON.stringify({ quests: existingQuests }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Quest pool with varied rewards
    const questPool: QuestTemplate[] = [
      { title: 'Complete 1 video lesson', type: 'learn', reward_xp: 100, reward_gold: 50 },
      { title: 'Finish 3 lessons in a row', type: 'learn', reward_xp: 150, reward_gold: 75 },
      { title: 'Share a course link with friends', type: 'share', reward_xp: 150, reward_gold: 75 },
      { title: 'Post about LiqLearns on social media', type: 'share', reward_xp: 200, reward_gold: 100 },
      { title: 'Recruit 1 new student', type: 'recruit', reward_xp: 200, reward_gold: 100 },
      { title: 'Help a friend join LiqLearns', type: 'recruit', reward_xp: 250, reward_gold: 125 }
    ];

    // Generate 3 random quests
    const shuffled = questPool.sort(() => Math.random() - 0.5);
    const selectedQuests = shuffled.slice(0, 3).map(q => ({
      ...q,
      user_id: userId
    }));

    const { data: newQuests, error: insertError } = await supabase
      .from('quests')
      .insert(selectedQuests)
      .select();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ quests: newQuests }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-quests:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});