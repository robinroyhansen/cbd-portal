#!/usr/bin/env npx tsx
/**
 * Find and translate missing research summaries to Danish
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const TRANSLATION_CONTEXT = `You are translating CBD health content for a medical/health information website.

Guidelines:
- Maintain medical accuracy - do not change the meaning
- Use formal but accessible language appropriate for Denmark
- Keep these terms unchanged: CBD, THC, CBG, CBN, CBDA, mg, ml, %
- Keep brand names unchanged
- Preserve all markdown formatting
- Use native Danish medical terminology where appropriate`;

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  console.log('🔍 Finding missing Danish translations...\n');

  // Get all translated research IDs first (paginated)
  const translatedIds = new Set<string>();
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data: translated } = await supabase
      .from('research_translations')
      .select('research_id')
      .eq('language', 'da')
      .range(offset, offset + pageSize - 1);

    if (!translated || translated.length === 0) break;
    translated.forEach(t => translatedIds.add(t.research_id));
    offset += pageSize;
    if (translated.length < pageSize) break;
  }

  console.log(`✅ Found ${translatedIds.size} existing Danish translations`);

  // Get all research with plain_summary (paginated)
  const missing: Array<{ id: string; title: string; plain_summary: string }> = [];
  offset = 0;

  while (true) {
    const { data: research } = await supabase
      .from('kb_research_queue')
      .select('id, title, plain_summary')
      .eq('status', 'approved')
      .not('plain_summary', 'is', null)
      .range(offset, offset + pageSize - 1);

    if (!research || research.length === 0) break;

    for (const r of research) {
      if (!translatedIds.has(r.id)) {
        missing.push(r);
      }
    }

    offset += pageSize;
    if (research.length < pageSize) break;
  }

  console.log(`❌ Found ${missing.length} missing translations\n`);

  if (missing.length === 0) {
    console.log('🎉 All research summaries are already translated!');
    return;
  }

  // Translate missing items
  let translated = 0;
  let errors = 0;

  for (const study of missing) {
    console.log(`🔄 [${translated + 1}/${missing.length}] Translating: ${study.title?.substring(0, 50)}...`);

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `${TRANSLATION_CONTEXT}

Translate this research study plain-language summary from English to Danish:

${study.plain_summary}

Provide ONLY the translated summary:`,
          },
        ],
      });

      const translatedSummary = response.content[0].type === 'text'
        ? response.content[0].text.trim()
        : study.plain_summary;

      const { error: insertError } = await supabase.from('research_translations').insert({
        research_id: study.id,
        language: 'da',
        plain_summary: translatedSummary,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          console.log(`⏭️ Already exists (race condition)`);
        } else {
          console.error(`❌ Save error:`, insertError.message);
          errors++;
        }
      } else {
        console.log(`✅ Saved`);
        translated++;
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 300));
    } catch (error: any) {
      console.error(`❌ Translation error:`, error.message);
      errors++;
    }
  }

  console.log(`\n🎉 Done! Translated: ${translated}, Errors: ${errors}`);
}

main().catch(console.error);
