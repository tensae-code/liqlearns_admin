-- ================================================
-- Life Progress Wheel Migration
-- ================================================
-- Purpose: Track student life progress across 7 categories
-- Integration Type: NEW_MODULE (additive)
-- Dependencies: student_profiles table (existing)
-- ================================================

-- Create enum for life categories
DO $$ BEGIN
    CREATE TYPE public.life_category AS ENUM (
        'spiritual',
        'health',
        'wealth',
        'service',
        'education',
        'family',
        'social'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create life_progress_entries table
CREATE TABLE IF NOT EXISTS public.life_progress_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    category public.life_category NOT NULL,
    satisfaction_score INTEGER NOT NULL CHECK (satisfaction_score >= 1 AND satisfaction_score <= 100),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one entry per student per category per day
    CONSTRAINT unique_daily_entry UNIQUE (student_id, category, entry_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_life_progress_student_id ON public.life_progress_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_life_progress_entry_date ON public.life_progress_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_life_progress_category ON public.life_progress_entries(category);
CREATE INDEX IF NOT EXISTS idx_life_progress_student_date ON public.life_progress_entries(student_id, entry_date);

-- Enable Row Level Security
ALTER TABLE public.life_progress_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Students can manage their own life progress entries
CREATE POLICY "students_manage_own_life_progress"
    ON public.life_progress_entries
    FOR ALL
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- RLS Policy: Teachers/Admins can view all entries
CREATE POLICY "teachers_view_life_progress"
    ON public.life_progress_entries
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role IN ('teacher', 'admin', 'ceo')
        )
    );

-- Create function to calculate average satisfaction for a category
CREATE OR REPLACE FUNCTION public.get_category_average_satisfaction(
    p_student_id UUID,
    p_category public.life_category,
    p_days INTEGER DEFAULT 30
) RETURNS NUMERIC AS $$
BEGIN
    RETURN (
        SELECT COALESCE(AVG(satisfaction_score), 0)
        FROM public.life_progress_entries
        WHERE student_id = p_student_id
        AND category = p_category
        AND entry_date >= CURRENT_DATE - p_days
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get overall life progress score
CREATE OR REPLACE FUNCTION public.get_overall_life_progress(
    p_student_id UUID,
    p_days INTEGER DEFAULT 30
) RETURNS NUMERIC AS $$
BEGIN
    RETURN (
        SELECT COALESCE(AVG(satisfaction_score), 0)
        FROM public.life_progress_entries
        WHERE student_id = p_student_id
        AND entry_date >= CURRENT_DATE - p_days
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_update_life_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_life_progress_entries_timestamp
    BEFORE UPDATE ON public.life_progress_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_life_progress_timestamp();

-- Insert sample data for demonstration
DO $$
DECLARE
    v_student_id UUID;
    v_categories public.life_category[] := ARRAY['spiritual', 'health', 'wealth', 'service', 'education', 'family', 'social']::public.life_category[];
    v_category public.life_category;
    v_days INTEGER;
BEGIN
    -- Get first student ID from student_profiles
    SELECT id INTO v_student_id FROM public.student_profiles LIMIT 1;
    
    IF v_student_id IS NOT NULL THEN
        -- Insert sample entries for the last 7 days
        FOR v_days IN 0..6 LOOP
            FOREACH v_category IN ARRAY v_categories LOOP
                INSERT INTO public.life_progress_entries (
                    student_id,
                    category,
                    satisfaction_score,
                    entry_date,
                    notes
                ) VALUES (
                    v_student_id,
                    v_category,
                    50 + FLOOR(RANDOM() * 50)::INTEGER, -- Random score 50-100
                    CURRENT_DATE - v_days,
                    CASE 
                        WHEN v_days = 0 THEN 'Today''s progress'
                        ELSE 'Sample entry from ' || v_days || ' days ago'
                    END
                )
                ON CONFLICT (student_id, category, entry_date) DO NOTHING;
            END LOOP;
        END LOOP;
    END IF;
END $$;