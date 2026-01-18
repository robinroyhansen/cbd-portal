/**
 * Audit Approved Studies
 *
 * Step 1: Run topic detection on approved studies missing topics
 * Step 2: Find problematic approved studies
 * Step 3: Report findings
 *
 * Run with: node scripts/audit-approved.mjs
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
  'veterinary': ['veterinary', 'canine', 'feline', 'dog', 'cat', 'pet', 'animal', 'equine', 'horse'],
  'stress': ['stress', 'cortisol', 'HPA axis', 'stress response', 'stress relief', 'chronic stress'],
  'neurological': ['neuroprotective', 'neurodegeneration', 'ALS', 'Huntington'],
  'glaucoma': ['glaucoma', 'intraocular pressure', 'eye pressure', 'ocular'],
  'covid': ['COVID', 'coronavirus', 'SARS-CoV-2', 'pandemic', 'viral infection'],
  'aging': ['aging', 'elderly', 'geriatric', 'age-related', 'longevity'],
  'womens': ['women', 'menstrual', 'pregnancy', 'menopause', 'gynecological']
};

// Irrelevant keywords
const IRRELEVANT_KEYWORDS = {
  extraction: ['extraction', 'chromatography', 'purification', 'enrichment'],
  agriculture: ['cultivation', 'agricultural', 'hemp fiber', 'soil', 'crop'],
  policy: ['policy', 'regulation', 'legalization', 'legal status'],
  economic: ['economic impact', 'market analysis']
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

function checkIrrelevant(title) {
  const titleLower = (title || '').toLowerCase();

  for (const [category, keywords] of Object.entries(IRRELEVANT_KEYWORDS)) {
    for (const kw of keywords) {
      if (titleLower.includes(kw.toLowerCase())) {
        return category;
      }
    }
  }
  return null;
}

async function fetchAllApprovedStudies() {
  let allStudies = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, relevant_topics, relevance_score')
      .eq('status', 'approved')
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
  console.log('  AUDIT APPROVED STUDIES');
  console.log('='.repeat(70));

  const studies = await fetchAllApprovedStudies();
  console.log(`\nTotal approved studies: ${studies.length}`);

  // ================================================================
  // STEP 1: RUN TOPIC DETECTION
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  STEP 1: RUN TOPIC DETECTION ON APPROVED STUDIES');
  console.log('='.repeat(70));

  const withoutTopics = studies.filter(s => !s.relevant_topics || s.relevant_topics.length === 0);
  console.log(`\nApproved studies with no topics: ${withoutTopics.length}`);

  let topicsAssigned = 0;
  const stillNoTopics = [];

  for (const study of withoutTopics) {
    const detectedTopics = detectTopics(study.title, study.abstract);
    if (detectedTopics.length > 0) {
      topicsAssigned++;
      // Update the study with detected topics
      await supabase
        .from('kb_research_queue')
        .update({ relevant_topics: detectedTopics })
        .eq('id', study.id);
      study.relevant_topics = detectedTopics; // Update local copy
    } else {
      stillNoTopics.push(study);
    }
  }

  console.log(`Topics assigned: ${topicsAssigned}`);
  console.log(`Still no topics: ${stillNoTopics.length}`);

  // ================================================================
  // STEP 2: FIND PROBLEMATIC STUDIES
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  STEP 2: FIND PROBLEMATIC APPROVED STUDIES');
  console.log('='.repeat(70));

  const problems = {
    no_topics: [],
    irrelevant: [],
    veterinary: [],
    duplicates: [],
    low_relevance: []
  };

  // Re-fetch to get updated topics
  const updatedStudies = await fetchAllApprovedStudies();

  // 2a) No topics
  for (const study of updatedStudies) {
    if (!study.relevant_topics || study.relevant_topics.length === 0) {
      problems.no_topics.push({
        id: study.id,
        title: study.title,
        issue: 'no_topics'
      });
    }
  }

  // 2b) Irrelevant content
  for (const study of updatedStudies) {
    const category = checkIrrelevant(study.title);
    if (category) {
      // Check if not already in no_topics
      if (!problems.no_topics.find(p => p.id === study.id)) {
        problems.irrelevant.push({
          id: study.id,
          title: study.title,
          issue: `irrelevant_${category}`
        });
      }
    }
  }

  // 2c) Veterinary
  for (const study of updatedStudies) {
    if (study.relevant_topics && study.relevant_topics.includes('veterinary')) {
      problems.veterinary.push({
        id: study.id,
        title: study.title,
        issue: 'veterinary'
      });
    }
  }

  // 2d) Duplicates
  const titleMap = {};
  for (const study of updatedStudies) {
    const normalizedTitle = (study.title || '').toLowerCase().trim();
    if (normalizedTitle.length > 10) {
      if (!titleMap[normalizedTitle]) {
        titleMap[normalizedTitle] = [];
      }
      titleMap[normalizedTitle].push(study);
    }
  }

  for (const [title, dupes] of Object.entries(titleMap)) {
    if (dupes.length > 1) {
      // Mark all but the first as duplicates
      for (let i = 1; i < dupes.length; i++) {
        problems.duplicates.push({
          id: dupes[i].id,
          title: dupes[i].title,
          issue: 'duplicate'
        });
      }
    }
  }

  // 2e) Low relevance
  for (const study of updatedStudies) {
    if ((study.relevance_score || 0) < 40) {
      // Check if not already flagged
      const alreadyFlagged =
        problems.no_topics.find(p => p.id === study.id) ||
        problems.irrelevant.find(p => p.id === study.id) ||
        problems.veterinary.find(p => p.id === study.id) ||
        problems.duplicates.find(p => p.id === study.id);

      if (!alreadyFlagged) {
        problems.low_relevance.push({
          id: study.id,
          title: study.title,
          issue: `low_relevance_${study.relevance_score || 0}`,
          relevance_score: study.relevance_score
        });
      }
    }
  }

  // ================================================================
  // STEP 3: REPORT FINDINGS
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  STEP 3: REPORT FINDINGS');
  console.log('='.repeat(70));

  // Summary table
  const totalProblematic =
    problems.no_topics.length +
    problems.irrelevant.length +
    problems.veterinary.length +
    problems.duplicates.length +
    problems.low_relevance.length;

  console.log('\n| Issue | Count |');
  console.log('|-------|-------|');
  console.log(`| No topics (general cannabis) | ${problems.no_topics.length} |`);
  console.log(`| Irrelevant content | ${problems.irrelevant.length} |`);
  console.log(`| Veterinary | ${problems.veterinary.length} |`);
  console.log(`| Duplicates | ${problems.duplicates.length} |`);
  console.log(`| Low relevance (<40) | ${problems.low_relevance.length} |`);
  console.log(`| **Total problematic** | **${totalProblematic}** |`);

  // List all problematic studies
  console.log('\n' + '='.repeat(70));
  console.log('  PROBLEMATIC STUDIES LIST');
  console.log('='.repeat(70));

  if (problems.no_topics.length > 0) {
    console.log('\n--- NO TOPICS (General Cannabis) ---');
    problems.no_topics.forEach((p, i) => {
      console.log(`${i + 1}. [${p.id}]`);
      console.log(`   Title: ${p.title?.substring(0, 70)}...`);
      console.log(`   Issue: ${p.issue}`);
    });
  }

  if (problems.irrelevant.length > 0) {
    console.log('\n--- IRRELEVANT CONTENT ---');
    problems.irrelevant.forEach((p, i) => {
      console.log(`${i + 1}. [${p.id}]`);
      console.log(`   Title: ${p.title?.substring(0, 70)}...`);
      console.log(`   Issue: ${p.issue}`);
    });
  }

  if (problems.veterinary.length > 0) {
    console.log('\n--- VETERINARY ---');
    problems.veterinary.forEach((p, i) => {
      console.log(`${i + 1}. [${p.id}]`);
      console.log(`   Title: ${p.title?.substring(0, 70)}...`);
      console.log(`   Issue: ${p.issue}`);
    });
  }

  if (problems.duplicates.length > 0) {
    console.log('\n--- DUPLICATES ---');
    problems.duplicates.forEach((p, i) => {
      console.log(`${i + 1}. [${p.id}]`);
      console.log(`   Title: ${p.title?.substring(0, 70)}...`);
      console.log(`   Issue: ${p.issue}`);
    });
  }

  if (problems.low_relevance.length > 0) {
    console.log('\n--- LOW RELEVANCE (<40) ---');
    problems.low_relevance.forEach((p, i) => {
      console.log(`${i + 1}. [${p.id}]`);
      console.log(`   Title: ${p.title?.substring(0, 70)}...`);
      console.log(`   Issue: ${p.issue} (score: ${p.relevance_score})`);
    });
  }

  if (totalProblematic === 0) {
    console.log('\n✓ No problematic approved studies found!');
  }

  console.log('\n' + '='.repeat(70));
  console.log(`  SUMMARY: ${totalProblematic} of ${studies.length} approved studies may need review`);
  console.log('='.repeat(70));
}

main().catch(console.error);
