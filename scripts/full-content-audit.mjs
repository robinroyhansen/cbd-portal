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
  console.log('===========================================');
  console.log('       CBD PORTAL CONTENT AUDIT');
  console.log('===========================================\n');

  // 1. Articles by type with titles
  const { data: articles } = await supabase.from('kb_articles')
    .select('article_type, slug, title, status')
    .order('article_type')
    .order('title');

  const byType = {};
  articles.forEach(a => {
    if (!byType[a.article_type]) byType[a.article_type] = [];
    byType[a.article_type].push(a);
  });

  console.log('=== ARTICLES BY TYPE (with titles) ===\n');

  for (const [type, items] of Object.entries(byType).sort()) {
    console.log(`\n--- ${type.toUpperCase()} (${items.length}) ---`);
    items.forEach(a => console.log(`  ${a.slug}`));
  }

  console.log(`\n\nTOTAL ARTICLES: ${articles.length}\n`);

  // 2. Conditions in database
  const { data: conditions } = await supabase.from('kb_conditions')
    .select('slug, name, condition_category')
    .order('condition_category')
    .order('name');

  console.log('===========================================');
  console.log('=== CONDITIONS DATABASE (39 total) ===');
  console.log('===========================================\n');

  const conditionsByCategory = {};
  conditions.forEach(c => {
    const cat = c.condition_category || 'uncategorized';
    if (!conditionsByCategory[cat]) conditionsByCategory[cat] = [];
    conditionsByCategory[cat].push(c);
  });

  for (const [cat, items] of Object.entries(conditionsByCategory).sort()) {
    console.log(`\n${cat} (${items.length}):`);
    items.forEach(c => console.log(`  - ${c.slug}`));
  }

  // 3. Research topics with counts
  const { data: research } = await supabase.from('kb_research_queue')
    .select('primary_topic, status')
    .eq('status', 'approved');

  console.log('\n\n===========================================');
  console.log('=== APPROVED RESEARCH BY TOPIC ===');
  console.log('===========================================\n');

  const topicCounts = {};
  research?.forEach(r => {
    if (r.primary_topic) {
      topicCounts[r.primary_topic] = (topicCounts[r.primary_topic] || 0) + 1;
    }
  });

  Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([topic, count]) => {
      console.log(`${topic}: ${count} studies`);
    });

  console.log(`\nTOTAL APPROVED STUDIES: ${research?.length || 0}`);

  // 4. Glossary count
  const { count: glossaryCount } = await supabase.from('kb_glossary_terms')
    .select('*', { count: 'exact', head: true });

  console.log(`\n\n===========================================`);
  console.log('=== GLOSSARY TERMS ===');
  console.log('===========================================');
  console.log(`Total glossary terms: ${glossaryCount}`);

  // 5. Summary
  console.log('\n\n===========================================');
  console.log('           PRODUCTION SUMMARY');
  console.log('===========================================\n');

  console.log('CONTENT TYPE               CURRENT   TARGET    %COMPLETE');
  console.log('-----------------------------------------------------------');
  console.log(`CBD Basics (basics)          ${(byType['basics']?.length || 0).toString().padStart(3)}       50        ${Math.round(((byType['basics']?.length || 0)/50)*100)}%`);
  console.log(`Science Articles             ${(byType['science']?.length || 0).toString().padStart(3)}       40*       ${Math.round(((byType['science']?.length || 0)/40)*100)}%`);
  console.log(`Terpene Profiles             ${(byType['terpene-profile']?.length || 0).toString().padStart(3)}       30        ${Math.round(((byType['terpene-profile']?.length || 0)/30)*100)}%`);
  console.log(`Product Guides               ${(byType['product-guide']?.length || 0).toString().padStart(3)}       40        ${Math.round(((byType['product-guide']?.length || 0)/40)*100)}%`);
  console.log(`Condition Articles           ${1}       280       ${Math.round((1/280)*100)}%`);
  console.log(`Educational Guides           ${(byType['educational-guide']?.length || 0).toString().padStart(3)}       20*       ${Math.round(((byType['educational-guide']?.length || 0)/20)*100)}%`);
  console.log(`Application Guides           ${(byType['application-guide']?.length || 0).toString().padStart(3)}       20*       ${Math.round(((byType['application-guide']?.length || 0)/20)*100)}%`);
  console.log(`Pillar Articles              ${(byType['pillar']?.length || 0).toString().padStart(3)}       10*       ${Math.round(((byType['pillar']?.length || 0)/10)*100)}%`);
  console.log('-----------------------------------------------------------');
  console.log(`TOTAL ARTICLES              ${articles.length.toString().padStart(3)}      ~500`);
  console.log(`\n* Estimated targets based on master plan categories`);

  console.log('\n\nRESEARCH DATABASE:');
  console.log(`  - ${research?.length || 0} approved studies`);
  console.log(`  - ${Object.keys(topicCounts).length} topics covered`);
  console.log(`  - ${conditions?.length || 0} conditions defined`);
  console.log(`  - ${glossaryCount} glossary terms`);
}
main();
