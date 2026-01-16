import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

interface Article {
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

  // Get articles from same category, excluding current
  let query = supabase
    .from('kb_articles')
    .select('slug, title, excerpt')
    .neq('slug', currentSlug)
    .eq('status', 'published')
    .eq('language', 'en')
    .limit(3);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data: articles } = await query.order('published_at', { ascending: false });

  if (!articles || articles.length === 0) return null;

  return (
    <section className="mt-8 p-6 bg-green-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">You Might Also Like</h3>
      <ul className="space-y-3">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/articles/${article.slug}`}
              className="text-green-700 hover:text-green-900 hover:underline"
            >
              → {article.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}