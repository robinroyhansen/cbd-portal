import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { ScienceHub } from '@/components/science';

export const metadata: Metadata = {
  title: 'CBD Science | Research, ECS & Pharmacology | CBD Portal',
  description: 'Explore the science behind CBD: endocannabinoid system, mechanisms of action, clinical research, and pharmacology. Evidence-based information from peer-reviewed studies.',
  alternates: {
    canonical: '/categories/science',
  },
};

export default async function SciencePage() {
  const supabase = await createClient();

  // Get science category
  const { data: category } = await supabase
    .from('kb_categories')
    .select('*')
    .eq('slug', 'science')
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
    { name: 'CBD Science', url: 'https://cbd-portal.vercel.app/categories/science' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />
      <ScienceHub articles={articles || []} />
    </div>
  );
}
