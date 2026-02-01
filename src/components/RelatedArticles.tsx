import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getRelatedSlugs, getRelatedTopics, CATEGORY_GROUPS } from '@/lib/related-topics';
import { getLanguage } from '@/lib/get-language';
import { LocaleLink } from '@/components/LocaleLink';

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

// Helper function to merge translations with base articles
async function mergeArticleTranslations(
  supabase: any,
  articles: Article[],
  language: string
): Promise<Article[]> {
  if (language === 'en' || articles.length === 0) {
    return articles;
  }

  // Fetch translations for these articles
  const { data: translations } = await supabase
    .from('article_translations')
    .select('article_id, title, excerpt')
    .eq('language', language)
    .in('article_id', articles.map(a => (a as any).id));

  if (!translations || translations.length === 0) {
    return articles;
  }

  // Create a map for quick lookup
  const translationMap = new Map(
    translations.map((t: any) => [t.article_id, t])
  );

  // Merge translations
  return articles.map(article => {
    const trans = translationMap.get((article as any).id);
    return {
      ...article,
      title: trans?.title || article.title,
      excerpt: trans?.excerpt || article.excerpt,
    };
  });
}

export async function RelatedArticles({ currentSlug }: { currentSlug: string }) {
  const supabase = await createClient();
  const language = await getLanguage();

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

  // Section title based on language
  const sectionTitles: Record<string, { related: string; conditions: string; minRead: string }> = {
    en: { related: 'Related Articles', conditions: 'Related Conditions', minRead: 'min read' },
    da: { related: 'Relaterede artikler', conditions: 'Relaterede tilstande', minRead: 'min læsning' },
    de: { related: 'Verwandte Artikel', conditions: 'Verwandte Erkrankungen', minRead: 'Min. Lesezeit' },
    no: { related: 'Relaterte artikler', conditions: 'Relaterte tilstander', minRead: 'min å lese' },
  };
  const titles = sectionTitles[language] || sectionTitles.en;

  if (potentialSlugs.length === 0) {
    // Fallback: get recent articles from same category based on title similarity
    const { data: fallbackArticles } = await supabase
      .from('kb_articles')
      .select('id, slug, title, excerpt, reading_time')
      .neq('slug', currentSlug)
      .eq('status', 'published')
      .ilike('slug', `%${topic.split('-')[0]}%`)
      .limit(4);

    if (!fallbackArticles || fallbackArticles.length === 0) return null;

    // Merge translations for non-English
    const translatedArticles = await mergeArticleTranslations(supabase, fallbackArticles, language);

    return (
      <section className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold mb-6">{titles.related}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {translatedArticles.map((article) => (
            <LocaleLink
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="block p-4 border rounded-lg hover:border-green-500 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-lg mb-2 text-green-700">{article.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
              {article.reading_time && (
                <p className="text-xs text-gray-400 mt-2">{article.reading_time} {titles.minRead}</p>
              )}
            </LocaleLink>
          ))}
        </div>
      </section>
    );
  }

  // Query for related articles (remove language filter - articles use slug as unique identifier)
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('id, slug, title, excerpt, reading_time')
    .in('slug', potentialSlugs)
    .eq('status', 'published')
    .limit(4);

  if (!articles || articles.length === 0) return null;

  // Merge translations for non-English
  const translatedArticles = await mergeArticleTranslations(supabase, articles, language);

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold mb-6">{titles.conditions}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {translatedArticles.map((article) => (
          <LocaleLink
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="block p-4 border rounded-lg hover:border-green-500 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-lg mb-2 text-green-700">{article.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
            {article.reading_time && (
              <p className="text-xs text-gray-400 mt-2">{article.reading_time} {titles.minRead}</p>
            )}
          </LocaleLink>
        ))}
      </div>
    </section>
  );
}