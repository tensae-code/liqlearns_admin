-- Fix RLS policies for security_audit_logs table
-- Problem: Table has ONLY SELECT policies, but INSERT operations are being attempted
-- Solution: Add INSERT policy to allow authenticated users to insert their own audit logs

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "users_view_own_audit_logs" ON security_audit_logs;
DROP POLICY IF EXISTS "admins_view_all_audit_logs" ON security_audit_logs;
DROP POLICY IF EXISTS "Users can view own audit logs" ON security_audit_logs;

-- Recreate SELECT policies (consolidated - removing duplicates)
CREATE POLICY "users_view_own_audit_logs"
  ON security_audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "admins_view_all_audit_logs"
  ON security_audit_logs
  FOR SELECT
  TO authenticated
  USING (is_admin_or_ceo());

-- Add INSERT policy to allow users to insert their own audit logs
CREATE POLICY "users_insert_own_audit_logs"
  ON security_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add INSERT policy for admins to insert any audit logs
CREATE POLICY "admins_insert_audit_logs"
  ON security_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_ceo());

-- Add system INSERT policy for service role (used by edge functions)
CREATE POLICY "service_role_insert_audit_logs"
  ON security_audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);