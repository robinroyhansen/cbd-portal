import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Get all published articles
  let articles: any[] = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('kb_articles')
      .select('id, slug, title, content, meta_description')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    articles = articles.concat(data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  // Get existing German translations
  const { data: existingTranslations } = await supabase
    .from('article_translations')
    .select('article_id')
    .eq('language', 'de');

  const translatedIds = new Set(existingTranslations?.map(t => t.article_id) || []);
  const untranslated = articles.filter(a => !translatedIds.has(a.id));

  console.log(JSON.stringify({
    total: articles.length,
    translated: translatedIds.size,
    remaining: untranslated.length,
    articles: untranslated.slice(0, 10)
  }, null, 2));
}

main().catch(console.error);
