/**
 * Analyze Remaining Pending Studies
 *
 * Run with: node scripts/analyze-pending.mjs
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
      .select('id, title, relevant_topics, relevance_score, quality_score, abstract')
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
  console.log('  ANALYZE REMAINING PENDING STUDIES');
  console.log('='.repeat(70));

  const studies = await fetchAllPendingStudies();
  console.log(`\nTotal pending studies: ${studies.length}`);

  // ================================================================
  // 1. RELEVANCE SCORE DISTRIBUTION
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  1. RELEVANCE SCORE DISTRIBUTION');
  console.log('='.repeat(70));

  const ranges = {
    '60-69': [],
    '50-59': [],
    '40-49': [],
    '30-39': [],
    '<30': []
  };

  for (const study of studies) {
    const score = study.relevance_score || 0;
    if (score >= 60 && score < 70) ranges['60-69'].push(study);
    else if (score >= 50 && score < 60) ranges['50-59'].push(study);
    else if (score >= 40 && score < 50) ranges['40-49'].push(study);
    else if (score >= 30 && score < 40) ranges['30-39'].push(study);
    else ranges['<30'].push(study);
  }

  console.log('\n| Relevance Range | Count | % |');
  console.log('|-----------------|-------|---|');
  for (const [range, items] of Object.entries(ranges)) {
    const pct = ((items.length / studies.length) * 100).toFixed(1);
    console.log(`| ${range.padEnd(15)} | ${String(items.length).padStart(5)} | ${pct.padStart(5)}% |`);
  }

  // ================================================================
  // 2. SAMPLE STUDIES BY RELEVANCE RANGE
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  2. SAMPLE STUDIES BY RELEVANCE RANGE');
  console.log('='.repeat(70));

  for (const [range, items] of Object.entries(ranges)) {
    if (items.length === 0) continue;

    console.log(`\n### Relevance ${range} (${items.length} total):`);

    // Shuffle and pick 3 random samples
    const shuffled = items.sort(() => Math.random() - 0.5);
    const samples = shuffled.slice(0, 3);

    samples.forEach((s, i) => {
      const topics = Array.isArray(s.relevant_topics) ? s.relevant_topics.join(', ') : (s.relevant_topics || 'none');
      console.log(`${i + 1}. [Score: ${s.relevance_score}] [Topics: ${topics}]`);
      console.log(`   "${s.title?.substring(0, 80)}${s.title?.length > 80 ? '...' : ''}"`);
    });
  }

  // ================================================================
  // 3. TOPIC DISTRIBUTION OF REMAINING STUDIES
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  3. TOPIC DISTRIBUTION OF REMAINING STUDIES');
  console.log('='.repeat(70));

  const topicCounts = {};
  const topicsByRelevance = {};

  for (const study of studies) {
    if (study.relevant_topics && study.relevant_topics.length > 0) {
      for (const topic of study.relevant_topics) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        if (!topicsByRelevance[topic]) {
          topicsByRelevance[topic] = { high: 0, medium: 0, low: 0 };
        }
        const score = study.relevance_score || 0;
        if (score >= 60) topicsByRelevance[topic].high++;
        else if (score >= 40) topicsByRelevance[topic].medium++;
        else topicsByRelevance[topic].low++;
      }
    }
  }

  const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);

  console.log('\nTop 10 topics with most pending studies:');
  console.log('| Topic | Count | 60-69 | 40-59 | <40 |');
  console.log('|-------|-------|-------|-------|-----|');
  sortedTopics.slice(0, 10).forEach(([topic, count]) => {
    const rel = topicsByRelevance[topic];
    console.log(`| ${topic.padEnd(18)} | ${String(count).padStart(5)} | ${String(rel.high).padStart(5)} | ${String(rel.medium).padStart(5)} | ${String(rel.low).padStart(3)} |`);
  });

  // Studies without topics
  const noTopics = studies.filter(s => !s.relevant_topics || s.relevant_topics.length === 0);
  console.log(`\nStudies without topics: ${noTopics.length}`);

  // ================================================================
  // 4. ANALYSIS FOR RECOMMENDATION
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  4. DETAILED ANALYSIS FOR RECOMMENDATION');
  console.log('='.repeat(70));

  // Check what's in the <30 range
  console.log('\n### Studies with relevance <30:');
  const veryLow = ranges['<30'];

  // Categorize low-relevance studies
  const lowCategories = {
    noTopics: 0,
    withTopics: 0,
    samples: []
  };

  for (const study of veryLow) {
    if (!study.relevant_topics || study.relevant_topics.length === 0) {
      lowCategories.noTopics++;
    } else {
      lowCategories.withTopics++;
      if (lowCategories.samples.length < 5) {
        lowCategories.samples.push(study);
      }
    }
  }

  console.log(`  - Without topics: ${lowCategories.noTopics}`);
  console.log(`  - With topics: ${lowCategories.withTopics}`);

  if (lowCategories.samples.length > 0) {
    console.log('\n  Low-relevance samples WITH topics (potential false negatives):');
    lowCategories.samples.forEach((s, i) => {
      const topics = Array.isArray(s.relevant_topics) ? s.relevant_topics.join(', ') : s.relevant_topics;
      console.log(`  ${i + 1}. [Score: ${s.relevance_score}] [${topics}]`);
      console.log(`     "${s.title?.substring(0, 70)}..."`);
    });
  }

  // Check 40-49 range for quality
  console.log('\n### Studies with relevance 40-49:');
  const midLow = ranges['40-49'];
  const midLowWithTopics = midLow.filter(s => s.relevant_topics && s.relevant_topics.length > 0);
  console.log(`  - Total: ${midLow.length}`);
  console.log(`  - With topics: ${midLowWithTopics.length}`);

  // Check 50-59 range
  console.log('\n### Studies with relevance 50-59:');
  const mid = ranges['50-59'];
  const midWithTopics = mid.filter(s => s.relevant_topics && s.relevant_topics.length > 0);
  console.log(`  - Total: ${mid.length}`);
  console.log(`  - With topics: ${midWithTopics.length}`);

  // Check 60-69 range
  console.log('\n### Studies with relevance 60-69:');
  const highMid = ranges['60-69'];
  const highMidWithTopics = highMid.filter(s => s.relevant_topics && s.relevant_topics.length > 0);
  console.log(`  - Total: ${highMid.length}`);
  console.log(`  - With topics: ${highMidWithTopics.length}`);

  // ================================================================
  // RECOMMENDATION
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  RECOMMENDATION');
  console.log('='.repeat(70));

  console.log('\nBased on the analysis:');
  console.log('\n1. SAFE TO APPROVE (relevance 60-69 + topics):');
  console.log(`   ${highMidWithTopics.length} studies`);

  console.log('\n2. CONSIDER APPROVING (relevance 50-59 + topics):');
  console.log(`   ${midWithTopics.length} studies`);

  console.log('\n3. REVIEW CAREFULLY (relevance 40-49 + topics):');
  console.log(`   ${midLowWithTopics.length} studies`);

  console.log('\n4. LIKELY REJECT (relevance <40 OR no topics):');
  const likelyReject = studies.filter(s =>
    (s.relevance_score || 0) < 40 ||
    !s.relevant_topics ||
    s.relevant_topics.length === 0
  );
  console.log(`   ${likelyReject.length} studies`);

  console.log('\n' + '='.repeat(70));
}

main().catch(console.error);
