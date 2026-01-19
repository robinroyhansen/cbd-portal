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
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      envVars[match[1].trim()] = value;
    }
  });
  return envVars;
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           CBD PORTAL - CONTENT PRODUCTION STATUS           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // 1. Articles by type
  const { data: articles } = await supabase.from('kb_articles')
    .select('article_type, slug, title, status')
    .order('article_type');

  const byType = {};
  articles.forEach(a => {
    if (!byType[a.article_type]) byType[a.article_type] = [];
    byType[a.article_type].push(a);
  });

  // 2. Research data
  const { data: research } = await supabase.from('kb_research_queue')
    .select('primary_topic, relevant_topics, status')
    .eq('status', 'approved');

  // Get topic counts
  const topicCounts = {};
  research?.forEach(r => {
    // Count primary topics
    if (r.primary_topic) {
      topicCounts[r.primary_topic] = (topicCounts[r.primary_topic] || 0) + 1;
    }
    // Also count relevant_topics
    if (r.relevant_topics && Array.isArray(r.relevant_topics)) {
      r.relevant_topics.forEach(t => {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      });
    }
  });

  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│                    ARTICLE INVENTORY                        │');
  console.log('├──────────────────────────┬──────────┬──────────┬────────────┤');
  console.log('│ Article Type             │ Current  │ Target   │ Completion │');
  console.log('├──────────────────────────┼──────────┼──────────┼────────────┤');

  const targets = {
    'basics': { target: 50, label: 'CBD Basics' },
    'science': { target: 40, label: 'Science/Cannabinoids' },
    'terpene-profile': { target: 30, label: 'Terpene Profiles' },
    'product-guide': { target: 40, label: 'Product Guides' },
    'condition': { target: 280, label: 'Condition Articles' },
    'educational-guide': { target: 20, label: 'Educational Guides' },
    'application-guide': { target: 20, label: 'Application Guides' },
    'pillar': { target: 10, label: 'Pillar Articles' }
  };

  let totalCurrent = 0;
  let totalTarget = 0;

  for (const [type, config] of Object.entries(targets)) {
    const current = byType[type]?.length || 0;
    const pct = Math.round((current / config.target) * 100);
    const bar = pct >= 100 ? '✓ COMPLETE' : `${pct}%`;
    console.log(`│ ${config.label.padEnd(24)} │ ${current.toString().padStart(8)} │ ${config.target.toString().padStart(8)} │ ${bar.padStart(10)} │`);
    totalCurrent += current;
    totalTarget += config.target;
  }

  console.log('├──────────────────────────┼──────────┼──────────┼────────────┤');
  console.log(`│ TOTAL                    │ ${totalCurrent.toString().padStart(8)} │ ${totalTarget.toString().padStart(8)} │ ${Math.round((totalCurrent/totalTarget)*100).toString().padStart(9)}% │`);
  console.log('└──────────────────────────┴──────────┴──────────┴────────────┘');

  console.log('\n┌─────────────────────────────────────────────────────────────┐');
  console.log('│                    RESEARCH DATABASE                        │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log(`│ Total Approved Studies: ${(research?.length || 0).toString().padStart(33)} │`);
  console.log(`│ Topics Covered: ${Object.keys(topicCounts).length.toString().padStart(41)} │`);
  console.log('└─────────────────────────────────────────────────────────────┘');

  console.log('\n┌─────────────────────────────────────────────────────────────┐');
  console.log('│               TOP RESEARCH TOPICS (by study count)          │');
  console.log('├─────────────────────────────────────────────────────────────┤');

  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  sortedTopics.forEach(([topic, count]) => {
    console.log(`│ ${topic.padEnd(40)} ${count.toString().padStart(16)} │`);
  });

  console.log('└─────────────────────────────────────────────────────────────┘');

  // RECOMMENDATIONS
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                     RECOMMENDATIONS                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Calculate priority score: target - current, weighted by importance
  const priorities = [
    { type: 'condition', current: 1, target: 280, priority: 'HIGH', reason: '0.4% complete - massive gap, 4819 studies available' },
    { type: 'basics', current: byType['basics']?.length || 0, target: 50, priority: 'MEDIUM', reason: `${Math.round(((byType['basics']?.length || 0)/50)*100)}% complete - foundational for SEO` },
    { type: 'educational-guide', current: byType['educational-guide']?.length || 0, target: 20, priority: 'LOW', reason: `${Math.round(((byType['educational-guide']?.length || 0)/20)*100)}% complete` }
  ];

  console.log('PRIORITY ORDER (based on gap analysis and SEO impact):\n');
  console.log('1. 🔴 CONDITION ARTICLES (Highest Priority)');
  console.log('   - Current: 1 article | Target: 280 articles');
  console.log('   - Gap: 279 articles (99.6% remaining)');
  console.log('   - Research available: 4,819 approved studies across 50+ topics');
  console.log('   - Why: Largest content gap, SEO keyword opportunity, research ready');
  console.log('   - Action: Follow condition-article-spec.md workflow');
  console.log('');
  console.log('2. 🟡 CBD BASICS (Medium Priority)');
  console.log(`   - Current: ${byType['basics']?.length || 0} articles | Target: 50 articles`);
  console.log(`   - Gap: ${50 - (byType['basics']?.length || 0)} articles (${100 - Math.round(((byType['basics']?.length || 0)/50)*100)}% remaining)`);
  console.log('   - Why: Foundational content, supports internal linking');
  console.log('');
  console.log('3. 🟢 TERPENE & SCIENCE (Lower Priority - Near Complete)');
  console.log(`   - Terpene Profiles: ${byType['terpene-profile']?.length || 0}/30 (${Math.round(((byType['terpene-profile']?.length || 0)/30)*100)}%)`);
  console.log(`   - Science Articles: ${byType['science']?.length || 0}/40 (${Math.round(((byType['science']?.length || 0)/40)*100)}%)`);
  console.log(`   - Product Guides: ${byType['product-guide']?.length || 0}/40 (${Math.round(((byType['product-guide']?.length || 0)/40)*100)}%)`);
  console.log('   - Why: Already at or near 100% completion');
}
main();
