import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { ProductsHub } from '@/components/products';

export const metadata: Metadata = {
  title: 'CBD Products Guide | Oils, Edibles, Topicals & More | CBD Portal',
  description: 'Complete guide to CBD product types: oils, tinctures, edibles, topicals, vapes, and more. Compare onset times, bioavailability, and find your perfect product.',
  alternates: {
    canonical: '/categories/products',
  },
};

export default async function ProductsPage() {
  const supabase = await createClient();

  // Get products category
  const { data: category } = await supabase
    .from('kb_categories')
    .select('*')
    .eq('slug', 'products')
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
    { name: 'CBD Products', url: 'https://cbd-portal.vercel.app/categories/products' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />
      <ProductsHub articles={articles || []} />
    </div>
  );
}
