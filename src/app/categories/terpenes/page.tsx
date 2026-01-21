import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { TerpenesHub } from '@/components/terpenes';

export const metadata: Metadata = {
  title: 'Terpenes Guide | Aromatic Compounds in CBD | CBD Portal',
  description: 'Complete guide to terpenes in CBD: myrcene, limonene, linalool, pinene, and more. Learn about aromas, effects, and the entourage effect.',
  alternates: {
    canonical: '/categories/terpenes',
  },
};

export default async function TerpenesPage() {
  const supabase = await createClient();

  // Get terpenes category
  const { data: category } = await supabase
    .from('kb_categories')
    .select('*')
    .eq('slug', 'terpenes')
    .single();

  // Get all articles
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('slug, title, excerpt, reading_time, updated_at')
    .eq('category_id', category?.id)
    .eq('status', 'published')
    .order('title');

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Topics', url: 'https://cbd-portal.vercel.app/categories' },
    { name: 'Terpenes', url: 'https://cbd-portal.vercel.app/categories/terpenes' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />
      <TerpenesHub articles={articles || []} />
    </div>
  );
}
