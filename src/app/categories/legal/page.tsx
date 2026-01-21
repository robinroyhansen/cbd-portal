import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { LegalHub } from '@/components/legal';

export const metadata: Metadata = {
  title: 'CBD Legal & Regulations | Laws, Compliance & Travel | CBD Portal',
  description: 'Navigate CBD laws and regulations: legal status, compliance requirements, traveling with CBD, and workplace considerations.',
  alternates: {
    canonical: '/categories/legal',
  },
};

export default async function LegalPage() {
  const supabase = await createClient();

  // Get legal category
  const { data: category } = await supabase
    .from('kb_categories')
    .select('*')
    .eq('slug', 'legal')
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
    { name: 'Legal & Regulations', url: 'https://cbd-portal.vercel.app/categories/legal' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />
      <LegalHub articles={articles || []} />
    </div>
  );
}
