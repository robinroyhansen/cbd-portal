import { createClient } from '@/lib/supabase/server';

export async function getArticles(language: string = 'en', limit: number = 100) {
  const supabase = await createClient();

  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select(`
      *,
      category:kb_categories(name, slug)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error || !articles) {
    return { data: articles, error };
  }

  // If English, return as-is
  if (language === 'en') {
    return { data: articles, error: null };
  }

  // Fetch translations for non-English languages
  const articleIds = articles.map(a => a.id);
  const { data: translations } = await supabase
    .from('article_translations')
    .select('article_id, title, meta_description, excerpt')
    .eq('language', language)
    .in('article_id', articleIds);

  const translationMap = new Map(
    (translations || []).map(t => [t.article_id, t])
  );

  // Merge translations with articles
  const translatedArticles = articles.map(article => {
    const trans = translationMap.get(article.id);
    return {
      ...article,
      title: trans?.title || article.title,
      meta_description: trans?.meta_description || article.meta_description,
      excerpt: trans?.excerpt || article.excerpt,
    };
  });

  return { data: translatedArticles, error: null };
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
