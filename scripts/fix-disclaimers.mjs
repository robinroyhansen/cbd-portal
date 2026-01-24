/**
 * Fix Disclaimers - Add to articles missing them
 *
 * Carefully checks for existing disclaimers to avoid duplicates
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

const DISCLAIMER_TEXT = `---

**Medical Disclaimer:** This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.`;

/**
 * Thorough check for existing disclaimer
 */
function hasDisclaimer(content) {
  if (!content) return false;
  const lower = content.toLowerCase();
  return (
    lower.includes('medical disclaimer') ||
    lower.includes('**disclaimer:**') ||
    lower.includes('**disclaimer**:') ||
    lower.includes('## disclaimer') ||
    lower.includes('### disclaimer') ||
    lower.includes('this article is for informational purposes only') ||
    lower.includes('does not constitute medical advice') ||
    lower.includes('consult a healthcare professional before') ||
    lower.includes('not intended as medical advice') ||
    lower.includes('seek professional medical advice') ||
    lower.includes('this content is not medical advice') ||
    lower.includes('consult your doctor') ||
    lower.includes('consult with a healthcare') ||
    lower.includes('not a substitute for professional medical advice') ||
    (lower.includes('informational purposes') && lower.includes('not medical advice')) ||
    (lower.includes('informational purposes') && lower.includes('consult'))
  );
}

/**
 * Add disclaimer at the end of article
 */
function addDisclaimer(content) {
  return content.trimEnd() + '\n\n' + DISCLAIMER_TEXT;
}

async function main() {
  console.log('\n⚕️  Fix Disclaimers\n');
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN' : '✏️  APPLY CHANGES'}\n`);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('id, slug, content')
    .not('content', 'is', null);

  if (error) {
    console.error('Failed to fetch articles:', error.message);
    process.exit(1);
  }

  let added = 0, alreadyHas = 0;

  for (const article of articles) {
    if (hasDisclaimer(article.content)) {
      alreadyHas++;
      continue;
    }

    added++;

    if (!DRY_RUN) {
      const updatedContent = addDisclaimer(article.content);
      await supabase
        .from('kb_articles')
        .update({ content: updatedContent, updated_at: new Date().toISOString() })
        .eq('id', article.id);
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Already had disclaimer: ${alreadyHas}`);
  console.log(`  Disclaimers ${DRY_RUN ? 'would be ' : ''}added: ${added}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (!DRY_RUN && added > 0) {
    console.log(`\n✅ Added disclaimers to ${added} articles`);
  }
}

main().catch(console.error);
