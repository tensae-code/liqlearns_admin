-- Migration: Fix invalid product category enum values
-- Description: Move language-specific and invalid category values to tags array
-- Date: 2026-01-06

-- Step 1: Find all products with invalid category values
DO $$ 
DECLARE
  invalid_category_record RECORD;
BEGIN
  -- Loop through products with invalid categories
  FOR invalid_category_record IN 
    SELECT id, category, tags 
    FROM marketplace_products 
    WHERE category NOT IN ('ebook', 'video', 'audio', 'flashcards', 'worksheet', 'guide', 'notes', 'other')
  LOOP
    -- Add the current category value as a tag if it's not already there
    UPDATE marketplace_products
    SET 
      tags = array_append(COALESCE(tags, ARRAY[]::text[]), invalid_category_record.category),
      category = 'other'
    WHERE id = invalid_category_record.id
    AND NOT (COALESCE(tags, ARRAY[]::text[]) && ARRAY[invalid_category_record.category]);

    -- If the category was already a tag, just fix the category
    UPDATE marketplace_products
    SET category = 'other'
    WHERE id = invalid_category_record.id
    AND (COALESCE(tags, ARRAY[]::text[]) && ARRAY[invalid_category_record.category]);
  END LOOP;

  RAISE NOTICE 'Fixed invalid product categories';
END $$;

-- Step 2: Add a constraint to prevent future invalid category values
ALTER TABLE marketplace_products
DROP CONSTRAINT IF EXISTS valid_product_category_check;

ALTER TABLE marketplace_products
ADD CONSTRAINT valid_product_category_check
CHECK (category IN ('ebook', 'video', 'audio', 'flashcards', 'worksheet', 'guide', 'notes', 'other'));

-- Step 3: Add helpful comment
COMMENT ON CONSTRAINT valid_product_category_check ON marketplace_products IS 
'Ensures category field only contains valid product_category enum values. Language-specific values should be stored in tags array.';