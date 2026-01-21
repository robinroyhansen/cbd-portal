import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { CBDBasicsHub } from '@/components/cbd-basics';

export const metadata: Metadata = {
  title: 'CBD Basics | Complete Beginner\'s Guide | CBD Portal',
  description: 'Master CBD fundamentals with 32+ comprehensive guides. From complete beginners to those seeking scientific understanding - find your learning path here.',
  alternates: {
    canonical: '/categories/cbd-basics',
  },
};

export default async function CBDBasicsPage() {
  const supabase = await createClient();

  // Get cbd-basics category
  const { data: category } = await supabase
    .from('kb_categories')
    .select('*')
    .eq('slug', 'cbd-basics')
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
    { name: 'CBD Basics', url: 'https://cbd-portal.vercel.app/categories/cbd-basics' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />
      <CBDBasicsHub articles={articles || []} />
    </div>
  );
}
