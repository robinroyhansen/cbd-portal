import { createClient } from '@/lib/supabase/server';

export async function getArticles(language: string = 'en') {
  const supabase = await createClient();

  // Temporarily remove language filter until migration is run
  const { data, error } = await supabase
    .from('kb_articles')
    .select(`
      *,
      category:kb_categories(name, slug)
    `)
    // .eq('language', language) // TODO: Uncomment after migration
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  return { data, error };
}

export async function getArticleBySlug(slug: string, language: string = 'en') {
  const supabase = await createClient();

  // Temporarily remove language filter until migration is run
  const { data, error } = await supabase
    .from('kb_articles')
    .select(`
      *,
      category:kb_categories(name, slug),
      citations:kb_citations(*)
    `)
    // .eq('language', language) // TODO: Uncomment after migration
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  return { data, error };
}

export async function getCategories(language: string = 'en') {
  const supabase = await createClient();

  // Temporarily remove language filter until migration is run
  const { data, error } = await supabase
    .from('kb_categories')
    .select('*')
    // .eq('language', language) // TODO: Uncomment after migration
    .order('name');

  return { data, error };
}

export async function getRelatedArticles(categoryId: string, currentSlug: string, language: string = 'en', limit: number = 3) {
  const supabase = await createClient();

  // Temporarily remove language filter until migration is run
  const { data, error } = await supabase
    .from('kb_articles')
    .select('title, slug, excerpt')
    .eq('category_id', categoryId)
    // .eq('language', language) // TODO: Uncomment after migration
    .eq('status', 'published')
    .neq('slug', currentSlug)
    .limit(limit);

  return { data, error };
}