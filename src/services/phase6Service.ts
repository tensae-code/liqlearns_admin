import { supabase } from '../lib/supabase';

// =====================================================
// BLOCKCHAIN INTEGRATION
// =====================================================

export interface NFTBadge {
  id: string;
  userId: string;
  achievementId?: string;
  tokenId: string;
  blockchainNetwork: 'ethereum' | 'polygon' | 'binance_smart_chain' | 'solana';
  contractAddress: string;
  metadataUri: string;
  nftStatus: 'minting' | 'minted' | 'transferred' | 'burned';
  transactionHash?: string;
  mintedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CryptoPayment {
  id: string;
  userId: string;
  productId?: string;
  currency: 'eth' | 'matic' | 'bnb' | 'sol' | 'usdt' | 'usdc';
  amount: number;
  walletAddress: string;
  transactionHash?: string;
  blockchainNetwork: 'ethereum' | 'polygon' | 'binance_smart_chain' | 'solana';
  paymentStatus: 'pending' | 'processing' | 'confirmed' | 'failed' | 'refunded';
  confirmationCount: number;
  gasFee?: number;
  exchangeRate?: number;
  fiatEquivalent?: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DecentralizedIdentity {
  id: string;
  userId: string;
  didIdentifier: string;
  didDocument: Record<string, any>;
  verificationMethod: Record<string, any>;
  blockchainNetwork: 'ethereum' | 'polygon' | 'binance_smart_chain' | 'solana';
  isVerified: boolean;
  verifiedAt?: string;
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// NFT Badge Operations
export const nftBadgeService = {
  async getUserNFTBadges(userId: string): Promise<NFTBadge[]> {
    const { data, error } = await supabase
      .from('nft_badges')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(badge => ({
      id: badge.id,
      userId: badge.user_id,
      achievementId: badge.achievement_id,
      tokenId: badge.token_id,
      blockchainNetwork: badge.blockchain_network,
      contractAddress: badge.contract_address,
      metadataUri: badge.metadata_uri,
      nftStatus: badge.nft_status,
      transactionHash: badge.transaction_hash,
      mintedAt: badge.minted_at,
      createdAt: badge.created_at,
      updatedAt: badge.updated_at,
    }));
  },

  async mintNFTBadge(badgeData: Partial<NFTBadge>): Promise<NFTBadge> {
    const { data, error } = await supabase
      .from('nft_badges')
      .insert({
        user_id: badgeData.userId,
        achievement_id: badgeData.achievementId,
        token_id: badgeData.tokenId,
        blockchain_network: badgeData.blockchainNetwork,
        contract_address: badgeData.contractAddress,
        metadata_uri: badgeData.metadataUri,
        nft_status: 'minting',
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      achievementId: data.achievement_id,
      tokenId: data.token_id,
      blockchainNetwork: data.blockchain_network,
      contractAddress: data.contract_address,
      metadataUri: data.metadata_uri,
      nftStatus: data.nft_status,
      transactionHash: data.transaction_hash,
      mintedAt: data.minted_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateNFTStatus(
    badgeId: string,
    status: NFTBadge['nftStatus'],
    transactionHash?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('nft_badges')
      .update({
        nft_status: status,
        transaction_hash: transactionHash,
        minted_at: status === 'minted' ? new Date().toISOString() : undefined,
      })
      .eq('id', badgeId);

    if (error) throw error;
  },
};

// Crypto Payment Operations
export const cryptoPaymentService = {
  async createPayment(paymentData: Partial<CryptoPayment>): Promise<CryptoPayment> {
    const { data, error } = await supabase
      .from('crypto_payments')
      .insert({
        user_id: paymentData.userId,
        product_id: paymentData.productId,
        currency: paymentData.currency,
        amount: paymentData.amount,
        wallet_address: paymentData.walletAddress,
        blockchain_network: paymentData.blockchainNetwork,
        payment_status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id,
      currency: data.currency,
      amount: data.amount,
      walletAddress: data.wallet_address,
      transactionHash: data.transaction_hash,
      blockchainNetwork: data.blockchain_network,
      paymentStatus: data.payment_status,
      confirmationCount: data.confirmation_count,
      gasFee: data.gas_fee,
      exchangeRate: data.exchange_rate,
      fiatEquivalent: data.fiat_equivalent,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updatePaymentStatus(
    paymentId: string,
    status: CryptoPayment['paymentStatus'],
    transactionHash?: string,
    confirmations?: number
  ): Promise<void> {
    const { error } = await supabase
      .from('crypto_payments')
      .update({
        payment_status: status,
        transaction_hash: transactionHash,
        confirmation_count: confirmations,
      })
      .eq('id', paymentId);

    if (error) throw error;
  },

  async getUserPayments(userId: string): Promise<CryptoPayment[]> {
    const { data, error } = await supabase
      .from('crypto_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(payment => ({
      id: payment.id,
      userId: payment.user_id,
      productId: payment.product_id,
      currency: payment.currency,
      amount: payment.amount,
      walletAddress: payment.wallet_address,
      transactionHash: payment.transaction_hash,
      blockchainNetwork: payment.blockchain_network,
      paymentStatus: payment.payment_status,
      confirmationCount: payment.confirmation_count,
      gasFee: payment.gas_fee,
      exchangeRate: payment.exchange_rate,
      fiatEquivalent: payment.fiat_equivalent,
      metadata: payment.metadata,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    }));
  },
};

// Decentralized Identity Operations
export const didService = {
  async createDID(didData: Partial<DecentralizedIdentity>): Promise<DecentralizedIdentity> {
    const { data, error } = await supabase
      .from('decentralized_identities')
      .insert({
        user_id: didData.userId,
        did_identifier: didData.didIdentifier,
        did_document: didData.didDocument,
        verification_method: didData.verificationMethod,
        blockchain_network: didData.blockchainNetwork,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      didIdentifier: data.did_identifier,
      didDocument: data.did_document,
      verificationMethod: data.verification_method,
      blockchainNetwork: data.blockchain_network,
      isVerified: data.is_verified,
      verifiedAt: data.verified_at,
      revokedAt: data.revoked_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async verifyDID(didId: string): Promise<void> {
    const { error } = await supabase
      .from('decentralized_identities')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', didId);

    if (error) throw error;
  },

  async getUserDID(userId: string): Promise<DecentralizedIdentity | null> {
    const { data, error } = await supabase
      .from('decentralized_identities')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      didIdentifier: data.did_identifier,
      didDocument: data.did_document,
      verificationMethod: data.verification_method,
      blockchainNetwork: data.blockchain_network,
      isVerified: data.is_verified,
      verifiedAt: data.verified_at,
      revokedAt: data.revoked_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },
};

// =====================================================
// ENTERPRISE FEATURES
// =====================================================

export interface BIMetric {
  id: string;
  metricName: string;
  metricCategory: string;
  metricValue: number;
  dimension1?: string;
  dimension2?: string;
  dimension3?: string;
  timePeriod: string;
  aggregationLevel: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export const enterpriseAnalyticsService = {
  async getMetricsByCategory(
    category: string,
    startDate: string,
    endDate: string
  ): Promise<BIMetric[]> {
    const { data, error } = await supabase
      .from('business_intelligence_metrics')
      .select('*')
      .eq('metric_category', category)
      .gte('time_period', startDate)
      .lte('time_period', endDate)
      .order('time_period', { ascending: false });

    if (error) throw error;
    return data.map(metric => ({
      id: metric.id,
      metricName: metric.metric_name,
      metricCategory: metric.metric_category,
      metricValue: metric.metric_value,
      dimension1: metric.dimension_1,
      dimension2: metric.dimension_2,
      dimension3: metric.dimension_3,
      timePeriod: metric.time_period,
      aggregationLevel: metric.aggregation_level,
      metadata: metric.metadata,
      createdAt: metric.created_at,
    }));
  },

  async getDashboardMetrics(): Promise<{
    revenue: number;
    users: number;
    courses: number;
    engagement: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('business_intelligence_metrics')
      .select('*')
      .eq('time_period', today)
      .in('metric_name', ['total_revenue', 'active_users', 'course_enrollments', 'engagement_rate']);

    if (error) throw error;

    const metrics = data.reduce((acc, metric) => {
      switch (metric.metric_name) {
        case 'total_revenue':
          acc.revenue = metric.metric_value;
          break;
        case 'active_users':
          acc.users = metric.metric_value;
          break;
        case 'course_enrollments':
          acc.courses = metric.metric_value;
          break;
        case 'engagement_rate':
          acc.engagement = metric.metric_value;
          break;
      }
      return acc;
    }, { revenue: 0, users: 0, courses: 0, engagement: 0 });

    return metrics;
  },
};

// =====================================================
// CONTENT PROTECTION
// =====================================================

export interface DRMLicense {
  id: string;
  userId: string;
  contentId: string;
  contentType: string;
  drmType: 'widevine' | 'fairplay' | 'playready' | 'custom';
  licenseKey: string;
  deviceId?: string;
  expiryDate: string;
  maxDevices: number;
  currentDevices: number;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export const contentProtectionService = {
  async createDRMLicense(licenseData: Partial<DRMLicense>): Promise<DRMLicense> {
    const { data, error } = await supabase
      .from('drm_licenses')
      .insert({
        user_id: licenseData.userId,
        content_id: licenseData.contentId,
        content_type: licenseData.contentType,
        drm_type: licenseData.drmType,
        license_key: licenseData.licenseKey,
        expiry_date: licenseData.expiryDate,
        max_devices: licenseData.maxDevices || 3,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      contentId: data.content_id,
      contentType: data.content_type,
      drmType: data.drm_type,
      licenseKey: data.license_key,
      deviceId: data.device_id,
      expiryDate: data.expiry_date,
      maxDevices: data.max_devices,
      currentDevices: data.current_devices,
      isActive: data.is_active,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async getUserLicenses(userId: string): Promise<DRMLicense[]> {
    const { data, error } = await supabase
      .from('drm_licenses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(license => ({
      id: license.id,
      userId: license.user_id,
      contentId: license.content_id,
      contentType: license.content_type,
      drmType: license.drm_type,
      licenseKey: license.license_key,
      deviceId: license.device_id,
      expiryDate: license.expiry_date,
      maxDevices: license.max_devices,
      currentDevices: license.current_devices,
      isActive: license.is_active,
      metadata: license.metadata,
      createdAt: license.created_at,
      updatedAt: license.updated_at,
    }));
  },
};

// =====================================================
// ADVANCED MLM
// =====================================================

export interface MLMCompensationPlan {
  id: string;
  planName: string;
  planType: 'binary' | 'matrix' | 'unilevel' | 'stairstep' | 'hybrid';
  planDescription?: string;
  binaryConfig?: Record<string, any>;
  matrixConfig?: Record<string, any>;
  unilevelConfig?: Record<string, any>;
  bonusStructure: Record<string, any>;
  qualificationRules: Record<string, any>;
  payoutFrequency: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamAnalytics {
  id: string;
  userId: string;
  teamId?: string;
  periodStart: string;
  periodEnd: string;
  teamSize: number;
  activeMembers: number;
  totalVolume: number;
  personalVolume: number;
  groupVolume: number;
  newRecruits: number;
  rankAdvancement: number;
  totalCommissions: number;
  metadata: Record<string, any>;
  createdAt: string;
}

export const advancedMLMService = {
  async getActiveCompensationPlans(): Promise<MLMCompensationPlan[]> {
    const { data, error } = await supabase
      .from('mlm_compensation_plans')
      .select('*')
      .eq('is_active', true)
      .order('effective_from', { ascending: false });

    if (error) throw error;
    return data.map(plan => ({
      id: plan.id,
      planName: plan.plan_name,
      planType: plan.plan_type,
      planDescription: plan.plan_description,
      binaryConfig: plan.binary_config,
      matrixConfig: plan.matrix_config,
      unilevelConfig: plan.unilevel_config,
      bonusStructure: plan.bonus_structure,
      qualificationRules: plan.qualification_rules,
      payoutFrequency: plan.payout_frequency,
      isActive: plan.is_active,
      effectiveFrom: plan.effective_from,
      effectiveTo: plan.effective_to,
      createdAt: plan.created_at,
      updatedAt: plan.updated_at,
    }));
  },

  async getUserTeamAnalytics(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<TeamAnalytics[]> {
    const { data, error } = await supabase
      .from('mlm_team_analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('period_start', startDate)
      .lte('period_end', endDate)
      .order('period_start', { ascending: false });

    if (error) throw error;
    return data.map(analytics => ({
      id: analytics.id,
      userId: analytics.user_id,
      teamId: analytics.team_id,
      periodStart: analytics.period_start,
      periodEnd: analytics.period_end,
      teamSize: analytics.team_size,
      activeMembers: analytics.active_members,
      totalVolume: analytics.total_volume,
      personalVolume: analytics.personal_volume,
      groupVolume: analytics.group_volume,
      newRecruits: analytics.new_recruits,
      rankAdvancement: analytics.rank_advancement,
      totalCommissions: analytics.total_commissions,
      metadata: analytics.metadata,
      createdAt: analytics.created_at,
    }));
  },

  async getLatestTeamAnalytics(userId: string): Promise<TeamAnalytics | null> {
    const { data, error } = await supabase
      .from('mlm_team_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('period_end', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      teamId: data.team_id,
      periodStart: data.period_start,
      periodEnd: data.period_end,
      teamSize: data.team_size,
      activeMembers: data.active_members,
      totalVolume: data.total_volume,
      personalVolume: data.personal_volume,
      groupVolume: data.group_volume,
      newRecruits: data.new_recruits,
      rankAdvancement: data.rank_advancement,
      totalCommissions: data.total_commissions,
      metadata: data.metadata,
      createdAt: data.created_at,
    };
  },
};