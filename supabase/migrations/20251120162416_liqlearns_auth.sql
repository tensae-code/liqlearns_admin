-- Location: supabase/migrations/20251120162416_liqlearns_auth.sql
-- Schema Analysis: Empty database - creating complete auth system
-- Integration Type: New authentication module
-- Dependencies: None (fresh project)

-- 1. Create Types
CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'support', 'admin', 'ceo');
CREATE TYPE public.account_status AS ENUM ('pending_approval', 'active', 'suspended', 'free_trial');
CREATE TYPE public.subscription_plan AS ENUM ('monthly', 'yearly', 'free_trial');

-- 2. Core Tables
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role public.user_role NOT NULL DEFAULT 'student'::public.user_role,
    account_status public.account_status DEFAULT 'active'::public.account_status,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Student-specific table
CREATE TABLE public.student_profiles (
    id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subscription_plan public.subscription_plan DEFAULT 'free_trial'::public.subscription_plan,
    trial_end_date TIMESTAMPTZ,
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    has_active_subscription BOOLEAN DEFAULT false,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Teacher/Support/Admin approval requests table
CREATE TABLE public.role_approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    requested_role public.user_role NOT NULL,
    form_data JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.user_profiles(id)
);

-- Two-factor authentication codes table
CREATE TABLE public.two_factor_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    phone TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes')
);

-- Platform statistics (managed by CEO)
CREATE TABLE public.platform_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_learners INTEGER DEFAULT 0,
    total_languages INTEGER DEFAULT 1,
    success_rate DECIMAL(5,2) DEFAULT 0.0,
    countries_count INTEGER DEFAULT 0,
    recommendation_rate DECIMAL(5,2) DEFAULT 0.0,
    completion_rate DECIMAL(5,2) DEFAULT 0.0,
    growth_rate DECIMAL(5,2) DEFAULT 0.0,
    happy_students INTEGER DEFAULT 0,
    demo_video_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Stripe payment plans (managed by CEO)
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    features JSONB,
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_student_profiles_user_id ON public.student_profiles(id);
CREATE INDEX idx_role_approval_requests_user_id ON public.role_approval_requests(user_id);
CREATE INDEX idx_role_approval_requests_status ON public.role_approval_requests(status);
CREATE INDEX idx_two_factor_codes_user_id ON public.two_factor_codes(user_id);
CREATE INDEX idx_two_factor_codes_phone ON public.two_factor_codes(phone);

-- 4. Functions (MUST BE BEFORE RLS POLICIES)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $func$
BEGIN
    INSERT INTO public.user_profiles (id, email, username, full_name, phone, role, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    
    -- If student role, create student profile with 3-day free trial
    IF COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role) = 'student'::public.user_role THEN
        INSERT INTO public.student_profiles (id, subscription_plan, trial_end_date)
        VALUES (
            NEW.id,
            'free_trial'::public.subscription_plan,
            CURRENT_TIMESTAMP + INTERVAL '3 days'
        );
    END IF;
    
    RETURN NEW;
END;
$func$;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if user is CEO
CREATE OR REPLACE FUNCTION public.is_ceo()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'ceo'::public.user_role
)
$$;

-- Function to check if user is admin or CEO
CREATE OR REPLACE FUNCTION public.is_admin_or_ceo()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role IN ('admin'::public.user_role, 'ceo'::public.user_role)
)
$$;

-- 5. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- user_profiles: Users manage own profiles, admins/CEO can view all
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "admins_view_all_user_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_admin_or_ceo());

-- student_profiles: Students manage own, admins/CEO can view all
CREATE POLICY "students_manage_own_student_profiles"
ON public.student_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "admins_view_all_student_profiles"
ON public.student_profiles
FOR SELECT
TO authenticated
USING (public.is_admin_or_ceo());

-- role_approval_requests: Users can create/view own, admins can manage all
CREATE POLICY "users_create_own_approval_requests"
ON public.role_approval_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_view_own_approval_requests"
ON public.role_approval_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admins_manage_all_approval_requests"
ON public.role_approval_requests
FOR ALL
TO authenticated
USING (public.is_admin_or_ceo())
WITH CHECK (public.is_admin_or_ceo());

-- two_factor_codes: Users manage own codes
CREATE POLICY "users_manage_own_two_factor_codes"
ON public.two_factor_codes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- platform_statistics: Public can read, only CEO can modify
CREATE POLICY "public_read_platform_statistics"
ON public.platform_statistics
FOR SELECT
TO public
USING (true);

CREATE POLICY "ceo_manage_platform_statistics"
ON public.platform_statistics
FOR ALL
TO authenticated
USING (public.is_ceo())
WITH CHECK (public.is_ceo());

-- subscription_plans: Public can read, only CEO can modify
CREATE POLICY "public_read_subscription_plans"
ON public.subscription_plans
FOR SELECT
TO public
USING (true);

CREATE POLICY "ceo_manage_subscription_plans"
ON public.subscription_plans
FOR ALL
TO authenticated
USING (public.is_ceo())
WITH CHECK (public.is_ceo());

-- 7. Initialize platform statistics
INSERT INTO public.platform_statistics (
    total_learners,
    total_languages,
    success_rate,
    countries_count,
    recommendation_rate,
    completion_rate,
    growth_rate,
    happy_students,
    demo_video_url
) VALUES (
    0,
    1,
    0.0,
    0,
    0.0,
    0.0,
    0.0,
    0,
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
);

-- 8. Initialize subscription plans
INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, currency, features, is_active)
VALUES
    ('Basic', 9.99, 99.99, 'USD', 
     '{"access_to_basic_tools": true, "support": "email", "storage": "10GB"}'::jsonb, 
     true),
    ('Premium', 19.99, 199.99, 'USD', 
     '{"access_to_all_tools": true, "support": "priority", "storage": "unlimited"}'::jsonb, 
     true);

-- 9. Mock Data for Testing
DO $$
DECLARE
    ceo_uuid UUID := gen_random_uuid();
    admin_uuid UUID := gen_random_uuid();
    student_uuid UUID := gen_random_uuid();
    teacher_uuid UUID := gen_random_uuid();
    support_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with all required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (ceo_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'ceo@liqlearns.com', crypt('ceo123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "CEO User", "username": "ceo", "role": "ceo"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@liqlearns.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "username": "admin", "role": "admin"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (student_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'student@liqlearns.com', crypt('student123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Student User", "username": "student", "role": "student"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (teacher_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'teacher@liqlearns.com', crypt('teacher123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Teacher User", "username": "teacher", "role": "teacher"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (support_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'support@liqlearns.com', crypt('support123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Support User", "username": "support", "role": "support"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- user_profiles will be created automatically by the trigger
    -- student_profiles will be created automatically for student role
    
END $$;