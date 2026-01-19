-- =============================================================================
-- CBD Drug Interaction Checker Tables
-- Created: 2026-01-19
-- =============================================================================

-- Create enum for drug categories
DO $$ BEGIN
  CREATE TYPE drug_category AS ENUM (
    'anticoagulant',
    'antiepileptic',
    'immunosuppressant',
    'benzodiazepine',
    'antidepressant',
    'opioid',
    'statin',
    'beta_blocker',
    'calcium_channel_blocker',
    'antipsychotic',
    'proton_pump_inhibitor',
    'antihistamine',
    'nsaid',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create enum for interaction severity
DO $$ BEGIN
  CREATE TYPE interaction_severity AS ENUM (
    'major',
    'moderate',
    'minor',
    'unknown'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create enum for interaction mechanism
DO $$ BEGIN
  CREATE TYPE interaction_mechanism AS ENUM (
    'cyp3a4_inhibition',
    'cyp2c19_inhibition',
    'cyp2d6_inhibition',
    'cyp2c9_inhibition',
    'pharmacodynamic',
    'protein_binding',
    'transporter',
    'multiple',
    'unknown'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- KB_DRUGS TABLE - Medications Database
-- =============================================================================

CREATE TABLE IF NOT EXISTS kb_drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core identity
  generic_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT,

  -- Brand names and synonyms (for search)
  brand_names TEXT[] DEFAULT '{}',
  synonyms TEXT[] DEFAULT '{}',

  -- Classification
  category drug_category NOT NULL,
  drug_class TEXT,

  -- CYP enzyme metabolism (key for CBD interactions)
  primary_cyp_enzymes TEXT[] DEFAULT '{}',
  secondary_cyp_enzymes TEXT[] DEFAULT '{}',

  -- Common uses (for user context)
  common_uses TEXT[] DEFAULT '{}',

  -- External identifiers
  rxcui TEXT,
  atc_code TEXT,

  -- Publishing
  is_published BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for kb_drugs
CREATE INDEX IF NOT EXISTS idx_drugs_slug ON kb_drugs(slug);
CREATE INDEX IF NOT EXISTS idx_drugs_generic_name ON kb_drugs(generic_name);
CREATE INDEX IF NOT EXISTS idx_drugs_generic_name_lower ON kb_drugs(LOWER(generic_name));
CREATE INDEX IF NOT EXISTS idx_drugs_category ON kb_drugs(category);
CREATE INDEX IF NOT EXISTS idx_drugs_brand_names ON kb_drugs USING GIN (brand_names);
CREATE INDEX IF NOT EXISTS idx_drugs_synonyms ON kb_drugs USING GIN (synonyms);
CREATE INDEX IF NOT EXISTS idx_drugs_primary_cyp ON kb_drugs USING GIN (primary_cyp_enzymes);
CREATE INDEX IF NOT EXISTS idx_drugs_published ON kb_drugs(is_published);

-- Full-text search index for autocomplete
CREATE INDEX IF NOT EXISTS idx_drugs_search ON kb_drugs USING GIN (
  to_tsvector('english',
    generic_name || ' ' ||
    COALESCE(display_name, '') || ' ' ||
    array_to_string(brand_names, ' ') || ' ' ||
    array_to_string(synonyms, ' ')
  )
);

-- =============================================================================
-- KB_DRUG_INTERACTIONS TABLE - CBD Interaction Details
-- =============================================================================

CREATE TABLE IF NOT EXISTS kb_drug_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to drug
  drug_id UUID NOT NULL REFERENCES kb_drugs(id) ON DELETE CASCADE,

  -- Severity classification
  severity interaction_severity NOT NULL,

  -- Mechanism details
  mechanism interaction_mechanism NOT NULL,
  mechanism_description TEXT,

  -- Clinical effects
  clinical_effects TEXT[] DEFAULT '{}',
  potential_outcomes TEXT,

  -- Recommendations
  recommendation TEXT NOT NULL,
  monitoring_parameters TEXT[] DEFAULT '{}',
  dose_adjustment_guidance TEXT,

  -- Timing considerations
  onset_timeframe TEXT,

  -- Evidence and citations
  evidence_level TEXT,
  citations JSONB DEFAULT '[]'::jsonb,

  -- Special populations
  special_populations_notes TEXT,

  -- Review metadata
  last_reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one interaction record per drug
  CONSTRAINT unique_drug_interaction UNIQUE (drug_id)
);

-- Indexes for kb_drug_interactions
CREATE INDEX IF NOT EXISTS idx_interactions_drug_id ON kb_drug_interactions(drug_id);
CREATE INDEX IF NOT EXISTS idx_interactions_severity ON kb_drug_interactions(severity);
CREATE INDEX IF NOT EXISTS idx_interactions_mechanism ON kb_drug_interactions(mechanism);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE kb_drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_drug_interactions ENABLE ROW LEVEL SECURITY;

-- Public read access for published drugs
DROP POLICY IF EXISTS "Public read drugs" ON kb_drugs;
CREATE POLICY "Public read drugs" ON kb_drugs
  FOR SELECT USING (is_published = true);

-- Service role full access to drugs
DROP POLICY IF EXISTS "Service role full access to drugs" ON kb_drugs;
CREATE POLICY "Service role full access to drugs" ON kb_drugs
  FOR ALL USING (auth.role() = 'service_role');

-- Public read access for interactions (via their published drug)
DROP POLICY IF EXISTS "Public read interactions" ON kb_drug_interactions;
CREATE POLICY "Public read interactions" ON kb_drug_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kb_drugs
      WHERE kb_drugs.id = kb_drug_interactions.drug_id
      AND kb_drugs.is_published = true
    )
  );

-- Service role full access to interactions
DROP POLICY IF EXISTS "Service role full access to interactions" ON kb_drug_interactions;
CREATE POLICY "Service role full access to interactions" ON kb_drug_interactions
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =============================================================================

-- Trigger function for drugs
CREATE OR REPLACE FUNCTION update_drugs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_drugs_updated ON kb_drugs;
CREATE TRIGGER trigger_drugs_updated
  BEFORE UPDATE ON kb_drugs
  FOR EACH ROW EXECUTE FUNCTION update_drugs_timestamp();

-- Trigger function for interactions
CREATE OR REPLACE FUNCTION update_interactions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_interactions_updated ON kb_drug_interactions;
CREATE TRIGGER trigger_interactions_updated
  BEFORE UPDATE ON kb_drug_interactions
  FOR EACH ROW EXECUTE FUNCTION update_interactions_timestamp();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE kb_drugs IS 'Medications database for CBD drug interaction checker';
COMMENT ON TABLE kb_drug_interactions IS 'CBD interaction details for each medication';
COMMENT ON COLUMN kb_drugs.primary_cyp_enzymes IS 'Primary CYP450 enzymes that metabolize this drug';
COMMENT ON COLUMN kb_drug_interactions.severity IS 'Interaction severity: major (avoid), moderate (caution), minor (monitor), unknown';
COMMENT ON COLUMN kb_drug_interactions.mechanism IS 'How CBD interacts with this drug (primarily CYP enzyme inhibition)';
COMMENT ON COLUMN kb_drug_interactions.citations IS 'JSON array of citation objects with doi, pmid, title, authors, journal, year';
