import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { DemographicsHub } from '@/components/demographics';

export const metadata: Metadata = {
  title: 'CBD for You | Age & Lifestyle Specific Guides | CBD Portal',
  description: 'CBD information tailored for specific groups: seniors, athletes, women, professionals, students, and more. Find content relevant to your lifestyle.',
  alternates: {
    canonical: '/categories/demographics',
  },
};

export default async function DemographicsPage() {
  const supabase = await createClient();

  // Get demographics category
  const { data: category } = await supabase
    .from('kb_categories')
    .select('*')
    .eq('slug', 'demographics')
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
    { name: 'CBD for You', url: 'https://cbd-portal.vercel.app/categories/demographics' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />
      <DemographicsHub articles={articles || []} />
    </div>
  );
}
