import { Metadata } from 'next';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { getLanguage } from '@/lib/get-language';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cbd-portal.vercel.app';

export const metadata: Metadata = {
  title: 'Research Quality Methodology | CBD Portal',
  description: 'Learn how CBD Portal evaluates and scores research quality. Our transparent 0-100 scoring system assesses study design, methodology, sample size, and relevance.',
  alternates: {
    canonical: '/research/methodology',
  },
  openGraph: {
    title: 'Research Quality Methodology',
    description: 'Our transparent scoring system for evaluating CBD research quality.',
    type: 'article',
  },
};

interface Props {
  searchParams: Promise<{ lang?: string }>;
}

export default async function MethodologyPage({ searchParams }: Props) {
  const { lang: langParam } = await searchParams;
  const lang = (langParam || await getLanguage()) as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  const breadcrumbs = [
    { name: t('methodology.breadcrumbHome'), url: SITE_URL },
    { name: t('methodology.breadcrumbResearch'), url: `${SITE_URL}/research` },
    { name: t('methodology.breadcrumbMethodology'), url: `${SITE_URL}/research/methodology` },
  ];

  const getLangUrl = (path: string) => {
    if (lang === 'en') return path;
    return path.includes('?') ? `${path}&lang=${lang}` : `${path}?lang=${lang}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link
          href={getLangUrl('/research')}
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('methodology.backToResearch')}
        </Link>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('methodology.title')}
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          {t('methodology.subtitle')}
        </p>

        {/* Scoring System Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">📊</span>
            {t('methodology.scoringSystemTitle')}
          </h2>
          <p className="text-gray-700 mb-6">
            {t('methodology.scoringSystemDesc')}
          </p>

          {/* Study Design */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              1. {t('methodology.studyDesign')} <span className="text-green-600 font-normal">({t('methodology.studyDesignPoints')})</span>
            </h3>
            <p className="text-gray-600 mb-4">
              {t('methodology.studyDesignDesc')}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 pr-4 font-semibold text-gray-900">{t('methodology.studyType')}</th>
                    <th className="py-3 px-4 font-semibold text-gray-900 text-center">{t('methodology.maxPoints')}</th>
                    <th className="py-3 pl-4 font-semibold text-gray-900">{t('methodology.why')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 pr-4 text-gray-700">{t('methodology.metaAnalysis')}</td>
                    <td className="py-3 px-4 text-center font-bold text-green-600">50</td>
                    <td className="py-3 pl-4 text-gray-600">{t('methodology.metaAnalysisWhy')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-700">{t('methodology.systematicReview')}</td>
                    <td className="py-3 px-4 text-center font-bold text-green-600">45</td>
                    <td className="py-3 pl-4 text-gray-600">{t('methodology.systematicReviewWhy')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-700">{t('methodology.rct')}</td>
                    <td className="py-3 px-4 text-center font-bold text-green-600">40</td>
                    <td className="py-3 pl-4 text-gray-600">{t('methodology.rctWhy')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-700">{t('methodology.cohortStudy')}</td>
                    <td className="py-3 px-4 text-center font-bold text-yellow-600">30</td>
                    <td className="py-3 pl-4 text-gray-600">{t('methodology.cohortStudyWhy')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-700">{t('methodology.caseControlStudy')}</td>
                    <td className="py-3 px-4 text-center font-bold text-yellow-600">25</td>
                    <td className="py-3 pl-4 text-gray-600">{t('methodology.caseControlStudyWhy')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-700">{t('methodology.crossSectionalStudy')}</td>
                    <td className="py-3 px-4 text-center font-bold text-orange-600">20</td>
                    <td className="py-3 pl-4 text-gray-600">{t('methodology.crossSectionalStudyWhy')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-700">{t('methodology.caseReport')}</td>
                    <td className="py-3 px-4 text-center font-bold text-red-600">10</td>
                    <td className="py-3 pl-4 text-gray-600">{t('methodology.caseReportWhy')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Methodology */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              2. {t('methodology.methodologyTitle')} <span className="text-green-600 font-normal">({t('methodology.methodologyPoints')})</span>
            </h3>
            <p className="text-gray-600 mb-4">{t('methodology.methodologyDesc')}</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>{t('methodology.blinding')}</strong> ({t('methodology.blindingDesc')})</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>{t('methodology.randomizationQuality')}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>{t('methodology.controlGroupPresence')}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>{t('methodology.validatedOutcomeMeasures')}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>{t('methodology.statisticalAnalysisRigor')}</strong></span>
              </li>
            </ul>
          </div>

          {/* Sample Size */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              3. {t('methodology.sampleSizeTitle')} <span className="text-green-600 font-normal">({t('methodology.sampleSizePoints')})</span>
            </h3>
            <p className="text-gray-600 mb-4">{t('methodology.sampleSizeDesc')}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 pr-4 font-semibold text-gray-900">{t('methodology.participants')}</th>
                    <th className="py-3 pl-4 font-semibold text-gray-900 text-center">{t('methodology.points')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 pr-4 text-gray-700">500+</td>
                    <td className="py-2 pl-4 text-center font-bold text-green-600">15</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-gray-700">200-499</td>
                    <td className="py-2 pl-4 text-center font-bold text-green-600">12</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-gray-700">100-199</td>
                    <td className="py-2 pl-4 text-center font-bold text-yellow-600">10</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-gray-700">50-99</td>
                    <td className="py-2 pl-4 text-center font-bold text-yellow-600">7</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-gray-700">20-49</td>
                    <td className="py-2 pl-4 text-center font-bold text-orange-600">5</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-gray-700">&lt;20</td>
                    <td className="py-2 pl-4 text-center font-bold text-red-600">2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Relevance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              4. {t('methodology.relevanceTitle')} <span className="text-green-600 font-normal">({t('methodology.relevancePoints')})</span>
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>{t('methodology.directCbdFocus')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>{t('methodology.humanSubjects')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>{t('methodology.peerReviewedJournal')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>{t('methodology.recentPublication')}</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Quality Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">🏆</span>
            {t('methodology.qualityCategoriesTitle')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left bg-white rounded-xl border border-gray-200 overflow-hidden">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 font-semibold text-gray-900">{t('methodology.score')}</th>
                  <th className="py-4 px-6 font-semibold text-gray-900">{t('methodology.category')}</th>
                  <th className="py-4 px-6 font-semibold text-gray-900">{t('methodology.meaning')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                      70-100
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-green-700">{t('methodology.highQuality')}</td>
                  <td className="py-4 px-6 text-gray-600">{t('methodology.highQualityMeaning')}</td>
                </tr>
                <tr>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-700">
                      50-69
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-yellow-700">{t('methodology.moderateQuality')}</td>
                  <td className="py-4 px-6 text-gray-600">{t('methodology.moderateQualityMeaning')}</td>
                </tr>
                <tr>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700">
                      30-49
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-orange-700">{t('methodology.lowQuality')}</td>
                  <td className="py-4 px-6 text-gray-600">{t('methodology.lowQualityMeaning')}</td>
                </tr>
                <tr>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                      0-29
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-red-700">{t('methodology.veryLowQuality')}</td>
                  <td className="py-4 px-6 text-gray-600">{t('methodology.veryLowQualityMeaning')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* What This Means */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">💡</span>
            {t('methodology.whatThisMeansTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-bold text-green-800 mb-2">{t('methodology.highQualityCard')}</h3>
              <p className="text-green-700 text-sm">{t('methodology.highQualityCardDesc')}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
              <div className="text-3xl mb-2">⚠️</div>
              <h3 className="font-bold text-yellow-800 mb-2">{t('methodology.moderateQualityCard')}</h3>
              <p className="text-yellow-700 text-sm">{t('methodology.moderateQualityCardDesc')}</p>
            </div>
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
              <div className="text-3xl mb-2">🔬</div>
              <h3 className="font-bold text-orange-800 mb-2">{t('methodology.lowQualityCard')}</h3>
              <p className="text-orange-700 text-sm">{t('methodology.lowQualityCardDesc')}</p>
            </div>
          </div>
        </section>

        {/* Commitment to Transparency */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">🔍</span>
            {t('methodology.transparencyTitle')}
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('methodology.transparencyItem1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('methodology.transparencyItem2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('methodology.transparencyItem3')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('methodology.transparencyItem4')}</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Limitations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">⚠️</span>
            {t('methodology.limitationsTitle')}
          </h2>
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
            <p className="text-amber-800 mb-4">{t('methodology.limitationsIntro')}</p>
            <ul className="space-y-2 text-amber-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>{t('methodology.limitationsItem1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>{t('methodology.limitationsItem2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>{t('methodology.limitationsItem3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>{t('methodology.limitationsItem4')}</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <div className="bg-gray-100 rounded-xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t('methodology.questionsTitle')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('methodology.questionsDesc')}
            </p>
            <Link
              href={getLangUrl('/contact')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {t('methodology.contactUs')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Back to Research */}
        <div className="text-center pt-8">
          <Link
            href={getLangUrl('/research')}
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            ← {t('methodology.backToResearch')}
          </Link>
        </div>
      </div>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: t('methodology.title'),
            description: t('methodology.subtitle'),
            author: {
              '@type': 'Organization',
              name: 'CBD Portal',
            },
            publisher: {
              '@type': 'Organization',
              name: 'CBD Portal',
              url: SITE_URL,
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${SITE_URL}/research/methodology`,
            },
          }),
        }}
      />
    </div>
  );
}
