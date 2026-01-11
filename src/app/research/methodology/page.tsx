import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';

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

export default function MethodologyPage() {
  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Research', url: `${SITE_URL}/research` },
    { name: 'Methodology', url: `${SITE_URL}/research/methodology` },
  ];

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
          href="/research"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Research Database
        </Link>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          How We Assess Research Quality
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          At CBD Portal, we evaluate every study using a transparent, evidence-based scoring system. Here's exactly how it works.
        </p>

        {/* Scoring System Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">📊</span>
            Our Scoring System (0-100)
          </h2>
          <p className="text-gray-700 mb-6">
            Every study receives a quality score based on four factors:
          </p>

          {/* Study Design */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              1. Study Design <span className="text-green-600 font-normal">(up to 50 points)</span>
            </h3>
            <p className="text-gray-600 mb-4">
              The type of study determines the maximum evidence quality:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 pr-4 font-semibold text-gray-900">Study Type</th>
                    <th className="py-3 px-4 font-semibold text-gray-900 text-center">Max Points</th>
                    <th className="py-3 pl-4 font-semibold text-gray-900">Why</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 pr-4 text-gray-700">Meta-Analysis</td>
                    <td className="py-3 px-4 text-center font-bold text-green-600">50</td>
                    <td className="py-3 pl-4 text-gray-600">Combines multiple studies</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-700">Systematic Review</td>
                    <td className="py-3 px-4 text-center font-bold text-green-600">45</td>
                    <td className="py-3 pl-4 text-gray-600">Comprehensive literature review</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-700">Randomized Controlled Trial (RCT)</td>
                    <td className="py-3 px-4 text-center font-bold text-green-600">40</td>
                    <td className="py-3 pl-4 text-gray-600">Gold standard for causation</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-700">Cohort Study</td>
                    <td className="py-3 px-4 text-center font-bold text-yellow-600">30</td>
                    <td className="py-3 pl-4 text-gray-600">Follows groups over time</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-700">Case-Control Study</td>
                    <td className="py-3 px-4 text-center font-bold text-yellow-600">25</td>
                    <td className="py-3 pl-4 text-gray-600">Compares cases to controls</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-700">Cross-Sectional Study</td>
                    <td className="py-3 px-4 text-center font-bold text-orange-600">20</td>
                    <td className="py-3 pl-4 text-gray-600">Snapshot in time</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-700">Case Report</td>
                    <td className="py-3 px-4 text-center font-bold text-red-600">10</td>
                    <td className="py-3 pl-4 text-gray-600">Single patient observation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Methodology */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              2. Methodology <span className="text-green-600 font-normal">(up to 25 points)</span>
            </h3>
            <p className="text-gray-600 mb-4">We assess:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Blinding</strong> (double-blind, single-blind, open-label)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Randomization quality</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Control group presence</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Validated outcome measures</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Statistical analysis rigor</strong></span>
              </li>
            </ul>
          </div>

          {/* Sample Size */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              3. Sample Size <span className="text-green-600 font-normal">(up to 15 points)</span>
            </h3>
            <p className="text-gray-600 mb-4">Larger studies provide more reliable results:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 pr-4 font-semibold text-gray-900">Participants</th>
                    <th className="py-3 pl-4 font-semibold text-gray-900 text-center">Points</th>
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
              4. Relevance <span className="text-green-600 font-normal">(up to 10 points)</span>
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Direct CBD focus (vs. cannabis generally)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Human subjects (vs. animal/cell studies)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Published in peer-reviewed journal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Recent publication (last 5 years)</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Quality Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">🏆</span>
            Quality Categories
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left bg-white rounded-xl border border-gray-200 overflow-hidden">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 font-semibold text-gray-900">Score</th>
                  <th className="py-4 px-6 font-semibold text-gray-900">Category</th>
                  <th className="py-4 px-6 font-semibold text-gray-900">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                      70-100
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-green-700">High Quality</td>
                  <td className="py-4 px-6 text-gray-600">Strong evidence, reliable methodology</td>
                </tr>
                <tr>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-700">
                      50-69
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-yellow-700">Moderate Quality</td>
                  <td className="py-4 px-6 text-gray-600">Useful evidence with some limitations</td>
                </tr>
                <tr>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700">
                      30-49
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-orange-700">Low Quality</td>
                  <td className="py-4 px-6 text-gray-600">Preliminary evidence, interpret cautiously</td>
                </tr>
                <tr>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                      0-29
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-red-700">Very Low Quality</td>
                  <td className="py-4 px-6 text-gray-600">Limited reliability, early research</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* What This Means */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">💡</span>
            What This Means For You
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-bold text-green-800 mb-2">High Quality (70+)</h3>
              <p className="text-green-700 text-sm">Results you can have reasonable confidence in</p>
            </div>
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
              <div className="text-3xl mb-2">⚠️</div>
              <h3 className="font-bold text-yellow-800 mb-2">Moderate Quality (50-69)</h3>
              <p className="text-yellow-700 text-sm">Promising but needs more research</p>
            </div>
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
              <div className="text-3xl mb-2">🔬</div>
              <h3 className="font-bold text-orange-800 mb-2">Low Quality (&lt;50)</h3>
              <p className="text-orange-700 text-sm">Interesting but don't base decisions on it alone</p>
            </div>
          </div>
        </section>

        {/* Commitment to Transparency */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">🔍</span>
            Our Commitment to Transparency
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>We show the exact score breakdown on every study page</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Our methodology is consistent across all studies in our database</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>We update scores when new information becomes available</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>We never adjust scores based on whether results favor CBD</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Limitations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">⚠️</span>
            Limitations
          </h2>
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
            <p className="text-amber-800 mb-4">Our scoring system has limitations:</p>
            <ul className="space-y-2 text-amber-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>We assess <strong>methodology</strong>, not results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>A high score doesn't mean CBD "works" for a condition</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>A low score doesn't mean the research is worthless</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>Individual studies should be considered alongside the full body of research</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <div className="bg-gray-100 rounded-xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Questions about our methodology?
            </h2>
            <p className="text-gray-600 mb-4">
              We're happy to explain our approach in more detail.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Contact Us
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Back to Research */}
        <div className="text-center pt-8">
          <Link
            href="/research"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Research Database
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
            headline: 'How We Assess Research Quality',
            description: 'CBD Portal\'s transparent methodology for evaluating and scoring research quality using a 0-100 point system.',
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
