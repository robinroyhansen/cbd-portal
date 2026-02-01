import { createClient } from '@/lib/supabase/server';
import { getLanguage } from '@/lib/get-language';
import { LocaleLink } from '@/components/LocaleLink';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
}

export async function YouMightAlsoLike({
  currentSlug,
  categoryId
}: {
  currentSlug: string;
  categoryId?: string;
}) {
  const supabase = await createClient();
  const language = await getLanguage();

  // Get articles from same category, excluding current
  let query = supabase
    .from('kb_articles')
    .select('id, slug, title, excerpt')
    .neq('slug', currentSlug)
    .eq('status', 'published')
    .limit(3);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data: articles } = await query.order('published_at', { ascending: false });

  if (!articles || articles.length === 0) return null;

  // Get translations for non-English languages
  let translatedArticles = articles;
  if (language !== 'en') {
    const articleIds = articles.map(a => a.id);
    const { data: translations } = await supabase
      .from('article_translations')
      .select('article_id, title, excerpt')
      .eq('language', language)
      .in('article_id', articleIds);

    if (translations && translations.length > 0) {
      const translationMap = new Map(
        translations.map(t => [t.article_id, t])
      );

      translatedArticles = articles.map(article => {
        const trans = translationMap.get(article.id);
        return {
          ...article,
          title: trans?.title || article.title,
          excerpt: trans?.excerpt || article.excerpt,
        };
      });
    }
  }

  // Section title based on language
  const sectionTitles: Record<string, string> = {
    en: 'You Might Also Like',
    da: 'Du vil måske også kunne lide',
    de: 'Das könnte Ihnen auch gefallen',
    no: 'Du vil kanskje også like',
  };
  const sectionTitle = sectionTitles[language] || sectionTitles.en;

  return (
    <section className="mt-8 p-6 bg-green-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">{sectionTitle}</h3>
      <ul className="space-y-3">
        {translatedArticles.map((article) => (
          <li key={article.slug}>
            <LocaleLink
              href={`/articles/${article.slug}`}
              className="text-green-700 hover:text-green-900 hover:underline"
            >
              → {article.title}
            </LocaleLink>
          </li>
        ))}
      </ul>
    </section>
  );
}