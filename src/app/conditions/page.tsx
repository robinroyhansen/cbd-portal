import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { ConditionsHub } from '@/components/conditions';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'Health Conditions | CBD Portal',
  description: 'Explore research-backed information on how CBD may help with anxiety, pain, sleep, inflammation, and 300+ other health conditions. Search, filter, and find the research you need.',
  alternates: {
    canonical: '/conditions',
  },
};

export default async function ConditionsPage() {
  const supabase = await createClient();

  // Get all published conditions with topic_keywords for research matching
  const { data: conditions } = await supabase
    .from('kb_conditions')
    .select('id, slug, name, display_name, short_description, category, research_count, is_featured, topic_keywords')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  // Get total research studies
  const { count: totalStudies } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  // Get all approved research with their topics for counting
  const { data: allResearch } = await supabase
    .from('kb_research_queue')
    .select('primary_topic, relevant_topics')
    .eq('status', 'approved');

  // Get articles linked to conditions (by condition slug in article metadata or tags)
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('slug, tags')
    .eq('status', 'published');

  // Count research per condition based on topic_keywords match
  const researchCounts: Record<string, number> = {};
  const articleCounts: Record<string, number> = {};

  if (conditions && allResearch) {
    conditions.forEach(condition => {
      const keywords = condition.topic_keywords || [];
      let count = 0;

      // Count research that matches any of the condition's topic keywords
      allResearch.forEach(research => {
        const topics = [research.primary_topic, ...(research.relevant_topics || [])].filter(Boolean);
        if (keywords.some(keyword => topics.includes(keyword))) {
          count++;
        }
      });

      researchCounts[condition.id] = count;
    });
  }

  // Count articles per condition (checking if condition slug is in article tags)
  if (conditions && articles) {
    conditions.forEach(condition => {
      let count = 0;
      articles.forEach(article => {
        const tags = article.tags || [];
        // Check if article is tagged with this condition's slug or name
        if (tags.some((tag: string) =>
          tag.toLowerCase() === condition.slug.toLowerCase() ||
          tag.toLowerCase() === condition.name.toLowerCase()
        )) {
          count++;
        }
      });
      articleCounts[condition.id] = count;
    });
  }

  // Merge counts into conditions
  const conditionsWithCounts = (conditions || []).map(condition => ({
    ...condition,
    // Use dynamically calculated count if research_count is 0 or null
    research_count: condition.research_count || researchCounts[condition.id] || 0,
    article_count: articleCounts[condition.id] || 0,
  }));

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Health Conditions', url: 'https://cbd-portal.vercel.app/conditions' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />
      <ConditionsHub
        conditions={conditionsWithCounts}
        totalStudies={totalStudies || 0}
      />
    </div>
  );
}
