import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { SafetyHub } from '@/components/safety';

export const metadata: Metadata = {
  title: 'CBD Safety & Quality | Drug Interactions & Side Effects | CBD Portal',
  description: 'Essential CBD safety information: drug interactions, side effects, quality indicators, third-party testing, and who should avoid CBD. Your safety is our priority.',
  alternates: {
    canonical: '/categories/safety-quality',
  },
};

export default async function SafetyQualityPage() {
  const supabase = await createClient();

  // Get safety-quality category
  const { data: category } = await supabase
    .from('kb_categories')
    .select('*')
    .eq('slug', 'safety-quality')
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
    { name: 'Safety & Quality', url: 'https://cbd-portal.vercel.app/categories/safety-quality' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />
      <SafetyHub articles={articles || []} />
    </div>
  );
}
