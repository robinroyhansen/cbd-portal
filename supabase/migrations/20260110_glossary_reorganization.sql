-- Glossary Reorganization Migration
-- 1. Add new category enum values (run separately - can't be in transaction)
-- 2. Remove 26 terms that are duplicates/article topics/country-specific
-- 3. Recategorize existing terms to new categories (science, research, side-effects, testing, plant)
-- 4. Add 50 new terms

-- NOTE: Enum values already added via separate commands:
-- ALTER TYPE glossary_category ADD VALUE IF NOT EXISTS 'science';
-- ALTER TYPE glossary_category ADD VALUE IF NOT EXISTS 'research';
-- ALTER TYPE glossary_category ADD VALUE IF NOT EXISTS 'side-effects';
-- ALTER TYPE glossary_category ADD VALUE IF NOT EXISTS 'testing';
-- ALTER TYPE glossary_category ADD VALUE IF NOT EXISTS 'plant';

-- ============================================================================
-- STEP 1: REMOVE 26 TERMS
-- ============================================================================

DELETE FROM kb_glossary WHERE term IN (
  -- Duplicates/Article Topics
  'CBD vs THC',
  'Hemp Oil vs CBD Oil',
  'CBD Edibles',
  'CBD Topical',
  'Spice / K2 (Avoid)',
  'Synthetic Cannabinoids (Danger)',
  'Legal High (Misnomer)',
  'CINV',
  'Third-Party Verified',
  'Reading CBD Labels',
  'CBD Storage',
  -- Country-Specific Regulations
  'French CBD Regulations',
  'German CBD Regulations',
  'Italian CBD Regulations',
  'Swiss CBD Regulations',
  'BAG (Swiss Federal Office of Public Health)',
  'BfArM (Germany)',
  'Swissmedic',
  'FSA',
  '0.2% THC Limit',
  '0.3% THC Limit',
  '2018 Farm Bill',
  'USDA Organic',
  'Medical Cannabis Card',
  'Traveling with CBD'
);

-- Remove 'Drug Interactions' from dosing category (keep 'Drug Interaction' in medical/side-effects)
DELETE FROM kb_glossary WHERE term = 'Drug Interactions' AND category = 'dosing';

-- ============================================================================
-- STEP 2: RECATEGORIZE EXISTING TERMS TO NEW CATEGORIES
-- ============================================================================

-- Move to 'science' (from medical)
UPDATE kb_glossary SET category = 'science' WHERE term IN (
  '2-AG',
  'Anandamide',
  'CB1 Receptor',
  'CB2 Receptor',
  'Blood-Brain Barrier',
  'CYP450 Enzymes',
  'Endocannabinoid Deficiency',
  'Homeostasis',
  'Hydrophobic',
  'Lipophilic',
  'Neurotransmitter',
  'Neuroprotection',
  'Pet Endocannabinoid System'
);

-- Move to 'research' (from medical)
UPDATE kb_glossary SET category = 'research' WHERE term IN (
  'Clinical Trial',
  'Double-Blind Study',
  'Efficacy',
  'In Vitro',
  'In Vivo',
  'Meta-Analysis',
  'Peer Review',
  'Placebo Effect',
  'Preclinical Study',
  'Systematic Review'
);

-- Move to 'side-effects' (from medical)
UPDATE kb_glossary SET category = 'side-effects' WHERE term IN (
  'Appetite Changes',
  'Contraindication',
  'Drowsiness',
  'Drug Interaction',
  'Dry Mouth',
  'Grapefruit Interaction',
  'Liver Enzymes',
  'Side Effects',
  'Tolerance',
  'Blood Thinner Interaction'
);

-- Move to 'testing' (from legal)
UPDATE kb_glossary SET category = 'testing' WHERE term IN (
  'Batch Number',
  'Batch Testing',
  'Certificate of Analysis',
  'Heavy Metals Testing',
  'Lab Report',
  'Microbial Testing',
  'Pesticide Testing',
  'Potency Testing',
  'Third-Party Testing',
  'Quality Assurance'
);

-- Move to 'plant' (from various categories)
UPDATE kb_glossary SET category = 'plant' WHERE term IN (
  'Hemp',
  'Cannabis Indica',
  'Cannabis Sativa',
  'Trichome',
  'Cultivar',
  'Strain',
  'Flower'
);

-- ============================================================================
-- STEP 3: ADD 50 NEW TERMS
-- ============================================================================

-- Helper function to generate slug
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Cannabinoids (5)
INSERT INTO kb_glossary (term, display_name, slug, definition, short_definition, category, synonyms)
VALUES
  ('Minor Cannabinoids', 'Minor Cannabinoids', 'minor-cannabinoids',
   'Minor cannabinoids are cannabis compounds found in smaller concentrations than CBD or THC. These include CBG, CBN, CBC, and others that may have unique therapeutic properties. Research suggests minor cannabinoids work synergistically with major cannabinoids through the entourage effect.',
   'Cannabis compounds found in smaller concentrations than CBD or THC, including CBG, CBN, and CBC.',
   'cannabinoids', ARRAY['rare cannabinoids', 'secondary cannabinoids']),

  ('Phytocannabinoid', 'Phytocannabinoid', 'phytocannabinoid',
   'Phytocannabinoids are cannabinoids produced naturally by the cannabis plant. Unlike endocannabinoids made by the body or synthetic cannabinoids made in labs, phytocannabinoids are plant-derived compounds that interact with the endocannabinoid system.',
   'Cannabinoids produced naturally by the cannabis plant, as opposed to those made by the body or synthesized.',
   'cannabinoids', ARRAY['plant cannabinoid', 'natural cannabinoid']),

  ('CBE', 'CBE (Cannabielsoin)', 'cbe-cannabielsoin',
   'Cannabielsoin (CBE) is a minor cannabinoid formed when CBD is metabolized or exposed to light and air. It is considered a degradation product of CBD and is typically found in aged cannabis products. Research on CBE is limited.',
   'A minor cannabinoid formed when CBD degrades, typically found in aged cannabis products.',
   'cannabinoids', ARRAY['cannabielsoin']),

  ('HHC', 'HHC (Hexahydrocannabinol)', 'hhc-hexahydrocannabinol',
   'Hexahydrocannabinol (HHC) is a hydrogenated form of THC that occurs naturally in cannabis in trace amounts. Commercial HHC is typically synthesized from CBD. It produces effects similar to THC but with different potency and duration.',
   'A hydrogenated form of THC that produces similar but distinct psychoactive effects.',
   'cannabinoids', ARRAY['hexahydrocannabinol']),

  ('THC-O', 'THC-O (THC-O-Acetate)', 'thc-o-acetate',
   'THC-O-acetate is a synthetic cannabinoid created by acetylating THC. It is reported to be significantly more potent than delta-9 THC and has a delayed onset of effects. THC-O does not occur naturally in cannabis and is produced in laboratories.',
   'A synthetic, acetylated form of THC reported to be more potent than natural THC.',
   'cannabinoids', ARRAY['THC-O-acetate', 'THC acetate']);

-- Science (8)
INSERT INTO kb_glossary (term, display_name, slug, definition, short_definition, category, synonyms)
VALUES
  ('GPR55 Receptor', 'GPR55 Receptor', 'gpr55-receptor',
   'GPR55 is an orphan G protein-coupled receptor that responds to cannabinoids and is sometimes called the third cannabinoid receptor. It is found throughout the body and may play roles in bone density, blood pressure regulation, and cancer cell proliferation.',
   'An orphan receptor that responds to cannabinoids, sometimes called the third cannabinoid receptor.',
   'science', ARRAY['G protein-coupled receptor 55']),

  ('TRPV1 Receptor', 'TRPV1 Receptor', 'trpv1-receptor',
   'TRPV1 (transient receptor potential vanilloid 1) is an ion channel that responds to heat, capsaicin, and certain cannabinoids including CBD. Activation of TRPV1 may contribute to pain relief and anti-inflammatory effects of cannabinoids.',
   'An ion channel receptor that responds to heat, capsaicin, and cannabinoids, involved in pain perception.',
   'science', ARRAY['vanilloid receptor', 'capsaicin receptor']),

  ('PPARs', 'PPARs (Peroxisome Proliferator-Activated Receptors)', 'ppars',
   'PPARs are nuclear receptors that regulate gene expression related to metabolism, inflammation, and cell differentiation. CBD and other cannabinoids can activate PPARs, which may explain some of their anti-inflammatory and neuroprotective effects.',
   'Nuclear receptors that regulate metabolism and inflammation, activated by some cannabinoids.',
   'science', ARRAY['peroxisome proliferator-activated receptors']),

  ('Retrograde Signaling', 'Retrograde Signaling', 'retrograde-signaling',
   'Retrograde signaling is the unique way endocannabinoids communicate in the nervous system. Unlike most neurotransmitters that travel from pre-synaptic to post-synaptic neurons, endocannabinoids are produced by post-synaptic neurons and travel backward to regulate neurotransmitter release.',
   'The backward communication method used by endocannabinoids in the nervous system.',
   'science', ARRAY['backward signaling']),

  ('Endocannabinoid Tone', 'Endocannabinoid Tone', 'endocannabinoid-tone',
   'Endocannabinoid tone refers to the baseline level of endocannabinoid activity in the body. It encompasses the concentrations of endocannabinoids, the density of cannabinoid receptors, and the efficiency of metabolizing enzymes. Optimal tone is associated with balanced health.',
   'The baseline level of endocannabinoid system activity in the body.',
   'science', ARRAY['ECS tone', 'cannabinoid tone']),

  ('Allosteric Modulation', 'Allosteric Modulation', 'allosteric-modulation',
   'Allosteric modulation occurs when a compound binds to a receptor at a site other than the main active site, altering how the receptor responds to its primary ligand. CBD acts as a negative allosteric modulator of CB1 receptors, reducing THC effects without blocking them.',
   'When a compound alters receptor function by binding at a secondary site rather than the main active site.',
   'science', ARRAY['allosteric regulation']),

  ('Serotonin Receptors (5-HT1A)', 'Serotonin Receptors (5-HT1A)', 'serotonin-receptors-5ht1a',
   'The 5-HT1A receptor is a serotonin receptor subtype that CBD directly activates. This interaction may explain CBD''s anxiolytic and antidepressant effects. The 5-HT1A receptor is a key target for many anxiety and depression medications.',
   'A serotonin receptor subtype directly activated by CBD, potentially explaining its anti-anxiety effects.',
   'science', ARRAY['5-HT1A', 'serotonin 1A receptor']),

  ('FAAH Enzyme', 'FAAH (Fatty Acid Amide Hydrolase)', 'faah-enzyme',
   'FAAH is the primary enzyme responsible for breaking down anandamide in the body. CBD inhibits FAAH, which increases anandamide levels and may enhance mood and reduce anxiety. FAAH inhibitors are being researched for various therapeutic applications.',
   'The enzyme that breaks down anandamide; CBD inhibits FAAH to increase anandamide levels.',
   'science', ARRAY['fatty acid amide hydrolase']);

-- Products (12)
INSERT INTO kb_glossary (term, display_name, slug, definition, short_definition, category, synonyms)
VALUES
  ('CBD Gummies', 'CBD Gummies', 'cbd-gummies',
   'CBD gummies are edible candies infused with cannabidiol. They offer a convenient, discreet, and tasty way to consume CBD with pre-measured doses. Effects typically onset within 30-90 minutes and last 4-6 hours due to digestive processing.',
   'Edible CBD-infused candies offering convenient, pre-measured doses with longer-lasting effects.',
   'products', ARRAY['gummy edibles', 'CBD candy']),

  ('CBD Capsules', 'CBD Capsules', 'cbd-capsules',
   'CBD capsules are oral supplements containing CBD oil or powder in a gelatin or vegetarian shell. They provide precise dosing without taste and are processed through the digestive system. Capsules typically contain 10-50mg of CBD per unit.',
   'Oral CBD supplements in pill form providing precise, tasteless dosing.',
   'products', ARRAY['CBD pills', 'CBD tablets']),

  ('Softgels', 'Softgels', 'softgels',
   'Softgels are soft gelatin capsules containing liquid CBD oil. They may offer better absorption than standard capsules due to their liquid contents and are easier to swallow. Softgels protect CBD from light and air, improving shelf stability.',
   'Soft gelatin capsules containing liquid CBD oil for potentially better absorption.',
   'products', ARRAY['soft gel capsules', 'gel caps']),

  ('CBD Cream', 'CBD Cream', 'cbd-cream',
   'CBD cream is a topical product combining CBD with a cream base for skin application. Creams are water-based emulsions that absorb well and are suitable for general skincare. CBD in creams does not enter the bloodstream but works locally.',
   'A water-based topical product for applying CBD directly to the skin.',
   'products', ARRAY['cannabidiol cream', 'hemp cream']),

  ('CBD Balm', 'CBD Balm', 'cbd-balm',
   'CBD balm is a thick, oil-based topical product without water content. Balms create a protective barrier on the skin and are ideal for targeted application to specific areas. They typically contain beeswax or plant waxes as thickening agents.',
   'A thick, oil-based topical CBD product that creates a protective skin barrier.',
   'products', ARRAY['cannabidiol balm', 'hemp balm']),

  ('CBD Salve', 'CBD Salve', 'cbd-salve',
   'CBD salve is similar to a balm but typically has a softer consistency. Salves are oil-based topicals made with CBD, carrier oils, and waxes. They are used for localized relief and skin conditioning without systemic absorption.',
   'A soft, oil-based topical CBD product similar to balm but with softer consistency.',
   'products', ARRAY['cannabidiol salve', 'hemp salve']),

  ('CBD Beverages', 'CBD Beverages', 'cbd-beverages',
   'CBD beverages are drinks infused with water-soluble CBD, including waters, teas, coffees, and sodas. They use nanoemulsion technology to make CBD miscible with water. Effects are typically faster than traditional edibles due to improved absorption.',
   'Drinks infused with water-soluble CBD using nanoemulsion technology.',
   'products', ARRAY['CBD drinks', 'hemp beverages']),

  ('CBD Coffee', 'CBD Coffee', 'cbd-coffee',
   'CBD coffee combines coffee beans or grounds with CBD oil or isolate. The caffeine provides alertness while CBD may reduce coffee-related jitters and anxiety. Products range from infused beans to ready-to-drink beverages.',
   'Coffee products infused with CBD, potentially balancing caffeine''s stimulating effects.',
   'products', ARRAY['hemp coffee', 'cannabidiol coffee']),

  ('CBD Bath Bombs', 'CBD Bath Bombs', 'cbd-bath-bombs',
   'CBD bath bombs are effervescent balls that dissolve in bathwater, releasing CBD along with essential oils and fragrances. The CBD is absorbed through the skin during bathing. They are used for relaxation and skin nourishment.',
   'Effervescent bath products that release CBD into bathwater for skin absorption.',
   'products', ARRAY['hemp bath bombs', 'CBD bath fizz']),

  ('Pre-Rolls', 'Pre-Rolls', 'pre-rolls',
   'Pre-rolls are pre-made hemp flower joints ready for smoking or vaping. They contain ground CBD-rich hemp wrapped in rolling paper. Pre-rolls offer convenience and consistent dosing for those who prefer inhalation methods.',
   'Ready-to-smoke hemp flower joints for convenient inhalation consumption.',
   'products', ARRAY['hemp pre-rolls', 'CBD joints', 'hemp cigarettes']),

  ('Disposable Vape', 'Disposable Vape', 'disposable-vape',
   'Disposable CBD vapes are single-use electronic devices pre-filled with CBD vape oil. They require no charging, refilling, or maintenance and are discarded after the oil is depleted. They offer convenience for occasional users.',
   'Single-use, pre-filled CBD vaping devices discarded after the oil is depleted.',
   'products', ARRAY['disposable vape pen', 'single-use vape']),

  ('510 Thread Cartridge', '510 Thread Cartridge', '510-thread-cartridge',
   '510 thread cartridges are pre-filled CBD oil containers that attach to compatible battery bases. The 510 thread is an industry-standard connection type, making cartridges interchangeable between most vape batteries.',
   'Pre-filled CBD oil containers using the industry-standard 510 thread connection.',
   'products', ARRAY['vape cartridge', '510 cart']);

-- Extraction (4)
INSERT INTO kb_glossary (term, display_name, slug, definition, short_definition, category, synonyms)
VALUES
  ('Chromatography', 'Chromatography', 'chromatography',
   'Chromatography is a laboratory technique used to separate and purify cannabinoids from hemp extract. Different types include flash chromatography and preparative HPLC. It allows manufacturers to isolate specific cannabinoids or remove unwanted compounds like THC.',
   'A separation technique used to purify cannabinoids or remove unwanted compounds from hemp extract.',
   'extraction', ARRAY['column chromatography', 'flash chromatography']),

  ('Short Path Distillation', 'Short Path Distillation', 'short-path-distillation',
   'Short path distillation is a purification technique that uses vacuum and heat to separate cannabinoids based on their boiling points. The short distance between the evaporation and condensation points minimizes degradation. It produces highly concentrated cannabinoid distillates.',
   'A vacuum distillation technique for creating highly concentrated cannabinoid distillates.',
   'extraction', ARRAY['SPD', 'molecular distillation']),

  ('Crude Oil', 'Crude Oil (Hemp)', 'crude-oil',
   'Crude oil is the initial extract obtained from hemp before further refinement. It contains cannabinoids, terpenes, chlorophyll, waxes, and plant lipids. Crude oil is typically dark in color and must be processed further to create consumer products.',
   'The initial, unrefined extract from hemp containing all plant compounds.',
   'extraction', ARRAY['raw extract', 'full extract']),

  ('Remediation', 'Remediation', 'remediation',
   'Remediation in hemp processing refers to removing or reducing THC levels in extracts to meet legal limits. Techniques include chromatography and selective extraction. Remediation allows high-THC hemp crops to be converted into compliant products.',
   'The process of removing or reducing THC in hemp extracts to meet legal compliance.',
   'extraction', ARRAY['THC remediation', 'THC removal']);

-- Dosing (5)
INSERT INTO kb_glossary (term, display_name, slug, definition, short_definition, category, synonyms)
VALUES
  ('Onset Time', 'Onset Time', 'onset-time',
   'Onset time is how long it takes to feel the effects of CBD after consumption. Inhalation has the fastest onset (minutes), sublingual is intermediate (15-30 minutes), and oral ingestion is slowest (30-90 minutes). Topicals work locally and onset varies.',
   'The time between CBD consumption and when effects become noticeable.',
   'dosing', ARRAY['time to effect', 'activation time']),

  ('Duration of Effects', 'Duration of Effects', 'duration-of-effects',
   'Duration of effects refers to how long CBD effects last after onset. Inhalation effects last 2-4 hours, sublingual 4-6 hours, and oral 6-8 hours. Factors including dose, metabolism, and frequency of use affect duration.',
   'How long CBD effects persist after they begin, varying by consumption method.',
   'dosing', ARRAY['effect duration', 'length of effects']),

  ('First-Pass Metabolism', 'First-Pass Metabolism', 'first-pass-metabolism',
   'First-pass metabolism occurs when orally consumed CBD passes through the liver before reaching systemic circulation. The liver metabolizes a significant portion, reducing bioavailability to 6-19%. Sublingual administration partially bypasses first-pass metabolism.',
   'Liver processing that reduces CBD bioavailability when consumed orally.',
   'dosing', ARRAY['first-pass effect', 'hepatic first pass']),

  ('Peak Plasma Concentration', 'Peak Plasma Concentration', 'peak-plasma-concentration',
   'Peak plasma concentration (Cmax) is the highest level of CBD in the bloodstream after a dose. This typically occurs 1-2 hours after oral consumption. Understanding peak levels helps optimize dosing timing for desired effects.',
   'The maximum CBD level reached in the bloodstream after a dose.',
   'dosing', ARRAY['Cmax', 'maximum concentration']),

  ('Body Weight Dosing', 'Body Weight Dosing', 'body-weight-dosing',
   'Body weight dosing calculates CBD amounts based on a person''s weight, typically 0.25-0.5mg per pound for standard doses. This approach helps personalize dosing, though individual responses still vary based on metabolism and other factors.',
   'A dosing approach that calculates CBD amounts based on body weight.',
   'dosing', ARRAY['weight-based dosing', 'mg per kg dosing']);

-- Legal (5)
INSERT INTO kb_glossary (term, display_name, slug, definition, short_definition, category, synonyms)
VALUES
  ('Seed-to-Sale Tracking', 'Seed-to-Sale Tracking', 'seed-to-sale-tracking',
   'Seed-to-sale tracking systems monitor cannabis and hemp products through every stage from cultivation to final sale. These systems use software and tagging to ensure regulatory compliance, prevent diversion, and enable product recalls if needed.',
   'Regulatory systems that track hemp products from cultivation through retail sale.',
   'legal', ARRAY['track and trace', 'chain of custody']),

  ('Hemp License', 'Hemp License', 'hemp-license',
   'A hemp license is a permit required to legally cultivate, process, or sell hemp in many jurisdictions. Requirements vary by location and may include background checks, facility inspections, and annual fees. Licenses ensure compliance with THC limits.',
   'A permit required for legal hemp cultivation, processing, or sales.',
   'legal', ARRAY['hemp cultivation license', 'hemp grower license']),

  ('Import/Export Regulations', 'Import/Export Regulations', 'import-export-regulations',
   'Import/export regulations govern international trade of hemp and CBD products. Requirements vary by country and may include permits, COAs, THC certifications, and customs documentation. Some countries prohibit CBD imports entirely.',
   'Rules governing international trade of hemp and CBD products.',
   'legal', ARRAY['customs regulations', 'international trade rules']),

  ('Food Supplement Classification', 'Food Supplement Classification', 'food-supplement-classification',
   'Food supplement classification determines how CBD products are regulated in a market. In the EU and UK, CBD foods require Novel Food authorization. Classification affects labeling requirements, claims allowed, and sales channels.',
   'The regulatory category determining how CBD products can be sold and marketed.',
   'legal', ARRAY['dietary supplement', 'nutraceutical classification']),

  ('Cosmetic CBD Regulations', 'Cosmetic CBD Regulations', 'cosmetic-cbd-regulations',
   'Cosmetic CBD regulations govern CBD use in skincare, beauty, and personal care products. Requirements vary by region and typically include ingredient restrictions, labeling rules, and safety assessments. CBD cosmetics often face fewer restrictions than ingestibles.',
   'Rules governing the use of CBD in skincare and beauty products.',
   'legal', ARRAY['CBD beauty regulations', 'topical CBD rules']);

-- Plant (5)
INSERT INTO kb_glossary (term, display_name, slug, definition, short_definition, category, synonyms)
VALUES
  ('Biomass', 'Biomass', 'biomass',
   'Hemp biomass is the raw plant material used for extraction, typically consisting of dried flowers, leaves, and sometimes stems. Quality biomass has high cannabinoid content and low THC levels. It is sold by the pound or ton to extraction facilities.',
   'Raw hemp plant material used for CBD extraction.',
   'plant', ARRAY['hemp biomass', 'raw material']),

  ('Feminized Seeds', 'Feminized Seeds', 'feminized-seeds',
   'Feminized seeds are bred to produce only female cannabis plants, which produce the cannabinoid-rich flowers. This eliminates the need to identify and remove male plants. Feminized seeds are standard in commercial hemp cultivation.',
   'Seeds bred to produce only female plants for maximum cannabinoid production.',
   'plant', ARRAY['female seeds', 'feminised seeds']),

  ('Autoflower', 'Autoflower', 'autoflower',
   'Autoflower hemp varieties flower based on age rather than light cycle changes. They typically mature faster (8-10 weeks) than photoperiod varieties. Autoflowers allow multiple harvests per season but often have lower yields per plant.',
   'Hemp varieties that flower automatically based on age rather than light exposure.',
   'plant', ARRAY['autoflowering', 'auto seeds', 'day-neutral']),

  ('Curing', 'Curing', 'curing',
   'Curing is the post-harvest process of slowly drying hemp flowers in controlled conditions to preserve cannabinoids and terpenes. Proper curing improves flavor, smoothness, and potency while preventing mold. The process typically takes 2-8 weeks.',
   'The controlled drying process that preserves cannabinoids and terpenes in harvested hemp.',
   'plant', ARRAY['flower curing', 'dry cure']),

  ('Organic Hemp', 'Organic Hemp', 'organic-hemp',
   'Organic hemp is grown without synthetic pesticides, herbicides, or fertilizers. Certification requires following specific agricultural practices and passing inspections. Organic cultivation may reduce contaminant risks but does not guarantee higher cannabinoid content.',
   'Hemp grown without synthetic chemicals, following organic agricultural standards.',
   'plant', ARRAY['certified organic', 'bio hemp']);

-- Conditions (3)
INSERT INTO kb_glossary (term, display_name, slug, definition, short_definition, category, synonyms)
VALUES
  ('Endometriosis', 'Endometriosis', 'endometriosis',
   'Endometriosis is a condition where tissue similar to uterine lining grows outside the uterus, causing pain and inflammation. The endocannabinoid system may play a role in endometriosis, and some patients report CBD helps manage symptoms. Clinical research is ongoing.',
   'A painful condition involving tissue growth outside the uterus; some use CBD for symptom management.',
   'conditions', ARRAY['endo']),

  ('IBS', 'IBS (Irritable Bowel Syndrome)', 'ibs-irritable-bowel-syndrome',
   'Irritable Bowel Syndrome is a gastrointestinal disorder causing abdominal pain, bloating, and altered bowel habits. The gut contains cannabinoid receptors, and some research suggests CBD may help regulate gut motility and reduce inflammation.',
   'A digestive disorder that may respond to cannabinoid treatment through gut receptors.',
   'conditions', ARRAY['irritable bowel syndrome', 'spastic colon']),

  ('Restless Leg Syndrome', 'Restless Leg Syndrome', 'restless-leg-syndrome',
   'Restless Leg Syndrome causes uncomfortable sensations and an urge to move the legs, often disrupting sleep. Some patients report CBD helps reduce symptoms, possibly through its effects on dopamine and sleep regulation. Clinical evidence is limited.',
   'A neurological condition causing leg discomfort; some patients report CBD provides relief.',
   'conditions', ARRAY['RLS', 'Willis-Ekbom disease']);

-- Testing (3)
INSERT INTO kb_glossary (term, display_name, slug, definition, short_definition, category, synonyms)
VALUES
  ('HPLC', 'HPLC (High-Performance Liquid Chromatography)', 'hplc',
   'HPLC is the primary analytical method for testing cannabinoid potency in hemp products. It separates, identifies, and quantifies cannabinoids without heat, preserving acidic forms like CBDA. HPLC provides more accurate results than gas chromatography for CBD products.',
   'The standard laboratory method for accurately testing cannabinoid content in CBD products.',
   'testing', ARRAY['high-performance liquid chromatography', 'liquid chromatography']),

  ('Gas Chromatography', 'Gas Chromatography', 'gas-chromatography',
   'Gas chromatography (GC) is a testing method that uses heat to vaporize samples for analysis. While effective for some purposes, GC converts acidic cannabinoids to their neutral forms, making it less ideal for CBD product testing than HPLC.',
   'A heat-based testing method less suitable for CBD products as it alters acidic cannabinoids.',
   'testing', ARRAY['GC', 'GC-MS']),

  ('ISO 17025 Accreditation', 'ISO 17025 Accreditation', 'iso-17025-accreditation',
   'ISO 17025 is an international standard for testing and calibration laboratory competence. Accredited labs meet rigorous quality requirements and demonstrate technical proficiency. COAs from ISO 17025 labs are considered most reliable for CBD product testing.',
   'An international standard ensuring laboratory testing competence and reliability.',
   'testing', ARRAY['ISO accreditation', 'lab accreditation']);

-- Clean up helper function
DROP FUNCTION IF EXISTS generate_slug(TEXT);

-- Verify the migration
SELECT category, COUNT(*) as count
FROM kb_glossary
GROUP BY category
ORDER BY category;
