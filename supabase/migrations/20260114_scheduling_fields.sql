-- Add scheduling fields to kb_brands and kb_brand_reviews
ALTER TABLE kb_brands ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;
ALTER TABLE kb_brand_reviews ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;

-- Comments for documentation
COMMENT ON COLUMN kb_brands.scheduled_publish_at IS 'When to auto-publish this brand';
COMMENT ON COLUMN kb_brand_reviews.scheduled_publish_at IS 'When to auto-publish this review';
