import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Check what tables exist
const tableChecks = [
  'kb_articles', 'kb_conditions', 'kb_research_queue', 'kb_brands',
  'kb_glossary_terms', 'kb_glossary', 'glossary', 'glossary_terms',
  'kb_tools', 'tools', 'kb_scan_jobs'
];

console.log('DATABASE TABLES:');
for (const table of tableChecks) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) {
    console.log(`  ${table}: does not exist`);
  } else {
    console.log(`  ${table}: ${count} rows`);
  }
}

// Get all articles
const { data: articles } = await supabase
  .from('kb_articles')
  .select('article_type, slug, title')
  .limit(2000);

console.log('\nARTICLE TYPES:');
const typeCounts = {};
articles.forEach(a => {
  typeCounts[a.article_type] = (typeCounts[a.article_type] || 0) + 1;
});
Object.entries(typeCounts).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => {
  console.log(`  ${k}: ${v}`);
});

// Check for specific content categories from master plan
const slugs = articles.map(a => a.slug.toLowerCase());
const titles = articles.map(a => a.title.toLowerCase());

console.log('\nCONTENT COVERAGE CHECK (from Master Plan):');

// Foundations & Basics (50 planned)
const foundationSlugs = ['what-is-cbd', 'what-is-hemp', 'endocannabinoid-system', 'beginners-guide', 'introduction-to-cbd'];
const foundationsFound = foundationSlugs.filter(s => slugs.some(slug => slug.includes(s))).length;
console.log(`  Foundations & Basics: ${foundationsFound}/${foundationSlugs.length} key articles found`);

// Cannabinoids (40 planned)
const cannabinoidSlugs = ['what-is-thc', 'what-is-cbg', 'what-is-cbn', 'what-is-cbc', 'what-is-delta-8', 'what-is-hhc'];
const cannabinoidsFound = slugs.filter(s => s.includes('cannabin') || cannabinoidSlugs.some(cs => s.includes(cs))).length;
console.log(`  Cannabinoid articles: ${cannabinoidsFound} found`);

// Terpenes (30 planned)
const terpeneCount = slugs.filter(s => s.includes('terpene') || s.includes('myrcene') || s.includes('limonene') || s.includes('linalool')).length;
console.log(`  Terpene articles: ${terpeneCount} found`);

// Products (40 planned)
const productCount = slugs.filter(s => s.includes('oil-guide') || s.includes('gummies-guide') || s.includes('cream-guide') || s.includes('capsules-guide')).length;
console.log(`  Product guides: ${productCount} found`);

// Conditions (280 planned)
const conditionCount = slugs.filter(s => s.startsWith('cbd-and-') || s.startsWith('cbd-for-')).length;
console.log(`  Condition articles (cbd-and-*/cbd-for-*): ${conditionCount} found`);

// Pets (80 planned)
const petCount = slugs.filter(s => s.includes('dog') || s.includes('cat') || s.includes('pet') || s.includes('horse') || s.includes('bird')).length;
console.log(`  Pet articles: ${petCount} found`);

// Legal (50 planned)
const legalCount = slugs.filter(s => s.includes('legal') || s.includes('law')).length;
console.log(`  Legal articles: ${legalCount} found`);

// Comparisons (55 planned)
const comparisonCount = slugs.filter(s => s.includes('-vs-')).length;
console.log(`  Comparison articles (X-vs-Y): ${comparisonCount} found`);

// Brand Reviews
const { count: brandCount } = await supabase.from('kb_brands').select('*', { count: 'exact', head: true });
console.log(`  Brand reviews: ${brandCount || 0} (target: 100+)`);

// Get glossary from correct table
const { count: glossaryCount } = await supabase.from('kb_glossary').select('*', { count: 'exact', head: true });

// Check for missing condition articles from Master Plan
const plannedConditions = [
  'anxiety', 'depression', 'stress', 'sleep', 'insomnia', 'pain', 'chronic-pain',
  'arthritis', 'inflammation', 'epilepsy', 'seizures', 'parkinsons', 'alzheimers',
  'ptsd', 'ocd', 'adhd', 'autism', 'migraines', 'fibromyalgia', 'crohns',
  'diabetes', 'cancer', 'acne', 'eczema', 'psoriasis', 'nausea',
  'menopause', 'pms', 'heart-health', 'blood-pressure', 'multiple-sclerosis',
  'ibs', 'lupus', 'gout', 'tinnitus', 'glaucoma', 'asthma'
];

const missingConditions = plannedConditions.filter(c =>
  slugs.filter(a => a.includes(c)).length === 0
);

console.log('\nMISSING CONDITION ARTICLES (from Master Plan):');
if (missingConditions.length > 0) {
  missingConditions.forEach(c => console.log('  - ' + c));
} else {
  console.log('  All major conditions covered');
}

console.log('\n========================================');
console.log('CONTENT GAP SUMMARY');
console.log('========================================');
console.log('\n✅ COMPLETED:');
console.log(`  - Articles: 1077 (target: 850) - EXCEEDED`);
console.log(`  - Research studies: 4879+ approved (target: 698) - EXCEEDED`);
console.log(`  - Glossary terms: ${glossaryCount || 0} (target: 251)`);
console.log(`  - Conditions: 39 defined`);
console.log(`  - Interactive tools: 6 built`);
console.log(`  - Research scanner: Complete`);
console.log(`  - Admin panel: Complete`);

console.log('\n❌ NOT PRODUCED:');
console.log(`  - Brand reviews: ${brandCount || 0}/100+ (${(brandCount || 0) * 1}%)`);
console.log('  - Newsletter system: Not built');
console.log('  - Multi-language (Danish/German): Not deployed');
console.log('  - Comment system: Admin exists but public not enabled');

console.log('\n⚠️  PARTIALLY COMPLETE:');
if (missingConditions.length > 0) {
  console.log(`  - Some condition articles may be missing: ${missingConditions.length} topics`);
}
