/**
 * Fix research_count for conditions
 *
 * Strategy:
 * 1. Only use EXACT topic matching from research relevant_topics
 * 2. Conditions without specific matching topics get 0
 * 3. Clear out the default keywords that were wrongly added
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// Map condition slugs to their relevant research topics
// Only map conditions that have direct research topics in the database
const CONDITION_TO_TOPICS: Record<string, string[]> = {
  // Mental Health
  'anxiety': ['anxiety'],
  'depression': ['depression'],
  'stress': ['stress'],
  'ptsd': ['ptsd'],
  'schizophrenia': ['schizophrenia'],
  'addiction': ['addiction'],
  'autism': ['autism'],
  'bipolar-disorder': ['bipolar'],

  // Pain
  'pain': ['pain'],
  'chronic-pain': ['pain'],
  'neuropathy': ['neuropathy'],
  'arthritis': ['arthritis'],
  'fibromyalgia': ['fibromyalgia'],

  // Neurological
  'epilepsy': ['epilepsy'],
  'parkinsons': ['parkinsons'],
  'parkinsons-disease': ['parkinsons'],
  'alzheimers': ['alzheimers'],
  'alzheimers-disease': ['alzheimers'],
  'multiple-sclerosis': ['ms'],
  'ms': ['ms'],

  // Sleep
  'sleep': ['sleep'],
  'insomnia': ['sleep'],
  'sleep-disorders': ['sleep'],

  // Inflammation
  'inflammation': ['inflammation'],

  // Cancer
  'cancer': ['cancer'],

  // Cardiovascular
  'heart-disease': ['heart'],
  'hypertension': ['blood_pressure'],
  'high-blood-pressure': ['blood_pressure'],

  // Metabolic
  'diabetes': ['diabetes'],
  'obesity': ['obesity'],

  // Skin
  'acne': ['acne'],
  'psoriasis': ['psoriasis'],
  'eczema': ['eczema'],

  // Digestive
  'ibs': ['ibs'],
  'crohns-disease': ['crohns'],
  'nausea': ['nausea'],

  // Other
  'glaucoma': ['glaucoma'],
  'athletic-performance': ['athletic'],
};

async function fixConditionCounts() {
  console.log('Fetching all research topics...');

  // Get research topic counts
  let allResearch: { id: string; relevant_topics: string[] }[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data: research, error } = await supabase
      .from('kb_research_queue')
      .select('id, relevant_topics')
      .eq('status', 'approved')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error || !research || research.length === 0) break;
    allResearch = [...allResearch, ...research];
    if (research.length < pageSize) break;
    page++;
  }

  console.log(`Found ${allResearch.length} approved research items`);

  // Count research per topic
  const topicCounts: Record<string, number> = {};
  for (const r of allResearch) {
    for (const topic of (r.relevant_topics || [])) {
      const t = topic.toLowerCase().trim();
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    }
  }

  console.log('\nResearch topics found:');
  const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
  for (const [topic, count] of sortedTopics) {
    console.log(`  ${topic}: ${count}`);
  }

  // Get all conditions
  const { data: conditions, error: condError } = await supabase
    .from('kb_conditions')
    .select('id, slug, name')
    .eq('is_published', true);

  if (condError || !conditions) {
    console.error('Error fetching conditions:', condError);
    return;
  }

  console.log(`\nFound ${conditions.length} conditions`);

  // Calculate and update counts
  console.log('\nUpdating counts...');
  let updated = 0;
  let withResearch = 0;

  for (const condition of conditions) {
    // Check if this condition has mapped topics
    const topics = CONDITION_TO_TOPICS[condition.slug];

    let count = 0;
    if (topics && topics.length > 0) {
      // Sum counts for all mapped topics
      for (const topic of topics) {
        count += topicCounts[topic] || 0;
      }
    }

    if (count > 0) withResearch++;

    // Update the condition
    const { error } = await supabase
      .from('kb_conditions')
      .update({
        research_count: count,
        // Only set topic_keywords if we have mapped topics
        topic_keywords: topics || []
      })
      .eq('id', condition.id);

    if (error) {
      console.error(`Error updating ${condition.name}:`, error.message);
    } else {
      updated++;
    }
  }

  console.log(`\nUpdated ${updated} conditions`);
  console.log(`${withResearch} conditions have matching research`);

  // Show final results
  const { data: finalConditions } = await supabase
    .from('kb_conditions')
    .select('name, research_count')
    .eq('is_published', true)
    .gt('research_count', 0)
    .order('research_count', { ascending: false })
    .limit(20);

  console.log('\nTop conditions by research count:');
  for (const c of finalConditions || []) {
    console.log(`  ${c.name}: ${c.research_count}`);
  }
}

fixConditionCounts().catch(console.error);
