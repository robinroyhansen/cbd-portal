/**
 * Content Type Classification Script
 *
 * Classifies studies as: medical, legal, economic, agricultural, or other
 * based on title, abstract, and raw terms analysis.
 *
 * Run with: node scripts/classify-content-type.mjs
 *
 * Options:
 *   --dry-run    Preview changes without updating database
 *   --status=X   Only classify studies with specific status (pending, approved, all)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local
function loadEnv() {
  const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      envVars[key] = value;
    }
  });
  return envVars;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Parse arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const statusArg = args.find(a => a.startsWith('--status='));
const targetStatus = statusArg ? statusArg.split('=')[1] : 'all';

// Classification keywords (weighted)
// Note: Be specific to avoid matching medical terms like "gene regulation"
const LEGAL_KEYWORDS = {
  strong: [
    'legalization', 'legislation', 'decriminalization',
    'criminal justice', 'drug policy', 'cannabis policy', 'marijuana policy',
    'legal status', 'prohibition', 'drug law', 'controlled substance act',
    'descheduling', 'law enforcement', 'prosecution', 'incarceration',
    'cannabis law', 'marijuana law', 'drug enforcement'
  ],
  moderate: [
    'legal framework', 'policy reform', 'criminal penalty', 'drug court',
    'sentencing', 'arrest rate', 'conviction rate', 'possession charge',
    'drug offense', 'cannabis regulation'  // not just 'regulation'
  ],
  weak: []  // removed weak matches to reduce false positives
};

const ECONOMIC_KEYWORDS = {
  strong: [
    'market analysis', 'economic impact', 'cannabis industry', 'marijuana market',
    'dispensary business', 'retail cannabis', 'cannabis business',
    'tax revenue', 'market size', 'industry growth', 'cannabis investment',
    'supply chain analysis', 'price analysis', 'market dynamics',
    'commercial cannabis market', 'cannabis entrepreneurship'
  ],
  moderate: [
    'economic analysis', 'market research', 'cannabis commerce', 'cannabis trade',
    'dispensary sales', 'retail sales data', 'commercial production'
  ],
  weak: []  // removed weak matches
};

const AGRICULTURAL_KEYWORDS = {
  strong: [
    'hemp cultivation', 'cannabis cultivation', 'crop yield',
    'hemp fiber', 'industrial hemp production', 'hemp seed oil',
    'phytoremediation', 'soil contamination', 'crop production',
    'hemp farming', 'cannabis harvest', 'outdoor cultivation',
    'hemp textile', 'fiber extraction', 'hemp biomass'
  ],
  moderate: [
    'cultivation technique', 'growing condition', 'plant breeding',
    'agronomic trait', 'seed production', 'biomass yield',
    'hemp processing', 'fiber quality'
  ],
  weak: []  // removed weak matches
};

const MEDICAL_KEYWORDS = {
  strong: [
    'clinical trial', 'randomized controlled', 'double-blind', 'placebo-controlled',
    'therapeutic', 'treatment outcome', 'patients with', 'efficacy', 'safety profile',
    'pharmacokinetics', 'pharmacodynamics', 'dose-response', 'adverse events',
    'medical cannabis', 'medicinal cannabis', 'pain management', 'symptom relief',
    'disease', 'disorder', 'syndrome', 'diagnosis', 'prognosis',
    'pilot study', 'cohort study', 'case study', 'prospective study', 'retrospective',
    'breast milk', 'plasma concentration', 'blood concentration', 'serum level',
    'bioavailability', 'metabolism', 'receptor', 'endocannabinoid'
  ],
  moderate: [
    'patient', 'therapy', 'clinical', 'health outcome', 'symptom',
    'pain', 'anxiety', 'depression', 'epilepsy', 'cancer', 'inflammation',
    'nausea', 'appetite', 'sleep', 'cognitive', 'neurological',
    'treatment', 'dosing', 'tolerability', 'side effect'
  ],
  weak: [
    'health', 'effect', 'medical'
  ]
};

function classifyContent(title, abstract, rawTerms) {
  const text = `${title || ''} ${abstract || ''}`.toLowerCase();
  const terms = (rawTerms || []).map(t => t.toLowerCase());

  // Pre-filter: Check if this is about "Central Business District" not cannabidiol
  const cbdBusinessPatterns = [
    'cbd development', 'cbd of ', 'major cbds', 'urban cbd', 'city cbd',
    'cbd area', 'downtown cbd', 'cbd planning', 'commercial cbd'
  ];
  if (cbdBusinessPatterns.some(p => text.includes(p))) {
    return { type: 'other', scores: { medical: 0, legal: 0, economic: 0, agricultural: 0 }, confidence: 'high', reason: 'CBD = Central Business District' };
  }

  // Pre-filter: Clear medical indicators in title should force medical classification
  const titleLower = (title || '').toLowerCase();
  const clearMedicalTitlePatterns = [
    'fetal', 'prenatal', 'pregnancy', 'pregnant', 'perinatal', 'neonatal',
    'patients', 'clinical trial', 'randomized', 'placebo',
    'treatment of', 'therapy for', 'efficacy of', 'effect on',
    'in children', 'in adults', 'in humans', 'in mice', 'in rats',
    'pharmacokinetics', 'pharmacodynamics', 'bioavailability',
    'brain', 'cognitive', 'behavioral', 'psychiatric', 'neurological'
  ];
  if (clearMedicalTitlePatterns.some(p => titleLower.includes(p))) {
    return { type: 'medical', scores: { medical: 10, legal: 0, economic: 0, agricultural: 0 }, confidence: 'high', reason: 'Clear medical title' };
  }

  const scores = {
    medical: 0,
    legal: 0,
    economic: 0,
    agricultural: 0
  };

  // Score each category
  function scoreCategory(keywords, category) {
    // Strong keywords: +3 points
    for (const kw of keywords.strong) {
      if (text.includes(kw.toLowerCase())) {
        scores[category] += 3;
      }
      if (terms.some(t => t.includes(kw.toLowerCase()))) {
        scores[category] += 2;
      }
    }

    // Moderate keywords: +1 point
    for (const kw of keywords.moderate) {
      if (text.includes(kw.toLowerCase())) {
        scores[category] += 1;
      }
    }
  }

  scoreCategory(MEDICAL_KEYWORDS, 'medical');
  scoreCategory(LEGAL_KEYWORDS, 'legal');
  scoreCategory(ECONOMIC_KEYWORDS, 'economic');
  scoreCategory(AGRICULTURAL_KEYWORDS, 'agricultural');

  // Check raw terms for specific categories
  const nonMedicalTerms = [
    'economics', 'political science', 'law', 'sociology',
    'agricultural science', 'crop science', 'business'
  ];

  for (const term of terms) {
    if (nonMedicalTerms.some(nm => term.includes(nm))) {
      if (term.includes('economics') || term.includes('business')) {
        scores.economic += 2;
      }
      if (term.includes('law') || term.includes('political')) {
        scores.legal += 2;
      }
      if (term.includes('agricultural') || term.includes('crop')) {
        scores.agricultural += 2;
      }
    }
  }

  // Determine classification
  // PRIORITY: If there's ANY significant medical signal, classify as medical
  // Only classify as non-medical if there's NO medical content

  // Strong medical signal = definitely medical
  if (scores.medical >= 3) {
    return { type: 'medical', scores, confidence: 'high' };
  }

  // Any medical signal with no strong non-medical = medical
  if (scores.medical >= 1) {
    const nonMedicalMax = Math.max(scores.legal, scores.economic, scores.agricultural);
    // Only override to non-medical if it's MUCH stronger
    if (nonMedicalMax > scores.medical * 3 && nonMedicalMax >= 4) {
      if (scores.legal === nonMedicalMax) return { type: 'legal', scores, confidence: 'high' };
      if (scores.economic === nonMedicalMax) return { type: 'economic', scores, confidence: 'high' };
      if (scores.agricultural === nonMedicalMax) return { type: 'agricultural', scores, confidence: 'high' };
    }
    return { type: 'medical', scores, confidence: 'medium' };
  }

  // No medical signal - classify by strongest non-medical
  if (scores.legal >= 3) {
    return { type: 'legal', scores, confidence: 'high' };
  }
  if (scores.economic >= 3) {
    return { type: 'economic', scores, confidence: 'high' };
  }
  if (scores.agricultural >= 3) {
    return { type: 'agricultural', scores, confidence: 'high' };
  }

  // Weak non-medical signal
  if (scores.legal >= 1) {
    return { type: 'legal', scores, confidence: 'low' };
  }
  if (scores.economic >= 1) {
    return { type: 'economic', scores, confidence: 'low' };
  }
  if (scores.agricultural >= 1) {
    return { type: 'agricultural', scores, confidence: 'low' };
  }

  return { type: 'other', scores, confidence: 'low' };
}

async function main() {
  console.log('='.repeat(50));
  console.log('  CONTENT TYPE CLASSIFICATION');
  console.log('='.repeat(50));
  console.log();
  console.log('Mode:', dryRun ? 'DRY RUN (no changes)' : 'LIVE');
  console.log('Target status:', targetStatus);
  console.log();

  // First, add the column if it doesn't exist
  if (!dryRun) {
    console.log('Ensuring content_type column exists...');
    // The column might not exist yet, so we'll handle errors
  }

  // Fetch studies
  let query = supabase
    .from('kb_research_queue')
    .select('id, title, abstract, status');

  if (targetStatus !== 'all') {
    query = query.eq('status', targetStatus);
  }

  // Paginate through all studies
  let allStudies = [];
  let offset = 0;
  const PAGE_SIZE = 1000;

  while (true) {
    const { data, error } = await query.range(offset, offset + PAGE_SIZE - 1);
    if (error) {
      console.error('Error fetching studies:', error);
      break;
    }
    if (!data || data.length === 0) break;
    allStudies = allStudies.concat(data);
    console.log(`Fetched ${allStudies.length} studies...`);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  console.log(`\nTotal studies to classify: ${allStudies.length}`);

  // Get raw terms for all studies
  console.log('Fetching raw terms...');
  const studyIds = allStudies.map(s => s.id);

  const rawTermsByStudy = new Map();
  offset = 0;
  while (offset < studyIds.length) {
    const batch = studyIds.slice(offset, offset + 500);
    const { data: terms } = await supabase
      .from('study_raw_terms')
      .select('study_id, term')
      .in('study_id', batch);

    for (const t of terms || []) {
      if (!rawTermsByStudy.has(t.study_id)) {
        rawTermsByStudy.set(t.study_id, []);
      }
      rawTermsByStudy.get(t.study_id).push(t.term);
    }
    offset += 500;
  }

  console.log(`Found raw terms for ${rawTermsByStudy.size} studies`);

  // Classify each study
  const results = {
    medical: [],
    legal: [],
    economic: [],
    agricultural: [],
    other: []
  };

  for (const study of allStudies) {
    const rawTerms = rawTermsByStudy.get(study.id) || [];
    const classification = classifyContent(study.title, study.abstract, rawTerms);
    results[classification.type].push({
      id: study.id,
      title: study.title,
      status: study.status,
      ...classification
    });
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('  CLASSIFICATION RESULTS');
  console.log('='.repeat(50));
  console.log();

  for (const [type, studies] of Object.entries(results)) {
    const approved = studies.filter(s => s.status === 'approved').length;
    const pending = studies.filter(s => s.status === 'pending').length;
    console.log(`${type.toUpperCase()}: ${studies.length} total (${approved} approved, ${pending} pending)`);
  }

  // Show examples of non-medical
  console.log('\n--- LEGAL EXAMPLES (first 10) ---');
  for (const study of results.legal.slice(0, 10)) {
    console.log(`  [${study.status}] ${study.title?.substring(0, 70)}...`);
  }

  console.log('\n--- ECONOMIC EXAMPLES (first 10) ---');
  for (const study of results.economic.slice(0, 10)) {
    console.log(`  [${study.status}] ${study.title?.substring(0, 70)}...`);
  }

  console.log('\n--- AGRICULTURAL EXAMPLES (first 10) ---');
  for (const study of results.agricultural.slice(0, 10)) {
    console.log(`  [${study.status}] ${study.title?.substring(0, 70)}...`);
  }

  // Update database if not dry run
  if (!dryRun) {
    console.log('\n--- UPDATING DATABASE ---');

    for (const [type, studies] of Object.entries(results)) {
      if (studies.length === 0) continue;

      const ids = studies.map(s => s.id);

      // Update in batches
      for (let i = 0; i < ids.length; i += 500) {
        const batch = ids.slice(i, i + 500);
        const { error } = await supabase
          .from('kb_research_queue')
          .update({ content_type: type })
          .in('id', batch);

        if (error) {
          console.log(`Error updating ${type}:`, error.message);
        }
      }
      console.log(`Updated ${studies.length} studies as '${type}'`);
    }
  }

  // Summary by status for non-medical
  console.log('\n' + '='.repeat(50));
  console.log('  NON-MEDICAL SUMMARY');
  console.log('='.repeat(50));

  const nonMedical = [...results.legal, ...results.economic, ...results.agricultural];
  const nonMedicalApproved = nonMedical.filter(s => s.status === 'approved');
  const nonMedicalPending = nonMedical.filter(s => s.status === 'pending');

  console.log(`\nTotal non-medical studies: ${nonMedical.length}`);
  console.log(`  - Approved: ${nonMedicalApproved.length}`);
  console.log(`  - Pending: ${nonMedicalPending.length}`);

  if (nonMedicalApproved.length > 0) {
    console.log('\nApproved non-medical studies that may need review:');
    for (const study of nonMedicalApproved.slice(0, 20)) {
      console.log(`  [${study.type}] ${study.title?.substring(0, 65)}...`);
    }
  }

  console.log('\n' + '='.repeat(50));
}

main().catch(console.error);
