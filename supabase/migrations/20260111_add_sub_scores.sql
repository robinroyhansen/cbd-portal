-- Add sub_scores column to kb_brand_review_scores for individual sub-criterion scores
-- Format: {"sub_criterion_id": score, ...} e.g., {"lab_testing_rigor": 4, "potency_accuracy": 3, ...}

ALTER TABLE kb_brand_review_scores
ADD COLUMN IF NOT EXISTS sub_scores JSONB DEFAULT '{}';

COMMENT ON COLUMN kb_brand_review_scores.sub_scores IS 'Individual sub-criterion scores as JSONB object. Keys are sub-criterion IDs, values are scores.';

-- Create index for sub_scores queries
CREATE INDEX IF NOT EXISTS idx_brand_review_scores_sub_scores ON kb_brand_review_scores USING GIN (sub_scores);
