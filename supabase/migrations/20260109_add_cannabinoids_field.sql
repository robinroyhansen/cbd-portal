-- Add cannabinoids array field to kb_research_queue
-- This field stores detected cannabinoids from title/abstract

ALTER TABLE kb_research_queue ADD COLUMN IF NOT EXISTS cannabinoids TEXT[] DEFAULT '{}';

-- Create index for array searching
CREATE INDEX IF NOT EXISTS idx_research_queue_cannabinoids ON kb_research_queue USING GIN (cannabinoids);

-- Function to detect cannabinoids from text
CREATE OR REPLACE FUNCTION detect_cannabinoids(title TEXT, abstract TEXT) RETURNS TEXT[] AS $$
DECLARE
  combined_text TEXT;
  detected TEXT[] := '{}';
BEGIN
  combined_text := LOWER(COALESCE(title, '') || ' ' || COALESCE(abstract, ''));

  -- CBD
  IF combined_text ~ '\mcannabidiol\M' OR combined_text ~ '\mcbd\M' THEN
    detected := array_append(detected, 'CBD');
  END IF;

  -- THC (but not THCV, THCA)
  IF combined_text ~ '\mtetrahydrocannabinol\M' OR
     combined_text ~ '\mthc\M' OR
     combined_text ~ '\mΔ9-thc\M' OR
     combined_text ~ '\mdelta-9-thc\M' OR
     combined_text ~ '\mdelta-9 thc\M' OR
     combined_text ~ '\mΔ-9-thc\M' THEN
    detected := array_append(detected, 'THC');
  END IF;

  -- CBG
  IF combined_text ~ '\mcannabigerol\M' OR combined_text ~ '\mcbg\M' THEN
    detected := array_append(detected, 'CBG');
  END IF;

  -- CBN
  IF combined_text ~ '\mcannabinol\M' OR combined_text ~ '\mcbn\M' THEN
    detected := array_append(detected, 'CBN');
  END IF;

  -- CBC
  IF combined_text ~ '\mcannabichromene\M' OR combined_text ~ '\mcbc\M' THEN
    detected := array_append(detected, 'CBC');
  END IF;

  -- THCV
  IF combined_text ~ '\mtetrahydrocannabivarin\M' OR combined_text ~ '\mthcv\M' THEN
    detected := array_append(detected, 'THCV');
  END IF;

  -- CBDV
  IF combined_text ~ '\mcannabidivarin\M' OR combined_text ~ '\mcbdv\M' THEN
    detected := array_append(detected, 'CBDV');
  END IF;

  -- Delta-8 THC
  IF combined_text ~ '\mdelta-8-thc\M' OR
     combined_text ~ '\mdelta-8 thc\M' OR
     combined_text ~ '\mΔ8-thc\M' OR
     combined_text ~ '\mΔ-8-thc\M' OR
     combined_text ~ '\mdelta-8-tetrahydrocannabinol\M' THEN
    detected := array_append(detected, 'Delta-8');
  END IF;

  -- THCA
  IF combined_text ~ '\mtetrahydrocannabinolic acid\M' OR combined_text ~ '\mthca\M' THEN
    detected := array_append(detected, 'THCA');
  END IF;

  -- CBDA
  IF combined_text ~ '\mcannabidiolic acid\M' OR combined_text ~ '\mcbda\M' THEN
    detected := array_append(detected, 'CBDA');
  END IF;

  RETURN detected;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Populate cannabinoids for existing studies
UPDATE kb_research_queue
SET cannabinoids = detect_cannabinoids(title, abstract)
WHERE cannabinoids = '{}' OR cannabinoids IS NULL;

-- Comment for documentation
COMMENT ON COLUMN kb_research_queue.cannabinoids IS 'Array of detected cannabinoids from title and abstract (CBD, THC, CBG, CBN, CBC, THCV, CBDV, Delta-8, THCA, CBDA)';
