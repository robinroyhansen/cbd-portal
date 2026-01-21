import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { GuidesHub } from '@/components/guides';

export const metadata: Metadata = {
  title: 'CBD Guides & How-To | Practical CBD Guides | CBD Portal',
  description: 'Practical CBD guides for every step of your journey. From getting started to advanced usage, dosing, quality verification, and lifestyle integration.',
  alternates: {
    canonical: '/categories/guides',
  },
};

export default async function GuidesPage() {
  const supabase = await createClient();

  // Get guides category
  const { data: category } = await supabase
    .from('kb_categories')
    .select('*')
    .eq('slug', 'guides')
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
    { name: 'Guides & How-To', url: 'https://cbd-portal.vercel.app/categories/guides' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />
      <GuidesHub articles={articles || []} />
    </div>
  );
}
