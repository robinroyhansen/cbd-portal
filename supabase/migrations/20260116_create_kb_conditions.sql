-- =====================================================
-- KB_CONDITIONS TABLE - Foundation for Programmatic SEO
-- Created: January 16, 2026
-- Purpose: Structured condition entities for scalable page generation
-- =====================================================

-- Create enum for condition categories
CREATE TYPE condition_category AS ENUM (
  'mental_health',
  'neurological',
  'pain',
  'gastrointestinal',
  'cancer',
  'skin',
  'cardiovascular',
  'metabolic',
  'other'
);

-- Create the kb_conditions table
CREATE TABLE IF NOT EXISTS kb_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core identity
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,                           -- Optional display override (e.g., "Parkinson's Disease")

  -- Translations (JSONB for flexibility)
  name_translations JSONB DEFAULT '{}'::jsonb, -- {"de": "Angst", "fr": "Anxiété", ...}

  -- Content
  description TEXT,
  description_translations JSONB DEFAULT '{}'::jsonb,
  short_description TEXT,                      -- 1-2 sentence summary for cards

  -- Categorization
  category condition_category NOT NULL DEFAULT 'other',
  parent_condition_id UUID REFERENCES kb_conditions(id),  -- For hierarchical conditions

  -- Relationships (stored as slugs for flexibility)
  related_condition_slugs TEXT[] DEFAULT '{}',
  symptom_keywords TEXT[] DEFAULT '{}',        -- Keywords that indicate this condition

  -- Research linkage
  topic_keywords TEXT[] DEFAULT '{}',          -- Keywords from TOPIC_KEYWORDS for matching
  research_count INT DEFAULT 0,                -- Cached count of related studies

  -- SEO templates
  meta_title_template TEXT,                    -- "CBD for {name}: Research & Dosage ({year})"
  meta_description_template TEXT,              -- Template with {placeholders}
  h1_template TEXT,                            -- "CBD and {name}: What Research Shows"

  -- Medical coding (optional, for enhanced schema)
  icd_10_codes TEXT[] DEFAULT '{}',
  mesh_terms TEXT[] DEFAULT '{}',

  -- Publishing
  is_published BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,           -- Show on homepage/navigation
  display_order INT DEFAULT 100,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_conditions_slug ON kb_conditions(slug);
CREATE INDEX idx_conditions_category ON kb_conditions(category);
CREATE INDEX idx_conditions_published ON kb_conditions(is_published);
CREATE INDEX idx_conditions_featured ON kb_conditions(is_featured);
CREATE INDEX idx_conditions_research_count ON kb_conditions(research_count DESC);
CREATE INDEX idx_conditions_topic_keywords ON kb_conditions USING gin(topic_keywords);

-- Enable RLS
ALTER TABLE kb_conditions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access to conditions" ON kb_conditions
  FOR SELECT USING (is_published = true);

-- Admin full access
CREATE POLICY "Admin full access to conditions" ON kb_conditions
  FOR ALL USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_conditions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_conditions_updated_at
  BEFORE UPDATE ON kb_conditions
  FOR EACH ROW
  EXECUTE FUNCTION update_conditions_updated_at();

-- =====================================================
-- POPULATE CONDITIONS FROM TOPIC_KEYWORDS (39 conditions)
-- =====================================================

INSERT INTO kb_conditions (
  slug, name, display_name, category, description, short_description,
  topic_keywords, related_condition_slugs, symptom_keywords,
  meta_title_template, meta_description_template, h1_template,
  is_featured, display_order
) VALUES

-- =====================================================
-- MENTAL HEALTH (Featured conditions)
-- =====================================================
(
  'anxiety',
  'Anxiety',
  'Anxiety Disorders',
  'mental_health',
  'Anxiety disorders are a group of mental health conditions characterized by excessive fear, worry, and related behavioral disturbances. Research suggests CBD may help modulate the stress response through interaction with serotonin receptors and the endocannabinoid system.',
  'Research on CBD for anxiety disorders including GAD, social anxiety, and panic disorder.',
  ARRAY['anxiety', 'anxiolytic', 'GAD', 'social anxiety', 'panic disorder', 'generalized anxiety', 'anxiety disorder', 'panic attack', 'anxious'],
  ARRAY['depression', 'ptsd', 'sleep', 'stress'],
  ARRAY['worry', 'fear', 'nervousness', 'restlessness', 'tension'],
  'CBD for Anxiety: {research_count}+ Studies Reviewed ({year})',
  'What does research say about CBD for anxiety? Review of {research_count} studies on cannabidiol for anxiety disorders, including dosage and effectiveness.',
  'CBD and Anxiety: What {research_count} Studies Show',
  true, 1
),
(
  'depression',
  'Depression',
  'Depression & Mood Disorders',
  'mental_health',
  'Depression is a mood disorder causing persistent feelings of sadness and loss of interest. Studies are investigating CBD''s potential antidepressant properties through its effects on serotonin signaling and neuroplasticity.',
  'Research on CBD for depression and mood disorders.',
  ARRAY['depression', 'antidepressant', 'mood disorder', 'MDD', 'major depressive', 'dysthymia', 'depressive'],
  ARRAY['anxiety', 'sleep', 'stress', 'ptsd'],
  ARRAY['sadness', 'hopelessness', 'fatigue', 'low mood', 'anhedonia'],
  'CBD for Depression: Research & Evidence ({year})',
  'Explore {research_count} studies on CBD for depression. Learn about cannabidiol''s potential effects on mood disorders and current research findings.',
  'CBD and Depression: Current Research',
  true, 2
),
(
  'ptsd',
  'PTSD',
  'Post-Traumatic Stress Disorder',
  'mental_health',
  'PTSD is a mental health condition triggered by experiencing or witnessing traumatic events. Research is examining CBD''s potential to help manage PTSD symptoms through effects on fear memory processing and the stress response system.',
  'Research on CBD for PTSD and trauma-related conditions.',
  ARRAY['PTSD', 'trauma', 'post-traumatic', 'posttraumatic', 'veteran', 'traumatic stress', 'stress disorder', 'flashback', 'combat'],
  ARRAY['anxiety', 'depression', 'sleep'],
  ARRAY['flashbacks', 'nightmares', 'hypervigilance', 'avoidance', 'trauma'],
  'CBD for PTSD: Research on Cannabidiol & Trauma ({year})',
  'Review of {research_count} studies on CBD for PTSD. Research on cannabidiol for post-traumatic stress disorder, including veteran studies.',
  'CBD and PTSD: What Research Shows',
  true, 3
),
(
  'sleep',
  'Sleep',
  'Sleep Disorders & Insomnia',
  'mental_health',
  'Sleep disorders affect millions worldwide, impacting quality of life and overall health. Research is investigating CBD''s potential to improve sleep quality through its calming effects and interaction with sleep-regulating systems.',
  'Research on CBD for sleep disorders including insomnia.',
  ARRAY['sleep', 'insomnia', 'circadian', 'sedative', 'sleep quality', 'sleep disorder', 'sleep disturbance', 'somnolence', 'sleep latency', 'REM sleep'],
  ARRAY['anxiety', 'chronic_pain', 'stress'],
  ARRAY['insomnia', 'restlessness', 'difficulty sleeping', 'poor sleep', 'fatigue'],
  'CBD for Sleep: {research_count} Studies on Insomnia & Sleep Quality',
  'Can CBD help with sleep? Review {research_count} studies on cannabidiol for insomnia, sleep quality, and sleep disorders.',
  'CBD and Sleep: Research & Dosage Guide',
  true, 4
),
(
  'stress',
  'Stress',
  'Chronic Stress',
  'mental_health',
  'Chronic stress can negatively impact physical and mental health. CBD research examines its potential to modulate the stress response through effects on cortisol levels and the HPA axis.',
  'Research on CBD for stress management and cortisol regulation.',
  ARRAY['stress', 'cortisol', 'HPA axis', 'stress response', 'stress relief', 'chronic stress'],
  ARRAY['anxiety', 'depression', 'sleep'],
  ARRAY['tension', 'burnout', 'overwhelm', 'cortisol', 'pressure'],
  'CBD for Stress: Research on Stress Relief ({year})',
  'What does research say about CBD for stress? Studies on cannabidiol''s effects on cortisol and the stress response.',
  'CBD and Stress: Scientific Evidence',
  false, 35
),
(
  'addiction',
  'Addiction',
  'Addiction & Substance Use Disorders',
  'mental_health',
  'Addiction is a chronic brain disorder characterized by compulsive substance use despite harmful consequences. Research is exploring CBD''s potential role in addiction treatment, including reducing drug cravings and withdrawal symptoms.',
  'Research on CBD for addiction and substance use disorders.',
  ARRAY['addiction', 'substance use disorder', 'cannabis use disorder', 'cud', 'opioid use', 'withdrawal symptoms', 'dependence', 'alcohol use disorder', 'drug abuse', 'cocaine', 'heroin', 'relapse prevention', 'discontinuing cannabis', 'quit cannabis', 'cannabis withdrawal'],
  ARRAY['anxiety', 'depression'],
  ARRAY['cravings', 'withdrawal', 'dependence', 'substance abuse'],
  'CBD for Addiction: Research on Substance Use Disorders',
  'Studies on CBD for addiction treatment. Research on cannabidiol for opioid, alcohol, and substance use disorders.',
  'CBD and Addiction: Treatment Research',
  false, 12
),
(
  'schizophrenia',
  'Schizophrenia',
  'Schizophrenia & Psychosis',
  'mental_health',
  'Schizophrenia is a serious mental disorder affecting thinking, emotions, and behavior. Research is investigating CBD''s potential antipsychotic properties as an adjunct treatment.',
  'Research on CBD for schizophrenia and psychotic disorders.',
  ARRAY['schizophrenia', 'psychosis', 'psychotic', 'antipsychotic', 'hallucination', 'delusion', 'negative symptoms'],
  ARRAY['anxiety', 'depression'],
  ARRAY['hallucinations', 'delusions', 'psychosis', 'cognitive symptoms'],
  'CBD for Schizophrenia: Antipsychotic Research ({year})',
  'Research on CBD for schizophrenia and psychosis. Studies on cannabidiol''s potential antipsychotic properties.',
  'CBD and Schizophrenia: Current Research',
  false, 11
),

-- =====================================================
-- NEUROLOGICAL CONDITIONS
-- =====================================================
(
  'epilepsy',
  'Epilepsy',
  'Epilepsy & Seizure Disorders',
  'neurological',
  'Epilepsy is a neurological disorder characterized by recurrent seizures. CBD (as Epidiolex) is FDA-approved for certain severe forms of epilepsy, making it one of the most researched therapeutic applications of cannabidiol.',
  'FDA-approved research on CBD for epilepsy and seizure disorders.',
  ARRAY['epilepsy', 'seizure', 'Dravet', 'Lennox-Gastaut', 'anticonvulsant', 'Epidiolex', 'refractory epilepsy', 'convulsion', 'ictal', 'intractable epilepsy'],
  ARRAY['neurological'],
  ARRAY['seizures', 'convulsions', 'epileptic', 'fits'],
  'CBD for Epilepsy: Epidiolex & Seizure Research ({year})',
  'FDA-approved CBD (Epidiolex) for epilepsy. Review {research_count} studies on cannabidiol for Dravet syndrome, Lennox-Gastaut, and seizure disorders.',
  'CBD and Epilepsy: FDA-Approved Treatment',
  true, 5
),
(
  'parkinsons',
  'Parkinson''s',
  'Parkinson''s Disease',
  'neurological',
  'Parkinson''s disease is a progressive neurological disorder affecting movement. Research is examining CBD''s potential neuroprotective properties and effects on motor symptoms like tremor and dyskinesia.',
  'Research on CBD for Parkinson''s disease symptoms.',
  ARRAY['Parkinson', 'parkinsonian', 'dopamine', 'tremor', 'bradykinesia', 'dyskinesia', 'Lewy body'],
  ARRAY['alzheimers', 'neurological', 'sleep'],
  ARRAY['tremor', 'stiffness', 'slow movement', 'balance problems'],
  'CBD for Parkinson''s Disease: Research & Evidence',
  'Studies on CBD for Parkinson''s disease. Research on cannabidiol for tremors, dyskinesia, and neuroprotection.',
  'CBD and Parkinson''s: What Research Shows',
  true, 6
),
(
  'alzheimers',
  'Alzheimer''s',
  'Alzheimer''s Disease & Dementia',
  'neurological',
  'Alzheimer''s disease is a progressive brain disorder causing memory loss and cognitive decline. Research is investigating CBD''s potential neuroprotective effects and ability to reduce neuroinflammation.',
  'Research on CBD for Alzheimer''s disease and dementia.',
  ARRAY['Alzheimer', 'dementia', 'cognitive decline', 'memory loss', 'amyloid', 'tau protein', 'neurodegeneration', 'cognitive impairment'],
  ARRAY['parkinsons', 'neurological', 'aging'],
  ARRAY['memory loss', 'confusion', 'cognitive decline', 'dementia'],
  'CBD for Alzheimer''s: Dementia & Neuroprotection Research',
  'Research on CBD for Alzheimer''s disease. Studies on cannabidiol''s neuroprotective effects and cognitive benefits.',
  'CBD and Alzheimer''s Disease: Research Review',
  true, 7
),
(
  'autism',
  'Autism',
  'Autism Spectrum Disorder',
  'neurological',
  'Autism spectrum disorder (ASD) is a developmental condition affecting communication and behavior. Research is exploring CBD''s potential to help manage associated symptoms like anxiety, aggression, and sleep issues.',
  'Research on CBD for autism spectrum disorder.',
  ARRAY['autism', 'ASD', 'autistic', 'Asperger', 'spectrum disorder', 'developmental disorder', 'neurodevelopmental'],
  ARRAY['anxiety', 'sleep', 'adhd'],
  ARRAY['social difficulties', 'repetitive behaviors', 'sensory issues'],
  'CBD for Autism: Research on ASD Symptoms ({year})',
  'Studies on CBD for autism spectrum disorder. Research on cannabidiol for behavioral symptoms and quality of life.',
  'CBD and Autism: Current Research',
  false, 8
),
(
  'adhd',
  'ADHD',
  'Attention-Deficit/Hyperactivity Disorder',
  'neurological',
  'ADHD is a neurodevelopmental disorder characterized by inattention, hyperactivity, and impulsivity. Research is examining whether CBD may help manage attention and executive function.',
  'Research on CBD for ADHD and attention disorders.',
  ARRAY['ADHD', 'attention deficit', 'hyperactivity', 'ADD', 'inattention', 'impulsivity', 'executive function'],
  ARRAY['anxiety', 'sleep', 'autism'],
  ARRAY['inattention', 'hyperactivity', 'impulsivity', 'focus problems'],
  'CBD for ADHD: Research on Attention & Focus',
  'What does research say about CBD for ADHD? Studies on cannabidiol for attention deficit hyperactivity disorder.',
  'CBD and ADHD: Scientific Evidence',
  false, 9
),
(
  'tourettes',
  'Tourette''s',
  'Tourette Syndrome',
  'neurological',
  'Tourette syndrome is a neurological disorder characterized by repetitive involuntary movements and vocalizations called tics. Research is investigating cannabinoids'' potential to reduce tic severity.',
  'Research on CBD for Tourette syndrome and tic disorders.',
  ARRAY['Tourette', 'tic disorder', 'tics', 'motor tic', 'vocal tic', 'coprolalia'],
  ARRAY['anxiety', 'adhd'],
  ARRAY['tics', 'involuntary movements', 'vocalizations'],
  'CBD for Tourette''s: Research on Tic Disorders',
  'Studies on CBD for Tourette syndrome. Research on cannabinoids for tic reduction and management.',
  'CBD and Tourette Syndrome: Research Review',
  false, 13
),
(
  'ms',
  'Multiple Sclerosis',
  'Multiple Sclerosis (MS)',
  'neurological',
  'Multiple sclerosis is an autoimmune disease affecting the central nervous system. Sativex (nabiximols), a cannabis-based medicine, is approved in many countries for MS-related spasticity.',
  'Research on CBD and cannabis medicines for multiple sclerosis.',
  ARRAY['multiple sclerosis', 'demyelinating', 'demyelination', 'spasticity', 'Sativex', 'nabiximols', 'relapsing-remitting', 'rrms', 'ppms', 'spms'],
  ARRAY['chronic_pain', 'inflammation', 'neurological'],
  ARRAY['spasticity', 'fatigue', 'numbness', 'vision problems'],
  'CBD for Multiple Sclerosis: Sativex & Spasticity Research',
  'Research on CBD and cannabis for MS. Studies on Sativex (nabiximols) for spasticity and multiple sclerosis symptoms.',
  'CBD and Multiple Sclerosis: Treatment Research',
  true, 17
),
(
  'neurological',
  'Neurological',
  'Other Neurological Conditions',
  'neurological',
  'Various neurological conditions including ALS, Huntington''s disease, and other neurodegenerative disorders. Research examines CBD''s neuroprotective potential across multiple conditions.',
  'Research on CBD for neuroprotection and neurological disorders.',
  ARRAY['neuroprotective', 'neurodegeneration', 'ALS', 'Huntington'],
  ARRAY['parkinsons', 'alzheimers', 'epilepsy'],
  ARRAY['neurodegeneration', 'motor symptoms', 'cognitive decline'],
  'CBD for Neurological Conditions: Neuroprotection Research',
  'Studies on CBD''s neuroprotective effects. Research on cannabidiol for ALS, Huntington''s, and neurodegeneration.',
  'CBD and Neurological Health: Research Overview',
  false, 36
),

-- =====================================================
-- PAIN & INFLAMMATION
-- =====================================================
(
  'chronic_pain',
  'Chronic Pain',
  'Chronic Pain Management',
  'pain',
  'Chronic pain persists for months or years and significantly impacts quality of life. Research examines CBD''s analgesic properties and potential as an alternative to opioid medications.',
  'Research on CBD for chronic pain management.',
  ARRAY['chronic pain', 'persistent pain', 'long-term pain', 'pain management', 'analgesic', 'pain relief', 'opioid-sparing'],
  ARRAY['neuropathic_pain', 'arthritis', 'fibromyalgia', 'inflammation'],
  ARRAY['persistent pain', 'long-term pain', 'pain relief'],
  'CBD for Chronic Pain: {research_count} Studies Reviewed ({year})',
  'Can CBD help with chronic pain? Review of {research_count} studies on cannabidiol for pain management and relief.',
  'CBD and Chronic Pain: Research & Evidence',
  true, 14
),
(
  'neuropathic_pain',
  'Neuropathic Pain',
  'Neuropathic Pain & Nerve Damage',
  'pain',
  'Neuropathic pain results from nerve damage and can be difficult to treat with conventional medications. Research is investigating CBD''s potential for nerve pain relief.',
  'Research on CBD for neuropathic pain and nerve damage.',
  ARRAY['neuropathic', 'neuropathy', 'nerve pain', 'peripheral neuropathy', 'diabetic neuropathy', 'neuralgia', 'allodynia'],
  ARRAY['chronic_pain', 'diabetes', 'inflammation'],
  ARRAY['nerve pain', 'tingling', 'burning', 'numbness'],
  'CBD for Neuropathic Pain: Nerve Pain Research',
  'Studies on CBD for neuropathic pain. Research on cannabidiol for peripheral neuropathy and nerve damage.',
  'CBD and Neuropathic Pain: Scientific Evidence',
  false, 15
),
(
  'arthritis',
  'Arthritis',
  'Arthritis & Joint Pain',
  'pain',
  'Arthritis causes joint inflammation, pain, and stiffness. Research examines CBD''s anti-inflammatory properties and potential for both rheumatoid and osteoarthritis.',
  'Research on CBD for arthritis and joint inflammation.',
  ARRAY['arthritis', 'rheumatoid', 'osteoarthritis', 'joint pain', 'joint inflammation', 'synovitis', 'articular'],
  ARRAY['chronic_pain', 'inflammation'],
  ARRAY['joint pain', 'stiffness', 'swelling', 'inflammation'],
  'CBD for Arthritis: Joint Pain & Inflammation Research',
  'Can CBD help arthritis? Studies on cannabidiol for rheumatoid arthritis, osteoarthritis, and joint pain.',
  'CBD and Arthritis: What Research Shows',
  true, 16
),
(
  'fibromyalgia',
  'Fibromyalgia',
  'Fibromyalgia Syndrome',
  'pain',
  'Fibromyalgia is a chronic condition characterized by widespread pain, fatigue, and cognitive difficulties. Research examines CBD''s potential for managing fibromyalgia symptoms.',
  'Research on CBD for fibromyalgia and widespread pain.',
  ARRAY['fibromyalgia', 'fibro', 'widespread pain', 'tender points', 'central sensitization'],
  ARRAY['chronic_pain', 'sleep', 'depression'],
  ARRAY['widespread pain', 'fatigue', 'fibro fog', 'tender points'],
  'CBD for Fibromyalgia: Pain & Fatigue Research',
  'Studies on CBD for fibromyalgia. Research on cannabidiol for widespread pain, fatigue, and fibro symptoms.',
  'CBD and Fibromyalgia: Current Evidence',
  false, 18
),
(
  'inflammation',
  'Inflammation',
  'Inflammation & Inflammatory Conditions',
  'pain',
  'Chronic inflammation underlies many diseases and health conditions. CBD demonstrates anti-inflammatory properties in research, affecting cytokines and inflammatory pathways.',
  'Research on CBD''s anti-inflammatory properties.',
  ARRAY['inflammation', 'anti-inflammatory', 'cytokine', 'TNF-alpha', 'interleukin', 'NF-kB', 'COX-2', 'prostaglandin', 'inflammatory'],
  ARRAY['arthritis', 'crohns', 'chronic_pain'],
  ARRAY['swelling', 'redness', 'inflammatory', 'cytokines'],
  'CBD for Inflammation: Anti-Inflammatory Research ({year})',
  'Research on CBD''s anti-inflammatory effects. Studies on cannabidiol for cytokines, inflammatory pathways, and chronic inflammation.',
  'CBD and Inflammation: Scientific Evidence',
  false, 19
),
(
  'migraines',
  'Migraines',
  'Migraines & Headaches',
  'pain',
  'Migraines are severe headaches often accompanied by nausea and sensitivity to light. Research is exploring CBD''s potential for migraine prevention and relief.',
  'Research on CBD for migraines and headache disorders.',
  ARRAY['migraine', 'headache', 'cephalalgia', 'cluster headache', 'tension headache', 'aura'],
  ARRAY['chronic_pain', 'nausea'],
  ARRAY['headache', 'migraine', 'head pain', 'light sensitivity'],
  'CBD for Migraines: Headache Research & Evidence',
  'Can CBD help migraines? Studies on cannabidiol for migraine prevention, headaches, and relief.',
  'CBD and Migraines: What Research Shows',
  false, 20
),

-- =====================================================
-- GASTROINTESTINAL
-- =====================================================
(
  'crohns',
  'Crohn''s Disease',
  'Crohn''s Disease & IBD',
  'gastrointestinal',
  'Crohn''s disease is an inflammatory bowel disease causing digestive tract inflammation. Research examines CBD''s anti-inflammatory effects on gut inflammation.',
  'Research on CBD for Crohn''s disease and inflammatory bowel disease.',
  ARRAY['Crohn', 'IBD', 'inflammatory bowel', 'colitis', 'ulcerative colitis', 'intestinal inflammation'],
  ARRAY['ibs', 'inflammation', 'nausea'],
  ARRAY['digestive issues', 'abdominal pain', 'diarrhea', 'intestinal inflammation'],
  'CBD for Crohn''s Disease: IBD Research ({year})',
  'Studies on CBD for Crohn''s disease and IBD. Research on cannabidiol for inflammatory bowel disease and colitis.',
  'CBD and Crohn''s Disease: Research Review',
  false, 21
),
(
  'ibs',
  'IBS',
  'Irritable Bowel Syndrome',
  'gastrointestinal',
  'IBS is a common digestive disorder causing abdominal pain and bowel dysfunction. Research examines CBD''s effects on gut motility and visceral pain.',
  'Research on CBD for irritable bowel syndrome.',
  ARRAY['IBS', 'irritable bowel', 'functional gastrointestinal', 'abdominal pain', 'bowel dysfunction'],
  ARRAY['crohns', 'anxiety', 'stress'],
  ARRAY['abdominal pain', 'bloating', 'constipation', 'diarrhea'],
  'CBD for IBS: Irritable Bowel Syndrome Research',
  'Can CBD help IBS? Studies on cannabidiol for irritable bowel syndrome, gut health, and digestive comfort.',
  'CBD and IBS: Scientific Evidence',
  false, 22
),
(
  'nausea',
  'Nausea',
  'Nausea & Vomiting',
  'gastrointestinal',
  'Nausea and vomiting can result from various causes including chemotherapy. Cannabinoids have established antiemetic properties, and CBD research explores its role in nausea management.',
  'Research on CBD for nausea and antiemetic effects.',
  ARRAY['nausea', 'vomiting', 'emesis', 'antiemetic', 'chemotherapy-induced nausea', 'CINV', 'morning sickness'],
  ARRAY['chemo_side_effects', 'cancer'],
  ARRAY['nausea', 'vomiting', 'queasiness', 'stomach upset'],
  'CBD for Nausea: Antiemetic Research & Evidence',
  'Research on CBD for nausea and vomiting. Studies on cannabidiol''s antiemetic effects and chemotherapy-induced nausea.',
  'CBD and Nausea: What Research Shows',
  false, 23
),

-- =====================================================
-- CANCER
-- =====================================================
(
  'cancer',
  'Cancer',
  'Cancer & Oncology',
  'cancer',
  'Cancer research with CBD explores multiple angles: symptom management, quality of life, and preliminary research on direct effects on cancer cells. Most evidence supports palliative uses.',
  'Research on CBD for cancer symptoms and support.',
  ARRAY['cancer', 'tumor', 'tumour', 'oncology', 'carcinoma', 'malignant', 'metastasis', 'apoptosis', 'antitumor'],
  ARRAY['chemo_side_effects', 'chronic_pain', 'nausea'],
  ARRAY['tumor', 'malignancy', 'oncology', 'cancer pain'],
  'CBD and Cancer: Research on Symptoms & Support ({year})',
  'What does research say about CBD and cancer? Studies on cannabidiol for cancer symptoms, pain, and quality of life.',
  'CBD and Cancer: Current Research',
  false, 24
),
(
  'chemo_side_effects',
  'Chemotherapy Side Effects',
  'Chemotherapy Side Effects',
  'cancer',
  'Chemotherapy causes significant side effects including nausea, pain, and appetite loss. Cannabinoids are well-researched for managing these treatment-related symptoms.',
  'Research on CBD for chemotherapy side effects.',
  ARRAY['chemotherapy', 'chemo-induced', 'chemotherapy-induced', 'palliative', 'cancer pain', 'cachexia', 'wasting syndrome'],
  ARRAY['cancer', 'nausea', 'chronic_pain'],
  ARRAY['chemo nausea', 'appetite loss', 'cancer pain', 'fatigue'],
  'CBD for Chemotherapy Side Effects: Symptom Management',
  'Studies on CBD for chemotherapy side effects. Research on cannabidiol for chemo-induced nausea, pain, and appetite.',
  'CBD and Chemotherapy: Side Effect Research',
  false, 25
),

-- =====================================================
-- SKIN CONDITIONS
-- =====================================================
(
  'acne',
  'Acne',
  'Acne & Skin Health',
  'skin',
  'Acne is a common skin condition caused by clogged hair follicles. Research examines CBD''s effects on sebum production and skin inflammation.',
  'Research on CBD for acne and sebum regulation.',
  ARRAY['acne', 'sebaceous', 'sebum', 'comedone', 'pimple', 'sebocyte'],
  ARRAY['psoriasis', 'eczema', 'inflammation'],
  ARRAY['pimples', 'oily skin', 'breakouts', 'blemishes'],
  'CBD for Acne: Skin Research & Evidence ({year})',
  'Can CBD help acne? Studies on cannabidiol for sebum regulation, skin inflammation, and acne treatment.',
  'CBD and Acne: Scientific Research',
  false, 26
),
(
  'psoriasis',
  'Psoriasis',
  'Psoriasis & Autoimmune Skin Conditions',
  'skin',
  'Psoriasis is an autoimmune condition causing rapid skin cell buildup and inflammation. Research examines CBD''s anti-inflammatory effects on skin conditions.',
  'Research on CBD for psoriasis and skin inflammation.',
  ARRAY['psoriasis', 'psoriatic', 'plaque psoriasis', 'scalp psoriasis', 'keratinocyte'],
  ARRAY['eczema', 'inflammation', 'arthritis'],
  ARRAY['skin patches', 'scales', 'itching', 'skin inflammation'],
  'CBD for Psoriasis: Skin Condition Research',
  'Studies on CBD for psoriasis. Research on cannabidiol for skin inflammation, plaques, and autoimmune skin conditions.',
  'CBD and Psoriasis: What Research Shows',
  false, 27
),
(
  'eczema',
  'Eczema',
  'Eczema & Dermatitis',
  'skin',
  'Eczema (atopic dermatitis) causes itchy, inflamed skin. Research examines CBD''s anti-inflammatory and anti-itch properties for skin conditions.',
  'Research on CBD for eczema and atopic dermatitis.',
  ARRAY['eczema', 'dermatitis', 'atopic', 'pruritus', 'itching', 'skin inflammation', 'topical'],
  ARRAY['psoriasis', 'inflammation', 'acne'],
  ARRAY['itchy skin', 'rash', 'dry skin', 'skin irritation'],
  'CBD for Eczema: Dermatitis & Itching Research',
  'Can CBD help eczema? Studies on cannabidiol for atopic dermatitis, skin inflammation, and itching.',
  'CBD and Eczema: Scientific Evidence',
  false, 28
),

-- =====================================================
-- CARDIOVASCULAR
-- =====================================================
(
  'heart',
  'Heart Health',
  'Cardiovascular Health',
  'cardiovascular',
  'Research examines CBD''s effects on cardiovascular function, including potential cardioprotective properties and effects on heart conditions.',
  'Research on CBD for heart health and cardiovascular function.',
  ARRAY['cardiovascular', 'cardiac', 'heart disease', 'cardioprotective', 'myocardial', 'arrhythmia', 'heart failure'],
  ARRAY['blood_pressure', 'inflammation'],
  ARRAY['heart health', 'cardiac function', 'cardiovascular'],
  'CBD for Heart Health: Cardiovascular Research',
  'Studies on CBD and heart health. Research on cannabidiol for cardiovascular function and cardioprotection.',
  'CBD and Heart Health: Current Research',
  false, 29
),
(
  'blood_pressure',
  'Blood Pressure',
  'Blood Pressure & Hypertension',
  'cardiovascular',
  'Research examines CBD''s effects on blood pressure regulation, with some studies showing acute blood pressure-lowering effects.',
  'Research on CBD for blood pressure and hypertension.',
  ARRAY['blood pressure', 'hypertension', 'hypotension', 'vascular', 'vasorelaxation', 'vasodilation', 'arterial'],
  ARRAY['heart', 'stress', 'anxiety'],
  ARRAY['high blood pressure', 'hypertension', 'vascular health'],
  'CBD for Blood Pressure: Hypertension Research',
  'Can CBD lower blood pressure? Studies on cannabidiol for hypertension and vascular health.',
  'CBD and Blood Pressure: Scientific Evidence',
  false, 30
),

-- =====================================================
-- METABOLIC
-- =====================================================
(
  'diabetes',
  'Diabetes',
  'Diabetes & Blood Sugar',
  'metabolic',
  'Research examines CBD''s effects on glucose metabolism, insulin sensitivity, and diabetes-related complications like neuropathy.',
  'Research on CBD for diabetes and metabolic health.',
  ARRAY['diabetes', 'diabetic', 'glucose', 'insulin', 'glycemic', 'blood sugar', 'metabolic syndrome', 'type 2 diabetes'],
  ARRAY['obesity', 'neuropathic_pain', 'inflammation'],
  ARRAY['blood sugar', 'insulin', 'metabolic', 'glucose'],
  'CBD for Diabetes: Blood Sugar & Metabolic Research',
  'Studies on CBD for diabetes. Research on cannabidiol for blood sugar, insulin sensitivity, and metabolic health.',
  'CBD and Diabetes: Current Research',
  false, 31
),
(
  'obesity',
  'Obesity',
  'Obesity & Weight Management',
  'metabolic',
  'Research examines CBD''s effects on metabolism, appetite regulation, and body weight. Some studies suggest CBD may promote "fat browning" and metabolic health.',
  'Research on CBD for weight management and metabolism.',
  ARRAY['obesity', 'weight loss', 'appetite', 'metabolic', 'BMI', 'adipose', 'fat tissue', 'overweight'],
  ARRAY['diabetes', 'inflammation'],
  ARRAY['weight management', 'metabolism', 'appetite', 'fat'],
  'CBD for Weight: Obesity & Metabolism Research',
  'Can CBD help with weight? Studies on cannabidiol for obesity, metabolism, and appetite regulation.',
  'CBD and Weight Management: Scientific Evidence',
  false, 32
),

-- =====================================================
-- OTHER CONDITIONS
-- =====================================================
(
  'athletic',
  'Athletic Recovery',
  'Sports & Athletic Performance',
  'other',
  'Athletes are increasingly interested in CBD for recovery, inflammation, and performance. Research examines CBD''s effects on exercise-induced inflammation and recovery.',
  'Research on CBD for athletic recovery and sports.',
  ARRAY['athletic', 'sport', 'exercise', 'recovery', 'muscle', 'performance', 'endurance', 'WADA', 'athlete'],
  ARRAY['chronic_pain', 'inflammation', 'sleep'],
  ARRAY['sports', 'recovery', 'exercise', 'performance'],
  'CBD for Athletes: Sports Recovery Research ({year})',
  'Studies on CBD for athletic recovery. Research on cannabidiol for exercise, inflammation, and sports performance.',
  'CBD and Athletic Performance: Evidence Review',
  false, 33
),
(
  'veterinary',
  'Pets',
  'CBD for Pets & Animals',
  'other',
  'Pet owners increasingly use CBD for animals. Research examines CBD''s effects on dogs, cats, and other animals for conditions like anxiety, arthritis, and seizures.',
  'Research on CBD for pets and veterinary applications.',
  ARRAY['veterinary', 'canine', 'feline', 'dog', 'cat', 'pet', 'animal', 'equine', 'horse'],
  ARRAY['anxiety', 'arthritis', 'epilepsy'],
  ARRAY['pets', 'dogs', 'cats', 'animals', 'veterinary'],
  'CBD for Pets: Dog & Cat Research ({year})',
  'Studies on CBD for dogs, cats, and pets. Research on cannabidiol for animal anxiety, arthritis, and seizures.',
  'CBD for Pets: Veterinary Research',
  true, 34
),
(
  'glaucoma',
  'Glaucoma',
  'Glaucoma & Eye Pressure',
  'other',
  'Glaucoma is an eye condition that can lead to vision loss. Research on cannabinoids and eye pressure has mixed results, with some concerns about CBD potentially raising eye pressure.',
  'Research on CBD and cannabis for glaucoma.',
  ARRAY['glaucoma', 'intraocular pressure', 'eye pressure', 'ocular'],
  ARRAY['neurological'],
  ARRAY['eye pressure', 'vision', 'glaucoma'],
  'CBD for Glaucoma: Eye Pressure Research',
  'What does research say about CBD for glaucoma? Studies on cannabidiol and intraocular pressure.',
  'CBD and Glaucoma: Scientific Evidence',
  false, 37
),
(
  'covid',
  'COVID-19',
  'COVID-19 Research',
  'other',
  'Emerging research explored CBD''s potential effects during the COVID-19 pandemic, including anti-inflammatory and antiviral properties. Most research is preliminary.',
  'Preliminary research on CBD and COVID-19.',
  ARRAY['COVID', 'coronavirus', 'SARS-CoV-2', 'pandemic', 'viral infection'],
  ARRAY['inflammation', 'anxiety', 'stress'],
  ARRAY['covid', 'coronavirus', 'viral', 'pandemic'],
  'CBD and COVID-19: Preliminary Research',
  'Emerging research on CBD and COVID-19. Studies on cannabidiol''s potential anti-inflammatory and antiviral effects.',
  'CBD and COVID-19: Research Overview',
  false, 38
),
(
  'aging',
  'Aging',
  'Aging & Longevity',
  'other',
  'Research examines CBD''s potential effects on age-related conditions, neuroprotection, and overall wellness in elderly populations.',
  'Research on CBD for aging and elderly health.',
  ARRAY['aging', 'elderly', 'geriatric', 'age-related', 'longevity'],
  ARRAY['alzheimers', 'chronic_pain', 'sleep'],
  ARRAY['elderly', 'aging', 'longevity', 'seniors'],
  'CBD for Aging: Elderly Health Research',
  'Studies on CBD for aging and elderly health. Research on cannabidiol for age-related conditions and longevity.',
  'CBD and Aging: What Research Shows',
  false, 39
),
(
  'womens',
  'Women''s Health',
  'Women''s Health & Hormones',
  'other',
  'Research examines CBD''s effects on women-specific health issues including menstrual pain, menopause symptoms, and hormonal balance.',
  'Research on CBD for women''s health conditions.',
  ARRAY['women', 'menstrual', 'pregnancy', 'menopause', 'gynecological'],
  ARRAY['chronic_pain', 'anxiety', 'sleep'],
  ARRAY['menstrual', 'menopause', 'hormones', 'women''s health'],
  'CBD for Women: Menstrual & Menopause Research',
  'Studies on CBD for women''s health. Research on cannabidiol for menstrual pain, menopause, and hormonal symptoms.',
  'CBD and Women''s Health: Research Review',
  false, 40
);

-- =====================================================
-- CREATE FUNCTION TO UPDATE RESEARCH COUNTS
-- =====================================================

CREATE OR REPLACE FUNCTION update_condition_research_counts()
RETURNS void AS $$
DECLARE
  cond RECORD;
  count_result INT;
BEGIN
  FOR cond IN SELECT id, topic_keywords FROM kb_conditions LOOP
    -- Count studies that have any matching topic
    SELECT COUNT(DISTINCT rq.id) INTO count_result
    FROM kb_research_queue rq
    WHERE rq.status = 'approved'
      AND rq.relevant_topics && cond.topic_keywords;

    UPDATE kb_conditions
    SET research_count = count_result
    WHERE id = cond.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run initial count update
SELECT update_condition_research_counts();

-- =====================================================
-- CREATE TRIGGER TO AUTO-UPDATE COUNTS
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_update_condition_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update counts for affected conditions
  PERFORM update_condition_research_counts();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger on research queue changes
CREATE TRIGGER trigger_research_count_update
  AFTER INSERT OR UPDATE OR DELETE ON kb_research_queue
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_update_condition_counts();

-- =====================================================
-- VERIFY SETUP
-- =====================================================

DO $$
DECLARE
  condition_count INT;
BEGIN
  SELECT COUNT(*) INTO condition_count FROM kb_conditions;
  RAISE NOTICE 'kb_conditions table created with % conditions', condition_count;

  IF condition_count >= 37 THEN
    RAISE NOTICE 'SUCCESS: All conditions populated correctly';
  ELSE
    RAISE WARNING 'WARNING: Expected 37+ conditions, got %', condition_count;
  END IF;
END $$;
