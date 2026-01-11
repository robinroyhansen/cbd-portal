import Link from 'next/link';
import { HomePageStats } from '@/lib/stats';

interface HeroProps {
  stats: HomePageStats;
}

export function Hero({ stats }: HeroProps) {
  return (
    <section className="bg-gradient-to-br from-green-50 via-white to-green-50 py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Evidence-Based
              <span className="text-green-600"> CBD Information</span>
              <br />You Can Trust
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The world's largest CBD information resource featuring the latest research, comprehensive guides,
              expert articles, product reviews, and evidence-based insights to help you understand CBD's potential.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/categories/conditions"
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Explore Health Topics
              </Link>
              <Link
                href="/tools/dosage-calculator"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>💊</span>
                Calculate My Dose
              </Link>
              <Link
                href="/research"
                className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                View Research
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="relative">
              {/* Trust signals */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                {/* Primary Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/research" className="text-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <div className="text-3xl font-bold text-green-700">{stats.researchStudies}+</div>
                    <div className="text-sm text-gray-600">Research Studies</div>
                  </Link>
                  <Link href="/glossary" className="text-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                    <div className="text-3xl font-bold text-blue-700">{stats.glossaryTerms}+</div>
                    <div className="text-sm text-gray-600">Glossary Terms</div>
                  </Link>
                  <Link href="/research" className="text-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                    <div className="text-3xl font-bold text-purple-700">{stats.healthTopics}+</div>
                    <div className="text-sm text-gray-600">Health Topics</div>
                  </Link>
                  <Link href="/research" className="text-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                    <div className="text-3xl font-bold text-orange-700">{stats.highQualityStudies}+</div>
                    <div className="text-sm text-gray-600">High-Quality Studies</div>
                  </Link>
                </div>

                {/* Secondary Stats Row (conditional - only show stats > 0) */}
                {(stats.articles > 0 || stats.countriesStudied > 0 || stats.brandReviews > 0) && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {stats.articles > 0 && (
                      <Link href="/articles" className="text-center p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                        <div className="text-xl font-bold text-amber-700">{stats.articles}+</div>
                        <div className="text-xs text-gray-600">Expert Articles</div>
                      </Link>
                    )}
                    {stats.countriesStudied > 0 && (
                      <Link href="/research" className="text-center p-3 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
                        <div className="text-xl font-bold text-teal-700">{stats.countriesStudied}+</div>
                        <div className="text-xs text-gray-600">Countries Studied</div>
                      </Link>
                    )}
                    {stats.brandReviews > 0 && (
                      <Link href="/reviews" className="text-center p-3 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
                        <div className="text-xl font-bold text-rose-700">{stats.brandReviews}+</div>
                        <div className="text-xs text-gray-600">Brand Reviews</div>
                      </Link>
                    )}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-sm">👨‍🔬</span>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-sm">👩‍⚕️</span>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-sm">🧑‍🔬</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Written by Industry Experts</p>
                      <p className="text-sm text-gray-500">
                        <Link href="/authors" className="text-green-600 hover:underline">
                          Meet our authors →
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}