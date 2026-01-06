-- Migration: Add intelligent tagging to marketplace products
-- This migration tags existing products based on name/description patterns

-- Step 1: Verify tags column exists (it already does, so this is a safety check)
-- The tags column already exists as TEXT[] with default '{}'

-- Step 2: Tag "interactive" items (quizzes, tests)
UPDATE marketplace_products 
SET tags = array_append(tags, 'interactive')
WHERE (
  title ILIKE '%quiz%' 
  OR title ILIKE '%test%' 
  OR description ILIKE '%interactive%'
  OR description ILIKE '%practice%'
)
AND NOT ('interactive' = ANY(tags));

-- Step 3: Tag "template" items (templates, worksheets)
UPDATE marketplace_products 
SET tags = array_append(tags, 'template')
WHERE (
  title ILIKE '%template%' 
  OR title ILIKE '%worksheet%'
  OR category = 'worksheet'
)
AND NOT ('template' = ANY(tags));

-- Step 4: Tag "audio" items
UPDATE marketplace_products 
SET tags = array_append(tags, 'audio')
WHERE (
  category = 'audio' 
  OR title ILIKE '%podcast%'
  OR title ILIKE '%audio%'
)
AND NOT ('audio' = ANY(tags));

-- Step 5: Tag "gamified" items
UPDATE marketplace_products 
SET tags = array_append(tags, 'gamified')
WHERE (
  title ILIKE '%game%' 
  OR title ILIKE '%challenge%'
  OR description ILIKE '%gamified%'
)
AND NOT ('gamified' = ANY(tags));

-- Step 6: Tag "tutorial" videos
UPDATE marketplace_products 
SET tags = array_append(tags, 'tutorial')
WHERE (
  category = 'video' 
  AND (
    title ILIKE '%tutorial%' 
    OR description ILIKE '%step-by-step%'
    OR description ILIKE '%how to%'
  )
)
AND NOT ('tutorial' = ANY(tags));

-- Step 7: Tag "lecture" videos
UPDATE marketplace_products 
SET tags = array_append(tags, 'lecture')
WHERE (
  category = 'video' 
  AND title ILIKE '%lecture%'
)
AND NOT ('lecture' = ANY(tags));

-- Step 8: Tag "reference" books/guides
UPDATE marketplace_products 
SET tags = array_append(tags, 'reference')
WHERE (
  (category = 'ebook' OR category = 'guide')
  AND (
    title ILIKE '%guide%' 
    OR title ILIKE '%reference%'
    OR description ILIKE '%reference%'
  )
)
AND NOT ('reference' = ANY(tags));

-- Step 9: Tag "spaced-repetition" items (flashcards)
UPDATE marketplace_products 
SET tags = array_append(tags, 'spaced-repetition')
WHERE (
  category = 'flashcards' 
  OR title ILIKE '%spaced%'
  OR description ILIKE '%repetition%'
)
AND NOT ('spaced-repetition' = ANY(tags));

-- Step 10: Add GIN index for tag-based searches (if not exists)
CREATE INDEX IF NOT EXISTS idx_marketplace_products_tags_gin 
ON marketplace_products USING GIN (tags);

-- Verification query (commented out for migration)
-- SELECT 
--   unnest(tags) as tag,
--   COUNT(*) as count
-- FROM marketplace_products 
-- WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
-- GROUP BY tag
-- ORDER BY count DESC;