-- Migration: Scanner V2 Schema
-- Adds structured metadata columns and scanner configuration table

-- ============================================
-- 1. Add new columns to kb_research_queue
-- ============================================

-- Matched cannabinoids (e.g., ['CBD', 'cannabidiol', 'THC'])
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS matched_cannabinoids text[];

-- Matched conditions (e.g., ['anxiety', 'GAD'])
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS matched_conditions text[];

-- Study type classification
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS study_type text;

-- Species: 'human', 'animal', 'in_vitro', 'mixed', 'unknown'
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS species text DEFAULT 'unknown';

-- Sample size (if detectable from abstract)
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS sample_size integer;

-- Confirmation score from Stage 2 validation (0-100)
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS confirmation_score integer;

-- Detailed breakdown of confirmation scoring
-- e.g., { "unambiguous_cannabinoid": 40, "dosing_pattern": 25, "total": 65 }
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS confirmation_breakdown jsonb;

-- ============================================
-- 2. Create scanner configuration table
-- ============================================

CREATE TABLE IF NOT EXISTS research_scanner_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('cannabinoid', 'condition', 'study_type', 'blacklist', 'journal')),
  term_key text NOT NULL,
  display_name text NOT NULL,
  synonyms text[] NOT NULL DEFAULT '{}',
  enabled boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Unique constraint: one term_key per category
  UNIQUE (category, term_key)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_scanner_config_category ON research_scanner_config(category);
CREATE INDEX IF NOT EXISTS idx_scanner_config_enabled ON research_scanner_config(category, enabled);

-- ============================================
-- 3. Create indexes for new columns
-- ============================================

-- GIN index for array columns (efficient for @> contains queries)
CREATE INDEX IF NOT EXISTS idx_research_queue_cannabinoids
ON kb_research_queue USING GIN (matched_cannabinoids);

CREATE INDEX IF NOT EXISTS idx_research_queue_conditions
ON kb_research_queue USING GIN (matched_conditions);

-- Index for study type and species filtering
CREATE INDEX IF NOT EXISTS idx_research_queue_study_type
ON kb_research_queue(study_type);

CREATE INDEX IF NOT EXISTS idx_research_queue_species
ON kb_research_queue(species);

-- ============================================
-- 4. Seed default cannabinoid terms
-- ============================================

INSERT INTO research_scanner_config (category, term_key, display_name, synonyms, sort_order) VALUES
  ('cannabinoid', 'cannabidiol', 'Cannabidiol (CBD)', ARRAY['cannabidiol', 'cbd'], 1),
  ('cannabinoid', 'thc', 'THC', ARRAY['tetrahydrocannabinol', 'thc', 'δ9-thc', 'delta-9-thc', 'delta-9-tetrahydrocannabinol'], 2),
  ('cannabinoid', 'cannabis', 'Cannabis', ARRAY['cannabis', 'cannabis sativa', 'cannabis indica', 'marijuana', 'marihuana', 'medical cannabis', 'medicinal cannabis'], 3),
  ('cannabinoid', 'cannabinoid', 'Cannabinoids (general)', ARRAY['cannabinoid', 'cannabinoids', 'phytocannabinoid', 'phytocannabinoids', 'endocannabinoid', 'endocannabinoids'], 4),
  ('cannabinoid', 'cbg', 'Cannabigerol (CBG)', ARRAY['cannabigerol', 'cbg'], 5),
  ('cannabinoid', 'cbn', 'Cannabinol (CBN)', ARRAY['cannabinol', 'cbn'], 6),
  ('cannabinoid', 'cbc', 'Cannabichromene (CBC)', ARRAY['cannabichromene', 'cbc'], 7),
  ('cannabinoid', 'acidic', 'Acidic Forms (THCA, CBDA)', ARRAY['thca', 'tetrahydrocannabinolic acid', 'cbda', 'cannabidiolic acid', 'cbga', 'cannabigerolic acid'], 8),
  ('cannabinoid', 'hemp', 'Hemp', ARRAY['hemp', 'hemp extract', 'hemp oil', 'hemp-derived', 'industrial hemp'], 9),
  ('cannabinoid', 'epidiolex', 'Epidiolex', ARRAY['epidiolex'], 10),
  ('cannabinoid', 'sativex', 'Sativex', ARRAY['sativex', 'nabiximols'], 11),
  ('cannabinoid', 'dronabinol', 'Dronabinol', ARRAY['dronabinol', 'marinol'], 12),
  ('cannabinoid', 'nabilone', 'Nabilone', ARRAY['nabilone', 'cesamet'], 13),
  ('cannabinoid', 'terpenes', 'Terpenes', ARRAY['terpene', 'terpenes', 'cannabis terpene', 'entourage effect', 'myrcene', 'limonene', 'linalool', 'pinene', 'caryophyllene'], 14),
  ('cannabinoid', 'spectrum', 'Full/Broad Spectrum', ARRAY['full spectrum', 'full-spectrum', 'broad spectrum', 'broad-spectrum', 'cbd isolate'], 15),
  ('cannabinoid', 'receptors', 'Cannabinoid Receptors', ARRAY['cb1 receptor', 'cb2 receptor', 'cb1', 'cb2', 'endocannabinoid system', 'ecs'], 16)
ON CONFLICT (category, term_key) DO NOTHING;

-- ============================================
-- 5. Seed default health conditions
-- ============================================

INSERT INTO research_scanner_config (category, term_key, display_name, synonyms, sort_order) VALUES
  -- Mental Health
  ('condition', 'anxiety', 'Anxiety', ARRAY['anxiety', 'anxiolytic', 'gad', 'generalized anxiety disorder', 'panic disorder', 'social anxiety', 'social phobia', 'anxiety disorder'], 1),
  ('condition', 'depression', 'Depression', ARRAY['depression', 'depressive', 'antidepressant', 'major depressive disorder', 'mdd', 'mood disorder', 'dysthymia'], 2),
  ('condition', 'ptsd', 'PTSD', ARRAY['ptsd', 'post-traumatic stress', 'post traumatic stress', 'trauma', 'traumatic stress disorder'], 3),
  ('condition', 'sleep', 'Sleep Disorders', ARRAY['sleep', 'insomnia', 'sleep disorder', 'sedative', 'sleep quality', 'sleep disturbance', 'circadian'], 4),
  ('condition', 'schizophrenia', 'Schizophrenia', ARRAY['schizophrenia', 'psychosis', 'antipsychotic', 'psychotic'], 5),

  -- Neurological
  ('condition', 'epilepsy', 'Epilepsy', ARRAY['epilepsy', 'seizure', 'convulsion', 'dravet syndrome', 'dravet', 'lennox-gastaut', 'lgs', 'anticonvulsant', 'antiepileptic', 'refractory epilepsy'], 10),
  ('condition', 'parkinson', 'Parkinson''s Disease', ARRAY['parkinson', 'parkinsonian', 'tremor', 'dyskinesia', 'bradykinesia', 'parkinson''s disease'], 11),
  ('condition', 'alzheimer', 'Alzheimer''s / Dementia', ARRAY['alzheimer', 'dementia', 'cognitive decline', 'neuroprotective', 'neurodegeneration', 'memory impairment', 'alzheimer''s disease'], 12),
  ('condition', 'ms', 'Multiple Sclerosis', ARRAY['multiple sclerosis', 'ms', 'spasticity', 'demyelination', 'myelin'], 13),
  ('condition', 'autism', 'Autism', ARRAY['autism', 'asd', 'autism spectrum', 'autistic', 'autism spectrum disorder'], 14),
  ('condition', 'adhd', 'ADHD', ARRAY['adhd', 'attention deficit', 'hyperactivity', 'attention-deficit'], 15),
  ('condition', 'migraine', 'Migraine', ARRAY['migraine', 'headache', 'cephalgia', 'cluster headache'], 16),
  ('condition', 'neuropathy', 'Neuropathy', ARRAY['neuropathy', 'neuropathic', 'peripheral neuropathy', 'diabetic neuropathy', 'nerve pain'], 17),

  -- Pain
  ('condition', 'chronic_pain', 'Chronic Pain', ARRAY['chronic pain', 'pain management', 'analgesic', 'nociceptive', 'pain relief', 'analgesia'], 20),
  ('condition', 'arthritis', 'Arthritis', ARRAY['arthritis', 'rheumatoid', 'osteoarthritis', 'joint pain', 'rheumatoid arthritis'], 21),
  ('condition', 'fibromyalgia', 'Fibromyalgia', ARRAY['fibromyalgia', 'fibromyalgic', 'fibromyalgia syndrome'], 22),

  -- Inflammatory/GI
  ('condition', 'inflammation', 'Inflammation', ARRAY['inflammation', 'inflammatory', 'anti-inflammatory', 'cytokine'], 30),
  ('condition', 'ibd', 'IBD / Crohn''s', ARRAY['crohn', 'ibd', 'inflammatory bowel', 'ulcerative colitis', 'colitis', 'crohn''s disease'], 31),
  ('condition', 'ibs', 'IBS', ARRAY['ibs', 'irritable bowel', 'gastrointestinal'], 32),
  ('condition', 'nausea', 'Nausea / Vomiting', ARRAY['nausea', 'vomiting', 'antiemetic', 'chemotherapy-induced nausea', 'cinv'], 33),

  -- Cancer
  ('condition', 'cancer', 'Cancer', ARRAY['cancer', 'oncology', 'tumor', 'tumour', 'antitumor', 'chemotherapy', 'palliative', 'apoptosis', 'antiproliferative', 'carcinoma'], 40),

  -- Skin
  ('condition', 'acne', 'Acne', ARRAY['acne', 'sebaceous', 'sebum', 'acne vulgaris'], 50),
  ('condition', 'psoriasis', 'Psoriasis', ARRAY['psoriasis', 'psoriatic'], 51),
  ('condition', 'eczema', 'Eczema / Dermatitis', ARRAY['eczema', 'dermatitis', 'atopic dermatitis', 'skin inflammation'], 52),

  -- Cardiovascular
  ('condition', 'cardiovascular', 'Cardiovascular', ARRAY['cardiovascular', 'blood pressure', 'hypertension', 'cardioprotective', 'heart', 'cardiac'], 60),

  -- Metabolic
  ('condition', 'diabetes', 'Diabetes', ARRAY['diabetes', 'diabetic', 'glucose', 'insulin', 'glycemic', 'blood sugar', 'type 2 diabetes'], 70),
  ('condition', 'obesity', 'Obesity', ARRAY['obesity', 'weight loss', 'appetite', 'metabolic syndrome', 'bmi', 'overweight'], 71),

  -- Addiction
  ('condition', 'addiction', 'Addiction', ARRAY['addiction', 'substance use', 'dependence', 'withdrawal', 'opioid use disorder', 'alcohol use disorder', 'smoking cessation'], 80),

  -- Other
  ('condition', 'glaucoma', 'Glaucoma', ARRAY['glaucoma', 'intraocular pressure', 'iop', 'eye pressure'], 90),
  ('condition', 'covid', 'COVID-19', ARRAY['covid', 'covid-19', 'coronavirus', 'sars-cov-2', 'long covid'], 91)
ON CONFLICT (category, term_key) DO NOTHING;

-- ============================================
-- 6. Seed study types
-- ============================================

INSERT INTO research_scanner_config (category, term_key, display_name, synonyms, sort_order) VALUES
  ('study_type', 'rct', 'Randomized Controlled Trial', ARRAY['randomized controlled trial', 'rct', 'randomised controlled trial', 'double-blind', 'placebo-controlled'], 1),
  ('study_type', 'systematic_review', 'Systematic Review', ARRAY['systematic review', 'cochrane review', 'prisma'], 2),
  ('study_type', 'meta_analysis', 'Meta-Analysis', ARRAY['meta-analysis', 'meta analysis', 'pooled analysis'], 3),
  ('study_type', 'clinical_trial', 'Clinical Trial', ARRAY['clinical trial', 'clinical study', 'phase 1', 'phase 2', 'phase 3', 'phase i', 'phase ii', 'phase iii'], 4),
  ('study_type', 'cohort', 'Cohort Study', ARRAY['cohort study', 'cohort', 'prospective study', 'longitudinal study'], 5),
  ('study_type', 'case_control', 'Case-Control', ARRAY['case-control', 'case control', 'retrospective study'], 6),
  ('study_type', 'observational', 'Observational', ARRAY['observational study', 'observational', 'cross-sectional', 'survey'], 7),
  ('study_type', 'case_report', 'Case Report', ARRAY['case report', 'case study', 'clinical case'], 8),
  ('study_type', 'case_series', 'Case Series', ARRAY['case series'], 9),
  ('study_type', 'animal', 'Animal Study', ARRAY['animal study', 'animal model', 'mouse', 'mice', 'rat', 'rats', 'rodent', 'murine', 'in vivo'], 10),
  ('study_type', 'in_vitro', 'In Vitro', ARRAY['in vitro', 'cell culture', 'cell line', 'cultured cells'], 11),
  ('study_type', 'review', 'Review', ARRAY['review', 'narrative review', 'literature review'], 12),
  ('study_type', 'pilot', 'Pilot Study', ARRAY['pilot study', 'pilot trial', 'feasibility study', 'preliminary study'], 13)
ON CONFLICT (category, term_key) DO NOTHING;

-- ============================================
-- 7. Seed blacklist terms
-- ============================================

INSERT INTO research_scanner_config (category, term_key, display_name, synonyms, sort_order) VALUES
  ('blacklist', 'central_business_district', 'Central Business District', ARRAY['central business district'], 1),
  ('blacklist', 'common_bile_duct', 'Common Bile Duct', ARRAY['common bile duct', 'bile duct stone', 'choledocholithiasis'], 2),
  ('blacklist', 'chemical_bath_deposition', 'Chemical Bath Deposition', ARRAY['chemical bath deposition'], 3),
  ('blacklist', 'convention_biological_diversity', 'Convention on Biological Diversity', ARRAY['convention on biological diversity'], 4),
  ('blacklist', 'chronic_beryllium_disease', 'Chronic Beryllium Disease', ARRAY['chronic beryllium disease', 'berylliosis'], 5),
  ('blacklist', 'corticobasal_degeneration', 'Corticobasal Degeneration', ARRAY['corticobasal degeneration', 'corticobasal syndrome'], 6),
  ('blacklist', 'congenital_bleeding_disorder', 'Congenital Bleeding Disorders', ARRAY['congenital bleeding disorder', 'congenital bleeding disorders'], 7),
  ('blacklist', 'cbd_diameter', 'CBD Diameter (medical)', ARRAY['cbd diameter', 'duct diameter'], 8)
ON CONFLICT (category, term_key) DO NOTHING;

-- ============================================
-- 8. Seed cannabis-focused journals
-- ============================================

INSERT INTO research_scanner_config (category, term_key, display_name, synonyms, sort_order) VALUES
  -- Cannabis-specific (highest confidence)
  ('journal', 'cannabis_cannabinoid_research', 'Cannabis and Cannabinoid Research', ARRAY['cannabis and cannabinoid research'], 1),
  ('journal', 'journal_cannabis_research', 'Journal of Cannabis Research', ARRAY['journal of cannabis research'], 2),
  ('journal', 'medical_cannabis_cannabinoids', 'Medical Cannabis and Cannabinoids', ARRAY['medical cannabis and cannabinoids'], 3),

  -- Pharmacology/Psychopharmacology
  ('journal', 'journal_psychopharmacology', 'Journal of Psychopharmacology', ARRAY['journal of psychopharmacology'], 10),
  ('journal', 'neuropsychopharmacology', 'Neuropsychopharmacology', ARRAY['neuropsychopharmacology'], 11),
  ('journal', 'psychopharmacology', 'Psychopharmacology', ARRAY['psychopharmacology'], 12),
  ('journal', 'british_j_pharmacology', 'British Journal of Pharmacology', ARRAY['british journal of pharmacology'], 13),

  -- Epilepsy
  ('journal', 'epilepsia', 'Epilepsia', ARRAY['epilepsia'], 20),
  ('journal', 'epilepsy_behavior', 'Epilepsy & Behavior', ARRAY['epilepsy & behavior', 'epilepsy and behavior'], 21),

  -- Pain
  ('journal', 'pain', 'Pain', ARRAY['pain'], 30),
  ('journal', 'journal_pain', 'Journal of Pain', ARRAY['journal of pain'], 31),
  ('journal', 'journal_pain_research', 'Journal of Pain Research', ARRAY['journal of pain research'], 32),

  -- MS
  ('journal', 'multiple_sclerosis_journal', 'Multiple Sclerosis Journal', ARRAY['multiple sclerosis journal', 'multiple sclerosis and related disorders'], 40),

  -- CNS/Neurology
  ('journal', 'cns_drugs', 'CNS Drugs', ARRAY['cns drugs'], 50)
ON CONFLICT (category, term_key) DO NOTHING;

-- ============================================
-- 9. Enable RLS (Row Level Security) for config table
-- ============================================

ALTER TABLE research_scanner_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access (needed for scanner)
CREATE POLICY "Allow public read access to scanner config"
ON research_scanner_config FOR SELECT
TO public
USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to scanner config"
ON research_scanner_config FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- Done!
-- ============================================
