-- Migration: Fix remaining invalid product categories
-- This migration handles products with invalid category values like "amharic"
-- that slipped through previous migrations

-- Step 1: Drop the category column constraint temporarily to allow updates
ALTER TABLE marketplace_products 
  ALTER COLUMN category TYPE text;

-- Step 2: Update all products with invalid categories
-- Move invalid category values to tags array and set category to 'other'
UPDATE marketplace_products
SET 
  category = 'other',
  tags = CASE 
    WHEN category NOT IN ('ebook', 'video', 'audio', 'flashcards', 'worksheet', 'guide', 'notes', 'other')
    THEN array_append(
      COALESCE(tags, '{}'::text[]),
      category::text
    )
    ELSE tags
  END
WHERE category NOT IN ('ebook', 'video', 'audio', 'flashcards', 'worksheet', 'guide', 'notes', 'other');

-- Step 3: Re-apply the enum constraint
ALTER TABLE marketplace_products
  ALTER COLUMN category TYPE product_category USING category::product_category;

-- Step 4: Add a constraint to prevent future invalid insertions
ALTER TABLE marketplace_products
  ADD CONSTRAINT valid_product_category CHECK (
    category IN ('ebook', 'video', 'audio', 'flashcards', 'worksheet', 'guide', 'notes', 'other')
  );

-- Step 5: Create a function to validate and fix category values before insert/update
CREATE OR REPLACE FUNCTION validate_product_category()
RETURNS TRIGGER AS $$
BEGIN
  -- If category is not in the valid enum list, move it to tags and set category to 'other'
  IF NEW.category::text NOT IN ('ebook', 'video', 'audio', 'flashcards', 'worksheet', 'guide', 'notes', 'other') THEN
    -- Add the invalid category to tags
    NEW.tags := array_append(COALESCE(NEW.tags, '{}'::text[]), NEW.category::text);
    -- Set category to 'other'
    NEW.category := 'other'::product_category;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to automatically validate categories
DROP TRIGGER IF EXISTS validate_category_before_write ON marketplace_products;
CREATE TRIGGER validate_category_before_write
  BEFORE INSERT OR UPDATE ON marketplace_products
  FOR EACH ROW
  EXECUTE FUNCTION validate_product_category();

-- Step 7: Add helpful comment
COMMENT ON TRIGGER validate_category_before_write ON marketplace_products IS 
  'Automatically validates product categories and moves invalid values to tags array';

-- Step 8: Log the fix
DO $$
DECLARE
  fixed_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fixed_count
  FROM marketplace_products
  WHERE 'amharic' = ANY(tags) OR 'spanish' = ANY(tags) OR 'french' = ANY(tags);
  
  RAISE NOTICE 'Fixed % products with invalid category values', fixed_count;
END $$;