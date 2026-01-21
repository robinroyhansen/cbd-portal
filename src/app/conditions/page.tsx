import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { ConditionsHub } from '@/components/conditions';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'Health Conditions | CBD Portal',
  description: 'Explore research-backed information on how CBD may help with anxiety, pain, sleep, inflammation, and 280+ other health conditions. Search, filter, and find the research you need.',
  alternates: {
    canonical: '/conditions',
  },
};

export default async function ConditionsPage() {
  const supabase = await createClient();

  // Get all published conditions
  const { data: conditions } = await supabase
    .from('kb_conditions')
    .select('id, slug, name, display_name, short_description, category, research_count, is_featured')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  // Get total research studies
  const { count: totalStudies } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Health Conditions', url: 'https://cbd-portal.vercel.app/conditions' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />
      <ConditionsHub
        conditions={conditions || []}
        totalStudies={totalStudies || 0}
      />
    </div>
  );
}
