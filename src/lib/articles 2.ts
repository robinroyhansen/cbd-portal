import { createClient } from '@/lib/supabase/server';

export async function getArticles(language: string = 'en') {
  const supabase = await createClient();

  // Use correct table names: articles and categories
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(name, slug)
    `)
    .eq('published', true)
    .order('published_date', { ascending: false });

  return { data, error };
}

export async function getArticleBySlug(slug: string, language: string = 'en') {
  const supabase = await createClient();

  // Use correct table names: articles and categories
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(name, slug)
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  return { data, error };
}

export async function getCategories(language: string = 'en') {
  const supabase = await createClient();

  // Use correct table name: categories
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return { data, error };
}

export async function getRelatedArticles(categoryId: string, currentSlug: string, language: string = 'en', limit: number = 3) {
  const supabase = await createClient();

  // Use correct table name: articles
  const { data, error } = await supabase
    .from('articles')
    .select('title, slug, meta_description')
    .eq('category_id', categoryId)
    .eq('published', true)
    .neq('slug', currentSlug)
    .limit(limit);

  return { data, error };
}