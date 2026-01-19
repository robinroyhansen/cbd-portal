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

// Master plan cannabinoid articles
const plannedArticles = {
  'Major Cannabinoids (10)': [
    'what-is-cannabidiol',
    'what-is-thc',
    'what-is-cbg',
    'what-is-cbn',
    'what-is-cbc',
    'what-is-cbda',
    'what-is-thca',
    'what-is-cbga',
    'what-is-delta-8-thc',
    'what-is-delta-9-thc'
  ],
  'Minor & Emerging Cannabinoids (12)': [
    'what-is-thcv',
    'what-is-cbdv',
    'what-is-cbe',
    'what-is-cbl',
    'what-is-cbt-cannabinoid',
    'what-is-hhc',
    'what-is-thc-o',
    'what-is-delta-10-thc',
    'what-is-thcp',
    'what-is-cbdp',
    'minor-cannabinoids',
    'synthetic-cannabinoids-dangers'
  ],
  'Cannabinoid Comparisons (18)': [
    'cbd-vs-thc',
    'cbd-vs-cbda',
    'thc-vs-thca',
    'cbd-vs-cbg',
    'cbd-vs-cbn',
    'cbd-vs-cbc',
    'cbd-vs-delta-8',
    'cbg-vs-cbn',
    'cbg-vs-cbga',
    'delta-8-vs-delta-9',
    'delta-8-vs-delta-10',
    'hhc-vs-thc',
    'hhc-vs-delta-8',
    'thc-o-vs-delta-8',
    'cbd-vs-hhc',
    'cbn-vs-melatonin',
    'raw-vs-decarboxylated-cannabinoids',
    'all-cannabinoids-compared'
  ]
};

async function main() {
  // Get all existing articles
  const { data: articles } = await supabase.from('kb_articles')
    .select('slug, title');

  const existingSlugs = new Set(articles?.map(a => a.slug) || []);

  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║           CANNABINOID ARTICLES AUDIT (Master Plan vs DB)           ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  let totalPlanned = 0;
  let totalExists = 0;
  let totalMissing = 0;

  for (const [section, slugs] of Object.entries(plannedArticles)) {
    console.log(`\n=== ${section} ===\n`);

    const exists = [];
    const missing = [];

    for (const slug of slugs) {
      if (existingSlugs.has(slug)) {
        exists.push(slug);
      } else {
        missing.push(slug);
      }
    }

    totalPlanned += slugs.length;
    totalExists += exists.length;
    totalMissing += missing.length;

    console.log(`✅ EXISTS (${exists.length}/${slugs.length}):`);
    exists.forEach(s => console.log(`   ${s}`));

    if (missing.length > 0) {
      console.log(`\n❌ MISSING (${missing.length}):`);
      missing.forEach(s => console.log(`   ${s}`));
    }
  }

  // Also check for "what-is-cbd" which might be different from "what-is-cannabidiol"
  console.log('\n\n=== ADDITIONAL CANNABINOID ARTICLES IN DB ===');
  const cannabinoidKeywords = ['cannabin', 'thc', 'cbg', 'cbn', 'cbc', 'cbd'];
  const additionalArticles = articles?.filter(a => {
    const slugLower = a.slug.toLowerCase();
    return cannabinoidKeywords.some(kw => slugLower.includes(kw)) &&
           !Object.values(plannedArticles).flat().includes(a.slug);
  }) || [];

  if (additionalArticles.length > 0) {
    additionalArticles.forEach(a => console.log(`   ${a.slug} - "${a.title}"`));
  } else {
    console.log('   (none)');
  }

  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                           SUMMARY                                  ║');
  console.log('╠════════════════════════════════════════════════════════════════════╣');
  console.log(`║  Planned:  ${totalPlanned.toString().padStart(3)} articles                                         ║`);
  console.log(`║  Exists:   ${totalExists.toString().padStart(3)} articles                                         ║`);
  console.log(`║  Missing:  ${totalMissing.toString().padStart(3)} articles                                         ║`);
  console.log(`║  Complete: ${Math.round((totalExists/totalPlanned)*100).toString().padStart(3)}%                                                  ║`);
  console.log('╚════════════════════════════════════════════════════════════════════╝');
}
main();
