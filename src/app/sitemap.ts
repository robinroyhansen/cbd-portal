import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cbd-portal.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use service role client to bypass RLS for sitemap generation
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/research`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/research/methodology`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/glossary`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/reviews`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/reviews/methodology`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/articles`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/authors`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/tags`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/tools`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/tools/dosage-calculator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/tools/animal-dosage-calculator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms-of-service`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/cookie-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/editorial-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/medical-disclaimer`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  ];

  // Research studies (~698)
  const { data: studies } = await supabase
    .from('kb_research_queue')
    .select('slug')
    .eq('status', 'approved')
    .not('slug', 'is', null);

  const studyPages: MetadataRoute.Sitemap = (studies || []).map(study => ({
    url: `${SITE_URL}/research/study/${study.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Glossary terms (~262) with last modified dates
  const { data: glossaryTerms } = await supabase
    .from('kb_glossary')
    .select('slug, updated_at');

  const glossaryPages: MetadataRoute.Sitemap = (glossaryTerms || []).map(term => ({
    url: `${SITE_URL}/glossary/${term.slug}`,
    lastModified: term.updated_at ? new Date(term.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Glossary category pages (high SEO value)
  const glossaryCategories = [
    'cannabinoids', 'terpenes', 'products', 'extraction', 'science',
    'research', 'side-effects', 'conditions', 'testing', 'legal', 'dosing', 'plant'
  ];
  const glossaryCategoryPages: MetadataRoute.Sitemap = glossaryCategories.map(category => ({
    url: `${SITE_URL}/glossary/category/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Brand reviews (published brands)
  const { data: brands } = await supabase
    .from('kb_brands')
    .select('slug')
    .eq('is_published', true);

  const reviewPages: MetadataRoute.Sitemap = (brands || []).map(brand => ({
    url: `${SITE_URL}/reviews/${brand.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Articles
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('slug')
    .eq('status', 'published');

  const articlePages: MetadataRoute.Sitemap = (articles || []).map(article => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Categories
  const { data: categories } = await supabase
    .from('kb_categories')
    .select('slug');

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map(category => ({
    url: `${SITE_URL}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Authors
  const { data: authors } = await supabase
    .from('kb_authors')
    .select('slug')
    .eq('is_active', true);

  const authorPages: MetadataRoute.Sitemap = (authors || []).map(author => ({
    url: `${SITE_URL}/authors/${author.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  // Health topics (research condition pages)
  const { data: topics } = await supabase
    .from('kb_research_queue')
    .select('relevant_topics')
    .eq('status', 'approved');

  const uniqueTopics = new Set<string>();
  topics?.forEach(study => {
    if (Array.isArray(study.relevant_topics)) {
      study.relevant_topics.forEach((topic: string) => uniqueTopics.add(topic));
    }
  });

  const topicPages: MetadataRoute.Sitemap = Array.from(uniqueTopics).map(topic => ({
    url: `${SITE_URL}/research/${encodeURIComponent(topic.toLowerCase().replace(/\s+/g, '-'))}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Tags
  const { data: tags } = await supabase
    .from('kb_tags')
    .select('slug');

  const tagPages: MetadataRoute.Sitemap = (tags || []).map(tag => ({
    url: `${SITE_URL}/tags/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.4,
  }));

  // Combine all pages
  return [
    ...staticPages,
    ...studyPages,
    ...glossaryPages,
    ...glossaryCategoryPages,
    ...reviewPages,
    ...articlePages,
    ...categoryPages,
    ...authorPages,
    ...topicPages,
    ...tagPages,
  ];
}
