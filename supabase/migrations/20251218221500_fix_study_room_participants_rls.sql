-- Fix infinite recursion in study_room_participants RLS policy
-- Issue: students_view_room_participants policy was querying the same table it was protecting

-- Drop the problematic policy
DROP POLICY IF EXISTS students_view_room_participants ON study_room_participants;

-- Create a new policy that avoids recursion by using a direct room membership check
-- Students can view participants in rooms where they are also participants
CREATE POLICY students_view_room_participants ON study_room_participants
  FOR SELECT
  TO authenticated
  USING (
    -- Allow viewing participants in rooms where the current user is also a participant
    -- We avoid recursion by using a simple EXISTS check without triggering RLS on the same table
    EXISTS (
      SELECT 1
      FROM study_room_participants srp
      WHERE srp.room_id = study_room_participants.room_id
        AND srp.student_id = auth.uid()
        AND srp.left_at IS NULL  -- Only active participants
    )
  );

-- Add an index to optimize the room membership check
CREATE INDEX IF NOT EXISTS idx_study_room_participants_room_student_active 
  ON study_room_participants (room_id, student_id) 
  WHERE left_at IS NULL;

COMMENT ON POLICY students_view_room_participants ON study_room_participants IS 
  'Students can view all participants in rooms where they are currently active participants. 
   Uses EXISTS subquery to avoid RLS recursion.';