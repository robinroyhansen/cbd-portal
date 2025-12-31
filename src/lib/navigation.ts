import { createClient } from '@/lib/supabase/server';

export interface NavCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  subcategories: {
    name: string;
    slug: string;
    articleCount: number;
  }[];
  featuredArticles: {
    title: string;
    slug: string;
  }[];
}

export async function getNavigationData(): Promise<NavCategory[]> {
  const supabase = await createClient();

  // Get main categories
  const { data: categories } = await supabase
    .from('kb_categories')
    .select('*')
    .order('name');

  // Get articles with category relationships
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('id, title, slug, category_id, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  // Category icons mapping (since not in database)
  const categoryIcons: Record<string, string> = {
    'conditions': '🏥',
    'products': '🧴',
    'science': '🔬',
    'guides': '📚',
    'legal': '⚖️'
  };

  // Build navigation structure
  const navData: NavCategory[] = (categories || []).map(cat => {
    // Get articles in this category
    const categoryArticles = (articles || []).filter(a =>
      a.category_id === cat.id
    );

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: categoryIcons[cat.slug] || '📄',
      description: cat.description || '',
      subcategories: [], // No subcategories in current structure
      featuredArticles: categoryArticles.slice(0, 3).map(a => ({
        title: a.title,
        slug: a.slug
      }))
    };
  });

  return navData;
}