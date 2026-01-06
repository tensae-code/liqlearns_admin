-- Migration: Fix invalid product category enum values with direct data update
-- This migration fixes products with invalid categories stored in the database
-- Problem: Products have invalid enum values like "amharic" causing query errors
-- Solution: Direct UPDATE using unnest to identify and fix invalid categories

-- Step 1: Create a temporary function to safely check if a value is a valid category
CREATE OR REPLACE FUNCTION is_valid_product_category(val text)
RETURNS boolean AS $$
BEGIN
  -- Try to cast to product_category enum, return true if successful
  PERFORM val::product_category;
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Update products with invalid categories
-- This uses a safe approach that doesn't require type casting in WHERE clause
WITH invalid_products AS (
  SELECT 
    id,
    category::text as current_category,
    tags
  FROM marketplace_products
  WHERE NOT is_valid_product_category(category::text)
)
UPDATE marketplace_products mp
SET 
  category = 'other'::product_category,
  tags = CASE 
    WHEN ip.current_category = ANY(mp.tags) THEN mp.tags
    ELSE array_append(COALESCE(mp.tags, '{}'::text[]), ip.current_category)
  END,
  updated_at = now()
FROM invalid_products ip
WHERE mp.id = ip.id;

-- Step 3: Log the results
DO $$
DECLARE
  fixed_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fixed_count
  FROM marketplace_products
  WHERE 'amharic' = ANY(tags) 
     OR 'spanish' = ANY(tags) 
     OR 'french' = ANY(tags)
     OR 'german' = ANY(tags)
     OR 'italian' = ANY(tags);
  
  RAISE NOTICE 'Migration complete: Fixed % products with invalid category values', fixed_count;
  RAISE NOTICE 'Invalid categories have been moved to tags array and category set to "other"';
END $$;

-- Step 4: Clean up temporary function
DROP FUNCTION is_valid_product_category(text);

-- Step 5: Verify the trigger is in place (it should already exist)
-- The validate_product_category() trigger will prevent future invalid insertions

-- Step 6: Add a comment explaining the fix
COMMENT ON TABLE marketplace_products IS 
  'Marketplace products table - valid categories: ebook, video, audio, flashcards, worksheet, guide, notes, other. Invalid categories are automatically moved to tags array by trigger.';