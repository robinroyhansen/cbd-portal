/**
 * Query Research for Pain Condition Articles
 * Queries the kb_research_queue for studies related to pain conditions
 *
 * Run with: node scripts/query-pain-conditions.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

// 12 pain conditions to analyze
const conditionsToAnalyze = [
  { slug: 'sciatica', terms: ['sciatica', 'sciatic nerve', 'lumbar radiculopathy', 'nerve pain', 'neuropathic pain', 'back pain', 'leg pain'] },
  { slug: 'tendonitis', terms: ['tendonitis', 'tendinitis', 'tendinopathy', 'tendon', 'inflammation', 'musculoskeletal'] },
  { slug: 'frozen-shoulder', terms: ['frozen shoulder', 'adhesive capsulitis', 'shoulder pain', 'joint pain', 'stiffness'] },
  { slug: 'hip-pain', terms: ['hip pain', 'hip arthritis', 'hip joint', 'osteoarthritis', 'joint pain', 'musculoskeletal'] },
  { slug: 'shoulder-pain', terms: ['shoulder pain', 'rotator cuff', 'shoulder joint', 'joint pain', 'musculoskeletal'] },
  { slug: 'ankle-pain', terms: ['ankle pain', 'ankle injury', 'ankle joint', 'joint pain', 'musculoskeletal', 'sprain'] },
  { slug: 'foot-pain', terms: ['foot pain', 'plantar fasciitis', 'neuropathy', 'nerve pain', 'diabetic neuropathy'] },
  { slug: 'hand-pain', terms: ['hand pain', 'arthritis', 'carpal tunnel', 'joint pain', 'neuropathy', 'rheumatoid'] },
  { slug: 'elbow-pain', terms: ['elbow pain', 'tennis elbow', 'epicondylitis', 'joint pain', 'tendonitis'] },
  { slug: 'wrist-pain', terms: ['wrist pain', 'carpal tunnel', 'joint pain', 'repetitive strain', 'arthritis'] },
  { slug: 'jaw-pain', terms: ['jaw pain', 'tmj', 'temporomandibular', 'facial pain', 'orofacial'] },
  { slug: 'rib-pain', terms: ['rib pain', 'chest pain', 'costochondritis', 'intercostal', 'thoracic'] }
];

async function queryConditionResearch(condition) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  Analyzing: ${condition.slug}`);
  console.log(`${'='.repeat(70)}`);

  const searchTerms = condition.terms;

  // Query for approved studies
  const { data: studies, error } = await supabase
    .from('kb_research_queue')
    .select(`
      id, title, year, study_type, study_subject,
      sample_size, quality_score, relevance_score,
      abstract, plain_summary, doi, pmid, slug,
      relevant_topics
    `)
    .eq('status', 'approved')
    .order('quality_score', { ascending: false });

  if (error) {
    console.error('Error querying:', error);
    return null;
  }

  // Filter studies matching our search terms
  const matchingStudies = studies.filter(study => {
    const title = (study.title || '').toLowerCase();
    const abstract = (study.abstract || '').toLowerCase();
    const summary = (study.plain_summary || '').toLowerCase();
    const topics = (study.relevant_topics || []).map(t => t.toLowerCase());

    return searchTerms.some(term => {
      const termLower = term.toLowerCase();
      return (
        title.includes(termLower) ||
        abstract.includes(termLower) ||
        summary.includes(termLower) ||
        topics.some(t => t.includes(termLower))
      );
    });
  });

  // Categorize studies
  const humanStudies = matchingStudies.filter(s => s.study_subject === 'human' || s.study_subject === 'review');
  const animalStudies = matchingStudies.filter(s => s.study_subject === 'animal');
  const inVitroStudies = matchingStudies.filter(s => s.study_subject === 'in_vitro');

  const rcts = matchingStudies.filter(s =>
    (s.study_type || '').toLowerCase().includes('rct') ||
    (s.study_type || '').toLowerCase().includes('randomized') ||
    (s.study_type || '').toLowerCase().includes('clinical trial')
  );

  const reviews = matchingStudies.filter(s =>
    (s.study_type || '').toLowerCase().includes('review') ||
    (s.study_type || '').toLowerCase().includes('meta-analysis')
  );

  // Calculate stats
  const totalParticipants = humanStudies
    .filter(s => s.sample_size)
    .reduce((sum, s) => sum + (s.sample_size || 0), 0);

  const highQuality = matchingStudies.filter(s => (s.quality_score || 0) >= 70);
  const mediumQuality = matchingStudies.filter(s => (s.quality_score || 0) >= 50 && (s.quality_score || 0) < 70);

  // Determine evidence level
  let evidenceLevel = 'Insufficient';
  if (matchingStudies.length >= 20 && (rcts.length >= 3 || reviews.length >= 1) && totalParticipants >= 200) {
    evidenceLevel = 'Strong';
  } else if (matchingStudies.length >= 10 && (rcts.length >= 1 || humanStudies.length >= 5)) {
    evidenceLevel = 'Moderate';
  } else if (matchingStudies.length >= 5) {
    evidenceLevel = 'Limited';
  }

  const analysis = {
    condition: condition.slug,
    searchTerms: condition.terms,
    evidenceLevel,
    totalStudies: matchingStudies.length,
    humanStudies: humanStudies.length,
    animalStudies: animalStudies.length,
    inVitroStudies: inVitroStudies.length,
    rcts: rcts.length,
    reviews: reviews.length,
    totalParticipants,
    highQualityCount: highQuality.length,
    mediumQualityCount: mediumQuality.length,
    topStudies: matchingStudies.slice(0, 15).map(s => ({
      title: s.title,
      year: s.year,
      type: s.study_type,
      subject: s.study_subject,
      sampleSize: s.sample_size,
      qualityScore: s.quality_score,
      summary: s.plain_summary,
      doi: s.doi,
      pmid: s.pmid,
      slug: s.slug
    }))
  };

  console.log(`\nStudy Summary:`);
  console.log(`  Total studies: ${matchingStudies.length}`);
  console.log(`  Human studies: ${humanStudies.length}`);
  console.log(`  Animal studies: ${animalStudies.length}`);
  console.log(`  In-vitro: ${inVitroStudies.length}`);
  console.log(`  RCTs: ${rcts.length}`);
  console.log(`  Reviews/Meta-analyses: ${reviews.length}`);
  console.log(`  Total participants: ${totalParticipants}`);
  console.log(`  Evidence Level: ${evidenceLevel}`);

  if (matchingStudies.length > 0) {
    console.log(`\nTop 5 studies:`);
    matchingStudies.slice(0, 5).forEach((s, i) => {
      console.log(`  ${i+1}. [Q:${s.quality_score || 0}] ${(s.title || '').substring(0, 60)}...`);
    });
  }

  return analysis;
}

async function main() {
  console.log('Starting research analysis for 12 pain conditions...\n');

  const results = [];

  for (const condition of conditionsToAnalyze) {
    const analysis = await queryConditionResearch(condition);
    if (analysis) {
      results.push(analysis);
    }
  }

  // Write results to file
  const outputPath = join(__dirname, 'pain-conditions-research.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Results saved to: ${outputPath}`);
  console.log(`${'='.repeat(70)}`);

  // Summary table
  console.log('\n\nSUMMARY TABLE:');
  console.log('-'.repeat(100));
  console.log('Condition'.padEnd(20) + 'Studies'.padStart(10) + 'Human'.padStart(10) + 'RCTs'.padStart(10) + 'Reviews'.padStart(10) + 'Participants'.padStart(15) + 'Evidence'.padStart(15));
  console.log('-'.repeat(100));

  for (const r of results) {
    console.log(
      r.condition.padEnd(20) +
      String(r.totalStudies).padStart(10) +
      String(r.humanStudies).padStart(10) +
      String(r.rcts).padStart(10) +
      String(r.reviews).padStart(10) +
      String(r.totalParticipants).padStart(15) +
      r.evidenceLevel.padStart(15)
    );
  }
  console.log('-'.repeat(100));
}

main().catch(console.error);
