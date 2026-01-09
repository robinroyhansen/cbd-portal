-- Add international fields to kb_brands
ALTER TABLE kb_brands
ADD COLUMN IF NOT EXISTS product_count INTEGER,
ADD COLUMN IF NOT EXISTS price_range VARCHAR(20), -- budget, mid, premium
ADD COLUMN IF NOT EXISTS ships_to TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS primary_market VARCHAR(10); -- US, EU, UK, CA, AU, etc.

-- Add international fields to kb_brand_reviews
ALTER TABLE kb_brand_reviews
ADD COLUMN IF NOT EXISTS about_content TEXT,
ADD COLUMN IF NOT EXISTS best_for TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS not_ideal_for TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS recommendation_status VARCHAR(50), -- recommended, cautiously_recommended, not_recommended
ADD COLUMN IF NOT EXISTS trustpilot_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS regulatory_status JSONB DEFAULT '{}';

-- Comments for documentation
COMMENT ON COLUMN kb_brands.product_count IS 'Number of products offered by the brand';
COMMENT ON COLUMN kb_brands.price_range IS 'Price tier: budget, mid, premium';
COMMENT ON COLUMN kb_brands.ships_to IS 'Array of regions: US, EU, UK, CA, AU, etc.';
COMMENT ON COLUMN kb_brands.primary_market IS 'Primary market: US, EU, UK, CA, AU';

COMMENT ON COLUMN kb_brand_reviews.about_content IS 'Factual intro paragraph about the brand';
COMMENT ON COLUMN kb_brand_reviews.best_for IS 'Array of user types this brand is best for';
COMMENT ON COLUMN kb_brand_reviews.not_ideal_for IS 'Array of user types this brand is not ideal for';
COMMENT ON COLUMN kb_brand_reviews.recommendation_status IS 'Overall recommendation: recommended, cautiously_recommended, not_recommended';
COMMENT ON COLUMN kb_brand_reviews.trustpilot_url IS 'Direct link to Trustpilot review page';
COMMENT ON COLUMN kb_brand_reviews.regulatory_status IS 'JSON object with regulatory info per market: {us: {fda_warnings: false}, eu: {novel_food: true}}';
