import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cbd-portal.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

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
    .select('slug, updated_at')
    .eq('status', 'approved')
    .not('slug', 'is', null);

  const studyPages: MetadataRoute.Sitemap = (studies || []).map(study => ({
    url: `${SITE_URL}/research/study/${study.slug}`,
    lastModified: study.updated_at ? new Date(study.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Glossary terms (~262)
  const { data: glossaryTerms } = await supabase
    .from('kb_glossary')
    .select('slug, updated_at');

  const glossaryPages: MetadataRoute.Sitemap = (glossaryTerms || []).map(term => ({
    url: `${SITE_URL}/glossary/${term.slug}`,
    lastModified: term.updated_at ? new Date(term.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Brand reviews
  const { data: brands } = await supabase
    .from('brands')
    .select('slug, updated_at')
    .not('review_content', 'is', null);

  const reviewPages: MetadataRoute.Sitemap = (brands || []).map(brand => ({
    url: `${SITE_URL}/reviews/${brand.slug}`,
    lastModified: brand.updated_at ? new Date(brand.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Articles
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('status', 'published');

  const articlePages: MetadataRoute.Sitemap = (articles || []).map(article => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at');

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map(category => ({
    url: `${SITE_URL}/categories/${category.slug}`,
    lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Authors
  const { data: authors } = await supabase
    .from('authors')
    .select('slug, updated_at');

  const authorPages: MetadataRoute.Sitemap = (authors || []).map(author => ({
    url: `${SITE_URL}/authors/${author.slug}`,
    lastModified: author.updated_at ? new Date(author.updated_at) : new Date(),
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
    .from('tags')
    .select('slug, updated_at');

  const tagPages: MetadataRoute.Sitemap = (tags || []).map(tag => ({
    url: `${SITE_URL}/tags/${tag.slug}`,
    lastModified: tag.updated_at ? new Date(tag.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.4,
  }));

  // Combine all pages
  return [
    ...staticPages,
    ...studyPages,
    ...glossaryPages,
    ...reviewPages,
    ...articlePages,
    ...categoryPages,
    ...authorPages,
    ...topicPages,
    ...tagPages,
  ];
}
