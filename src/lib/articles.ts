import { createClient } from '@/lib/supabase/server';

export async function getArticles(language: string = 'en', limit: number = 100) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('kb_articles')
    .select(`
      *,
      category:kb_categories(name, slug)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

export async function getArticleBySlug(slug: string, language: string = 'en') {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('kb_articles')
    .select(`
      *,
      category:kb_categories(name, slug),
      citations:kb_citations(id, title, authors, publication, year, url, doi, pmid, slug)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  return { data, error };
}

export async function getCategories(language: string = 'en') {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('kb_categories')
    .select('*')
    .order('name');

  return { data, error };
}

export async function getRelatedArticles(categoryId: string, currentSlug: string, language: string = 'en', limit: number = 3) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('kb_articles')
    .select('title, slug, meta_description')
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .neq('slug', currentSlug)
    .limit(limit);

  return { data, error };
}
