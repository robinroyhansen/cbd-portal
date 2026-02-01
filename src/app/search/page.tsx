import { createClient } from '@/lib/supabase/server';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { Metadata } from 'next';
import { SearchForm } from '@/components/SearchForm';
import { getHreflangAlternates } from '@/components/HreflangTags';
import { getLanguage } from '@/lib/get-language';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';
import { getLocalizedSlug } from '@/lib/utils/locale-href';

interface Props {
  searchParams: Promise<{ q?: string; lang?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, lang: langParam } = await searchParams;
  const lang = (langParam || await getLanguage()) as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  return {
    title: q ? `${t('searchPage.title') || 'Search'}: ${q} | ${locale.meta?.siteName || 'CBD Portal'}` : `${t('searchPage.title') || 'Search'} | ${locale.meta?.siteName || 'CBD Portal'}`,
    description: t('searchPage.metaDescription') || 'Search CBD Portal for articles, research studies, glossary terms, and more.',
    alternates: getHreflangAlternates('/search'),
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, lang: langParam } = await searchParams;
  const lang = (langParam || await getLanguage()) as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);
  const query = q || '';
  const supabase = await createClient();

  let articles: any[] = [];
  let categories: any[] = [];
  let studies: any[] = [];
  let glossary: any[] = [];

  if (query.length >= 2) {
    // Search articles
    const { data: articleResults } = await supabase
      .from('kb_articles')
      .select('slug, title, excerpt, reading_time, updated_at')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .limit(15);

    // Search categories
    const { data: categoryResults } = await supabase
      .from('kb_categories')
      .select('slug, name, description')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10);

    // Search research studies
    const { data: studyResults } = await supabase
      .from('research_queue')
      .select('slug, title, authors, publication, year, abstract')
      .eq('status', 'approved')
      .or(`title.ilike.%${query}%,authors.ilike.%${query}%,abstract.ilike.%${query}%`)
      .order('year', { ascending: false })
      .limit(15);

    // Search glossary terms
    const { data: glossaryResults } = await supabase
      .from('glossary_terms')
      .select('id, slug, term, short_definition')
      .or(`term.ilike.%${query}%,short_definition.ilike.%${query}%,definition.ilike.%${query}%`)
      .limit(10);

    articles = articleResults || [];
    categories = categoryResults || [];
    studies = studyResults || [];
    glossary = glossaryResults || [];
  }

  // Fetch translated slugs for glossary terms (non-English)
  let glossarySlugMap = new Map<string, string>();
  if (lang !== 'en' && glossary.length > 0) {
    const glossaryIds = glossary.map((t: { id: string }) => t.id);
    const { data: slugTranslations } = await supabase
      .from('glossary_translations')
      .select('term_id, slug')
      .eq('language', lang)
      .in('term_id', glossaryIds);
    glossarySlugMap = new Map(
      (slugTranslations || []).map((t: { term_id: string; slug: string }) => [t.term_id, t.slug])
    );
  }

  const totalResults = articles.length + categories.length + studies.length + glossary.length;

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    'conditions': '🏥',
    'products': '🧴',
    'science': '🔬',
    'guides': '📚',
    'legal': '⚖️'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('searchPage.title')}</h1>

      <SearchForm />

      {query ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {totalResults} {totalResults !== 1 ? t('common.articles') : t('common.article')} for "{query}"
          </h2>

          {/* Categories */}
          {categories.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-500 mb-4">{t('searchPage.categories')}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="flex items-center gap-3 p-4 border rounded-lg hover:border-green-400 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl">{categoryIcons[cat.slug] || '📄'}</span>
                    <div>
                      <h3 className="font-semibold">{cat.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{cat.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Research Studies */}
          {studies.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-500 mb-4">{t('searchPage.researchStudies')}</h2>
              <div className="space-y-4">
                {studies.map((study) => (
                  <Link
                    key={study.slug}
                    href={`/research/study/${study.slug}`}
                    className="block p-5 border rounded-lg hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🔬</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{study.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{study.authors}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{study.publication}</span>
                          <span>{study.year}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Glossary Terms */}
          {glossary.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-500 mb-4">{t('searchPage.glossaryTerms')}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {glossary.map((term) => (
                  <Link
                    key={term.slug}
                    href={`/glossary/${getLocalizedSlug({ slug: term.slug, translated_slug: glossarySlugMap.get(term.id) })}`}
                    className="flex items-start gap-3 p-4 border rounded-lg hover:border-amber-400 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl">📖</span>
                    <div>
                      <h3 className="font-semibold">{term.term}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{term.short_definition}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Articles */}
          {articles.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-500 mb-4">{t('searchPage.articles')}</h2>
              <div className="space-y-4">
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className="block p-5 border rounded-lg hover:border-green-400 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{article.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {article.reading_time && <span>{article.reading_time} {t('searchPage.minRead')}</span>}
                      <span>{t('searchPage.updated')} {new Date(article.updated_at).toLocaleDateString(lang === 'en' ? 'en-GB' : lang)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {totalResults === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{t('searchPage.noResults')} &quot;{query}&quot;</p>
              <p className="text-sm text-gray-400">{t('searchPage.noResultsHint')}</p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <Link
                  href="/categories"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('searchPage.browseCategories')}
                </Link>
                <Link
                  href="/research"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('searchPage.browseResearch')}
                </Link>
                <Link
                  href="/glossary"
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  {t('searchPage.browseGlossary')}
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}