-- Create Brand Reviews system for CBD brands
-- Tables: kb_brands, kb_review_criteria, kb_brand_reviews, kb_brand_review_scores

----------------------------------------------------------------------
-- 1. kb_brands - Store brand information
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kb_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  website_url VARCHAR(500), -- internal use only, for AI research
  website_domain VARCHAR(255), -- display only (e.g., "charlottesweb.com"), NOT a clickable link
  logo_url VARCHAR(500), -- manual upload
  headquarters_country VARCHAR(100),
  founded_year INTEGER,
  short_description TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for kb_brands
CREATE INDEX IF NOT EXISTS idx_brands_slug ON kb_brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_name ON kb_brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_is_published ON kb_brands(is_published);
CREATE INDEX IF NOT EXISTS idx_brands_created_at ON kb_brands(created_at DESC);

-- Enable RLS for kb_brands
ALTER TABLE kb_brands ENABLE ROW LEVEL SECURITY;

-- Public can only read published brands
CREATE POLICY "Public read published brands" ON kb_brands
  FOR SELECT USING (is_published = true);

-- Service role full access
CREATE POLICY "Service role full access to brands" ON kb_brands
  FOR ALL USING (auth.role() = 'service_role');

-- Update timestamp trigger for brands
CREATE OR REPLACE FUNCTION update_brands_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_brands_updated ON kb_brands;
CREATE TRIGGER trigger_brands_updated
  BEFORE UPDATE ON kb_brands
  FOR EACH ROW EXECUTE FUNCTION update_brands_timestamp();

-- Function to generate slug from brand name
CREATE OR REPLACE FUNCTION generate_brand_slug(brand_name TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(brand_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON TABLE kb_brands IS 'CBD brands for reviews. website_url is internal only (AI research), website_domain is display text only (not a link)';

----------------------------------------------------------------------
-- 2. kb_review_criteria - Scoring criteria for reviews
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kb_review_criteria (
  id VARCHAR(50) PRIMARY KEY, -- e.g., 'quality_testing', 'lab_testing_rigor'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_points INTEGER NOT NULL,
  display_order INTEGER NOT NULL,
  category VARCHAR(100), -- parent category for grouping
  subcriteria JSONB DEFAULT '[]', -- array of {id, name, max_points, description}
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for kb_review_criteria
CREATE INDEX IF NOT EXISTS idx_review_criteria_display_order ON kb_review_criteria(display_order);
CREATE INDEX IF NOT EXISTS idx_review_criteria_category ON kb_review_criteria(category);

-- Enable RLS for kb_review_criteria
ALTER TABLE kb_review_criteria ENABLE ROW LEVEL SECURITY;

-- Public read access (criteria are always public)
CREATE POLICY "Public read review criteria" ON kb_review_criteria
  FOR SELECT USING (true);

-- Service role full access
CREATE POLICY "Service role full access to review criteria" ON kb_review_criteria
  FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE kb_review_criteria IS 'Review scoring criteria with subcriteria. Total points across all criteria = 100';

----------------------------------------------------------------------
-- 3. kb_brand_reviews - Individual brand reviews
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kb_brand_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES kb_brands(id) ON DELETE CASCADE,
  author_id UUID REFERENCES kb_authors(id) ON DELETE SET NULL,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100), -- auto-calculated
  summary TEXT,
  full_review TEXT, -- markdown content
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  verdict TEXT,
  sources_researched TEXT[] DEFAULT '{}', -- URLs AI checked (internal, not displayed to public)
  meta_title VARCHAR(60),
  meta_description VARCHAR(155),
  review_version INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(brand_id) -- One review per brand
);

-- Indexes for kb_brand_reviews
CREATE INDEX IF NOT EXISTS idx_brand_reviews_brand_id ON kb_brand_reviews(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_reviews_author_id ON kb_brand_reviews(author_id);
CREATE INDEX IF NOT EXISTS idx_brand_reviews_is_published ON kb_brand_reviews(is_published);
CREATE INDEX IF NOT EXISTS idx_brand_reviews_overall_score ON kb_brand_reviews(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_brand_reviews_published_at ON kb_brand_reviews(published_at DESC);

-- Enable RLS for kb_brand_reviews
ALTER TABLE kb_brand_reviews ENABLE ROW LEVEL SECURITY;

-- Public can only read published reviews
CREATE POLICY "Public read published brand reviews" ON kb_brand_reviews
  FOR SELECT USING (is_published = true);

-- Service role full access
CREATE POLICY "Service role full access to brand reviews" ON kb_brand_reviews
  FOR ALL USING (auth.role() = 'service_role');

-- Update timestamp trigger for brand reviews
CREATE OR REPLACE FUNCTION update_brand_reviews_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_brand_reviews_updated ON kb_brand_reviews;
CREATE TRIGGER trigger_brand_reviews_updated
  BEFORE UPDATE ON kb_brand_reviews
  FOR EACH ROW EXECUTE FUNCTION update_brand_reviews_timestamp();

-- Auto-set published_at when publishing
CREATE OR REPLACE FUNCTION set_brand_review_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true AND (OLD.is_published = false OR OLD.is_published IS NULL) THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_brand_review_published ON kb_brand_reviews;
CREATE TRIGGER trigger_brand_review_published
  BEFORE UPDATE ON kb_brand_reviews
  FOR EACH ROW EXECUTE FUNCTION set_brand_review_published_at();

COMMENT ON TABLE kb_brand_reviews IS 'Brand reviews with scores, content, and author attribution. sources_researched is internal only.';

----------------------------------------------------------------------
-- 4. kb_brand_review_scores - Individual criterion scores
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kb_brand_review_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_review_id UUID NOT NULL REFERENCES kb_brand_reviews(id) ON DELETE CASCADE,
  criterion_id VARCHAR(50) NOT NULL REFERENCES kb_review_criteria(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0),
  ai_reasoning TEXT, -- why AI proposed this score
  author_notes TEXT, -- author's adjustments/comments
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(brand_review_id, criterion_id)
);

-- Indexes for kb_brand_review_scores
CREATE INDEX IF NOT EXISTS idx_brand_review_scores_review_id ON kb_brand_review_scores(brand_review_id);
CREATE INDEX IF NOT EXISTS idx_brand_review_scores_criterion_id ON kb_brand_review_scores(criterion_id);

-- Enable RLS for kb_brand_review_scores
ALTER TABLE kb_brand_review_scores ENABLE ROW LEVEL SECURITY;

-- Public can read scores for published reviews
CREATE POLICY "Public read scores for published reviews" ON kb_brand_review_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kb_brand_reviews
      WHERE kb_brand_reviews.id = kb_brand_review_scores.brand_review_id
      AND kb_brand_reviews.is_published = true
    )
  );

-- Service role full access
CREATE POLICY "Service role full access to review scores" ON kb_brand_review_scores
  FOR ALL USING (auth.role() = 'service_role');

-- Update timestamp trigger for scores
CREATE OR REPLACE FUNCTION update_brand_review_scores_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_brand_review_scores_updated ON kb_brand_review_scores;
CREATE TRIGGER trigger_brand_review_scores_updated
  BEFORE UPDATE ON kb_brand_review_scores
  FOR EACH ROW EXECUTE FUNCTION update_brand_review_scores_timestamp();

COMMENT ON TABLE kb_brand_review_scores IS 'Individual criterion scores for brand reviews. ai_reasoning shows why AI proposed the score.';

----------------------------------------------------------------------
-- 5. Function to calculate overall score from criterion scores
----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_brand_review_score(review_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_score INTEGER;
BEGIN
  SELECT COALESCE(SUM(brs.score), 0)
  INTO total_score
  FROM kb_brand_review_scores brs
  WHERE brs.brand_review_id = review_id;

  RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update overall_score when scores change
CREATE OR REPLACE FUNCTION update_brand_review_overall_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE kb_brand_reviews
  SET overall_score = calculate_brand_review_score(
    CASE WHEN TG_OP = 'DELETE' THEN OLD.brand_review_id ELSE NEW.brand_review_id END
  )
  WHERE id = CASE WHEN TG_OP = 'DELETE' THEN OLD.brand_review_id ELSE NEW.brand_review_id END;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_overall_score ON kb_brand_review_scores;
CREATE TRIGGER trigger_update_overall_score
  AFTER INSERT OR UPDATE OR DELETE ON kb_brand_review_scores
  FOR EACH ROW EXECUTE FUNCTION update_brand_review_overall_score();

COMMENT ON FUNCTION calculate_brand_review_score IS 'Calculates total score by summing all criterion scores for a review';
