-- Location: supabase/migrations/20251121035400_marketplace_system.sql
-- Schema Analysis: Building upon existing student_profiles and user_profiles
-- Integration Type: Addition
-- Dependencies: user_profiles, student_profiles

-- 1. Types for Marketplace
CREATE TYPE public.product_category AS ENUM (
    'ebook',
    'video',
    'audio',
    'flashcards',
    'worksheet',
    'guide',
    'notes',
    'other'
);

CREATE TYPE public.product_status AS ENUM (
    'draft',
    'active',
    'inactive',
    'sold_out'
);

CREATE TYPE public.payment_method AS ENUM (
    'aura_points',
    'ethiopian_birr'
);

-- 2. Core Tables
CREATE TABLE public.marketplace_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category public.product_category NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    payment_method public.payment_method NOT NULL,
    status public.product_status DEFAULT 'active'::public.product_status,
    inventory_count INTEGER DEFAULT 0 CHECK (inventory_count >= 0),
    downloads_allowed BOOLEAN DEFAULT true,
    printable BOOLEAN DEFAULT false,
    shareable BOOLEAN DEFAULT false,
    access_expiry_days INTEGER DEFAULT 0 CHECK (access_expiry_days >= 0),
    file_url TEXT,
    preview_image_url TEXT,
    rating_average DECIMAL(3,2) DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
    total_sales INTEGER DEFAULT 0 CHECK (total_sales >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.marketplace_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    payment_method public.payment_method NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL CHECK (amount_paid >= 0),
    transaction_id TEXT,
    access_expires_at TIMESTAMPTZ,
    purchased_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, reviewer_id)
);

-- 3. Indexes
CREATE INDEX idx_marketplace_products_seller ON public.marketplace_products(seller_id);
CREATE INDEX idx_marketplace_products_category ON public.marketplace_products(category);
CREATE INDEX idx_marketplace_products_status ON public.marketplace_products(status);
CREATE INDEX idx_marketplace_products_payment ON public.marketplace_products(payment_method);
CREATE INDEX idx_marketplace_purchases_buyer ON public.marketplace_purchases(buyer_id);
CREATE INDEX idx_marketplace_purchases_product ON public.marketplace_purchases(product_id);
CREATE INDEX idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_reviewer ON public.product_reviews(reviewer_id);

-- 4. RLS Setup
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Marketplace Products: Public read, owner manage
CREATE POLICY "public_can_view_active_products"
ON public.marketplace_products
FOR SELECT
TO public
USING (status = 'active'::public.product_status);

CREATE POLICY "sellers_manage_own_products"
ON public.marketplace_products
FOR ALL
TO authenticated
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- Marketplace Purchases: Buyers and sellers can view their own
CREATE POLICY "users_view_own_purchases"
ON public.marketplace_purchases
FOR SELECT
TO authenticated
USING (
    buyer_id = auth.uid() 
    OR product_id IN (SELECT id FROM public.marketplace_products WHERE seller_id = auth.uid())
);

CREATE POLICY "users_create_own_purchases"
ON public.marketplace_purchases
FOR INSERT
TO authenticated
WITH CHECK (buyer_id = auth.uid());

-- Product Reviews: Public read, buyers can create
CREATE POLICY "public_can_view_reviews"
ON public.product_reviews
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_manage_own_reviews"
ON public.product_reviews
FOR ALL
TO authenticated
USING (reviewer_id = auth.uid())
WITH CHECK (reviewer_id = auth.uid());

-- 6. Functions for automatic updates
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.marketplace_products
    SET rating_average = (
        SELECT COALESCE(AVG(rating), 0)
        FROM public.product_reviews
        WHERE product_id = NEW.product_id
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_product_rating_on_review
AFTER INSERT OR UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_rating();

CREATE OR REPLACE FUNCTION public.update_product_sales()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.marketplace_products
    SET total_sales = total_sales + 1,
        inventory_count = GREATEST(inventory_count - 1, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_product_sales_on_purchase
AFTER INSERT ON public.marketplace_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_product_sales();

-- 7. Mock Data
DO $$
DECLARE
    student_user_id UUID;
    teacher_user_id UUID;
    product1_id UUID := gen_random_uuid();
    product2_id UUID := gen_random_uuid();
    product3_id UUID := gen_random_uuid();
BEGIN
    -- Get existing users
    SELECT id INTO student_user_id 
    FROM public.user_profiles 
    WHERE role = 'student'::public.user_role 
    LIMIT 1;
    
    SELECT id INTO teacher_user_id 
    FROM public.user_profiles 
    WHERE role = 'teacher'::public.user_role 
    LIMIT 1;
    
    -- Create sample products if users exist
    IF student_user_id IS NOT NULL THEN
        INSERT INTO public.marketplace_products (
            id, seller_id, title, description, category, price, 
            payment_method, status, inventory_count, file_url
        ) VALUES
            (
                product1_id,
                student_user_id,
                'Amharic Grammar Study Guide',
                'Comprehensive study guide covering essential Amharic grammar rules with examples and exercises.',
                'guide'::public.product_category,
                15.00,
                'aura_points'::public.payment_method,
                'active'::public.product_status,
                50,
                '/files/amharic-grammar-guide.pdf'
            ),
            (
                product2_id,
                student_user_id,
                'Ethiopian Culture Flashcards',
                'Set of 100 flashcards covering Ethiopian culture, traditions, and vocabulary.',
                'flashcards'::public.product_category,
                10.00,
                'aura_points'::public.payment_method,
                'active'::public.product_status,
                30,
                '/files/culture-flashcards.pdf'
            );
    END IF;
    
    IF teacher_user_id IS NOT NULL THEN
        INSERT INTO public.marketplace_products (
            id, seller_id, title, description, category, price, 
            payment_method, status, inventory_count, file_url
        ) VALUES
            (
                product3_id,
                teacher_user_id,
                'Advanced Amharic Conversation Course',
                'Professional video course for advanced learners focusing on real-world conversations.',
                'video'::public.product_category,
                299.99,
                'ethiopian_birr'::public.payment_method,
                'active'::public.product_status,
                100,
                '/files/advanced-conversation-course.mp4'
            );
        
        -- Add sample review
        INSERT INTO public.product_reviews (product_id, reviewer_id, rating, comment)
        VALUES
            (product3_id, student_user_id, 5, 'Excellent course! Really helped me improve my conversation skills.');
    END IF;
    
    RAISE NOTICE 'Marketplace mock data created successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mock data: %', SQLERRM;
END $$;