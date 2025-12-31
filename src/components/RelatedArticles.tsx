import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getRelatedSlugs } from '@/lib/related-topics';

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  reading_time?: number;
}

export async function RelatedArticles({ currentSlug }: { currentSlug: string }) {
  const supabase = await createClient();
  const relatedSlugs = getRelatedSlugs(currentSlug);

  if (relatedSlugs.length === 0) return null;

  const { data: articles } = await supabase
    .from('kb_articles')
    .select('slug, title, excerpt, reading_time')
    .in('slug', relatedSlugs)
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