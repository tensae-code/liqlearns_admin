import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req?.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Add this block - Declare Deno global variable
    declare const Deno: {
      env: {
        get(key: string): string | undefined;
      };
    };
    // End of added block
    
    const supabase = createClient(
      Deno?.env?.get('SUPABASE_URL') ?? '',
      Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { questId } = await req?.json();

    if (!questId) {
      return new Response(
        JSON.stringify({ error: 'questId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update quest to completed
    // Only complete if not already completed
    const { data: quest, error: updateError } = await supabase?.from('quests')?.update({ 
        is_completed: true,
        completed_at: new Date()?.toISOString()
      })?.eq('id', questId)?.eq('is_completed', false)?.select()?.single();

    if (updateError) {
      throw updateError;
    }

    if (!quest) {
      return new Response(
        JSON.stringify({ error: 'Quest not found or already completed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch updated user stats
    const { data: userProfile, error: profileError } = await supabase?.from('user_profiles')?.select('xp, gold, streak')?.eq('id', quest?.user_id)?.single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        quest,
        userStats: userProfile
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in complete-quest:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});