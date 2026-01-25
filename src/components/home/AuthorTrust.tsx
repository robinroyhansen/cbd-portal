import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';

interface AuthorTrustProps {
  lang?: LanguageCode;
}

export async function AuthorTrust({ lang = 'en' }: AuthorTrustProps) {
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);
  const supabase = await createClient();

  const { data: authors } = await supabase
    .from('kb_authors')
    .select('name, slug, title, years_experience, image_url')
    .eq('is_active', true)
    .order('is_primary', { ascending: false })
    .limit(4);

  const totalExperience = authors?.reduce((sum, a) => sum + (a.years_experience || 0), 0) || 0;

  return (
    <section className="py-16 bg-green-700 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t('authors.title')}
          </h2>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            {t('authors.description')}
          </p>
        </div>

        {/* Author avatars */}
        <div className="flex justify-center gap-6 mb-8 flex-wrap">
          {authors?.map((author) => (
            <Link
              key={author.slug}
              href={`/authors/${author.slug}`}
              className="text-center group"
            >
              {author.image_url ? (
                <img
                  src={author.image_url}
                  alt={author.name}
                  className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-white group-hover:border-green-300 transition-colors"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-2 border-2 border-white group-hover:border-green-300 transition-colors">
                  <span className="text-xl">{author.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
              )}
              <p className="text-sm font-medium">{author.name.split(' ')[0]}</p>
              <p className="text-xs text-green-200">{author.years_experience}+ {t('authors.years')}</p>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 text-sm mb-8">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{totalExperience}+ {t('authors.combinedExperience')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{t('authors.verifiedProfessionals')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{t('authors.evidenceBased')}</span>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/authors"
            className="inline-block px-6 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            {t('authors.meetAll')}
          </Link>
        </div>

        <p className="text-xs text-green-200 mt-8 text-center max-w-xl mx-auto">
          {t('authors.disclaimer')}
        </p>
      </div>
    </section>
  );
}