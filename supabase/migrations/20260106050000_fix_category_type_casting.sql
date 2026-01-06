-- Fix category type casting issues in marketplace_products
-- This migration ensures proper type casting when comparing text values to product_category enum

-- Step 1: Update products with invalid category values to 'other' with explicit casting
-- This fixes products where category might be stored as text or have invalid enum values
UPDATE marketplace_products
SET 
  category = 'other'::product_category,
  tags = CASE 
    WHEN category::text NOT IN ('ebook', 'video', 'audio', 'flashcards', 'worksheet', 'guide', 'notes', 'other')
    THEN array_append(tags, category::text)
    ELSE tags
  END,
  updated_at = CURRENT_TIMESTAMP
WHERE category::text NOT IN ('ebook', 'video', 'audio', 'flashcards', 'worksheet', 'guide', 'notes', 'other');

-- Step 2: Create a validation function with proper type handling
CREATE OR REPLACE FUNCTION validate_product_category()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure the category is a valid enum value
  -- If not, move invalid value to tags and set category to 'other'
  IF NEW.category::text NOT IN ('ebook', 'video', 'audio', 'flashcards', 'worksheet', 'guide', 'notes', 'other') THEN
    -- Add the invalid category to tags if not already present
    IF NOT (NEW.category::text = ANY(NEW.tags)) THEN
      NEW.tags := array_append(NEW.tags, NEW.category::text);
    END IF;
    -- Set category to 'other'
    NEW.category := 'other'::product_category;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_valid_product_category ON marketplace_products;

-- Step 4: Create trigger to validate category on insert/update
CREATE TRIGGER ensure_valid_product_category
  BEFORE INSERT OR UPDATE ON marketplace_products
  FOR EACH ROW
  EXECUTE FUNCTION validate_product_category();

-- Step 5: Add helpful comment
COMMENT ON FUNCTION validate_product_category() IS 
  'Validates product category enum values and moves invalid values to tags array. Valid categories: ebook, video, audio, flashcards, worksheet, guide, notes, other';

-- Verify the fix by checking for any remaining invalid categories
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM marketplace_products
  WHERE category::text NOT IN ('ebook', 'video', 'audio', 'flashcards', 'worksheet', 'guide', 'notes', 'other');
  
  IF invalid_count > 0 THEN
    RAISE NOTICE 'Found % products with invalid categories - they will be automatically fixed', invalid_count;
  ELSE
    RAISE NOTICE 'All product categories are valid';
  END IF;
END $$;