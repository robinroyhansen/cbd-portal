/**
 * Research Queue Analysis Script
 * Analyzes pending studies to understand the queue composition
 *
 * Run with: node scripts/analyze-queue.mjs
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

async function analyze() {
  console.log('='.repeat(70));
  console.log('  RESEARCH QUEUE ANALYSIS - PENDING STUDIES');
  console.log('='.repeat(70));

  // Get total pending count
  const { count: totalPending } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  console.log('\nTotal pending studies:', totalPending);

  // ================================================================
  // 1. TOPIC DISTRIBUTION
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  1. TOPIC DISTRIBUTION');
  console.log('='.repeat(70));

  // Paginate through all pending studies
  let allStudies = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from('kb_research_queue')
      .select('id, relevant_topics, relevance_score, quality_score, title, study_subject')
      .eq('status', 'pending')
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    allStudies = allStudies.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }

  const topicCounts = {};
  let noTopicCount = 0;
  const noTopicStudies = [];

  for (const study of allStudies) {
    if (!study.relevant_topics || study.relevant_topics.length === 0) {
      noTopicCount++;
      noTopicStudies.push(study);
    } else {
      for (const topic of study.relevant_topics) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }
  }

  const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
  console.log('\nTop 40 topics:');
  sortedTopics.slice(0, 40).forEach(([topic, count], i) => {
    console.log('  ' + String(i+1).padStart(2) + '. ' + topic.padEnd(30) + ': ' + count);
  });

  console.log('\nTotal unique topics:', Object.keys(topicCounts).length);
  console.log('Studies with NO topic:', noTopicCount);

  // ================================================================
  // 2. STUDIES WITH NO TOPIC
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  2. STUDIES WITH NO TOPIC ASSIGNED (' + noTopicCount + ' total)');
  console.log('='.repeat(70));

  // Sort by quality score
  noTopicStudies.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));

  console.log('\nSample 15 studies without topics (highest quality first):');
  noTopicStudies.slice(0, 15).forEach((s, i) => {
    console.log('  ' + (i+1) + '. [Q:' + String(s.quality_score || 0).padStart(2) + ' R:' + String(s.relevance_score || 0).padStart(2) + '] ' + (s.title || '').substring(0, 55) + '...');
  });

  // ================================================================
  // 3. TOPICS NOT IN KB_CONDITIONS
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  3. TOPICS IN RESEARCH BUT NOT IN KB_CONDITIONS');
  console.log('='.repeat(70));

  const { data: conditions } = await supabase
    .from('kb_conditions')
    .select('slug, name');

  const conditionSlugs = new Set((conditions || []).map(c => c.slug));

  const missingTopics = sortedTopics.filter(([topic]) => !conditionSlugs.has(topic));
  console.log('\nTopics in research without matching condition page:');
  missingTopics.slice(0, 20).forEach(([topic, count]) => {
    console.log('  - ' + topic.padEnd(30) + ': ' + count + ' studies');
  });

  // ================================================================
  // 4. DUPLICATE DETECTION
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  4. DUPLICATE DETECTION');
  console.log('='.repeat(70));

  const titleCounts = {};
  for (const study of allStudies) {
    const normalizedTitle = (study.title || '').toLowerCase().trim();
    if (normalizedTitle.length > 10) {
      titleCounts[normalizedTitle] = (titleCounts[normalizedTitle] || 0) + 1;
    }
  }

  const duplicates = Object.entries(titleCounts)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);

  console.log('\nExact title duplicates:', duplicates.length);
  console.log('Total duplicate entries:', duplicates.reduce((sum, [_, c]) => sum + c - 1, 0));

  if (duplicates.length > 0) {
    console.log('\nTop 10 duplicated titles:');
    duplicates.slice(0, 10).forEach(([title, count]) => {
      console.log('  [' + count + 'x] ' + title.substring(0, 60) + '...');
    });
  }

  // ================================================================
  // 5. RELEVANCE SCORE DISTRIBUTION
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  5. RELEVANCE SCORE DISTRIBUTION');
  console.log('='.repeat(70));

  const scoreRanges = {
    '90-100': 0,
    '70-89': 0,
    '50-69': 0,
    '30-49': 0,
    '1-29': 0,
    '0 or null': 0
  };

  for (const study of allStudies) {
    const score = study.relevance_score || 0;
    if (score >= 90) scoreRanges['90-100']++;
    else if (score >= 70) scoreRanges['70-89']++;
    else if (score >= 50) scoreRanges['50-69']++;
    else if (score >= 30) scoreRanges['30-49']++;
    else if (score >= 1) scoreRanges['1-29']++;
    else scoreRanges['0 or null']++;
  }

  console.log('\nRelevance score distribution:');
  Object.entries(scoreRanges).forEach(([range, count]) => {
    const pct = ((count / allStudies.length) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(count / allStudies.length * 40));
    console.log('  ' + range.padEnd(10) + ': ' + String(count).padStart(5) + ' (' + pct.padStart(5) + '%) ' + bar);
  });

  // Quality score distribution too
  console.log('\nQuality score distribution:');
  const qualityRanges = { '70+': 0, '50-69': 0, '30-49': 0, '<30': 0, 'null': 0 };
  for (const study of allStudies) {
    const score = study.quality_score;
    if (score === null || score === undefined) qualityRanges['null']++;
    else if (score >= 70) qualityRanges['70+']++;
    else if (score >= 50) qualityRanges['50-69']++;
    else if (score >= 30) qualityRanges['30-49']++;
    else qualityRanges['<30']++;
  }
  Object.entries(qualityRanges).forEach(([range, count]) => {
    const pct = ((count / allStudies.length) * 100).toFixed(1);
    console.log('  ' + range.padEnd(10) + ': ' + String(count).padStart(5) + ' (' + pct.padStart(5) + '%)');
  });

  // ================================================================
  // 6. POTENTIALLY IRRELEVANT STUDIES
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  6. POTENTIALLY IRRELEVANT STUDIES');
  console.log('='.repeat(70));

  const extractionKeywords = ['extraction', 'chromatography', 'hplc', 'gc-ms', 'spectroscopy', 'quantification method'];
  const agricultureKeywords = ['cultivation', 'hemp seed', 'fiber', 'crop', 'farming', 'agricultural', 'phytoremediation'];
  const policyKeywords = ['policy', 'legalization', 'legislation', 'regulation', 'law enforcement'];

  let extractionCount = 0;
  let agricultureCount = 0;
  let policyCount = 0;

  for (const study of allStudies) {
    const title = (study.title || '').toLowerCase();
    if (extractionKeywords.some(kw => title.includes(kw))) extractionCount++;
    if (agricultureKeywords.some(kw => title.includes(kw))) agricultureCount++;
    if (policyKeywords.some(kw => title.includes(kw))) policyCount++;
  }

  console.log('\nStudies by category (based on title keywords):');
  console.log('  Extraction/Processing/Analysis: ' + extractionCount);
  console.log('  Agriculture/Cultivation:        ' + agricultureCount);
  console.log('  Policy/Legal/Regulation:        ' + policyCount);

  // ================================================================
  // 7. STUDY SUBJECT DISTRIBUTION
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  7. STUDY SUBJECT DISTRIBUTION');
  console.log('='.repeat(70));

  const subjectCounts = {};
  for (const study of allStudies) {
    const subject = study.study_subject || 'not_classified';
    subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
  }

  console.log('\nStudy subjects:');
  Object.entries(subjectCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([subject, count]) => {
      const pct = ((count / allStudies.length) * 100).toFixed(1);
      console.log('  ' + subject.padEnd(20) + ': ' + String(count).padStart(5) + ' (' + pct.padStart(5) + '%)');
    });

  // ================================================================
  // 8. HIGH-SCORING STUDIES WITHOUT TOPICS
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  8. HIGH-QUALITY STUDIES WITHOUT TOPICS');
  console.log('='.repeat(70));

  const highQualityNoTopic = noTopicStudies
    .filter(s => (s.quality_score || 0) >= 70)
    .slice(0, 10);

  console.log('\nStudies with quality >= 70 but no topic (' + highQualityNoTopic.length + ' shown):');
  highQualityNoTopic.forEach((s, i) => {
    console.log('  ' + (i+1) + '. [Q:' + s.quality_score + '] ' + (s.title || '').substring(0, 55) + '...');
  });

  // ================================================================
  // SUMMARY & RECOMMENDATIONS
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  SUMMARY & RECOMMENDATIONS');
  console.log('='.repeat(70));

  console.log('\nKEY FINDINGS:');
  console.log('  - Total pending: ' + allStudies.length);
  console.log('  - With topics: ' + (allStudies.length - noTopicCount) + ' (' + ((allStudies.length - noTopicCount) / allStudies.length * 100).toFixed(1) + '%)');
  console.log('  - Without topics: ' + noTopicCount + ' (' + (noTopicCount / allStudies.length * 100).toFixed(1) + '%)');
  console.log('  - Exact duplicates: ' + duplicates.reduce((sum, [_, c]) => sum + c - 1, 0));
  console.log('  - Topics not in kb_conditions: ' + missingTopics.length);

  console.log('\nPOTENTIAL ISSUES:');
  if (scoreRanges['0 or null'] > 100) {
    console.log('  ⚠ ' + scoreRanges['0 or null'] + ' studies have no relevance score');
  }
  if (noTopicCount > allStudies.length * 0.2) {
    console.log('  ⚠ ' + (noTopicCount / allStudies.length * 100).toFixed(0) + '% of studies have no topic assigned');
  }
  if (extractionCount > 50) {
    console.log('  ⚠ ' + extractionCount + ' extraction/processing studies may not be relevant');
  }

  console.log('\nRECOMMENDATIONS:');
  console.log('  1. Remove ' + duplicates.reduce((sum, [_, c]) => sum + c - 1, 0) + ' duplicate entries');
  console.log('  2. Auto-reject ' + extractionCount + ' extraction/processing studies');
  console.log('  3. Review ' + noTopicCount + ' studies without topics');
  console.log('  4. Consider adding conditions for popular topics: ' + missingTopics.slice(0, 5).map(([t]) => t).join(', '));

  console.log('\n' + '='.repeat(70));
}

analyze().catch(console.error);
