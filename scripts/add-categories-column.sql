-- Add categories column to research queue table
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create an index on categories for better query performance
CREATE INDEX IF NOT EXISTS idx_kb_research_queue_categories
ON kb_research_queue USING GIN (categories);

-- Show confirmation
SELECT 'Categories column added successfully' as result;