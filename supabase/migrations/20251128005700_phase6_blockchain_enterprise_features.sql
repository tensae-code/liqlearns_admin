-- Location: supabase/migrations/20251128005700_phase6_blockchain_enterprise_features.sql
-- Schema Analysis: Building upon existing 67 tables (Phases 1-5)
-- Integration Type: NEW_MODULE - Blockchain, Enterprise, Content Protection, Advanced MLM
-- Dependencies: user_profiles, mlm_network, mlm_commissions, courses, marketplace_products

-- =====================================================
-- PHASE 6: BLOCKCHAIN & ENTERPRISE FEATURES
-- =====================================================

-- 1. CUSTOM TYPES
CREATE TYPE public.blockchain_network AS ENUM ('ethereum', 'polygon', 'binance_smart_chain', 'solana');
CREATE TYPE public.nft_status AS ENUM ('minting', 'minted', 'transferred', 'burned');
CREATE TYPE public.crypto_currency AS ENUM ('eth', 'matic', 'bnb', 'sol', 'usdt', 'usdc');
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'confirmed', 'failed', 'refunded');
CREATE TYPE public.sso_provider AS ENUM ('okta', 'azure_ad', 'google_workspace', 'auth0', 'custom');
CREATE TYPE public.ldap_sync_status AS ENUM ('idle', 'syncing', 'completed', 'failed');
CREATE TYPE public.drm_type AS ENUM ('widevine', 'fairplay', 'playready', 'custom');
CREATE TYPE public.watermark_type AS ENUM ('visible', 'invisible', 'dynamic', 'forensic');
CREATE TYPE public.compensation_plan_type AS ENUM ('binary', 'matrix', 'unilevel', 'stairstep', 'hybrid');

-- 2. BLOCKCHAIN INTEGRATION TABLES

-- NFT Badge System
CREATE TABLE public.nft_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.student_achievements(id) ON DELETE SET NULL,
    token_id TEXT UNIQUE NOT NULL,
    blockchain_network public.blockchain_network NOT NULL,
    contract_address TEXT NOT NULL,
    metadata_uri TEXT NOT NULL,
    nft_status public.nft_status DEFAULT 'minting'::public.nft_status,
    transaction_hash TEXT,
    minted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Cryptocurrency Payment System
CREATE TABLE public.crypto_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.marketplace_products(id) ON DELETE SET NULL,
    currency public.crypto_currency NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    wallet_address TEXT NOT NULL,
    transaction_hash TEXT UNIQUE,
    blockchain_network public.blockchain_network NOT NULL,
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status,
    confirmation_count INTEGER DEFAULT 0,
    gas_fee DECIMAL(20, 8),
    exchange_rate DECIMAL(20, 8),
    fiat_equivalent DECIMAL(10, 2),
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Decentralized Identity (DID)
CREATE TABLE public.decentralized_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    did_identifier TEXT UNIQUE NOT NULL,
    did_document JSONB NOT NULL,
    verification_method JSONB NOT NULL,
    blockchain_network public.blockchain_network NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. ENTERPRISE FEATURES TABLES

-- SSO Integration
CREATE TABLE public.sso_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name TEXT NOT NULL,
    sso_provider public.sso_provider NOT NULL,
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    domain TEXT NOT NULL,
    metadata_url TEXT,
    certificate TEXT,
    is_active BOOLEAN DEFAULT true,
    auto_provision BOOLEAN DEFAULT true,
    default_role public.user_role DEFAULT 'student'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- LDAP Integration
CREATE TABLE public.ldap_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name TEXT NOT NULL,
    ldap_server TEXT NOT NULL,
    ldap_port INTEGER DEFAULT 389,
    bind_dn TEXT NOT NULL,
    bind_password TEXT NOT NULL,
    base_dn TEXT NOT NULL,
    user_filter TEXT DEFAULT '(objectClass=person)'::TEXT,
    group_filter TEXT DEFAULT '(objectClass=group)'::TEXT,
    sync_interval INTEGER DEFAULT 3600,
    last_sync_status public.ldap_sync_status DEFAULT 'idle'::public.ldap_sync_status,
    last_sync_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Advanced Analytics
CREATE TABLE public.business_intelligence_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_category TEXT NOT NULL,
    metric_value DECIMAL(15, 2) NOT NULL,
    dimension_1 TEXT,
    dimension_2 TEXT,
    dimension_3 TEXT,
    time_period DATE NOT NULL,
    aggregation_level TEXT DEFAULT 'daily'::TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Organization Hierarchy
CREATE TABLE public.organization_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.organization_units(id) ON DELETE CASCADE,
    unit_name TEXT NOT NULL,
    unit_type TEXT NOT NULL,
    manager_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    cost_center TEXT,
    budget DECIMAL(12, 2),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. CONTENT PROTECTION TABLES

-- DRM Licenses
CREATE TABLE public.drm_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL,
    drm_type public.drm_type NOT NULL,
    license_key TEXT NOT NULL,
    device_id TEXT,
    expiry_date TIMESTAMPTZ NOT NULL,
    max_devices INTEGER DEFAULT 3,
    current_devices INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Watermarking System
CREATE TABLE public.content_watermarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL,
    watermark_type public.watermark_type NOT NULL,
    watermark_data TEXT NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    embedded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    detection_algorithm TEXT,
    strength_level INTEGER DEFAULT 50,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Security Audit Logs (Enhanced)
CREATE TABLE public.advanced_security_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL,
    severity public.risk_level DEFAULT 'low'::public.risk_level,
    ip_address INET,
    user_agent TEXT,
    geo_location JSONB,
    resource_id UUID,
    resource_type TEXT,
    action_performed TEXT NOT NULL,
    action_result TEXT,
    anomaly_score DECIMAL(5, 2),
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. ADVANCED MLM TABLES

-- Complex Compensation Plans
CREATE TABLE public.mlm_compensation_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name TEXT NOT NULL,
    plan_type public.compensation_plan_type NOT NULL,
    plan_description TEXT,
    binary_config JSONB,
    matrix_config JSONB,
    unilevel_config JSONB,
    bonus_structure JSONB NOT NULL,
    qualification_rules JSONB NOT NULL,
    payout_frequency TEXT DEFAULT 'monthly'::TEXT,
    is_active BOOLEAN DEFAULT true,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Team Performance Analytics
CREATE TABLE public.mlm_team_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    team_id UUID,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    team_size INTEGER DEFAULT 0,
    active_members INTEGER DEFAULT 0,
    total_volume DECIMAL(12, 2) DEFAULT 0,
    personal_volume DECIMAL(12, 2) DEFAULT 0,
    group_volume DECIMAL(12, 2) DEFAULT 0,
    new_recruits INTEGER DEFAULT 0,
    rank_advancement INTEGER DEFAULT 0,
    total_commissions DECIMAL(10, 2) DEFAULT 0,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Rank Achievement Tracking
CREATE TABLE public.mlm_rank_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    previous_rank TEXT,
    current_rank TEXT NOT NULL,
    achievement_date DATE NOT NULL,
    qualification_criteria JSONB NOT NULL,
    bonus_awarded DECIMAL(10, 2),
    recognition_level TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. INDEXES

-- NFT Badges
CREATE INDEX idx_nft_badges_user_id ON public.nft_badges(user_id);
CREATE INDEX idx_nft_badges_blockchain ON public.nft_badges(blockchain_network);
CREATE INDEX idx_nft_badges_status ON public.nft_badges(nft_status);

-- Crypto Payments
CREATE INDEX idx_crypto_payments_user_id ON public.crypto_payments(user_id);
CREATE INDEX idx_crypto_payments_status ON public.crypto_payments(payment_status);
CREATE INDEX idx_crypto_payments_created_at ON public.crypto_payments(created_at);

-- DID
CREATE INDEX idx_did_user_id ON public.decentralized_identities(user_id);
CREATE INDEX idx_did_verified ON public.decentralized_identities(is_verified);

-- SSO
CREATE INDEX idx_sso_provider ON public.sso_configurations(sso_provider);
CREATE INDEX idx_sso_active ON public.sso_configurations(is_active);

-- LDAP
CREATE INDEX idx_ldap_active ON public.ldap_configurations(is_active);
CREATE INDEX idx_ldap_last_sync ON public.ldap_configurations(last_sync_at);

-- Analytics
CREATE INDEX idx_bi_metrics_category ON public.business_intelligence_metrics(metric_category);
CREATE INDEX idx_bi_metrics_period ON public.business_intelligence_metrics(time_period);

-- DRM
CREATE INDEX idx_drm_user_id ON public.drm_licenses(user_id);
CREATE INDEX idx_drm_expiry ON public.drm_licenses(expiry_date);
CREATE INDEX idx_drm_active ON public.drm_licenses(is_active);

-- Watermarks
CREATE INDEX idx_watermarks_content ON public.content_watermarks(content_id, content_type);
CREATE INDEX idx_watermarks_type ON public.content_watermarks(watermark_type);

-- Security Audits
CREATE INDEX idx_security_audits_user ON public.advanced_security_audits(user_id);
CREATE INDEX idx_security_audits_created ON public.advanced_security_audits(created_at);
CREATE INDEX idx_security_audits_severity ON public.advanced_security_audits(severity);

-- MLM Compensation
CREATE INDEX idx_mlm_plans_active ON public.mlm_compensation_plans(is_active);
CREATE INDEX idx_mlm_plans_effective ON public.mlm_compensation_plans(effective_from, effective_to);

-- Team Analytics
CREATE INDEX idx_team_analytics_user ON public.mlm_team_analytics(user_id);
CREATE INDEX idx_team_analytics_period ON public.mlm_team_analytics(period_start, period_end);

-- Rank Achievements
CREATE INDEX idx_rank_achievements_user ON public.mlm_rank_achievements(user_id);
CREATE INDEX idx_rank_achievements_date ON public.mlm_rank_achievements(achievement_date);

-- 7. FUNCTIONS

-- Calculate Blockchain Transaction Fees
CREATE OR REPLACE FUNCTION public.calculate_blockchain_fee(
    network public.blockchain_network,
    amount DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
STABLE
AS $func$
DECLARE
    fee_percentage DECIMAL := 0.01;
BEGIN
    CASE network
        WHEN 'ethereum'::public.blockchain_network THEN fee_percentage := 0.015;
        WHEN 'polygon'::public.blockchain_network THEN fee_percentage := 0.005;
        WHEN 'binance_smart_chain'::public.blockchain_network THEN fee_percentage := 0.008;
        WHEN 'solana'::public.blockchain_network THEN fee_percentage := 0.003;
    END CASE;
    
    RETURN amount * fee_percentage;
END;
$func$;

-- Calculate Advanced MLM Commissions
CREATE OR REPLACE FUNCTION public.calculate_advanced_commission(
    user_uuid UUID,
    sales_volume DECIMAL,
    plan_uuid UUID
)
RETURNS DECIMAL
LANGUAGE plpgsql
STABLE
AS $func$
DECLARE
    total_commission DECIMAL := 0;
    plan_details RECORD;
BEGIN
    SELECT * INTO plan_details
    FROM public.mlm_compensation_plans
    WHERE id = plan_uuid AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Complex commission calculation based on plan type
    -- This is a simplified version - actual implementation would be more complex
    total_commission := sales_volume * 0.1; -- 10% base rate
    
    RETURN total_commission;
END;
$func$;

-- 8. ENABLE RLS

ALTER TABLE public.nft_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decentralized_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sso_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ldap_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_intelligence_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drm_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_watermarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advanced_security_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlm_compensation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlm_team_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlm_rank_achievements ENABLE ROW LEVEL SECURITY;

-- 9. RLS POLICIES

-- NFT Badges (users can view own NFTs)
CREATE POLICY "users_view_own_nft_badges"
ON public.nft_badges
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Crypto Payments (users manage own payments)
CREATE POLICY "users_manage_own_crypto_payments"
ON public.crypto_payments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DID (users manage own identity)
CREATE POLICY "users_manage_own_did"
ON public.decentralized_identities
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- SSO (admins only)
CREATE POLICY "admins_manage_sso"
ON public.sso_configurations
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
);

-- LDAP (admins only)
CREATE POLICY "admins_manage_ldap"
ON public.ldap_configurations
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
);

-- BI Metrics (admins and CEOs)
CREATE POLICY "leadership_view_bi_metrics"
ON public.business_intelligence_metrics
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role IN ('admin'::public.user_role, 'ceo'::public.user_role)
    )
);

-- DRM Licenses (users view own licenses)
CREATE POLICY "users_view_own_drm_licenses"
ON public.drm_licenses
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Watermarks (content creators and admins)
CREATE POLICY "creators_admins_manage_watermarks"
ON public.content_watermarks
FOR ALL
TO authenticated
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
);

-- Security Audits (admins only read)
CREATE POLICY "admins_view_security_audits"
ON public.advanced_security_audits
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
);

-- MLM Plans (public read, admin write)
CREATE POLICY "public_view_mlm_plans"
ON public.mlm_compensation_plans
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admins_manage_mlm_plans"
ON public.mlm_compensation_plans
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
);

-- Team Analytics (users view own team)
CREATE POLICY "users_view_own_team_analytics"
ON public.mlm_team_analytics
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Rank Achievements (users view own achievements)
CREATE POLICY "users_view_own_rank_achievements"
ON public.mlm_rank_achievements
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 10. TRIGGERS

-- Update timestamps
CREATE TRIGGER update_nft_badges_updated_at
    BEFORE UPDATE ON public.nft_badges
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crypto_payments_updated_at
    BEFORE UPDATE ON public.crypto_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sso_configurations_updated_at
    BEFORE UPDATE ON public.sso_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();