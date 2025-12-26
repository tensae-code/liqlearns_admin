-- Ensure tutoring_resources table is properly accessible
-- This migration ensures the table is properly registered in PostgREST schema cache

-- Refresh the schema cache (this is a PostgreSQL notify command)
NOTIFY pgrst, 'reload schema';

-- Ensure RLS is enabled
ALTER TABLE tutoring_resources ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to recreate it properly)
DROP POLICY IF EXISTS public_can_read_tutoring_resources ON tutoring_resources;

-- Create comprehensive RLS policy
CREATE POLICY public_can_read_tutoring_resources ON tutoring_resources
  FOR SELECT
  TO authenticated
  USING (true);

-- Grant necessary permissions
GRANT SELECT ON tutoring_resources TO authenticated;
GRANT SELECT ON tutoring_resources TO anon;

-- Add a comment to ensure table is documented
COMMENT ON TABLE tutoring_resources IS 'Stores tutoring resources with unlock requirements based on student level, XP, and aura points';

-- Verify table exists and is accessible
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'tutoring_resources'
  ) THEN
    RAISE EXCEPTION 'tutoring_resources table does not exist';
  END IF;
END $$;

-- Add sample resources if table is empty (for testing purposes)
DO $$
DECLARE
  resource_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO resource_count FROM tutoring_resources;
  
  IF resource_count = 0 THEN
    INSERT INTO tutoring_resources (name, category, icon_color, unlock_level, unlock_xp, unlock_aura_points, is_premium)
    VALUES
      ('Books', 'Reading', 'bg-blue-500', 1, 0, 0, false),
      ('Videos', 'Visual', 'bg-red-500', 1, 0, 0, false),
      ('Audio', 'Listening', 'bg-purple-500', 2, 500, 100, false),
      ('Music', 'Listening', 'bg-pink-500', 2, 500, 100, false),
      ('Games', 'Interactive', 'bg-green-500', 3, 1000, 250, false),
      ('Audiobooks', 'Reading', 'bg-indigo-500', 3, 1000, 250, false),
      ('Vocabulary', 'Learning', 'bg-yellow-500', 4, 1500, 400, false),
      ('Notes', 'Study', 'bg-gray-500', 4, 1500, 400, false),
      ('Exercises', 'Practice', 'bg-orange-500', 5, 2000, 600, false),
      ('Novels', 'Reading', 'bg-teal-500', 5, 2000, 600, false),
      ('Movies', 'Visual', 'bg-cyan-500', 6, 2500, 800, true),
      ('Live Classes', 'Interactive', 'bg-lime-500', 7, 3000, 1000, true);
  END IF;
END $$;

-- Create index for better query performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_tutoring_resources_unlock_requirements 
  ON tutoring_resources(unlock_level, unlock_xp, unlock_aura_points);

-- Force a schema cache reload
SELECT pg_notify('pgrst', 'reload schema');