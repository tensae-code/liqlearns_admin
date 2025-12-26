import { supabase } from '../lib/supabase';

export type LifeCategory = 'spiritual' | 'health' | 'wealth' | 'service' | 'education' | 'family' | 'social';

export interface LifeProgressEntry {
  id: string;
  studentId: string;
  category: LifeCategory;
  satisfactionScore: number;
  entryDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LifeProgressSuggestion {
  id: string;
  studentId: string;
  category: LifeCategory;
  suggestionText: string;
  suggestionType: 'daily_mission' | 'weekly_goal' | 'habit_change' | 'resource';
  priority: number;
  basedOnScore: number;
  isActive: boolean;
  appliedAt: string | null;
  createdAt: string;
  expiresAt: string;
  metadata: Record<string, any>;
}

export interface ImbalancedCategory {
  category: LifeCategory;
  averageScore: number;
  latestScore: number;
  imbalanceSeverity: 'critical' | 'moderate' | 'mild' | 'balanced';
}

export interface CategoryMission {
  id: string;
  title: string;
  description: string;
  category: LifeCategory;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  xpReward: number;
  isCompleted?: boolean;
}

export interface CategoryProgress {
  category: LifeCategory;
  averageScore: number;
  latestScore: number;
  trend: 'up' | 'down' | 'stable';
}

export interface OverallProgress {
  overallScore: number;
  categoryScores: CategoryProgress[];
  lastUpdated: string;
}

const lifeCategoryLabels: Record<LifeCategory, string> = {
  spiritual: 'Spiritual',
  health: 'Health',
  wealth: 'Wealth',
  service: 'Service',
  education: 'Education',
  family: 'Family',
  social: 'Social'
};

const lifeCategoryColors: Record<LifeCategory, string> = {
  spiritual: '#9333EA', // Purple
  health: '#10B981', // Green
  wealth: '#F59E0B', // Amber
  service: '#3B82F6', // Blue
  education: '#EF4444', // Red
  family: '#EC4899', // Pink
  social: '#8B5CF6'  // Violet
};

export const lifeProgressService = {
  // Get category label
  getCategoryLabel(category: LifeCategory): string {
    return lifeCategoryLabels[category];
  },

  // Get category color
  getCategoryColor(category: LifeCategory): string {
    return lifeCategoryColors[category];
  },

  // Create or update daily entry
  async saveDailyEntry(
    studentId: string,
    category: LifeCategory,
    satisfactionScore: number,
    notes?: string
  ): Promise<LifeProgressEntry> {
    const entryDate = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('life_progress_entries')
      .upsert({
        student_id: studentId,
        category,
        satisfaction_score: satisfactionScore,
        entry_date: entryDate,
        notes: notes || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'student_id,category,entry_date'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      studentId: data.student_id,
      category: data.category,
      satisfactionScore: data.satisfaction_score,
      entryDate: data.entry_date,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Get today's entries for all categories
  async getTodayEntries(studentId: string): Promise<LifeProgressEntry[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('life_progress_entries')
      .select('*')
      .eq('student_id', studentId)
      .eq('entry_date', today);

    if (error) throw error;

    return (data || []).map(entry => ({
      id: entry.id,
      studentId: entry.student_id,
      category: entry.category,
      satisfactionScore: entry.satisfaction_score,
      entryDate: entry.entry_date,
      notes: entry.notes,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at
    }));
  },

  // Get entries for specific date range
  async getEntriesByDateRange(
    studentId: string,
    startDate: string,
    endDate: string
  ): Promise<LifeProgressEntry[]> {
    const { data, error } = await supabase
      .from('life_progress_entries')
      .select('*')
      .eq('student_id', studentId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(entry => ({
      id: entry.id,
      studentId: entry.student_id,
      category: entry.category,
      satisfactionScore: entry.satisfaction_score,
      entryDate: entry.entry_date,
      notes: entry.notes,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at
    }));
  },

  // Get category average for last N days
  async getCategoryAverage(
    studentId: string,
    category: LifeCategory,
    days: number = 30
  ): Promise<number> {
    const { data, error } = await supabase
      .rpc('get_category_average_satisfaction', {
        p_student_id: studentId,
        p_category: category,
        p_days: days
      });

    if (error) throw error;
    return data || 0;
  },

  // Get overall progress across all categories
  async getOverallProgress(studentId: string, days: number = 30): Promise<OverallProgress> {
    const { data: overallData, error: overallError } = await supabase
      .rpc('get_overall_life_progress', {
        p_student_id: studentId,
        p_days: days
      });

    if (overallError) throw overallError;

    // Get category-specific progress
    const categories: LifeCategory[] = ['spiritual', 'health', 'wealth', 'service', 'education', 'family', 'social'];
    const categoryScores = await Promise.all(
      categories.map(async (category) => {
        const average = await this.getCategoryAverage(studentId, category, days);
        const latestEntry = await this.getLatestEntryForCategory(studentId, category);
        
        return {
          category,
          averageScore: average,
          latestScore: latestEntry?.satisfactionScore || 0,
          trend: this.calculateTrend(average, latestEntry?.satisfactionScore || 0)
        };
      })
    );

    return {
      overallScore: overallData || 0,
      categoryScores,
      lastUpdated: new Date().toISOString()
    };
  },

  // Get latest entry for specific category
  async getLatestEntryForCategory(
    studentId: string,
    category: LifeCategory
  ): Promise<LifeProgressEntry | null> {
    const { data, error } = await supabase
      .from('life_progress_entries')
      .select('*')
      .eq('student_id', studentId)
      .eq('category', category)
      .order('entry_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    return {
      id: data.id,
      studentId: data.student_id,
      category: data.category,
      satisfactionScore: data.satisfaction_score,
      entryDate: data.entry_date,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Calculate trend
  calculateTrend(average: number, latest: number): 'up' | 'down' | 'stable' {
    const difference = latest - average;
    if (Math.abs(difference) < 5) return 'stable';
    return difference > 0 ? 'up' : 'down';
  },

  // Delete entry
  async deleteEntry(entryId: string): Promise<void> {
    const { error } = await supabase
      .from('life_progress_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
  },

  // Get entries for specific category
  async getEntriesByCategory(
    studentId: string,
    category: LifeCategory,
    limit: number = 30
  ): Promise<LifeProgressEntry[]> {
    const { data, error } = await supabase
      .from('life_progress_entries')
      .select('*')
      .eq('student_id', studentId)
      .eq('category', category)
      .order('entry_date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(entry => ({
      id: entry.id,
      studentId: entry.student_id,
      category: entry.category,
      satisfactionScore: entry.satisfaction_score,
      entryDate: entry.entry_date,
      notes: entry.notes,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at
    }));
  },

  // Get imbalanced categories
  async getImbalancedCategories(
    studentId: string,
    threshold: number = 50,
    days: number = 7
  ): Promise<ImbalancedCategory[]> {
    const { data, error } = await supabase
      .rpc('get_imbalanced_categories', {
        p_student_id: studentId,
        p_threshold: threshold,
        p_days: days
      });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      category: item.category,
      averageScore: parseFloat(item.average_score),
      latestScore: item.latest_score,
      imbalanceSeverity: item.imbalance_severity
    }));
  },

  // Get personalized suggestions for a category
  async getCategorySuggestions(studentId: string, category?: LifeCategory): Promise<LifeProgressSuggestion[]> {
    let query = supabase
      .from('life_progress_suggestions')
      .select('*')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('priority', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      studentId: item.student_id,
      category: item.category,
      suggestionText: item.suggestion_text,
      suggestionType: item.suggestion_type,
      priority: item.priority,
      basedOnScore: item.based_on_score,
      isActive: item.is_active,
      appliedAt: item.applied_at,
      createdAt: item.created_at,
      expiresAt: item.expires_at,
      metadata: item.metadata || {}
    }));
  },

  // Auto-generate suggestions for imbalanced categories
  async generateSuggestions(studentId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('auto_generate_life_suggestions', {
        p_student_id: studentId
      });

    if (error) throw error;
    return data || 0;
  },

  // Mark suggestion as applied
  async applySuggestion(suggestionId: string): Promise<void> {
    const { error } = await supabase
      .from('life_progress_suggestions')
      .update({
        applied_at: new Date().toISOString(),
        is_active: false
      })
      .eq('id', suggestionId);

    if (error) throw error;
  },

  // Get category-specific missions
  async getCategoryMissions(
    studentId: string,
    category?: LifeCategory,
    includeCompleted: boolean = false
  ): Promise<CategoryMission[]> {
    let query = supabase
      .from('daily_missions')
      .select(`
        id,
        title,
        description,
        category,
        difficulty_level,
        xp_reward,
        student_mission_progress!left(is_completed)
      `)
      .eq('is_active', true)
      .not('category', 'is', null);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      difficultyLevel: item.difficulty_level,
      xpReward: item.xp_reward,
      isCompleted: item.student_mission_progress?.[0]?.is_completed || false
    })).filter((mission: CategoryMission) => includeCompleted || !mission.isCompleted);
  },

  // Get severity color based on imbalance level
  getSeverityColor(severity: 'critical' | 'moderate' | 'mild' | 'balanced'): string {
    switch (severity) {
      case 'critical':
        return '#EF4444'; // Red
      case 'moderate':
        return '#F59E0B'; // Amber
      case 'mild':
        return '#FBBF24'; // Yellow
      default:
        return '#10B981'; // Green
    }
  },

  // Get severity label
  getSeverityLabel(severity: 'critical' | 'moderate' | 'mild' | 'balanced'): string {
    switch (severity) {
      case 'critical':
        return 'Needs Immediate Attention';
      case 'moderate':
        return 'Needs Improvement';
      case 'mild':
        return 'Minor Imbalance';
      default:
        return 'Balanced';
    }
  },

  // Create a daily mission from suggestion
  async createMissionFromSuggestion(
    studentId: string,
    suggestionId: string
  ): Promise<void> {
    // Get the suggestion
    const { data: suggestion, error: suggestionError } = await supabase
      .from('life_progress_suggestions')
      .select('*')
      .eq('id', suggestionId)
      .single();

    if (suggestionError) throw suggestionError;

    // Create a mission based on the suggestion
    const { error: missionError } = await supabase
      .from('daily_missions')
      .insert({
        title: `Improve ${this.getCategoryLabel(suggestion.category)}`,
        description: suggestion.suggestion_text,
        category: suggestion.category,
        difficulty_level: 'medium',
        xp_reward: 75,
        is_active: true,
        is_suggestion: true,
        suggestion_reason: `Based on ${suggestion.category} score of ${suggestion.based_on_score}`
      });

    if (missionError) throw missionError;

    // Mark suggestion as applied
    await this.applySuggestion(suggestionId);
  }
};