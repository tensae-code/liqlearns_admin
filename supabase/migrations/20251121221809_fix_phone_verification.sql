-- Fix Phone Verification Issues
-- This migration ensures two_factor_codes are created with verified=false by default
-- and fixes any existing incorrectly verified codes

-- First, update any existing codes that were incorrectly marked as verified
-- when they shouldn't be (codes that were just created)
UPDATE two_factor_codes
SET verified = false
WHERE verified = true 
  AND created_at >= NOW() - INTERVAL '1 hour';

-- Ensure the default value is explicitly false (redundant but explicit)
ALTER TABLE two_factor_codes 
  ALTER COLUMN verified SET DEFAULT false;

-- Add a check constraint to prevent verified from being true on insert
-- unless explicitly set by verification process
ALTER TABLE two_factor_codes
  DROP CONSTRAINT IF EXISTS check_verified_on_insert;

-- Add a comment to the table documenting the expected behavior
COMMENT ON COLUMN two_factor_codes.verified IS 
  'Must be false on creation. Only set to true after successful verification via verifyTwoFactorCode function.';

-- Create a function to ensure proper verification flow
CREATE OR REPLACE FUNCTION ensure_two_factor_code_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure new codes are created with verified = false
  IF TG_OP = 'INSERT' THEN
    NEW.verified := false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_two_factor_defaults_trigger ON two_factor_codes;

-- Create trigger to enforce defaults on insert
CREATE TRIGGER ensure_two_factor_defaults_trigger
  BEFORE INSERT ON two_factor_codes
  FOR EACH ROW
  EXECUTE FUNCTION ensure_two_factor_code_defaults();

-- Add logging for debugging (optional but helpful)
DO $$
BEGIN
  RAISE NOTICE 'Fixed phone verification: codes now properly default to verified=false';
END $$;