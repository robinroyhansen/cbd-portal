/**
 * Final Queue Summary
 *
 * Run with: node scripts/final-summary.mjs
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

async function fetchAllPendingStudies() {
  let allStudies = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, relevant_topics, relevance_score, quality_score')
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
  console.log('  FINAL QUEUE SUMMARY');
  console.log('='.repeat(70));

  const studies = await fetchAllPendingStudies();

  // 1. Total pending
  console.log('\n1. TOTAL PENDING STUDIES: ' + studies.length);

  // 2. Topic distribution (Top 15)
  console.log('\n2. TOPIC DISTRIBUTION (Top 15):');
  const topicCounts = {};
  for (const study of studies) {
    if (study.relevant_topics) {
      for (const topic of study.relevant_topics) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }
  }

  const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
  sortedTopics.slice(0, 15).forEach(([topic, count], i) => {
    const pct = ((count / studies.length) * 100).toFixed(1);
    console.log(`   ${String(i + 1).padStart(2)}. ${topic.padEnd(20)}: ${String(count).padStart(4)} (${pct.padStart(5)}%)`);
  });

  console.log(`\n   Total unique topics: ${sortedTopics.length}`);

  // 3. Relevance score distribution
  console.log('\n3. RELEVANCE SCORE DISTRIBUTION:');
  const relevanceRanges = {
    '90-100 (Excellent)': { count: 0, studies: [] },
    '70-89 (High)': { count: 0, studies: [] },
    '50-69 (Medium)': { count: 0, studies: [] },
    '30-49 (Low)': { count: 0, studies: [] },
    '1-29 (Very Low)': { count: 0, studies: [] },
    '0 or null': { count: 0, studies: [] }
  };

  for (const study of studies) {
    const score = study.relevance_score || 0;
    if (score >= 90) relevanceRanges['90-100 (Excellent)'].count++;
    else if (score >= 70) relevanceRanges['70-89 (High)'].count++;
    else if (score >= 50) relevanceRanges['50-69 (Medium)'].count++;
    else if (score >= 30) relevanceRanges['30-49 (Low)'].count++;
    else if (score >= 1) relevanceRanges['1-29 (Very Low)'].count++;
    else relevanceRanges['0 or null'].count++;
  }

  for (const [range, data] of Object.entries(relevanceRanges)) {
    const pct = ((data.count / studies.length) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(data.count / studies.length * 30));
    console.log(`   ${range.padEnd(20)}: ${String(data.count).padStart(4)} (${pct.padStart(5)}%) ${bar}`);
  }

  // 4. High confidence studies
  console.log('\n4. READY FOR "APPROVE HIGH CONFIDENCE":');
  const highConfidence = studies.filter(s =>
    s.relevant_topics &&
    s.relevant_topics.length > 0 &&
    (s.relevance_score || 0) >= 70
  );

  console.log(`   Studies with topic + relevance >= 70: ${highConfidence.length}`);

  const hc9100 = highConfidence.filter(s => s.relevance_score >= 90).length;
  const hc7089 = highConfidence.filter(s => s.relevance_score >= 70 && s.relevance_score < 90).length;
  console.log(`     - Relevance 90-100: ${hc9100}`);
  console.log(`     - Relevance 70-89: ${hc7089}`);

  // Breakdown by topic for high confidence
  console.log('\n   High confidence by topic:');
  const hcTopicCounts = {};
  for (const study of highConfidence) {
    for (const topic of (study.relevant_topics || [])) {
      hcTopicCounts[topic] = (hcTopicCounts[topic] || 0) + 1;
    }
  }
  Object.entries(hcTopicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([topic, count]) => {
      console.log(`     ${topic.padEnd(20)}: ${count}`);
    });

  // Final database state
  const { count: approved } = await supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).eq('status', 'approved');
  const { count: rejected } = await supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).eq('status', 'rejected');

  console.log('\n' + '='.repeat(70));
  console.log('  FINAL DATABASE STATE');
  console.log('='.repeat(70));
  console.log(`   Pending:  ${studies.length}`);
  console.log(`   Approved: ${approved}`);
  console.log(`   Rejected: ${rejected}`);
  console.log(`   TOTAL:    ${studies.length + approved + rejected}`);
  console.log('='.repeat(70));
}

main().catch(console.error);
