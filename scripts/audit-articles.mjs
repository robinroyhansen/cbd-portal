import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: articles } = await supabase
  .from('kb_articles')
  .select('slug, title, article_type, content')
  .not('content', 'is', null)
  .limit(2000);

const metrics = {
  total: 0,
  byline: 0,
  myTake: 0,
  researchSnapshot: 0,
  keyNumbers: 0,
  references: 0,
  disclaimer: 0,
  relatedStudies: 0,
  faq: 0,
  glossaryLinks: 0,
};

articles.forEach(a => {
  metrics.total++;
  const c = a.content?.toLowerCase() || '';

  if (c.includes('by robin') || c.includes('robin roy')) metrics.byline++;
  if (c.includes('## my take')) metrics.myTake++;
  if (c.includes('research snapshot') || c.includes('studies reviewed')) metrics.researchSnapshot++;
  if (c.includes('key numbers') || c.includes('**key numbers**')) metrics.keyNumbers++;
  if (c.includes('## references') || c.includes('### references')) metrics.references++;
  if (c.includes('disclaimer') || c.includes('informational purposes only')) metrics.disclaimer++;
  if (c.includes('## related studies') || c.includes('/research/study/')) metrics.relatedStudies++;
  if (c.includes('## faq') || c.includes('frequently asked') || c.includes('## common questions')) metrics.faq++;
  if (c.includes('/glossary/')) metrics.glossaryLinks++;
});

console.log('\n📊 ARTICLE QUALITY AUDIT\n');
console.log(`Total articles: ${metrics.total}\n`);

const items = [
  ['My Take sections', metrics.myTake],
  ['Author bylines', metrics.byline],
  ['Disclaimers', metrics.disclaimer],
  ['Glossary links', metrics.glossaryLinks],
  ['FAQ sections', metrics.faq],
  ['References sections', metrics.references],
  ['Related Studies', metrics.relatedStudies],
  ['Research Snapshots', metrics.researchSnapshot],
  ['Key Numbers boxes', metrics.keyNumbers],
];

items.sort((a, b) => b[1] - a[1]);

items.forEach(([name, count]) => {
  const pct = Math.round(count / metrics.total * 100);
  const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
  console.log(`${name.padEnd(20)} ${bar} ${pct}% (${count}/${metrics.total})`);
});

// Check study slug coverage
const { count: totalStudies } = await supabase
  .from('kb_research_queue')
  .select('id', { count: 'exact', head: true })
  .eq('status', 'approved');

const { count: studiesWithSlug } = await supabase
  .from('kb_research_queue')
  .select('id', { count: 'exact', head: true })
  .eq('status', 'approved')
  .not('slug', 'is', null);

console.log('\n📚 RESEARCH DATABASE');
console.log(`Study slugs: ${studiesWithSlug}/${totalStudies} (${Math.round(studiesWithSlug/totalStudies*100)}%)`);
console.log(`Missing slugs: ${totalStudies - studiesWithSlug}`);
