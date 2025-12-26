-- Migration: Add Tutor Demo Account
-- Purpose: Create demo tutor account for testing teacher/tutor dashboard
-- Timestamp: 20251202011506

DO $$
DECLARE
    tutor_uuid UUID := gen_random_uuid();
BEGIN
    -- Create tutor auth user
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (tutor_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'tutor@liqlearns.com', crypt('tutor123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Tutor User", "username": "tutor", "role": "teacher"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);
    
    -- Note: user_profiles will be created automatically by the handle_new_user trigger
    -- The trigger will insert into user_profiles with role 'teacher' since enum doesn't have 'tutor'
    
END $$;

-- Add comment to clarify tutor/teacher role equivalence
COMMENT ON TYPE public.user_role IS 'User roles: student, teacher (includes tutors), support, admin, ceo. Note: "tutor" is treated as "teacher" in the database but can be displayed differently in UI.';