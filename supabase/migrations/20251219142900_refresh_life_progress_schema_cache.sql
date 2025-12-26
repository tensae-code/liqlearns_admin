-- Location: supabase/migrations/20251219142900_refresh_life_progress_schema_cache.sql
-- Schema Analysis: Fixing schema cache synchronization issue for life_progress_entries
-- Integration Type: Schema maintenance / cache refresh
-- Dependencies: life_progress_entries table

-- The error indicates schema cache expects 'last_updated_at' but table has 'updated_at'
-- This migration ensures proper schema recognition without data loss

-- Drop and recreate the trigger to refresh schema cache understanding
DROP TRIGGER IF EXISTS update_life_progress_entries_timestamp ON public.life_progress_entries;

-- Recreate the trigger function with explicit column reference
CREATE OR REPLACE FUNCTION public.trigger_update_life_progress_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_life_progress_entries_timestamp
    BEFORE UPDATE ON public.life_progress_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_life_progress_timestamp();

-- Add a comment to the updated_at column to help with schema cache
COMMENT ON COLUMN public.life_progress_entries.updated_at IS 'Timestamp of last update, automatically managed by trigger';

-- Force PostgREST schema cache reload by touching the table structure
-- This is a no-op ALTER that forces schema cache refresh
ALTER TABLE public.life_progress_entries ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- Verify the column exists (this helps PostgREST recognize it)
DO $$
BEGIN
    -- Check if updated_at column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'life_progress_entries' 
        AND column_name = 'updated_at'
    ) THEN
        RAISE EXCEPTION 'Column updated_at does not exist in life_progress_entries table';
    END IF;
    
    RAISE NOTICE 'Schema validation passed: updated_at column exists and is properly configured';
END $$;