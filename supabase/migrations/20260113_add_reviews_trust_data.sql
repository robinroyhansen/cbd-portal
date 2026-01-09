-- Add Trustpilot and Google review data to kb_brand_reviews
ALTER TABLE kb_brand_reviews
ADD COLUMN IF NOT EXISTS trustpilot_score DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS trustpilot_count INTEGER,
ADD COLUMN IF NOT EXISTS google_score DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS google_count INTEGER;

-- Add certifications/trust badges to kb_brands
ALTER TABLE kb_brands
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]';

-- Comment for documentation
COMMENT ON COLUMN kb_brand_reviews.trustpilot_score IS 'Trustpilot rating out of 5 (e.g., 4.2)';
COMMENT ON COLUMN kb_brand_reviews.trustpilot_count IS 'Number of Trustpilot reviews';
COMMENT ON COLUMN kb_brand_reviews.google_score IS 'Google rating out of 5 (e.g., 4.5)';
COMMENT ON COLUMN kb_brand_reviews.google_count IS 'Number of Google reviews';
COMMENT ON COLUMN kb_brands.certifications IS 'Array of certification IDs: gmp, usda_organic, us_hemp_authority, third_party_tested, non_gmo, vegan, cruelty_free, iso_certified';
