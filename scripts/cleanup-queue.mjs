/**
 * Queue Cleanup Script
 *
 * Step 1: Run topic detection on pending studies without topics
 * Step 2: Reject studies still without topics
 * Step 3: Generate final summary
 *
 * Run with: node scripts/cleanup-queue.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
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

// Topic keywords from research-scanner.ts
const TOPIC_KEYWORDS = {
  'anxiety': ['anxiety', 'anxiolytic', 'GAD', 'social anxiety', 'panic disorder', 'generalized anxiety', 'anxiety disorder', 'panic attack', 'anxious'],
  'depression': ['depression', 'antidepressant', 'mood disorder', 'MDD', 'major depressive', 'dysthymia', 'depressive'],
  'ptsd': ['PTSD', 'trauma', 'post-traumatic', 'posttraumatic', 'veteran', 'traumatic stress', 'stress disorder', 'flashback', 'combat'],
  'sleep': ['sleep', 'insomnia', 'circadian', 'sedative', 'sleep quality', 'sleep disorder', 'sleep disturbance', 'somnolence', 'sleep latency', 'REM sleep'],
  'epilepsy': ['epilepsy', 'seizure', 'Dravet', 'Lennox-Gastaut', 'anticonvulsant', 'Epidiolex', 'refractory epilepsy', 'convulsion', 'ictal', 'intractable epilepsy'],
  'parkinsons': ['Parkinson', 'parkinsonian', 'dopamine', 'tremor', 'bradykinesia', 'dyskinesia', 'Lewy body'],
  'alzheimers': ['Alzheimer', 'dementia', 'cognitive decline', 'memory loss', 'amyloid', 'tau protein', 'neurodegeneration', 'cognitive impairment'],
  'autism': ['autism', 'ASD', 'autistic', 'Asperger', 'spectrum disorder', 'developmental disorder', 'neurodevelopmental'],
  'adhd': ['ADHD', 'attention deficit', 'hyperactivity', 'ADD', 'inattention', 'impulsivity', 'executive function'],
  'schizophrenia': ['schizophrenia', 'psychosis', 'psychotic', 'antipsychotic', 'hallucination', 'delusion', 'negative symptoms'],
  'addiction': ['addiction', 'substance use disorder', 'cannabis use disorder', 'cud', 'opioid use', 'withdrawal symptoms', 'dependence', 'alcohol use disorder', 'drug abuse', 'cocaine', 'heroin', 'relapse prevention', 'discontinuing cannabis', 'quit cannabis', 'cannabis withdrawal'],
  'tourettes': ['Tourette', 'tic disorder', 'tics', 'motor tic', 'vocal tic', 'coprolalia'],
  'chronic_pain': ['chronic pain', 'persistent pain', 'long-term pain', 'pain management', 'analgesic', 'pain relief', 'opioid-sparing'],
  'neuropathic_pain': ['neuropathic', 'neuropathy', 'nerve pain', 'peripheral neuropathy', 'diabetic neuropathy', 'neuralgia', 'allodynia'],
  'arthritis': ['arthritis', 'rheumatoid', 'osteoarthritis', 'joint pain', 'joint inflammation', 'synovitis', 'articular'],
  'fibromyalgia': ['fibromyalgia', 'fibro', 'widespread pain', 'tender points', 'central sensitization'],
  'ms': ['multiple sclerosis', 'demyelinating', 'demyelination', 'spasticity', 'Sativex', 'nabiximols', 'relapsing-remitting', 'rrms', 'ppms', 'spms'],
  'inflammation': ['inflammation', 'anti-inflammatory', 'cytokine', 'TNF-alpha', 'interleukin', 'NF-kB', 'COX-2', 'prostaglandin', 'inflammatory'],
  'migraines': ['migraine', 'headache', 'cephalalgia', 'cluster headache', 'tension headache', 'aura'],
  'crohns': ['Crohn', 'IBD', 'inflammatory bowel', 'colitis', 'ulcerative colitis', 'intestinal inflammation'],
  'ibs': ['IBS', 'irritable bowel', 'functional gastrointestinal', 'abdominal pain', 'bowel dysfunction'],
  'nausea': ['nausea', 'vomiting', 'emesis', 'antiemetic', 'chemotherapy-induced nausea', 'CINV', 'morning sickness'],
  'cancer': ['cancer', 'tumor', 'tumour', 'oncology', 'carcinoma', 'malignant', 'metastasis', 'apoptosis', 'antitumor'],
  'chemo_side_effects': ['chemotherapy', 'chemo-induced', 'chemotherapy-induced', 'palliative', 'cancer pain', 'cachexia', 'wasting syndrome'],
  'acne': ['acne', 'sebaceous', 'sebum', 'comedone', 'pimple', 'sebocyte'],
  'psoriasis': ['psoriasis', 'psoriatic', 'plaque psoriasis', 'scalp psoriasis', 'keratinocyte'],
  'eczema': ['eczema', 'dermatitis', 'atopic', 'pruritus', 'itching', 'skin inflammation', 'topical'],
  'heart': ['cardiovascular', 'cardiac', 'heart disease', 'cardioprotective', 'myocardial', 'arrhythmia', 'heart failure'],
  'blood_pressure': ['blood pressure', 'hypertension', 'hypotension', 'vascular', 'vasorelaxation', 'vasodilation', 'arterial'],
  'diabetes': ['diabetes', 'diabetic', 'glucose', 'insulin', 'glycemic', 'blood sugar', 'metabolic syndrome', 'type 2 diabetes'],
  'obesity': ['obesity', 'weight loss', 'appetite', 'metabolic', 'BMI', 'adipose', 'fat tissue', 'overweight'],
  'athletic': ['athletic', 'sport', 'exercise', 'recovery', 'muscle', 'performance', 'endurance', 'WADA', 'athlete'],
  'stress': ['stress', 'cortisol', 'HPA axis', 'stress response', 'stress relief', 'chronic stress'],
  'neurological': ['neuroprotective', 'neurodegeneration', 'ALS', 'Huntington'],
  'glaucoma': ['glaucoma', 'intraocular pressure', 'eye pressure', 'ocular'],
  'covid': ['COVID', 'coronavirus', 'SARS-CoV-2', 'pandemic', 'viral infection'],
  'aging': ['aging', 'elderly', 'geriatric', 'age-related', 'longevity'],
  'womens': ['women', 'menstrual', 'pregnancy', 'menopause', 'gynecological']
};

function detectTopics(title, abstract) {
  const text = `${title || ''} ${abstract || ''}`.toLowerCase();
  const topics = [];

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
      if (regex.test(text)) {
        if (!topics.includes(topic)) {
          topics.push(topic);
        }
        break;
      }
    }
  }

  return topics;
}

function calculateQualityScore(title, abstract, year) {
  const titleLower = (title || '').toLowerCase();
  const abstractLower = (abstract || '').toLowerCase();
  const text = `${titleLower} ${abstractLower}`;

  const breakdown = {
    studyDesign: 0,
    methodologyQuality: 0,
    relevance: 0,
    sampleSize: 0,
    recency: 0
  };

  // 1. STUDY DESIGN (0-35 points)
  const studyTypeScores = [
    { pattern: /meta[\s-]?analysis|systematic review|cochrane/i, score: 35 },
    { pattern: /randomized.*controlled|randomised.*controlled|\brct\b|double[\s-]?blind.*placebo/i, score: 30 },
    { pattern: /randomized|randomised|controlled trial/i, score: 25 },
    { pattern: /cohort|longitudinal|prospective/i, score: 20 },
    { pattern: /observational|cross[\s-]?sectional/i, score: 15 },
    { pattern: /case[\s-]?control|retrospective/i, score: 12 },
    { pattern: /pilot|preliminary|feasibility/i, score: 10 },
    { pattern: /case report|case series/i, score: 8 },
    { pattern: /in[\s-]?vitro|cell culture|cell line|preclinical/i, score: 5 },
    { pattern: /review|overview/i, score: 3 },
  ];

  for (const st of studyTypeScores) {
    if (st.pattern.test(text)) {
      breakdown.studyDesign = st.score;
      break;
    }
  }

  // 2. METHODOLOGY QUALITY (0-25 points)
  let methodologyScore = 0;
  if (/double[\s-]?blind/i.test(text)) methodologyScore += 8;
  if (/placebo[\s-]?controlled|placebo group|vs\.?\s*placebo/i.test(text)) methodologyScore += 7;
  if (/multi[\s-]?cent(?:er|re)|multi[\s-]?site/i.test(text)) methodologyScore += 5;
  if (/phase\s*[23]|phase\s*(?:ii|iii)\b/i.test(text)) methodologyScore += 5;
  breakdown.methodologyQuality = Math.min(methodologyScore, 25);

  // 3. RELEVANCE (0-20 points)
  let relevanceScore = 0;
  if (/\bcbd\b|cannabidiol/i.test(titleLower)) {
    relevanceScore += 10;
  } else if (/\bcbd\b|cannabidiol/i.test(abstractLower)) {
    relevanceScore += 5;
  }
  if (/epidiolex|sativex|nabiximols/i.test(text)) {
    relevanceScore += 3;
  }
  const topics = detectTopics(title, abstract);
  if (topics.length > 0) {
    relevanceScore += Math.min(topics.length * 2, 7);
  }
  breakdown.relevance = Math.min(relevanceScore, 20);

  // 4. SAMPLE SIZE (0-10 points)
  const samplePatterns = [
    /(\d{1,3}(?:,\d{3})*|\d+)\s*(?:participant|patient|subject|individual|volunteer)s?/gi,
    /\bn\s*=\s*(\d{1,3}(?:,\d{3})*|\d+)/gi,
    /(\d{1,3}(?:,\d{3})*|\d+)\s+(?:were\s+)?(?:enrolled|recruited|randomized|randomised)/gi,
    /sample\s+(?:size\s+)?(?:of\s+)?(\d{1,3}(?:,\d{3})*|\d+)/gi,
  ];

  let maxSample = 0;
  for (const pattern of samplePatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseInt(numStr);
      if (num >= 5 && num < 100000 && num > maxSample) {
        maxSample = num;
      }
    }
  }

  if (maxSample >= 1000) breakdown.sampleSize = 10;
  else if (maxSample >= 500) breakdown.sampleSize = 8;
  else if (maxSample >= 100) breakdown.sampleSize = 6;
  else if (maxSample >= 50) breakdown.sampleSize = 4;
  else if (maxSample >= 20) breakdown.sampleSize = 2;
  else breakdown.sampleSize = 0;

  // 5. RECENCY (0-10 points)
  const studyYear = year || 2000;
  const currentYear = new Date().getFullYear();
  const age = currentYear - studyYear;

  if (age <= 1) breakdown.recency = 10;
  else if (age <= 2) breakdown.recency = 8;
  else if (age <= 3) breakdown.recency = 6;
  else if (age <= 5) breakdown.recency = 4;
  else if (age <= 10) breakdown.recency = 2;
  else breakdown.recency = 0;

  const totalScore =
    breakdown.studyDesign +
    breakdown.methodologyQuality +
    breakdown.relevance +
    breakdown.sampleSize +
    breakdown.recency;

  return { score: totalScore, breakdown };
}

async function fetchAllPendingStudies() {
  let allStudies = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, year, relevant_topics, quality_score, relevance_score')
      .eq('status', 'pending')
      .range(offset, offset + 999);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allStudies = allStudies.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }

  return allStudies;
}

async function main() {
  console.log('='.repeat(70));
  console.log('  QUEUE CLEANUP - 3 STEPS');
  console.log('='.repeat(70));

  // ================================================================
  // STEP 1: RUN TOPIC DETECTION
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  STEP 1: RUN TOPIC DETECTION');
  console.log('='.repeat(70));

  const studies = await fetchAllPendingStudies();
  console.log(`\nTotal pending studies: ${studies.length}`);

  // Find studies without topics
  const withoutTopics = studies.filter(s => !s.relevant_topics || s.relevant_topics.length === 0);
  console.log(`Studies without topics: ${withoutTopics.length}`);

  let topicsAssigned = 0;
  let qualityScoresAssigned = 0;
  let processed = 0;

  // Process in batches
  const BATCH_SIZE = 100;
  for (let i = 0; i < withoutTopics.length; i += BATCH_SIZE) {
    const batch = withoutTopics.slice(i, i + BATCH_SIZE);
    const updates = [];

    for (const study of batch) {
      const topics = detectTopics(study.title, study.abstract);
      const { score: qualityScore, breakdown } = calculateQualityScore(study.title, study.abstract, study.year);

      const update = { id: study.id };
      let needsUpdate = false;

      if (topics.length > 0) {
        update.relevant_topics = topics;
        topicsAssigned++;
        needsUpdate = true;
      }

      if (study.quality_score === null || study.quality_score === undefined) {
        update.quality_score = qualityScore;
        update.quality_breakdown = breakdown;
        qualityScoresAssigned++;
        needsUpdate = true;
      }

      if (needsUpdate) {
        updates.push(update);
      }
    }

    // Apply updates
    for (const update of updates) {
      const { id, ...data } = update;
      await supabase
        .from('kb_research_queue')
        .update(data)
        .eq('id', id);
    }

    processed += batch.length;
    if (processed % 500 === 0 || processed === withoutTopics.length) {
      console.log(`  Processed ${processed}/${withoutTopics.length}...`);
    }
  }

  console.log(`\nSTEP 1 RESULTS:`);
  console.log(`  Studies processed: ${withoutTopics.length}`);
  console.log(`  Topics assigned: ${topicsAssigned}`);
  console.log(`  Quality scores assigned: ${qualityScoresAssigned}`);

  // ================================================================
  // STEP 2: REJECT STUDIES STILL WITHOUT TOPICS
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  STEP 2: REJECT STUDIES STILL WITHOUT TOPICS');
  console.log('='.repeat(70));

  // Re-fetch to get updated data
  const updatedStudies = await fetchAllPendingStudies();
  const stillWithoutTopics = updatedStudies.filter(s => !s.relevant_topics || s.relevant_topics.length === 0);

  console.log(`\nStudies still without topics: ${stillWithoutTopics.length}`);

  // Reject them
  const idsToReject = stillWithoutTopics.map(s => s.id);

  for (let i = 0; i < idsToReject.length; i += 500) {
    const batch = idsToReject.slice(i, i + 500);
    await supabase
      .from('kb_research_queue')
      .update({ status: 'rejected' })
      .in('id', batch);
  }

  console.log(`\nSTEP 2 RESULTS:`);
  console.log(`  Rejected: ${stillWithoutTopics.length} studies`);
  console.log(`  Reason: General cannabis research - not condition-specific`);

  // ================================================================
  // STEP 3: FINAL QUEUE SUMMARY
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  STEP 3: FINAL QUEUE SUMMARY');
  console.log('='.repeat(70));

  // Get final pending count
  const finalStudies = await fetchAllPendingStudies();
  console.log(`\n1. TOTAL PENDING STUDIES: ${finalStudies.length}`);

  // Topic distribution
  console.log('\n2. TOPIC DISTRIBUTION (Top 15):');
  const topicCounts = {};
  for (const study of finalStudies) {
    if (study.relevant_topics) {
      for (const topic of study.relevant_topics) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }
  }

  Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([topic, count], i) => {
      console.log(`   ${String(i + 1).padStart(2)}. ${topic.padEnd(20)}: ${count}`);
    });

  // Relevance score distribution
  console.log('\n3. RELEVANCE SCORE DISTRIBUTION:');
  const relevanceRanges = {
    '90-100 (Excellent)': 0,
    '70-89 (High)': 0,
    '50-69 (Medium)': 0,
    '30-49 (Low)': 0,
    '1-29 (Very Low)': 0,
    '0 or null': 0
  };

  for (const study of finalStudies) {
    const score = study.relevance_score || 0;
    if (score >= 90) relevanceRanges['90-100 (Excellent)']++;
    else if (score >= 70) relevanceRanges['70-89 (High)']++;
    else if (score >= 50) relevanceRanges['50-69 (Medium)']++;
    else if (score >= 30) relevanceRanges['30-49 (Low)']++;
    else if (score >= 1) relevanceRanges['1-29 (Very Low)']++;
    else relevanceRanges['0 or null']++;
  }

  for (const [range, count] of Object.entries(relevanceRanges)) {
    const pct = ((count / finalStudies.length) * 100).toFixed(1);
    console.log(`   ${range.padEnd(20)}: ${String(count).padStart(5)} (${pct.padStart(5)}%)`);
  }

  // High confidence studies
  console.log('\n4. READY FOR "APPROVE HIGH CONFIDENCE":');
  const highConfidence = finalStudies.filter(s =>
    s.relevant_topics &&
    s.relevant_topics.length > 0 &&
    (s.relevance_score || 0) >= 70
  );

  console.log(`   Studies with topic + relevance >= 70: ${highConfidence.length}`);

  // Breakdown by relevance
  const hc9100 = highConfidence.filter(s => s.relevance_score >= 90).length;
  const hc7089 = highConfidence.filter(s => s.relevance_score >= 70 && s.relevance_score < 90).length;
  console.log(`     - Relevance 90-100: ${hc9100}`);
  console.log(`     - Relevance 70-89: ${hc7089}`);

  // Get final rejection count
  const { count: totalRejected } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected');

  const { count: totalApproved } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  console.log('\n' + '='.repeat(70));
  console.log('  FINAL DATABASE STATE');
  console.log('='.repeat(70));
  console.log(`   Pending: ${finalStudies.length}`);
  console.log(`   Approved: ${totalApproved}`);
  console.log(`   Rejected: ${totalRejected}`);
  console.log('='.repeat(70));
}

main().catch(console.error);
