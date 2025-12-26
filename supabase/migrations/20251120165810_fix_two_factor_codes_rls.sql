-- Migration: Fix Two-Factor Codes RLS Policy for Anonymous Users
-- Issue: 401 errors during signup because anonymous users can't insert verification codes
-- Solution: Add policy allowing anonymous users to insert two-factor codes for phone verification

-- Drop existing policy that only allows authenticated users
DROP POLICY IF EXISTS users_manage_own_two_factor_codes ON two_factor_codes;

-- Create new policies:
-- 1. Allow anonymous users to INSERT verification codes during signup (no user_id yet)
CREATE POLICY anon_can_insert_two_factor_codes ON two_factor_codes
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- 2. Allow authenticated users to manage their own two-factor codes
CREATE POLICY authenticated_manage_own_two_factor_codes ON two_factor_codes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Allow anonymous users to SELECT codes for phone verification
CREATE POLICY anon_can_select_two_factor_codes ON two_factor_codes
  FOR SELECT
  TO anon
  USING (true);

-- 4. Allow anonymous users to UPDATE verification status after entering code
CREATE POLICY anon_can_update_two_factor_codes ON two_factor_codes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Add comment explaining the security model
COMMENT ON TABLE two_factor_codes IS 'Two-factor authentication codes for phone verification. Anonymous users can create and verify codes during signup. Authenticated users can only manage their own codes.';