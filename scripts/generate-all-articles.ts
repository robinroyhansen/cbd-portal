#!/usr/bin/env npx tsx
/**
 * Batch Article Generator
 * Generates articles for all conditions that don't have one yet
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  // Get all conditions
  const { data: conditions } = await supabase
    .from('kb_conditions')
    .select('slug, name, research_count')
    .eq('is_published', true)
    .order('research_count', { ascending: false });

  // Get existing articles
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('condition_slug')
    .not('condition_slug', 'is', null);

  const existingSlugs = new Set(articles?.map(a => a.condition_slug) || []);
  const needsArticle = (conditions || []).filter(c => !existingSlugs.has(c.slug));

  console.log(`\n📊 Article Generation Status`);
  console.log(`   Total conditions: ${conditions?.length}`);
  console.log(`   With articles: ${existingSlugs.size}`);
  console.log(`   Need articles: ${needsArticle.length}\n`);

  // Only process conditions that have some research or are important
  const toProcess = needsArticle.filter(c => c.research_count > 0 || c.slug.includes('dog') || c.slug.includes('cat'));

  console.log(`Processing ${toProcess.length} conditions with research or pet-related...\n`);

  let success = 0;
  let failed = 0;

  for (const condition of toProcess) {
    try {
      console.log(`📝 Generating: ${condition.slug} (${condition.research_count || 0} studies)`);

      execSync(`npx tsx scripts/generate-condition-article.ts ${condition.slug}`, {
        stdio: 'pipe',
        timeout: 60000
      });

      success++;
      console.log(`   ✓ Done\n`);
    } catch (error: any) {
      failed++;
      console.log(`   ✗ Failed: ${error.message}\n`);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Completed: ${success} success, ${failed} failed`);
}

main().catch(console.error);
