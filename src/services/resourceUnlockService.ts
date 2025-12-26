import { supabase } from '../lib/supabase';

export interface TutoringResource {
  id: string;
  name: string;
  category: string;
  iconColor: string;
  unlockLevel: number;
  unlockXp: number;
  unlockAuraPoints: number;
  isPremium: boolean;
}

export interface StudentLevel {
  currentLevel: number;
  levelName: string;
  rankTitle: string;
  auraPoints: number;
  totalXp: number;
}

class ResourceUnlockService {
  async getTutoringResources(): Promise<TutoringResource[]> {
    try {
      const { data, error } = await supabase
        .from('tutoring_resources')
        .select('*')
        .order('unlock_level', { ascending: true });

      if (error) {
        // Log detailed error for debugging
        console.error('Supabase error fetching tutoring resources:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Check if it's a schema cache issue
        if (error.code === 'PGRST205' || error.message.includes('schema cache')) {
          throw new Error('Unable to access tutoring resources. Please try refreshing the page or contact support if the issue persists.');
        }
        
        throw error;
      }

      // Return empty array if no data instead of throwing error
      if (!data || data.length === 0) {
        console.warn('No tutoring resources found in database');
        return [];
      }

      return data.map(resource => ({
        id: resource.id,
        name: resource.name,
        category: resource.category,
        iconColor: resource.icon_color,
        unlockLevel: resource.unlock_level,
        unlockXp: resource.unlock_xp,
        unlockAuraPoints: resource.unlock_aura_points,
        isPremium: resource.is_premium
      }));
    } catch (error: any) {
      console.error('Error fetching tutoring resources:', error);
      
      // Provide user-friendly error message
      const errorMessage = error.message || 'Failed to load tutoring resources';
      throw new Error(errorMessage);
    }
  }

  async getStudentLevel(studentId: string): Promise<StudentLevel> {
    try {
      // Get student profile data
      const { data: profileData, error: profileError } = await supabase
        .from('student_profiles')
        .select('current_level, level_name, rank_title, aura_points')
        .eq('id', studentId)
        .single();

      if (profileError) throw profileError;

      // Get total XP from student_progress
      const { data: progressData, error: progressError } = await supabase
        .from('student_progress')
        .select('total_xp')
        .eq('student_id', studentId);

      if (progressError) throw progressError;

      const totalXp = progressData?.reduce((sum, record) => sum + (record.total_xp || 0), 0) || 0;

      return {
        currentLevel: profileData?.current_level || 1,
        levelName: profileData?.level_name || 'Beginner',
        rankTitle: profileData?.rank_title || 'Novice Learner',
        auraPoints: profileData?.aura_points || 0,
        totalXp
      };
    } catch (error: any) {
      console.error('Error fetching student level:', error);
      throw new Error(error.message || 'Failed to load student level data');
    }
  }

  isResourceUnlocked(
    resource: TutoringResource,
    currentLevel: number,
    totalXp: number,
    auraPoints: number
  ): boolean {
    // Check if student meets all unlock requirements
    const meetsLevel = currentLevel >= resource.unlockLevel;
    const meetsXp = totalXp >= resource.unlockXp;
    const meetsAura = auraPoints >= resource.unlockAuraPoints;

    return meetsLevel && meetsXp && meetsAura;
  }

  getUnlockRequirementText(
    resource: TutoringResource,
    currentLevel: number,
    totalXp: number,
    auraPoints: number
  ): string {
    const requirements: string[] = [];

    if (currentLevel < resource.unlockLevel) {
      requirements.push(`Level ${resource.unlockLevel}`);
    }
    if (totalXp < resource.unlockXp) {
      requirements.push(`${resource.unlockXp} XP`);
    }
    if (auraPoints < resource.unlockAuraPoints) {
      requirements.push(`${resource.unlockAuraPoints} Aura`);
    }

    if (requirements.length === 0) return 'Unlocked';

    return `Unlock at: ${requirements.join(' + ')}`;
  }
}

export const resourceUnlockService = new ResourceUnlockService();