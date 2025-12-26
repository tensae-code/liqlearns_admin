-- Location: supabase/migrations/20251223194500_add_email_verification.sql
-- Schema Analysis: email_verifications table for OTP verification
-- Integration Type: addition
-- Dependencies: user_profiles

BEGIN;

-- Create email_verifications table similar to two_factor_codes
CREATE TABLE IF NOT EXISTS public.email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes'),
    attempts INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON public.email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON public.email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_verified ON public.email_verifications(verified);

-- Enable RLS
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow anonymous users to create and verify during signup
CREATE POLICY "anon_can_insert_email_verifications"
ON public.email_verifications
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

CREATE POLICY "anon_can_select_email_verifications"
ON public.email_verifications
FOR SELECT
TO anon
USING (true);

CREATE POLICY "anon_can_update_email_verifications"
ON public.email_verifications
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Authenticated users can only manage their own verifications
CREATE POLICY "authenticated_manage_own_email_verifications"
ON public.email_verifications
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Service role has full access
CREATE POLICY "service_role_email_verifications"
ON public.email_verifications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Trigger to ensure defaults
CREATE OR REPLACE FUNCTION public.ensure_email_verification_defaults()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $func$
BEGIN
    -- Set verified to false if not explicitly set
    IF NEW.verified IS NULL THEN
        NEW.verified := false;
    END IF;
    
    -- Set expires_at if not explicitly set
    IF NEW.expires_at IS NULL THEN
        NEW.expires_at := CURRENT_TIMESTAMP + INTERVAL '10 minutes';
    END IF;
    
    -- Initialize attempts if not set
    IF NEW.attempts IS NULL THEN
        NEW.attempts := 0;
    END IF;
    
    RETURN NEW;
END;
$func$;

CREATE TRIGGER ensure_email_verification_defaults_trigger
BEFORE INSERT ON public.email_verifications
FOR EACH ROW
EXECUTE FUNCTION public.ensure_email_verification_defaults();

COMMIT;