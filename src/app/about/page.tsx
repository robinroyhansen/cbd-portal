import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getHreflangAlternates } from '@/components/HreflangTags';
import { detectLanguage } from '@/lib/language';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'About CBD Portal | Evidence-Based CBD Information',
    description: 'CBD Portal provides evidence-based CBD information written by industry experts.',
    alternates: getHreflangAlternates('/about'),
  };
}

export default async function AboutPage() {
  const headersList = await headers();
  const lang = detectLanguage(headersList) as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  const supabase = await createClient();

  // Get stats
  const { count: articleCount } = await supabase
    .from('kb_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  const { count: researchCount } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { data: authors } = await supabase
    .from('kb_authors')
    .select('years_experience')
    .eq('is_active', true);

  const totalExperience = authors?.reduce((sum, a) => sum + (a.years_experience || 0), 0) || 0;

  // Organization schema
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CBD Portal',
    url: 'https://cbd-portal.vercel.app',
    logo: 'https://cbd-portal.vercel.app/logo.png',
    description: 'Evidence-based CBD information backed by peer-reviewed research',
    foundingDate: '2024',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@cbdportal.com'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('about.title')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Trust stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-green-50 rounded-xl">
            <div className="text-3xl font-bold text-green-700">{researchCount || 0}+</div>
            <div className="text-sm text-gray-600">{t('about.researchStudies')}</div>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-xl">
            <div className="text-3xl font-bold text-blue-700">{totalExperience}+</div>
            <div className="text-sm text-gray-600">{t('about.yearsCombinedExperience')}</div>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-xl">
            <div className="text-3xl font-bold text-purple-700">{articleCount || 0}</div>
            <div className="text-sm text-gray-600">{t('about.expertArticles')}</div>
          </div>
          <div className="text-center p-6 bg-orange-50 rounded-xl">
            <div className="text-3xl font-bold text-orange-700">{authors?.length || 0}</div>
            <div className="text-sm text-gray-600">{t('about.expertAuthors')}</div>
          </div>
        </div>

        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">{t('about.missionTitle')}</h2>
          <div className="prose prose-green max-w-none">
            <p>{t('about.missionText1')}</p>
            <p>{t('about.missionText2')}</p>
          </div>
        </section>

        {/* What makes us different */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">{t('about.whatMakesUsDifferent')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-xl">
              <div className="text-2xl mb-3">🔬</div>
              <h3 className="font-semibold text-lg mb-2">{t('about.evidenceBasedContent')}</h3>
              <p className="text-gray-600 text-sm">{t('about.evidenceBasedContentDesc')}</p>
            </div>
            <div className="p-6 border rounded-xl">
              <div className="text-2xl mb-3">👨‍🔬</div>
              <h3 className="font-semibold text-lg mb-2">{t('about.expertAuthorsTitle')}</h3>
              <p className="text-gray-600 text-sm">{t('about.expertAuthorsDesc')}</p>
            </div>
            <div className="p-6 border rounded-xl">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="font-semibold text-lg mb-2">{t('about.noExaggeratedClaims')}</h3>
              <p className="text-gray-600 text-sm">{t('about.noExaggeratedClaimsDesc')}</p>
            </div>
            <div className="p-6 border rounded-xl">
              <div className="text-2xl mb-3">🔄</div>
              <h3 className="font-semibold text-lg mb-2">{t('about.regularlyUpdated')}</h3>
              <p className="text-gray-600 text-sm">{t('about.regularlyUpdatedDesc')}</p>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">{t('about.ourTeamTitle')}</h2>
          <p className="text-gray-600 mb-6">{t('about.ourTeamDesc')}</p>
          <Link
            href="/authors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('about.meetOurAuthors')}
            <span>→</span>
          </Link>
        </section>

        {/* Editorial standards */}
        <section className="mb-16 bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">{t('about.editorialTitle')}</h2>
          <p className="text-gray-600 mb-6">{t('about.editorialDesc')}</p>
          <Link
            href="/editorial-policy"
            className="text-green-600 hover:text-green-800 font-medium"
          >
            {t('about.readEditorialPolicy')} →
          </Link>
        </section>

        {/* Contact CTA */}
        <section className="text-center bg-green-700 text-white rounded-xl p-10">
          <h2 className="text-2xl font-bold mb-4">{t('about.haveQuestions')}</h2>
          <p className="text-green-100 mb-6">{t('about.haveQuestionsDesc')}</p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            {t('about.contactUs')}
          </Link>
        </section>
      </div>
    </>
  );
}