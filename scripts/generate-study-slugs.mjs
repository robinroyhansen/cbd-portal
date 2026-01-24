/**
 * Generate Slugs for Research Studies
 *
 * Creates URL-friendly slugs for studies missing them
 * Enables linking to /research/study/[slug] pages
 *
 * Usage:
 *   node scripts/generate-study-slugs.mjs --dry-run
 *   node scripts/generate-study-slugs.mjs
 *   node scripts/generate-study-slugs.mjs --limit=100
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '10000', 10);
const VERBOSE = args.includes('--verbose');

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title, year, id) {
  if (!title) return null;

  // Clean and normalize title
  let slug = title
    .toLowerCase()
    .trim()
    // Remove special characters but keep spaces and hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Truncate to reasonable length (60 chars for slug part)
    .substring(0, 60)
    // Remove trailing hyphen after truncation
    .replace(/-+$/, '');

  // Add year if available for uniqueness
  if (year) {
    slug = `${slug}-${year}`;
  }

  // Add short ID suffix for guaranteed uniqueness
  const idSuffix = id.substring(0, 6);
  slug = `${slug}-${idSuffix}`;

  return slug;
}

async function main() {
  console.log('\n🔗 Generate Study Slugs\n');
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN' : '✏️  APPLY CHANGES'}`);
  console.log(`Limit: ${LIMIT}\n`);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get total counts
  const { count: totalStudies } = await supabase
    .from('kb_research_queue')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: withSlugs } = await supabase
    .from('kb_research_queue')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')
    .not('slug', 'is', null);

  console.log(`📚 Approved studies: ${totalStudies}`);
  console.log(`   With slugs: ${withSlugs}`);
  console.log(`   Missing slugs: ${totalStudies - withSlugs}\n`);

  // Fetch studies without slugs
  const { data: studies, error } = await supabase
    .from('kb_research_queue')
    .select('id, title, year')
    .eq('status', 'approved')
    .is('slug', null)
    .limit(LIMIT);

  if (error) {
    console.error('Failed to fetch:', error.message);
    process.exit(1);
  }

  console.log(`Processing ${studies.length} studies...\n`);

  let updated = 0;
  let skipped = 0;
  const slugsGenerated = new Set();

  // Process in batches for efficiency
  const BATCH_SIZE = 100;
  const batches = [];

  for (let i = 0; i < studies.length; i += BATCH_SIZE) {
    batches.push(studies.slice(i, i + BATCH_SIZE));
  }

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const updates = [];

    for (const study of batch) {
      const slug = generateSlug(study.title, study.year, study.id);

      if (!slug) {
        skipped++;
        continue;
      }

      // Check for duplicates within this run
      if (slugsGenerated.has(slug)) {
        // Add extra uniqueness
        const uniqueSlug = `${slug}-${study.id.substring(6, 10)}`;
        updates.push({ id: study.id, slug: uniqueSlug });
        slugsGenerated.add(uniqueSlug);
      } else {
        updates.push({ id: study.id, slug });
        slugsGenerated.add(slug);
      }

      if (VERBOSE) {
        console.log(`  ${study.title?.substring(0, 50)}...`);
        console.log(`    -> ${slug}`);
      }
    }

    if (!DRY_RUN && updates.length > 0) {
      // Update in batch
      for (const update of updates) {
        await supabase
          .from('kb_research_queue')
          .update({ slug: update.slug })
          .eq('id', update.id);
      }
    }

    updated += updates.length;

    // Progress
    const progress = Math.round(((batchIdx + 1) / batches.length) * 100);
    process.stdout.write(`  Progress: ${progress}% (${updated}/${studies.length})\r`);
  }

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Slugs ${DRY_RUN ? 'would be ' : ''}generated: ${updated}`);
  console.log(`  Skipped (no title): ${skipped}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (!DRY_RUN && updated > 0) {
    // Check new coverage
    const { count: newWithSlugs } = await supabase
      .from('kb_research_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .not('slug', 'is', null);

    console.log(`\n✅ Generated ${updated} study slugs`);
    console.log(`   New coverage: ${newWithSlugs}/${totalStudies} (${Math.round(newWithSlugs/totalStudies*100)}%)`);
  }
}

main().catch(console.error);
