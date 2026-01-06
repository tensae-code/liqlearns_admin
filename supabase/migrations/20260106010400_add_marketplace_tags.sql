-- Add tags column to marketplace_products
ALTER TABLE marketplace_products 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Tag "quizzes" and "tests"
UPDATE marketplace_products 
SET tags = array_append(tags, 'interactive')
WHERE (title ILIKE '%quiz%' OR title ILIKE '%test%' OR description ILIKE '%interactive%')
  AND NOT 'interactive' = ANY(tags);

-- Tag "templates" and "worksheets"
UPDATE marketplace_products 
SET tags = array_append(tags, 'template')
WHERE (title ILIKE '%template%' OR title ILIKE '%worksheet%')
  AND NOT 'template' = ANY(tags);

-- Tag "audio" and "podcast"
UPDATE marketplace_products 
SET tags = array_append(tags, 'audio')
WHERE (category = 'audio' OR title ILIKE '%podcast%')
  AND NOT 'audio' = ANY(tags);

-- Tag "games" and "challenges"
UPDATE marketplace_products 
SET tags = array_append(tags, 'gamified')
WHERE (title ILIKE '%game%' OR title ILIKE '%challenge%')
  AND NOT 'gamified' = ANY(tags);

-- Tag "videos" with specific types
UPDATE marketplace_products 
SET tags = array_append(tags, 'tutorial')
WHERE (category = 'video' AND (title ILIKE '%tutorial%' OR description ILIKE '%step-by-step%'))
  AND NOT 'tutorial' = ANY(tags);

UPDATE marketplace_products 
SET tags = array_append(tags, 'lecture')
WHERE (category = 'video' AND title ILIKE '%lecture%')
  AND NOT 'lecture' = ANY(tags);

-- Tag "ebooks" with "guide" or "reference"
UPDATE marketplace_products 
SET tags = array_append(tags, 'reference')
WHERE (category = 'ebook' AND (title ILIKE '%guide%' OR title ILIKE '%reference%'))
  AND NOT 'reference' = ANY(tags);

-- Tag "flashcards" with "memory" or "spaced"
UPDATE marketplace_products 
SET tags = array_append(tags, 'spaced-repetition')
WHERE (category = 'flashcards' OR title ILIKE '%spaced%')
  AND NOT 'spaced-repetition' = ANY(tags);

-- Add memory tag for study aids
UPDATE marketplace_products 
SET tags = array_append(tags, 'memory')
WHERE (title ILIKE '%memory%' OR title ILIKE '%memorize%' OR title ILIKE '%remember%')
  AND NOT 'memory' = ANY(tags);

-- Create index for efficient tag queries
CREATE INDEX IF NOT EXISTS idx_marketplace_products_tags 
ON marketplace_products USING GIN (tags);

-- Comment explaining the tags column
COMMENT ON COLUMN marketplace_products.tags IS 'Array of descriptive tags for enhanced search and filtering (interactive, template, audio, gamified, tutorial, lecture, reference, spaced-repetition, memory)';