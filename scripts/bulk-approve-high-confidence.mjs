/**
 * Bulk Approve High-Confidence Pending Studies
 *
 * Criteria:
 * - relevant_topics is NOT null/empty
 * - relevance_score >= 70
 *
 * Run with: node scripts/bulk-approve-high-confidence.mjs
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

async function fetchHighConfidencePending() {
  let allStudies = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, relevant_topics, relevance_score')
      .eq('status', 'pending')
      .gte('relevance_score', 70)
      .not('relevant_topics', 'is', null)
      .range(offset, offset + 999);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allStudies = allStudies.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }

  // Filter out empty arrays
  return allStudies.filter(s => s.relevant_topics && s.relevant_topics.length > 0);
}

async function main() {
  console.log('='.repeat(70));
  console.log('  BULK APPROVE HIGH-CONFIDENCE STUDIES');
  console.log('='.repeat(70));

  // Fetch eligible studies
  const studies = await fetchHighConfidencePending();
  console.log(`\nStudies matching criteria (topics + relevance >= 70): ${studies.length}`);

  if (studies.length === 0) {
    console.log('No studies to approve.');
    return;
  }

  // Collect topic stats before approving
  const topicCounts = {};
  for (const study of studies) {
    for (const topic of (study.relevant_topics || [])) {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
  }

  // Approve in batches
  console.log('\nApproving studies...');
  const ids = studies.map(s => s.id);
  let approved = 0;

  for (let i = 0; i < ids.length; i += 500) {
    const batch = ids.slice(i, i + 500);
    const { data, error } = await supabase
      .from('kb_research_queue')
      .update({ status: 'approved' })
      .in('id', batch)
      .select('id');

    if (data) {
      approved += data.length;
    }
    if (error) {
      console.log('Error:', error.message);
    }

    console.log(`  Approved ${Math.min(i + 500, ids.length)}/${ids.length}...`);
  }

  // Final counts
  const { count: finalApproved } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: finalPending } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: finalRejected } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected');

  // Report
  console.log('\n' + '='.repeat(70));
  console.log('  RESULTS');
  console.log('='.repeat(70));

  console.log(`\nStudies approved this run: ${approved}`);

  console.log('\n| Status | Count |');
  console.log('|--------|-------|');
  console.log(`| Approved | ${finalApproved} |`);
  console.log(`| Pending | ${finalPending} |`);
  console.log(`| Rejected | ${finalRejected} |`);
  console.log(`| **Total** | **${finalApproved + finalPending + finalRejected}** |`);

  console.log('\nTopic distribution of newly approved (Top 10):');
  Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([topic, count], i) => {
      console.log(`  ${String(i + 1).padStart(2)}. ${topic.padEnd(20)}: ${count}`);
    });

  console.log('\n' + '='.repeat(70));
}

main().catch(console.error);
