/**
 * Query Research for Condition Articles
 * Queries the kb_research_queue for studies related to specific conditions
 *
 * Run with: node scripts/query-condition-research.mjs
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

// Conditions to analyze with search terms
const conditionsToAnalyze = [
  { slug: 'cluster-headaches', terms: ['cluster headache', 'headache', 'head pain', 'migraine', 'trigeminal'] },
  { slug: 'tension-headaches', terms: ['tension headache', 'headache', 'head pain', 'tension-type'] },
  { slug: 'occipital-neuralgia', terms: ['occipital neuralgia', 'neuralgia', 'head pain', 'nerve pain', 'neuropathic pain'] },
  { slug: 'tmj', terms: ['tmj', 'temporomandibular', 'jaw pain', 'facial pain', 'orofacial pain'] },
  { slug: 'tooth-pain', terms: ['tooth pain', 'dental pain', 'toothache', 'oral pain', 'dental'] },
  { slug: 'mouth-ulcers', terms: ['mouth ulcer', 'oral ulcer', 'aphthous', 'canker sore', 'oral mucosa'] },
  { slug: 'gum-disease', terms: ['gum disease', 'periodontal', 'gingivitis', 'periodontitis', 'oral health'] },
  { slug: 'seasonal-allergies', terms: ['allergy', 'allergic', 'hay fever', 'rhinitis', 'histamine', 'immune'] },
  { slug: 'sinusitis', terms: ['sinusitis', 'sinus', 'nasal', 'rhinosinusitis', 'inflammation'] },
  { slug: 'bronchitis', terms: ['bronchitis', 'bronchial', 'respiratory', 'airway', 'lung', 'pulmonary'] },
  { slug: 'copd', terms: ['copd', 'chronic obstructive', 'emphysema', 'respiratory', 'lung', 'pulmonary'] },
  { slug: 'colds-flu', terms: ['cold', 'flu', 'influenza', 'viral', 'respiratory infection', 'immune', 'antiviral'] }
];

async function queryConditionResearch(condition) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  Analyzing: ${condition.slug}`);
  console.log(`${'='.repeat(70)}`);

  // Build search conditions
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

    // Check if any search term matches
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

  // Create analysis object
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
    topStudies: matchingStudies.slice(0, 10).map(s => ({
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

  // Print summary
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
  console.log('Starting research analysis for 12 conditions...\n');

  const results = [];

  for (const condition of conditionsToAnalyze) {
    const analysis = await queryConditionResearch(condition);
    if (analysis) {
      results.push(analysis);
    }
  }

  // Write results to file
  const outputPath = join(__dirname, 'condition-research-analysis.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Results saved to: ${outputPath}`);
  console.log(`${'='.repeat(70)}`);

  // Summary table
  console.log('\n\nSUMMARY TABLE:');
  console.log('-'.repeat(100));
  console.log('Condition'.padEnd(25) + 'Studies'.padStart(10) + 'Human'.padStart(10) + 'RCTs'.padStart(10) + 'Reviews'.padStart(10) + 'Participants'.padStart(15) + 'Evidence'.padStart(15));
  console.log('-'.repeat(100));

  for (const r of results) {
    console.log(
      r.condition.padEnd(25) +
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
