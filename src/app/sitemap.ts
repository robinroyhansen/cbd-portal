import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cbd-portal.vercel.app';
  const supabase = await createClient();

  // Fetch all published articles
  const { data } = await supabase
    .from('kb_articles')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const articles = data as Array<{ slug: string; updated_at: string | null; published_at: string | null }> | null;

  // Fetch all categories
  const { data: categoriesData } = await supabase
    .from('kb_categories')
    .select('slug')
    .gt('article_count', 0);

  const categories = categoriesData as Array<{ slug: string }> | null;

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Article pages
  const articlePages = (articles || []).map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: new Date(article.updated_at || article.published_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Category pages
  const categoryPages = (categories || []).map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...articlePages, ...categoryPages];
}
