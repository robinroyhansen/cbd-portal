import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { ComparisonsHub } from '@/components/comparisons';

export const metadata: Metadata = {
  title: 'CBD Comparisons | CBD vs THC, Products & More | CBD Portal',
  description: 'Side-by-side CBD comparisons: CBD vs THC, full spectrum vs isolate, oils vs gummies, and more. Make informed decisions with our detailed comparison guides.',
  alternates: {
    canonical: '/categories/comparisons',
  },
};

export default async function ComparisonsPage() {
  const supabase = await createClient();

  // Get comparisons category
  const { data: category } = await supabase
    .from('kb_categories')
    .select('*')
    .eq('slug', 'comparisons')
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
    { name: 'Comparisons', url: 'https://cbd-portal.vercel.app/categories/comparisons' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />
      <ComparisonsHub articles={articles || []} />
    </div>
  );
}
