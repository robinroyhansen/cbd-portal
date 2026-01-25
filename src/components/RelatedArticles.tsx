import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getRelatedSlugs, getRelatedTopics, CATEGORY_GROUPS } from '@/lib/related-topics';

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  reading_time?: number;
}

// Extract topic from various slug formats
function extractTopic(slug: string): string {
  return slug
    .replace(/^cbd[-\s](?:and|for|oil[-\s]for)[-\s]/i, '')
    .replace(/[-\s]guide$/i, '')
    .replace(/[-\s]benefits$/i, '')
    .replace(/[-\s]treatment$/i, '')
    .replace(/[-\s]relief$/i, '')
    .toLowerCase()
    .trim();
}

// Find which category a topic belongs to
function findCategoryForTopic(topic: string): string | null {
  for (const [category, topics] of Object.entries(CATEGORY_GROUPS)) {
    if (topics.some(t => topic.includes(t) || t.includes(topic))) {
      return category;
    }
  }
  return null;
}

export async function RelatedArticles({ currentSlug }: { currentSlug: string }) {
  const supabase = await createClient();

  // Get related slugs from expanded topic mapping
  const relatedSlugs = getRelatedSlugs(currentSlug);

  // Also find articles in the same category
  const topic = extractTopic(currentSlug);
  const category = findCategoryForTopic(topic);

  // Build list of potential related slugs
  let potentialSlugs = [...relatedSlugs];

  // Add category-based related topics
  if (category && CATEGORY_GROUPS[category]) {
    const categoryTopics = CATEGORY_GROUPS[category].filter(t => t !== topic);
    for (const t of categoryTopics.slice(0, 4)) {
      potentialSlugs.push(`cbd-and-${t}`, `cbd-for-${t}`);
    }
  }

  // Remove duplicates and current slug
  potentialSlugs = [...new Set(potentialSlugs)].filter(s => s !== currentSlug);

  if (potentialSlugs.length === 0) {
    // Fallback: get recent articles from same category based on title similarity
    const { data: fallbackArticles } = await supabase
      .from('kb_articles')
      .select('slug, title, excerpt, reading_time')
      .neq('slug', currentSlug)
      .eq('status', 'published')
      .eq('language', 'en')
      .ilike('slug', `%${topic.split('-')[0]}%`)
      .limit(4);

    if (!fallbackArticles || fallbackArticles.length === 0) return null;

    return (
      <section className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {fallbackArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="block p-4 border rounded-lg hover:border-green-500 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-lg mb-2 text-green-700">{article.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
              {article.reading_time && (
                <p className="text-xs text-gray-400 mt-2">{article.reading_time} min read</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // Query for related articles
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('slug, title, excerpt, reading_time')
    .in('slug', potentialSlugs)
    .eq('status', 'published')
    .eq('language', 'en')
    .limit(4);

  if (!articles || articles.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold mb-6">Related Conditions</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="block p-4 border rounded-lg hover:border-green-500 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-lg mb-2 text-green-700">{article.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
            {article.reading_time && (
              <p className="text-xs text-gray-400 mt-2">{article.reading_time} min read</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}