/**
 * Verify Condition Articles
 * Checks that all 12 condition articles were properly inserted
 *
 * Run with: node scripts/verify-condition-articles.mjs
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

const EXPECTED_SLUGS = [
  'cbd-and-cluster-headaches',
  'cbd-and-tension-headaches',
  'cbd-and-occipital-neuralgia',
  'cbd-and-tmj',
  'cbd-and-tooth-pain',
  'cbd-and-mouth-ulcers',
  'cbd-and-gum-disease',
  'cbd-and-seasonal-allergies',
  'cbd-and-sinusitis',
  'cbd-and-bronchitis',
  'cbd-and-copd',
  'cbd-and-colds-flu'
];

async function main() {
  console.log('='.repeat(70));
  console.log('  VERIFYING CONDITION ARTICLES');
  console.log('='.repeat(70));

  // Query all our articles
  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('id, slug, title, status, language, condition_slug, article_type, reading_time, created_at, template_data')
    .in('slug', EXPECTED_SLUGS);

  if (error) {
    console.error('Error querying articles:', error);
    return;
  }

  console.log(`\nFound ${articles.length} of ${EXPECTED_SLUGS.length} expected articles\n`);

  // Check each expected slug
  console.log('-'.repeat(100));
  console.log('Slug'.padEnd(35) + 'Status'.padStart(12) + 'Evidence'.padStart(15) + 'Words'.padStart(10) + 'Condition'.padStart(25));
  console.log('-'.repeat(100));

  for (const expectedSlug of EXPECTED_SLUGS) {
    const article = articles.find(a => a.slug === expectedSlug);
    if (article) {
      const evidenceLevel = article.template_data?.evidence_level || 'N/A';
      const wordCount = article.reading_time ? article.reading_time * 200 : 'N/A';
      console.log(
        expectedSlug.padEnd(35) +
        article.status.padStart(12) +
        evidenceLevel.padStart(15) +
        String(wordCount).padStart(10) +
        (article.condition_slug || 'N/A').padStart(25)
      );
    } else {
      console.log(expectedSlug.padEnd(35) + 'MISSING'.padStart(12));
    }
  }
  console.log('-'.repeat(100));

  // Summary
  const published = articles.filter(a => a.status === 'published').length;
  const withConditionSlug = articles.filter(a => a.condition_slug).length;
  const withTemplateData = articles.filter(a => a.template_data).length;

  console.log(`\nSUMMARY:`);
  console.log(`  Total articles found: ${articles.length}/${EXPECTED_SLUGS.length}`);
  console.log(`  Published: ${published}`);
  console.log(`  With condition_slug: ${withConditionSlug}`);
  console.log(`  With template_data: ${withTemplateData}`);

  if (articles.length === EXPECTED_SLUGS.length) {
    console.log(`\n  SUCCESS: All ${EXPECTED_SLUGS.length} condition articles verified!`);
  } else {
    const missing = EXPECTED_SLUGS.filter(slug => !articles.find(a => a.slug === slug));
    console.log(`\n  WARNING: Missing articles:`);
    missing.forEach(slug => console.log(`    - ${slug}`));
  }
}

main().catch(console.error);
