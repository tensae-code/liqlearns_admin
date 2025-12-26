-- ================================================================
-- STUDENT CUSTOM MISSION CREATION POLICY
-- ================================================================
-- Purpose: Allow students to create their own missions for tomorrow
-- Date: 2025-12-18 19:20:00
-- ================================================================

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS students_can_create_missions ON daily_missions;

-- Create new INSERT policy allowing students to create missions
CREATE POLICY students_can_create_missions 
ON daily_missions 
FOR INSERT 
TO authenticated 
WITH CHECK (
  -- Allow students to create missions for future dates only (today or later)
  mission_date >= CURRENT_DATE
);

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Student mission creation policy added successfully';
  RAISE NOTICE '📝 Students can now create custom missions for tomorrow';
END $$;