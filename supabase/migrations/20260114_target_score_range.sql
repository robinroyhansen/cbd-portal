-- Add target score range and generation instructions for AI review generation
ALTER TABLE kb_brand_reviews ADD COLUMN IF NOT EXISTS target_score_range VARCHAR(20);
ALTER TABLE kb_brand_reviews ADD COLUMN IF NOT EXISTS generation_instructions TEXT;

-- Comments for documentation
COMMENT ON COLUMN kb_brand_reviews.target_score_range IS 'Author-selected target score range for AI generation (e.g., 61-70)';
COMMENT ON COLUMN kb_brand_reviews.generation_instructions IS 'Custom instructions provided to AI during generation';
