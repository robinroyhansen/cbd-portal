import { LocaleLink as Link } from '@/components/LocaleLink';
import Image from 'next/image';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';
import { getFeaturedArticlesWithTranslations } from '@/lib/translations';

interface FeaturedArticlesProps {
  lang?: LanguageCode;
}

export async function FeaturedArticles({ lang = 'en' }: FeaturedArticlesProps) {
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  // Fetch articles with translations for the current language
  const articles = await getFeaturedArticlesWithTranslations(lang, 5);

  if (!articles || articles.length === 0) return null;

  const [featured, ...rest] = articles;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="inline-block text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-4">
              {t('articles.sectionLabel')}
            </span>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-4">
              {t('articles.title')}
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              {t('articles.description')}
            </p>
          </div>
          <Link
            href="/articles"
            className="group inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium transition-colors"
          >
            <span>{t('articles.viewAll')}</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Articles Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Featured Article - Large */}
          <Link
            href={`/articles/${featured.slug}`}
            className="group relative bg-slate-900 rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:row-span-2"
          >
            {/* Background image */}
            {featured.featured_image ? (
              <Image
                src={featured.featured_image}
                alt={featured.title}
                fill
                className="object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-slate-900" />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 p-8 lg:p-10 flex flex-col justify-end">
              {featured.category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm font-medium rounded-full mb-4 w-fit backdrop-blur-sm border border-emerald-500/20">
                  {featured.category.name}
                </span>
              )}
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors leading-tight">
                {featured.title}
              </h3>
              <p className="text-white/70 mb-6 line-clamp-2 max-w-xl">
                {featured.meta_description}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-sm text-white/50">
                  {featured.reading_time && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('articles.minRead', { minutes: featured.reading_time })}
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-2 text-emerald-400 font-medium text-sm ml-auto group-hover:gap-3 transition-all">
                  {t('articles.readArticle')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Secondary Articles */}
          <div className="grid gap-6">
            {rest.slice(0, 3).map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group flex gap-5 p-5 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
                  {article.featured_image ? (
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="128px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  {article.category && (
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                      {article.category.name}
                    </span>
                  )}
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2 line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    {article.reading_time && (
                      <span>{t('articles.minShort', { minutes: article.reading_time })}</span>
                    )}
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>
                      {new Date(article.updated_at).toLocaleDateString(lang === 'en' ? 'en-GB' : lang, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
