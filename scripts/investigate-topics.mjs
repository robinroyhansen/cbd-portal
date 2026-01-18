/**
 * Investigate Topic Detection Issues
 *
 * Run with: node scripts/investigate-topics.mjs
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

async function fetchAllPendingStudies() {
  let allStudies = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, relevant_topics, source_site, quality_score, relevance_score')
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
  console.log('  TOPIC DETECTION INVESTIGATION');
  console.log('='.repeat(70));

  const studies = await fetchAllPendingStudies();
  console.log(`\nTotal pending studies: ${studies.length}`);

  // Separate studies with and without topics
  const withTopics = studies.filter(s => s.relevant_topics && s.relevant_topics.length > 0);
  const withoutTopics = studies.filter(s => !s.relevant_topics || s.relevant_topics.length === 0);

  console.log(`Studies WITH topics: ${withTopics.length} (${(withTopics.length / studies.length * 100).toFixed(1)}%)`);
  console.log(`Studies WITHOUT topics: ${withoutTopics.length} (${(withoutTopics.length / studies.length * 100).toFixed(1)}%)`);

  // ================================================================
  // 1. SOURCE COMPARISON
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  1. SOURCE COMPARISON');
  console.log('='.repeat(70));

  const sourceStats = {};
  for (const study of studies) {
    const source = study.source_site || 'unknown';
    if (!sourceStats[source]) {
      sourceStats[source] = { total: 0, withTopics: 0, withoutTopics: 0 };
    }
    sourceStats[source].total++;
    if (study.relevant_topics && study.relevant_topics.length > 0) {
      sourceStats[source].withTopics++;
    } else {
      sourceStats[source].withoutTopics++;
    }
  }

  console.log('\nTopic assignment by source:');
  for (const [source, stats] of Object.entries(sourceStats).sort((a, b) => b[1].total - a[1].total)) {
    const pctWithTopics = (stats.withTopics / stats.total * 100).toFixed(1);
    console.log(`  ${source.padEnd(20)}: ${stats.total.toString().padStart(5)} total, ${pctWithTopics.padStart(5)}% with topics`);
  }

  // ================================================================
  // 2. QUALITY SCORE COMPARISON
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  2. QUALITY SCORE COMPARISON');
  console.log('='.repeat(70));

  const withTopicsQuality = withTopics.filter(s => s.quality_score !== null);
  const withoutTopicsQuality = withoutTopics.filter(s => s.quality_score !== null);

  console.log(`\nStudies WITH topics that have quality score: ${withTopicsQuality.length}/${withTopics.length}`);
  console.log(`Studies WITHOUT topics that have quality score: ${withoutTopicsQuality.length}/${withoutTopics.length}`);

  // Most studies don't have quality scores, which means calculateQualityScore wasn't called on them
  console.log('\n==> This indicates studies WITHOUT quality_score were NOT processed through calculateQualityScore()');

  // ================================================================
  // 3. TEST TOPIC DETECTION ON SAMPLES
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  3. TEST TOPIC DETECTION ON TOPIC-LESS STUDIES');
  console.log('='.repeat(70));

  // Sample 30 topic-less studies and run topic detection
  const sample = withoutTopics.slice(0, 50);
  let wouldGetTopics = 0;
  let stillNoTopics = 0;
  const detectedSamples = [];

  for (const study of sample) {
    const detectedTopics = detectTopics(study.title, study.abstract);
    if (detectedTopics.length > 0) {
      wouldGetTopics++;
      detectedSamples.push({ title: study.title, topics: detectedTopics });
    } else {
      stillNoTopics++;
    }
  }

  console.log(`\nOut of ${sample.length} topic-less studies tested:`);
  console.log(`  Would get topics if re-processed: ${wouldGetTopics} (${(wouldGetTopics / sample.length * 100).toFixed(0)}%)`);
  console.log(`  Still wouldn't get topics: ${stillNoTopics} (${(stillNoTopics / sample.length * 100).toFixed(0)}%)`);

  console.log('\nSample studies that WOULD get topics:');
  detectedSamples.slice(0, 10).forEach((s, i) => {
    console.log(`  ${i + 1}. [${s.topics.join(', ')}] ${s.title?.substring(0, 55)}...`);
  });

  // ================================================================
  // 4. STUDIES THAT WOULDN'T GET TOPICS
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  4. SAMPLE STUDIES THAT STILL WOULDN\'T GET TOPICS');
  console.log('='.repeat(70));

  const noTopicsSamples = sample.filter(s => detectTopics(s.title, s.abstract).length === 0);
  console.log('\nThese studies don\'t match any topic keywords:');
  noTopicsSamples.slice(0, 15).forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.title?.substring(0, 70)}...`);
  });

  // ================================================================
  // 5. BULK ESTIMATE
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  5. BULK TOPIC DETECTION ESTIMATE');
  console.log('='.repeat(70));

  // Test on ALL topic-less studies
  let totalWouldGetTopics = 0;
  const topicCounts = {};

  for (const study of withoutTopics) {
    const detectedTopics = detectTopics(study.title, study.abstract);
    if (detectedTopics.length > 0) {
      totalWouldGetTopics++;
      for (const topic of detectedTopics) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }
  }

  console.log(`\nOf ${withoutTopics.length} topic-less studies:`);
  console.log(`  Would get topics: ${totalWouldGetTopics} (${(totalWouldGetTopics / withoutTopics.length * 100).toFixed(1)}%)`);
  console.log(`  Still no topics: ${withoutTopics.length - totalWouldGetTopics}`);

  console.log('\nTopics that would be assigned:');
  Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([topic, count]) => {
      console.log(`  ${topic.padEnd(20)}: ${count}`);
    });

  // ================================================================
  // SUMMARY
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  SUMMARY & RECOMMENDATIONS');
  console.log('='.repeat(70));

  console.log('\nFINDINGS:');
  console.log(`  1. ${withoutTopics.length} studies (${(withoutTopics.length / studies.length * 100).toFixed(1)}%) have no topics`);
  console.log(`  2. ${withoutTopicsQuality.length} of those have quality_score (processed through calculateQualityScore)`);
  console.log(`  3. ${totalWouldGetTopics} (${(totalWouldGetTopics / withoutTopics.length * 100).toFixed(1)}%) would get topics if re-processed`);

  console.log('\nROOT CAUSE:');
  console.log('  Most studies were likely imported before topic detection was implemented,');
  console.log('  or through a path that didn\'t call calculateQualityScore().');

  console.log('\nSOLUTION:');
  console.log('  Run topic re-assignment script on all pending studies without topics.');
  console.log(`  This would assign topics to ~${totalWouldGetTopics} studies.`);
}

main().catch(console.error);
