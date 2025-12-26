import { supabase } from '../lib/supabase';

// ==================== TYPE DEFINITIONS ====================

// Certificates
export interface StudentCertificate {
  id: string;
  studentId: string;
  title: string;
  description: string;
  uniqueCertificateId: string;
  certificateType: string;
  status: string;
  courseId?: string;
  templateId?: string;
  issuedDate: string;
  completionDate: string;
  verificationUrl?: string;
  qrCodeData?: string;
  blockchainHash?: string;
  metadata?: any;
}

// Subscriptions
export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: Record<string, any>;
  isActive: boolean;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

// Gamification - Badges
export interface BadgeTier {
  id: string;
  achievementId: string;
  tier: string;
  tierName: string;
  requirementValue: number;
  xpReward: number;
  auraPointsReward: number;
  iconUrl?: string;
  unlockFeatures?: any;
  isActive: boolean;
}

export interface BadgeProgress {
  id: string;
  studentId: string;
  badgeTierId: string;
  currentProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  tier: BadgeTier;
}

// MLM / Earners
export interface MLMNetwork {
  id: string;
  userId: string;
  sponsorId?: string;
  level: number;
  rank: string;
  totalDownline: number;
  activeDownline: number;
  totalEarnings: number;
  monthlyEarnings: number;
  joinDate: string;
  lastActivity: string;
}

export interface MLMCommission {
  id: string;
  userId: string;
  fromUserId?: string;
  amount: number;
  percentage?: number;
  commissionType: string;
  description?: string;
  transactionReference?: string;
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  userId: string;
  amount: number;
  netAmount?: number;
  processingFee: number;
  payoutMethod: string;
  status: string;
  accountDetails: any;
  notes?: string;
  createdAt: string;
  processedAt?: string;
}

export interface DownlineMember {
  id: string;
  userId: string;
  email: string;
  fullName?: string;
  level: number;
  rank: string;
  totalEarnings: number;
  joinDate: string;
  isActive: boolean;
}

export interface EarningsBreakdown {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  withdrawnTotal: number;
}

// ==================== CERTIFICATE SERVICE ====================

export const certificateService = {
  async getStudentCertificates(studentId: string): Promise<StudentCertificate[]> {
    try {
      const { data, error } = await supabase
        .from('student_certificates')
        .select('*')
        .eq('student_id', studentId)
        .eq('status', 'issued')
        .order('issued_date', { ascending: false });

      if (error) throw error;

      return (data || []).map(cert => ({
        id: cert.id,
        studentId: cert.student_id,
        title: cert.title,
        description: cert.description || '',
        uniqueCertificateId: cert.unique_certificate_id,
        certificateType: cert.certificate_type,
        status: cert.status,
        courseId: cert.course_id,
        templateId: cert.template_id,
        issuedDate: cert.issued_date,
        completionDate: cert.completion_date,
        verificationUrl: cert.verification_url,
        qrCodeData: cert.qr_code_data,
        blockchainHash: cert.blockchain_hash,
        metadata: cert.metadata
      }));
    } catch (error: any) {
      console.error('Error fetching certificates:', error);
      throw new Error(error.message || 'Failed to fetch certificates');
    }
  },

  async downloadCertificate(certificateId: string): Promise<void> {
    // TODO: Implement certificate download logic
    console.log('Download certificate:', certificateId);
  }
};

// ==================== SUBSCRIPTION SERVICE ====================

export const subscriptionService = {
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;

      return (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        priceMonthly: parseFloat(plan.price_monthly || '0'),
        priceYearly: parseFloat(plan.price_yearly || '0'),
        currency: plan.currency || 'USD',
        features: plan.features || {},
        isActive: plan.is_active,
        stripePriceIdMonthly: plan.stripe_price_id_monthly,
        stripePriceIdYearly: plan.stripe_price_id_yearly
      }));
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error);
      throw new Error(error.message || 'Failed to fetch subscription plans');
    }
  },

  async getCurrentSubscription(userId: string): Promise<SubscriptionPlan | null> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('subscription_plan, has_active_subscription, subscription_end_date')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      if (!profile?.has_active_subscription) return null;

      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);

      if (plansError) throw plansError;

      const currentPlan = plans?.find(p => 
        p.name.toLowerCase() === profile.subscription_plan?.toLowerCase()
      );

      if (!currentPlan) return null;

      return {
        id: currentPlan.id,
        name: currentPlan.name,
        priceMonthly: parseFloat(currentPlan.price_monthly || '0'),
        priceYearly: parseFloat(currentPlan.price_yearly || '0'),
        currency: currentPlan.currency || 'USD',
        features: currentPlan.features || {},
        isActive: currentPlan.is_active,
        stripePriceIdMonthly: currentPlan.stripe_price_id_monthly,
        stripePriceIdYearly: currentPlan.stripe_price_id_yearly
      };
    } catch (error: any) {
      console.error('Error fetching current subscription:', error);
      return null;
    }
  }
};

// ==================== GAMIFICATION SERVICE ====================

export const gamificationService = {
  async getStudentBadgeProgress(studentId: string): Promise<BadgeProgress[]> {
    try {
      const { data, error } = await supabase
        .from('student_badge_progress')
        .select(`
          *,
          tier:badge_tier_id (
            id,
            achievement_id,
            tier,
            tier_name,
            requirement_value,
            xp_reward,
            aura_points_reward,
            icon_url,
            unlock_features,
            is_active
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(progress => ({
        id: progress.id,
        studentId: progress.student_id,
        badgeTierId: progress.badge_tier_id,
        currentProgress: progress.current_progress || 0,
        isUnlocked: progress.is_unlocked || false,
        unlockedAt: progress.unlocked_at,
        tier: {
          id: progress.tier.id,
          achievementId: progress.tier.achievement_id,
          tier: progress.tier.tier,
          tierName: progress.tier.tier_name,
          requirementValue: progress.tier.requirement_value,
          xpReward: progress.tier.xp_reward || 0,
          auraPointsReward: progress.tier.aura_points_reward || 0,
          iconUrl: progress.tier.icon_url,
          unlockFeatures: progress.tier.unlock_features,
          isActive: progress.tier.is_active
        }
      }));
    } catch (error: any) {
      console.error('Error fetching badge progress:', error);
      throw new Error(error.message || 'Failed to fetch badge progress');
    }
  }
};

// ==================== MLM / EARNERS SERVICE ====================

export const mlmEarnersService = {
  async getNetworkStats(userId: string): Promise<MLMNetwork | null> {
    try {
      const { data, error } = await supabase
        .from('mlm_network')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data ? {
        id: data.id,
        userId: data.user_id,
        sponsorId: data.sponsor_id,
        level: data.level || 1,
        rank: data.rank || 'Bronze',
        totalDownline: data.total_downline || 0,
        activeDownline: data.active_downline || 0,
        totalEarnings: parseFloat(data.total_earnings || '0'),
        monthlyEarnings: parseFloat(data.monthly_earnings || '0'),
        joinDate: data.join_date,
        lastActivity: data.last_activity
      } : null;
    } catch (error: any) {
      console.error('Error fetching network stats:', error);
      return null;
    }
  },

  async getCommissions(userId: string, limit: number = 10): Promise<MLMCommission[]> {
    try {
      const { data, error } = await supabase
        .from('mlm_commissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(comm => ({
        id: comm.id,
        userId: comm.user_id,
        fromUserId: comm.from_user_id,
        amount: parseFloat(comm.amount || '0'),
        percentage: comm.percentage ? parseFloat(comm.percentage) : undefined,
        commissionType: comm.commission_type,
        description: comm.description,
        transactionReference: comm.transaction_reference,
        createdAt: comm.created_at
      }));
    } catch (error: any) {
      console.error('Error fetching commissions:', error);
      throw new Error(error.message || 'Failed to fetch commissions');
    }
  },

  async getPayoutRequests(userId: string): Promise<PayoutRequest[]> {
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(payout => ({
        id: payout.id,
        userId: payout.user_id,
        amount: parseFloat(payout.amount || '0'),
        netAmount: payout.net_amount ? parseFloat(payout.net_amount) : undefined,
        processingFee: parseFloat(payout.processing_fee || '0'),
        payoutMethod: payout.payout_method,
        status: payout.status,
        accountDetails: payout.account_details,
        notes: payout.notes,
        createdAt: payout.created_at,
        processedAt: payout.processed_at
      }));
    } catch (error: any) {
      console.error('Error fetching payout requests:', error);
      throw new Error(error.message || 'Failed to fetch payout requests');
    }
  },

  async getDownlineMembers(userId: string): Promise<DownlineMember[]> {
    try {
      const { data, error } = await supabase
        .from('mlm_network')
        .select(`
          id,
          user_id,
          level,
          rank,
          total_earnings,
          join_date,
          last_activity,
          user:user_profiles!mlm_network_user_id_fkey (
            email,
            full_name
          )
        `)
        .eq('sponsor_id', userId)
        .order('join_date', { ascending: false });

      if (error) throw error;

      return (data || []).map(member => ({
        id: member.id,
        userId: member.user_id,
        email: member.user.email || '',
        fullName: member.user.full_name,
        level: member.level || 1,
        rank: member.rank || 'Bronze',
        totalEarnings: parseFloat(member.total_earnings || '0'),
        joinDate: member.join_date,
        isActive: new Date(member.last_activity).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      }));
    } catch (error: any) {
      console.error('Error fetching downline members:', error);
      throw new Error(error.message || 'Failed to fetch downline members');
    }
  },

  async getEarningsBreakdown(userId: string): Promise<EarningsBreakdown> {
    try {
      const [networkData, commissionsData, payoutsData] = await Promise.all([
        supabase.from('mlm_network').select('total_earnings, monthly_earnings').eq('user_id', userId).single(),
        supabase.from('mlm_commissions').select('amount').eq('user_id', userId),
        supabase.from('payout_requests').select('amount, status').eq('user_id', userId)
      ]);

      const totalEarnings = parseFloat(networkData.data?.total_earnings || '0');
      
      const pendingPayouts = (payoutsData.data || [])
        .filter(p => p.status === 'pending' || p.status === 'processing')
        .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

      const completedPayouts = (payoutsData.data || [])
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

      return {
        totalEarnings,
        availableBalance: totalEarnings - pendingPayouts - completedPayouts,
        pendingBalance: pendingPayouts,
        withdrawnTotal: completedPayouts
      };
    } catch (error: any) {
      console.error('Error fetching earnings breakdown:', error);
      return {
        totalEarnings: 0,
        availableBalance: 0,
        pendingBalance: 0,
        withdrawnTotal: 0
      };
    }
  }
};