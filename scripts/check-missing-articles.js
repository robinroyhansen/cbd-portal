const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bvrdryvgqarffgdujmjz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY'
);

// All slugs from master plan - organized by category
const masterPlanSlugs = {
  // CATEGORY 1: FOUNDATIONS & BASICS (50)
  foundations: [
    'introduction-to-cbd', 'beginners-guide-to-cbd', 'how-cbd-works', 'endocannabinoid-system',
    'history-of-cbd', 'cbd-buying-guide', 'understanding-cbd-quality', 'cbd-and-your-body',
    'what-is-cbd', 'what-is-hemp', 'hemp-vs-marijuana', 'what-is-cannabis',
    'what-is-full-spectrum-cbd', 'what-is-broad-spectrum-cbd', 'what-is-cbd-isolate',
    'full-spectrum-vs-broad-spectrum-vs-isolate', 'entourage-effect', 'what-are-cannabinoids',
    'what-are-terpenes', 'what-are-flavonoids', 'phytocannabinoids-vs-endocannabinoids',
    'hemp-extract-vs-cbd', 'cannabis-sativa-indica-ruderalis', 'cb1-receptors', 'cb2-receptors',
    'what-is-anandamide', 'what-is-2-ag', 'gpr55-receptor', 'trpv-receptors', 'what-is-faah',
    'endocannabinoid-deficiency', 'support-endocannabinoid-system', 'ecs-and-homeostasis',
    'does-cbd-get-you-high', 'is-cbd-psychoactive', 'what-does-cbd-feel-like', 'is-cbd-natural',
    'where-does-cbd-come-from', 'how-is-cbd-made', 'is-cbd-a-drug', 'is-cbd-medicine',
    'can-anyone-take-cbd', 'age-to-buy-cbd', 'is-cbd-halal', 'is-cbd-kosher', 'is-cbd-vegan',
    'cbd-myths-debunked', 'cbd-terminology-glossary', 'cbd-skeptics', 'why-people-use-cbd'
  ],

  // CATEGORY 2: CANNABINOIDS (40)
  cannabinoids: [
    'what-is-cannabidiol', 'what-is-thc', 'what-is-cbg', 'what-is-cbn', 'what-is-cbc',
    'what-is-cbda', 'what-is-thca', 'what-is-cbga', 'what-is-delta-8-thc', 'what-is-delta-9-thc',
    'what-is-thcv', 'what-is-cbdv', 'what-is-cbe', 'what-is-cbl', 'what-is-cbt-cannabinoid',
    'what-is-hhc', 'what-is-thc-o', 'what-is-delta-10-thc', 'what-is-thcp', 'what-is-cbdp',
    'minor-cannabinoids', 'synthetic-cannabinoids-dangers', 'cbd-vs-thc', 'cbd-vs-cbda',
    'thc-vs-thca', 'cbd-vs-cbg', 'cbd-vs-cbn', 'cbd-vs-cbc', 'cbd-vs-delta-8', 'cbg-vs-cbn',
    'cbg-vs-cbga', 'delta-8-vs-delta-9', 'delta-8-vs-delta-10', 'hhc-vs-thc', 'hhc-vs-delta-8',
    'thc-o-vs-delta-8', 'cbd-vs-hhc', 'cbn-vs-melatonin', 'raw-vs-decarboxylated-cannabinoids',
    'all-cannabinoids-compared'
  ],

  // CATEGORY 3: TERPENES (30)
  terpenes: [
    'what-are-terpenes-guide', 'terpenes-and-cbd', 'how-terpenes-affect-cbd', 'terpene-profiles',
    'terpenes-vs-cannabinoids', 'myrcene', 'limonene', 'linalool', 'pinene', 'caryophyllene',
    'humulene', 'terpinolene', 'ocimene', 'bisabolol', 'eucalyptol', 'geraniol', 'nerolidol',
    'valencene', 'borneol', 'camphene', 'guaiol', 'terpineol', 'phytol', 'sabinene', 'cymene',
    'best-terpenes-for-sleep', 'best-terpenes-for-anxiety', 'best-terpenes-for-pain',
    'best-terpenes-for-focus', 'best-terpenes-for-energy'
  ],

  // CATEGORY 4: PRODUCTS (40)
  products: [
    'cbd-oil-guide', 'cbd-gummies-guide', 'cbd-capsules-guide', 'cbd-softgels-guide',
    'cbd-cream-guide', 'cbd-balm-guide', 'cbd-salve-guide', 'cbd-lotion-guide',
    'cbd-topicals-guide', 'cbd-tincture-guide', 'cbd-vape-guide', 'cbd-vape-pen-guide',
    'cbd-vape-cartridge-guide', 'cbd-e-liquid-guide', 'cbd-flower-guide', 'cbd-pre-rolls-guide',
    'cbd-edibles-guide', 'cbd-patches-guide', 'cbd-drinks-guide', 'cbd-coffee-guide',
    'cbd-tea-guide', 'cbd-bath-bombs-guide', 'cbd-skincare-guide', 'cbd-lip-balm-guide',
    'cbd-concentrates-guide', 'water-soluble-cbd', 'nano-cbd', 'liposomal-cbd', 'cbd-hash',
    'cbd-shatter', 'cbd-wax', 'cbd-crumble', 'cbd-distillate', 'cbd-crude-oil', 'rso-oil',
    'cbd-carrier-oils', 'mct-oil-cbd', 'hemp-seed-oil-vs-cbd-oil', 'flavored-vs-unflavored-cbd',
    'cbd-oil-strength-guide'
  ],

  // CATEGORY 7: GUIDES (55) - Sample
  guides: [
    'how-to-start-taking-cbd', 'choose-cbd-product', 'choose-cbd-brand', 'buy-cbd-online',
    'buy-cbd-in-store', 'what-to-expect-cbd', 'set-cbd-goals', 'track-cbd-effects',
    'cbd-journal', 'talk-to-doctor-cbd', 'first-week-cbd', 'cbd-dosage-guide',
    'find-your-cbd-dosage', 'cbd-dosage-by-weight', 'cbd-dosage-for-beginners',
    'cbd-dosage-for-sleep', 'cbd-dosage-for-anxiety', 'cbd-dosage-for-pain',
    'cbd-starting-dose', 'cbd-maintenance-dose', 'microdosing-cbd', 'cbd-titration',
    'when-to-increase-cbd-dose', 'when-to-decrease-cbd-dose', 'cbd-mg-ml-calculator',
    'cbd-percentage-to-mg', 'how-to-take-cbd-oil', 'how-to-use-cbd-drops',
    'how-to-take-cbd-sublingually', 'how-to-use-cbd-gummies', 'how-to-take-cbd-capsules',
    'how-to-apply-cbd-cream', 'how-to-apply-cbd-topicals', 'how-to-vape-cbd',
    'how-to-use-cbd-patches', 'how-to-use-cbd-flower', 'how-long-cbd-to-work',
    'how-long-does-cbd-last', 'how-long-cbd-in-system', 'best-time-to-take-cbd',
    'cbd-morning-vs-night', 'how-to-read-cbd-labels', 'how-to-read-cbd-lab-reports',
    'verify-cbd-quality', 'check-cbd-potency', 'spot-fake-cbd', 'store-cbd-products',
    'travel-with-cbd', 'dispose-of-cbd', 'consumption-methods-compared',
    'sublingual-cbd-guide', 'oral-cbd-guide', 'topical-cbd-guide', 'inhaled-cbd-guide'
  ],

  // CATEGORY 8: SCIENCE (45)
  science: [
    'science-of-cbd', 'how-cbd-affects-brain', 'cbd-and-nervous-system', 'cbd-pharmacology',
    'cbd-pharmacokinetics', 'how-cbd-metabolized', 'cbd-bioavailability', 'first-pass-metabolism-cbd',
    'cbd-half-life', 'cbd-serotonin-receptors', 'cbd-gaba-receptors', 'cbd-and-dopamine',
    'cbd-anti-inflammatory-mechanisms', 'cbd-antioxidant-properties', 'cbd-homeostasis',
    'cbd-research-overview', 'cbd-clinical-research', 'cbd-clinical-trials',
    'understanding-cbd-studies', 'why-cbd-works-differently', 'cbd-and-genetics',
    'cbd-research-limitations', 'cbd-placebo-effect', 'future-of-cbd-research',
    'how-to-read-cbd-research', 'epidiolex-study', 'charlottes-web-story',
    'key-cbd-anxiety-studies', 'key-cbd-pain-studies', 'key-cbd-sleep-studies',
    'key-cbd-epilepsy-studies', 'cbd-inflammation-research', 'cbd-neuroprotection-research',
    'cbd-skin-research', 'cbd-mental-health-research', 'cbd-extraction-methods',
    'co2-extraction-cbd', 'ethanol-extraction-cbd', 'hydrocarbon-extraction-cbd',
    'solventless-extraction-cbd', 'cbd-distillation', 'cbd-winterization',
    'decarboxylation-cbd', 'cbd-chromatography', 'how-cbd-products-made'
  ],

  // CATEGORY 9: SAFETY (40)
  safety: [
    'is-cbd-safe', 'cbd-side-effects', 'common-cbd-side-effects', 'rare-cbd-side-effects',
    'can-you-overdose-on-cbd', 'cbd-drug-interactions', 'cbd-prescription-medications',
    'cbd-blood-thinners', 'cbd-antidepressants', 'cbd-and-antibiotics', 'cbd-drug-tests',
    'is-cbd-addictive', 'cbd-tolerance', 'cbd-and-alcohol', 'cbd-and-caffeine',
    'cbd-long-term-safety', 'cbd-safety-for-seniors', 'cbd-safety-during-fasting',
    'who-should-not-take-cbd', 'cbd-contraindications', 'what-to-look-for-buying-cbd',
    'cbd-quality-standards', 'third-party-testing-cbd', 'understanding-coas',
    'cbd-potency-testing', 'cbd-contaminant-testing', 'heavy-metals-cbd', 'pesticides-cbd',
    'residual-solvents-cbd', 'microbial-testing-cbd', 'organic-cbd', 'gmp-certification-cbd',
    'iso-certification-cbd', 'eu-gmp-standards', 'cbd-red-flags', 'low-quality-cbd',
    'cbd-shelf-life', 'check-if-cbd-real', 'cbd-source-quality', 'cbd-batch-testing'
  ],

  // CATEGORY 10: COMPARISONS (55) - Sample
  comparisons: [
    'cbd-vs-melatonin', 'cbd-vs-ashwagandha', 'cbd-vs-valerian', 'cbd-vs-kratom',
    'cbd-vs-turmeric', 'cbd-vs-magnesium', 'cbd-vs-l-theanine', 'cbd-vs-gaba-supplements',
    'cbd-vs-5-htp', 'cbd-vs-fish-oil', 'cbd-vs-passionflower', 'cbd-vs-chamomile',
    'cbd-vs-lavender', 'cbd-vs-kava', 'cbd-vs-rhodiola', 'cbd-vs-ginkgo-biloba',
    'cbd-vs-st-johns-wort', 'cbd-vs-arnica', 'cbd-vs-essential-oils', 'cbd-vs-acupuncture',
    'cbd-vs-ibuprofen', 'cbd-vs-nsaids', 'cbd-vs-paracetamol', 'cbd-vs-prescription-painkillers',
    'cbd-vs-benzodiazepines', 'cbd-vs-ssris', 'cbd-vs-sleeping-pills', 'cbd-vs-muscle-relaxants',
    'cbd-vs-steroids', 'cbd-vs-medical-marijuana', 'cbd-oil-vs-hemp-oil',
    'cbd-oil-vs-hemp-seed-oil', 'cbd-oil-vs-capsules', 'cbd-oil-vs-gummies',
    'cbd-oil-vs-cream', 'cbd-oil-vs-vape', 'cbd-oil-vs-tincture', 'gummies-vs-capsules',
    'cbd-oil-for-anxiety-vs-gummies', 'cbd-oil-for-sleep-vs-gummies', 'cbd-cream-vs-balm-vs-salve',
    'cbd-oil-for-pain-vs-cream', 'topical-vs-oral-cbd', 'softgels-vs-capsules',
    'cbd-flower-vs-oil', 'cbd-edibles-vs-oil', 'cbd-sublingual-vs-edibles',
    'full-spectrum-vs-isolate-for-sleep', 'full-spectrum-vs-isolate-for-anxiety',
    'water-soluble-vs-oil-cbd', 'mct-vs-hemp-seed-carrier', 'high-vs-low-potency-cbd',
    'cbd-with-food-vs-empty-stomach', 'cbd-morning-vs-evening'
  ],

  // CATEGORY 11: LEGAL (50)
  legal: [
    'is-cbd-legal', 'cbd-laws-europe', 'cbd-laws-eu', 'novel-food-regulations', 'thc-limits',
    'marketing-claims-cbd', 'traveling-with-cbd-europe', 'flying-with-cbd', 'import-export-cbd',
    'workplace-drug-testing-cbd', 'cbd-legal-austria', 'cbd-legal-belgium', 'cbd-legal-bulgaria',
    'cbd-legal-croatia', 'cbd-legal-cyprus', 'cbd-legal-czech-republic', 'cbd-legal-denmark',
    'cbd-legal-estonia', 'cbd-legal-finland', 'cbd-legal-france', 'cbd-legal-germany',
    'cbd-legal-greece', 'cbd-legal-hungary', 'cbd-legal-ireland', 'cbd-legal-italy',
    'cbd-legal-latvia', 'cbd-legal-lithuania', 'cbd-legal-luxembourg', 'cbd-legal-malta',
    'cbd-legal-netherlands', 'cbd-legal-poland', 'cbd-legal-portugal', 'cbd-legal-romania',
    'cbd-legal-slovakia', 'cbd-legal-slovenia', 'cbd-legal-spain', 'cbd-legal-sweden',
    'cbd-legal-switzerland', 'cbd-legal-uk', 'cbd-legal-norway', 'cbd-legal-iceland',
    'cbd-legal-usa', 'cbd-legal-canada', 'cbd-legal-australia', 'cbd-legal-new-zealand',
    'cbd-legal-japan', 'cbd-legal-south-korea', 'cbd-legal-brazil', 'cbd-legal-mexico',
    'cbd-legal-south-africa'
  ],

  // CATEGORY 13: HEMP (25)
  hemp: [
    'what-is-hemp-plant', 'hemp-vs-cannabis-plant', 'hemp-anatomy', 'how-hemp-is-grown',
    'organic-hemp-farming', 'hemp-farming-europe', 'sustainable-hemp-cultivation',
    'hemp-seed-vs-flower', 'hemp-strains', 'high-cbd-hemp-strains', 'hemp-harvesting',
    'hemp-drying-curing', 'hemp-processing-methods', 'hemp-biomass', 'eu-approved-hemp-varieties',
    'hemp-certification-programs', 'hemp-and-environment', 'hemp-carbon-footprint',
    'hemp-sustainability-benefits', 'hemp-supply-chain', 'seed-to-sale-tracking',
    'hemp-quality-indicators', 'sourcing-quality-hemp', 'european-vs-american-hemp',
    'swiss-hemp-quality'
  ],

  // CATEGORY 12: DEMOGRAPHICS (25)
  demographics: [
    'cbd-for-beginners', 'cbd-for-first-time-users', 'cbd-for-seniors', 'cbd-for-over-50',
    'cbd-for-over-60', 'cbd-for-athletes', 'cbd-for-runners', 'cbd-for-cyclists',
    'cbd-for-weightlifters', 'cbd-for-yoga', 'cbd-for-women', 'cbd-for-men',
    'cbd-for-students', 'cbd-for-professionals', 'cbd-for-shift-workers', 'cbd-for-travelers',
    'cbd-for-vegans', 'cbd-for-allergies', 'cbd-for-thc-sensitive', 'cbd-for-cannabis-newbies',
    'cbd-for-healthcare-workers', 'cbd-for-musicians', 'cbd-for-creatives', 'cbd-for-parents',
    'cbd-for-caregivers'
  ],

  // CATEGORY 14: FAQ (35)
  faq: [
    'does-cbd-work', 'why-doesnt-cbd-work-for-me', 'how-do-i-know-if-cbd-is-working',
    'can-cbd-make-you-fail-drug-test', 'can-you-take-too-much-cbd', 'can-you-drive-after-cbd',
    'can-you-work-while-taking-cbd', 'does-cbd-make-you-tired', 'does-cbd-make-you-hungry',
    'does-cbd-cause-dry-mouth', 'does-cbd-cause-headaches', 'does-cbd-expire',
    'can-cbd-go-bad', 'is-cbd-worth-it', 'is-cbd-a-scam', 'what-is-best-cbd-product',
    'how-much-cbd-oil-should-i-take', 'what-cbd-strength-should-i-buy',
    'can-i-use-cbd-oil-on-skin', 'can-i-add-cbd-to-food', 'can-i-add-cbd-to-drinks',
    'cbd-oil-or-gummies', 'what-does-cbd-taste-like', 'why-is-cbd-expensive',
    'cheapest-way-to-take-cbd', 'is-cbd-safe-every-day', 'is-cbd-safe-for-older-adults',
    'is-cbd-safe-with-medication', 'is-cbd-safe-before-surgery', 'is-cbd-safe-while-fasting',
    'can-i-mix-cbd-with-supplements', 'what-happens-if-i-stop-cbd', 'can-i-take-cbd-long-term',
    'are-there-cbd-recalls', 'how-to-report-cbd-side-effects'
  ]
};

async function checkMissing() {
  // Flatten all slugs
  const allSlugs = Object.values(masterPlanSlugs).flat();
  console.log(`Total slugs in master plan: ${allSlugs.length}`);

  // Get all existing slugs from database
  const { data, error } = await supabase
    .from('kb_articles')
    .select('slug');

  if (error) {
    console.error('Error:', error);
    return;
  }

  const existingSlugs = new Set(data.map(a => a.slug));
  console.log(`Total articles in database: ${existingSlugs.size}`);

  // Find missing by category
  console.log('\n=== MISSING ARTICLES BY CATEGORY ===\n');

  let totalMissing = 0;
  for (const [category, slugs] of Object.entries(masterPlanSlugs)) {
    const missing = slugs.filter(s => !existingSlugs.has(s));
    if (missing.length > 0) {
      console.log(`${category.toUpperCase()} (${missing.length} missing):`);
      missing.forEach(s => console.log(`  - ${s}`));
      console.log('');
      totalMissing += missing.length;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total missing: ${totalMissing}`);
  console.log(`Coverage: ${((allSlugs.length - totalMissing) / allSlugs.length * 100).toFixed(1)}%`);
}

checkMissing();
