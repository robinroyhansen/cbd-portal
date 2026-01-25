import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { LANGUAGE_DOMAINS } from '@/lib/hreflang';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cbd-portal.vercel.app';

// Generate language alternates for a given path
function getLanguageAlternates(path: string): Record<string, string> {
  const cleanPath = path === '/' ? '' : path;
  const alternates: Record<string, string> = {};

  for (const [lang, domain] of Object.entries(LANGUAGE_DOMAINS)) {
    alternates[lang] = `https://${domain}${cleanPath}`;
  }

  return alternates;
}

// Create a sitemap entry with language alternates
function createSitemapEntry(
  path: string,
  lastModified: Date,
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
  priority: number
): MetadataRoute.Sitemap[0] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: getLanguageAlternates(path),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use service role client to bypass RLS for sitemap generation
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date();

  // Static pages with language alternates
  const staticPages: MetadataRoute.Sitemap = [
    createSitemapEntry('/', now, 'daily', 1.0),
    createSitemapEntry('/conditions', now, 'daily', 0.95),
    createSitemapEntry('/research', now, 'daily', 0.9),
    createSitemapEntry('/research/methodology', now, 'monthly', 0.6),
    createSitemapEntry('/glossary', now, 'weekly', 0.8),
    createSitemapEntry('/reviews', now, 'weekly', 0.9),
    createSitemapEntry('/reviews/methodology', now, 'monthly', 0.6),
    createSitemapEntry('/articles', now, 'weekly', 0.8),
    createSitemapEntry('/categories', now, 'weekly', 0.7),
    createSitemapEntry('/authors', now, 'monthly', 0.5),
    createSitemapEntry('/tags', now, 'weekly', 0.5),
    createSitemapEntry('/tools', now, 'monthly', 0.7),
    createSitemapEntry('/tools/dosage-calculator', now, 'monthly', 0.8),
    createSitemapEntry('/tools/animal-dosage-calculator', now, 'monthly', 0.7),
    createSitemapEntry('/tools/interactions', now, 'monthly', 0.8),
    createSitemapEntry('/tools/cost-calculator', now, 'monthly', 0.7),
    createSitemapEntry('/tools/strength-calculator', now, 'monthly', 0.7),
    createSitemapEntry('/pets', now, 'weekly', 0.8),
    createSitemapEntry('/pets/dogs', now, 'weekly', 0.7),
    createSitemapEntry('/pets/cats', now, 'weekly', 0.7),
    createSitemapEntry('/pets/horses', now, 'weekly', 0.6),
    createSitemapEntry('/pets/birds', now, 'weekly', 0.6),
    createSitemapEntry('/pets/small-pets', now, 'weekly', 0.6),
    createSitemapEntry('/about', now, 'monthly', 0.5),
    createSitemapEntry('/contact', now, 'yearly', 0.4),
    createSitemapEntry('/search', now, 'monthly', 0.5),
    createSitemapEntry('/privacy-policy', now, 'yearly', 0.3),
    createSitemapEntry('/terms-of-service', now, 'yearly', 0.3),
    createSitemapEntry('/cookie-policy', now, 'yearly', 0.3),
    createSitemapEntry('/editorial-policy', now, 'yearly', 0.4),
    createSitemapEntry('/medical-disclaimer', now, 'yearly', 0.4),
  ];

  // Health conditions (~312) with language alternates
  const { data: conditions } = await supabase
    .from('kb_conditions')
    .select('slug, updated_at')
    .eq('is_published', true);

  const conditionPages: MetadataRoute.Sitemap = (conditions || []).map(condition =>
    createSitemapEntry(
      `/conditions/${condition.slug}`,
      condition.updated_at ? new Date(condition.updated_at) : now,
      'weekly',
      0.85
    )
  );

  // Research studies (~698) - no language alternates needed for study pages
  const { data: studies } = await supabase
    .from('kb_research_queue')
    .select('slug, updated_at')
    .eq('status', 'approved')
    .not('slug', 'is', null);

  const studyPages: MetadataRoute.Sitemap = (studies || []).map(study => ({
    url: `${SITE_URL}/research/study/${study.slug}`,
    lastModified: study.updated_at ? new Date(study.updated_at) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Glossary terms (~262) with language alternates
  const { data: glossaryTerms } = await supabase
    .from('kb_glossary')
    .select('slug, updated_at');

  const glossaryPages: MetadataRoute.Sitemap = (glossaryTerms || []).map(term =>
    createSitemapEntry(
      `/glossary/${term.slug}`,
      term.updated_at ? new Date(term.updated_at) : now,
      'monthly',
      0.6
    )
  );

  // Glossary category pages with language alternates
  const glossaryCategories = [
    'cannabinoids', 'terpenes', 'products', 'extraction', 'science',
    'research', 'side-effects', 'conditions', 'testing', 'legal', 'dosing', 'plant'
  ];
  const glossaryCategoryPages: MetadataRoute.Sitemap = glossaryCategories.map(category =>
    createSitemapEntry(`/glossary/category/${category}`, now, 'weekly', 0.7)
  );

  // Brand reviews (published brands)
  const { data: brands } = await supabase
    .from('kb_brands')
    .select('slug, updated_at')
    .eq('is_published', true);

  const reviewPages: MetadataRoute.Sitemap = (brands || []).map(brand =>
    createSitemapEntry(
      `/reviews/${brand.slug}`,
      brand.updated_at ? new Date(brand.updated_at) : now,
      'weekly',
      0.8
    )
  );

  // Articles with language alternates and images
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('slug, updated_at, featured_image, title')
    .eq('status', 'published');

  const articlePages: MetadataRoute.Sitemap = (articles || []).map(article => {
    const entry = createSitemapEntry(
      `/articles/${article.slug}`,
      article.updated_at ? new Date(article.updated_at) : now,
      'monthly',
      0.7
    );

    // Add image entry if featured_image exists
    if (article.featured_image) {
      return {
        ...entry,
        images: [article.featured_image],
      };
    }

    return entry;
  });

  // Categories with language alternates
  const { data: categories } = await supabase
    .from('kb_categories')
    .select('slug, updated_at');

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map(category =>
    createSitemapEntry(
      `/categories/${category.slug}`,
      category.updated_at ? new Date(category.updated_at) : now,
      'weekly',
      0.6
    )
  );

  // Authors with language alternates
  const { data: authors } = await supabase
    .from('kb_authors')
    .select('slug, updated_at')
    .eq('is_active', true);

  const authorPages: MetadataRoute.Sitemap = (authors || []).map(author =>
    createSitemapEntry(
      `/authors/${author.slug}`,
      author.updated_at ? new Date(author.updated_at) : now,
      'monthly',
      0.5
    )
  );

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

  const topicPages: MetadataRoute.Sitemap = Array.from(uniqueTopics).map(topic =>
    createSitemapEntry(
      `/research/${encodeURIComponent(topic.toLowerCase().replace(/\s+/g, '-'))}`,
      now,
      'weekly',
      0.8
    )
  );

  // Tags
  const { data: tags } = await supabase
    .from('kb_tags')
    .select('slug, updated_at');

  const tagPages: MetadataRoute.Sitemap = (tags || []).map(tag =>
    createSitemapEntry(
      `/tags/${tag.slug}`,
      tag.updated_at ? new Date(tag.updated_at) : now,
      'weekly',
      0.4
    )
  );

  // Combine all pages
  return [
    ...staticPages,
    ...conditionPages,
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
