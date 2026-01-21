import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { HempHub } from '@/components/hemp-cultivation';

export const metadata: Metadata = {
  title: 'Hemp & Cultivation | Growing, Processing & Sustainability | CBD Portal',
  description: 'Complete guide to hemp cultivation: growing practices, CBD extraction, processing methods, sustainability, and the hemp industry.',
  alternates: {
    canonical: '/categories/hemp-cultivation',
  },
};

export default async function HempCultivationPage() {
  const supabase = await createClient();

  // Get hemp-cultivation category
  const { data: category } = await supabase
    .from('kb_categories')
    .select('*')
    .eq('slug', 'hemp-cultivation')
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
    { name: 'Hemp & Cultivation', url: 'https://cbd-portal.vercel.app/categories/hemp-cultivation' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />
      <HempHub articles={articles || []} />
    </div>
  );
}
