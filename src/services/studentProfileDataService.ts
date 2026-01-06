import { supabase } from './supabaseClient';

interface ProfileData {
  id: string;
  subscription_plan: string;
  trial_end_date: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  has_active_subscription: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  aura_points: number;
  current_level: number;
  level_name: string;
  rank_title: string;
  xp: number;
  gold: number;
  streak: number;
  last_quest_date: string | null;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  action_title: string;
  action_description: string;
  related_entity_type: string;
  related_entity_id: string;
  related_entity_name: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  progress_percentage: number;
  is_completed: boolean;
  enrolled_at: string;
  completed_at: string | null;
  last_accessed_at: string | null;
}

interface StudentProfileJSON {
  profile: ProfileData;
  activities: ActivityLog[];
  enrollments: Enrollment[];
}

export class StudentProfileDataService {
  /**
   * Push complete student profile data from JSON to database
   * Updates profile, inserts activities, and updates enrollments
   */
  static async pushStudentProfileData(
    email: string,
    profileData: StudentProfileJSON
  ): Promise<{ success: boolean; message: string; errors?: any[] }> {
    try {
      // 1. Verify user exists with this email
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userProfile) {
        return {
          success: false,
          message: `User with email ${email} not found`,
          errors: [userError],
        };
      }

      const userId = userProfile.id;
      const errors: any[] = [];

      // 2. Update student_profiles table
      const { error: profileError } = await supabase
        .from('student_profiles')
        .update({
          subscription_plan: profileData.profile.subscription_plan,
          trial_end_date: profileData.profile.trial_end_date,
          subscription_start_date: profileData.profile.subscription_start_date,
          subscription_end_date: profileData.profile.subscription_end_date,
          has_active_subscription: profileData.profile.has_active_subscription,
          stripe_customer_id: profileData.profile.stripe_customer_id,
          stripe_subscription_id: profileData.profile.stripe_subscription_id,
          aura_points: profileData.profile.aura_points,
          current_level: profileData.profile.current_level,
          level_name: profileData.profile.level_name,
          rank_title: profileData.profile.rank_title,
          xp: profileData.profile.xp,
          gold: profileData.profile.gold,
          streak: profileData.profile.streak,
          last_quest_date: profileData.profile.last_quest_date,
        })
        .eq('id', userId);

      if (profileError) {
        errors.push({ type: 'profile_update', error: profileError });
      }

      // 3. Insert activity logs (checking for duplicates)
      for (const activity of profileData.activities) {
        // Check if activity already exists to avoid duplicates
        const { data: existingActivity } = await supabase
          .from('user_activity_logs')
          .select('id')
          .eq('id', activity.id)
          .single();

        if (!existingActivity) {
          const { error: activityError } = await supabase
            .from('user_activity_logs')
            .insert({
              id: activity.id,
              user_id: userId,
              action_type: activity.action_type,
              action_title: activity.action_title,
              action_description: activity.action_description,
              related_entity_type: activity.related_entity_type,
              related_entity_id: activity.related_entity_id,
              related_entity_name: activity.related_entity_name,
              ip_address: activity.ip_address,
              user_agent: activity.user_agent,
              metadata: activity.metadata,
              created_at: activity.created_at,
            });

          if (activityError) {
            errors.push({ type: 'activity_insert', activity_id: activity.id, error: activityError });
          }
        }
      }

      // 4. Update course enrollments
      for (const enrollment of profileData.enrollments) {
        // Check if enrollment exists
        const { data: existingEnrollment } = await supabase
          .from('course_enrollments')
          .select('id')
          .eq('id', enrollment.id)
          .single();

        if (existingEnrollment) {
          // Update existing enrollment
          const { error: enrollmentError } = await supabase
            .from('course_enrollments')
            .update({
              progress_percentage: enrollment.progress_percentage,
              is_completed: enrollment.is_completed,
              completed_at: enrollment.completed_at,
              last_accessed_at: enrollment.last_accessed_at,
            })
            .eq('id', enrollment.id);

          if (enrollmentError) {
            errors.push({ type: 'enrollment_update', enrollment_id: enrollment.id, error: enrollmentError });
          }
        } else {
          // Insert new enrollment
          const { error: enrollmentError } = await supabase
            .from('course_enrollments')
            .insert({
              id: enrollment.id,
              student_id: userId,
              course_id: enrollment.course_id,
              progress_percentage: enrollment.progress_percentage,
              is_completed: enrollment.is_completed,
              enrolled_at: enrollment.enrolled_at,
              completed_at: enrollment.completed_at,
              last_accessed_at: enrollment.last_accessed_at,
            });

          if (enrollmentError) {
            errors.push({ type: 'enrollment_insert', enrollment_id: enrollment.id, error: enrollmentError });
          }
        }
      }

      // 5. Return results
      if (errors.length > 0) {
        return {
          success: false,
          message: `Profile data partially pushed with ${errors.length} errors`,
          errors,
        };
      }

      return {
        success: true,
        message: `Successfully pushed profile data for ${email}. Updated profile, inserted ${profileData.activities.length} activities, and processed ${profileData.enrollments.length} enrollments.`,
      };
    } catch (error) {
      console.error('Error pushing student profile data:', error);
      return {
        success: false,
        message: 'Unexpected error occurred while pushing profile data',
        errors: [error],
      };
    }
  }

  /**
   * Fetch current student profile data for verification
   */
  static async fetchStudentProfileData(email: string): Promise<{
    success: boolean;
    data?: StudentProfileJSON;
    message?: string;
  }> {
    try {
      // Get user ID from email
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userProfile) {
        return {
          success: false,
          message: `User with email ${email} not found`,
        };
      }

      const userId = userProfile.id;

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        return {
          success: false,
          message: 'Error fetching student profile',
        };
      }

      // Fetch recent activities
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('student_id', userId);

      return {
        success: true,
        data: {
          profile: profile as ProfileData,
          activities: (activities || []) as ActivityLog[],
          enrollments: (enrollments || []) as Enrollment[],
        },
      };
    } catch (error) {
      console.error('Error fetching student profile data:', error);
      return {
        success: false,
        message: 'Unexpected error occurred while fetching profile data',
      };
    }
  }
}