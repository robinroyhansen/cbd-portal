import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bvrdryvgqarffgdujmjz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY'
);

async function run() {
  console.log('========================================');
  console.log('SLUG TRANSLATION VERIFICATION REPORT');
  console.log('========================================\n');

  // 1. Total counts per language
  console.log('--- 1. TOTAL TRANSLATION COUNTS ---\n');

  const { count: condTotal } = await supabase.from('kb_conditions').select('*', { count: 'exact', head: true });
  const { count: glossTotal } = await supabase.from('kb_glossary').select('*', { count: 'exact', head: true });
  const { count: artTotal } = await supabase.from('kb_articles').select('*', { count: 'exact', head: true });
  console.log(`Source table totals: conditions=${condTotal}, glossary=${glossTotal}, articles=${artTotal}\n`);

  for (const lang of ['no', 'da']) {
    const { count: ct } = await supabase.from('condition_translations').select('*', { count: 'exact', head: true }).eq('language', lang);
    const { count: gt } = await supabase.from('glossary_translations').select('*', { count: 'exact', head: true }).eq('language', lang);
    const { count: at } = await supabase.from('article_translations').select('*', { count: 'exact', head: true }).eq('language', lang);
    console.log(`${lang.toUpperCase()} => condition_translations: ${ct}/${condTotal}, glossary_translations: ${gt}/${glossTotal}, article_translations: ${at}/${artTotal}`);
  }

  // 2. NULL slug counts
  console.log('\n--- 2. NULL SLUG COUNTS ---\n');

  for (const lang of ['no', 'da']) {
    const { count: ctNull } = await supabase.from('condition_translations').select('*', { count: 'exact', head: true }).eq('language', lang).is('slug', null);
    const { count: gtNull } = await supabase.from('glossary_translations').select('*', { count: 'exact', head: true }).eq('language', lang).is('slug', null);
    const { count: atNull } = await supabase.from('article_translations').select('*', { count: 'exact', head: true }).eq('language', lang).is('slug', null);
    console.log(`${lang.toUpperCase()} NULL slugs => conditions: ${ctNull}, glossary: ${gtNull}, articles: ${atNull}`);
  }

  // 3. Slugs identical to English source
  console.log('\n--- 3. SLUGS IDENTICAL TO ENGLISH SOURCE ---\n');

  // For conditions: join condition_translations with kb_conditions
  for (const lang of ['no', 'da']) {
    // Get all condition translations with their condition_id and slug
    const { data: condTrans } = await supabase
      .from('condition_translations')
      .select('condition_id, slug')
      .eq('language', lang)
      .not('slug', 'is', null);

    if (condTrans && condTrans.length > 0) {
      const condIds = condTrans.map(ct => ct.condition_id);
      const { data: conditions } = await supabase
        .from('kb_conditions')
        .select('id, slug')
        .in('id', condIds);

      if (conditions) {
        const condMap = new Map(conditions.map(c => [c.id, c.slug]));
        let identicalCount = 0;
        const identicalExamples: string[] = [];
        for (const ct of condTrans) {
          const englishSlug = condMap.get(ct.condition_id);
          if (englishSlug && ct.slug === englishSlug) {
            identicalCount++;
            if (identicalExamples.length < 5) {
              identicalExamples.push(ct.slug);
            }
          }
        }
        console.log(`${lang.toUpperCase()} conditions: ${identicalCount}/${condTrans.length} slugs identical to English`);
        if (identicalExamples.length > 0) {
          console.log(`  Examples: ${identicalExamples.join(', ')}`);
        }
      }
    } else {
      console.log(`${lang.toUpperCase()} conditions: No non-null slugs found`);
    }
  }

  // For glossary: join glossary_translations with kb_glossary
  for (const lang of ['no', 'da']) {
    const { data: glossTrans } = await supabase
      .from('glossary_translations')
      .select('glossary_id, slug')
      .eq('language', lang)
      .not('slug', 'is', null);

    if (glossTrans && glossTrans.length > 0) {
      const glossIds = glossTrans.map(gt => gt.glossary_id);
      const { data: glossary } = await supabase
        .from('kb_glossary')
        .select('id, slug')
        .in('id', glossIds);

      if (glossary) {
        const glossMap = new Map(glossary.map(g => [g.id, g.slug]));
        let identicalCount = 0;
        const identicalExamples: string[] = [];
        for (const gt of glossTrans) {
          const englishSlug = glossMap.get(gt.glossary_id);
          if (englishSlug && gt.slug === englishSlug) {
            identicalCount++;
            if (identicalExamples.length < 5) {
              identicalExamples.push(gt.slug);
            }
          }
        }
        console.log(`${lang.toUpperCase()} glossary: ${identicalCount}/${glossTrans.length} slugs identical to English`);
        if (identicalExamples.length > 0) {
          console.log(`  Examples: ${identicalExamples.join(', ')}`);
        }
      }
    } else {
      console.log(`${lang.toUpperCase()} glossary: No non-null slugs found`);
    }
  }

  // For articles: join article_translations with kb_articles
  for (const lang of ['no', 'da']) {
    // article_translations may have many rows, fetch in batches
    let offset = 0;
    const batchSize = 1000;
    let identicalCount = 0;
    let totalWithSlug = 0;
    const identicalExamples: string[] = [];

    while (true) {
      const { data: artTrans } = await supabase
        .from('article_translations')
        .select('article_id, slug')
        .eq('language', lang)
        .not('slug', 'is', null)
        .range(offset, offset + batchSize - 1);

      if (!artTrans || artTrans.length === 0) break;

      totalWithSlug += artTrans.length;
      const artIds = artTrans.map(at => at.article_id);
      const { data: articles } = await supabase
        .from('kb_articles')
        .select('id, slug')
        .in('id', artIds);

      if (articles) {
        const artMap = new Map(articles.map(a => [a.id, a.slug]));
        for (const at of artTrans) {
          const englishSlug = artMap.get(at.article_id);
          if (englishSlug && at.slug === englishSlug) {
            identicalCount++;
            if (identicalExamples.length < 5) {
              identicalExamples.push(at.slug);
            }
          }
        }
      }

      if (artTrans.length < batchSize) break;
      offset += batchSize;
    }

    console.log(`${lang.toUpperCase()} articles: ${identicalCount}/${totalWithSlug} slugs identical to English`);
    if (identicalExamples.length > 0) {
      console.log(`  Examples: ${identicalExamples.join(', ')}`);
    }
  }

  // 4. Sample some properly translated slugs for verification
  console.log('\n--- 4. SAMPLE TRANSLATED SLUGS (non-identical to English) ---\n');

  for (const lang of ['no', 'da']) {
    // Condition samples
    const { data: condSamples } = await supabase
      .from('condition_translations')
      .select('condition_id, slug, name')
      .eq('language', lang)
      .not('slug', 'is', null)
      .limit(500);

    if (condSamples) {
      const condIds = condSamples.map(c => c.condition_id);
      const { data: srcConds } = await supabase
        .from('kb_conditions')
        .select('id, slug, name')
        .in('id', condIds);

      if (srcConds) {
        const srcMap = new Map(srcConds.map(c => [c.id, c]));
        const translated = condSamples.filter(ct => {
          const src = srcMap.get(ct.condition_id);
          return src && ct.slug !== src.slug;
        });
        console.log(`${lang.toUpperCase()} conditions - properly translated slug samples (${translated.length} total):`);
        for (const t of translated.slice(0, 5)) {
          const src = srcMap.get(t.condition_id);
          console.log(`  EN: ${src?.slug} -> ${lang.toUpperCase()}: ${t.slug} (${src?.name} -> ${t.name})`);
        }
      }
    }

    // Article samples
    const { data: artSamples } = await supabase
      .from('article_translations')
      .select('article_id, slug, title')
      .eq('language', lang)
      .not('slug', 'is', null)
      .limit(500);

    if (artSamples) {
      const artIds = artSamples.map(a => a.article_id);
      const { data: srcArts } = await supabase
        .from('kb_articles')
        .select('id, slug, title')
        .in('id', artIds);

      if (srcArts) {
        const srcMap = new Map(srcArts.map(a => [a.id, a]));
        const translated = artSamples.filter(at => {
          const src = srcMap.get(at.article_id);
          return src && at.slug !== src.slug;
        });
        console.log(`${lang.toUpperCase()} articles - properly translated slug samples (${translated.length} of ${artSamples.length} checked):`);
        for (const t of translated.slice(0, 5)) {
          const src = srcMap.get(t.article_id);
          console.log(`  EN: ${src?.slug} -> ${lang.toUpperCase()}: ${t.slug}`);
        }
      }
    }
    console.log('');
  }

  console.log('========================================');
  console.log('END OF REPORT');
  console.log('========================================');
}

run().catch(console.error);
