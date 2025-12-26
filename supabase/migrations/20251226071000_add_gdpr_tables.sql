-- Create user_consent_settings table for GDPR cookie consent
CREATE TABLE IF NOT EXISTS user_consent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  essential_consent BOOLEAN NOT NULL DEFAULT TRUE,
  analytics_consent BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  functional_consent BOOLEAN NOT NULL DEFAULT FALSE,
  consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create account_deletion_requests table for GDPR right to erasure
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
  deletion_scheduled_date TIMESTAMPTZ NOT NULL,
  deleted_date TIMESTAMPTZ,
  reason TEXT,
  UNIQUE(user_id, status)
);

-- Create security_audit_logs table for tracking login attempts and security events
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  event_description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies for user_consent_settings
ALTER TABLE user_consent_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent settings"
  ON user_consent_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own consent settings"
  ON user_consent_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent settings"
  ON user_consent_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for account_deletion_requests
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deletion requests"
  ON account_deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deletion requests"
  ON account_deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for security_audit_logs (read-only for users)
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON security_audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_consent_settings_user_id ON user_consent_settings(user_id);
CREATE INDEX idx_account_deletion_requests_user_id ON account_deletion_requests(user_id);
CREATE INDEX idx_account_deletion_requests_status ON account_deletion_requests(status);
CREATE INDEX idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_event_type ON security_audit_logs(event_type);
CREATE INDEX idx_security_audit_logs_created_at ON security_audit_logs(created_at DESC);

-- Function to auto-update last_updated timestamp
CREATE OR REPLACE FUNCTION update_consent_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consent_settings_timestamp
  BEFORE UPDATE ON user_consent_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_settings_timestamp();