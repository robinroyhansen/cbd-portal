import Link from 'next/link';
import { HomePageStats } from '@/lib/stats';
import { SearchBar } from './SearchBar';

interface HeroProps {
  stats: HomePageStats;
}

function SourceBadge({ name, icon }: { name: string; icon: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-gray-500 text-xs md:text-sm">
      <span>{icon}</span>
      <span>{name}</span>
    </span>
  );
}

export function Hero({ stats }: HeroProps) {
  return (
    <section className="bg-gradient-to-br from-green-50 via-white to-green-50 py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Hero Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Evidence-Based
              <span className="text-green-600"> CBD Information</span>
              <br />You Can Trust
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The world&apos;s largest CBD information resource featuring the latest research, comprehensive guides,
              expert articles, product reviews, and evidence-based insights to help you understand CBD&apos;s potential.
            </p>
            {/* CTA Buttons - full width on mobile */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
              <Link
                href="/categories/conditions"
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
              >
                Explore Health Topics
              </Link>
              <Link
                href="/tools/dosage-calculator"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>💊</span>
                Calculate My Dose
              </Link>
              <Link
                href="/research"
                className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center"
              >
                View Research
              </Link>
            </div>

            {/* Search Bar - visible on all screens */}
            <div className="w-full">
              <SearchBar />
            </div>
          </div>

          {/* Stats Card - Desktop Only */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Trust Headline */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  We Analyze Global Research and Present the Facts.
                </h2>
                <p className="text-gray-600">
                  Every CBD study summarized in plain language, scored for quality,
                  and free from industry influence.
                </p>
              </div>

              {/* Primary Stats - The Big Three */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <Link href="/research" className="text-center group">
                  <div className="text-5xl font-bold text-green-600 group-hover:text-green-700 transition-colors">
                    {stats.totalScannedStudies.toLocaleString()}
                  </div>
                  <div className="text-sm font-semibold text-gray-800 mt-1">Studies Scanned</div>
                  <div className="text-xs text-gray-500">From peer-reviewed sources</div>
                </Link>

                <Link href="/research" className="text-center group">
                  <div className="text-5xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                    {stats.researchStudies}
                  </div>
                  <div className="text-sm font-semibold text-gray-800 mt-1">Studies Published</div>
                  <div className="text-xs text-gray-500">Curated for our database</div>
                </Link>

                <Link href="/research/methodology" className="text-center group">
                  <div className="text-5xl font-bold text-purple-600 group-hover:text-purple-700 transition-colors">
                    100%
                  </div>
                  <div className="text-sm font-semibold text-gray-800 mt-1">Quality Scored</div>
                  <div className="text-xs text-gray-500">Transparent methodology</div>
                </Link>
              </div>

              {/* Study Subject Breakdown */}
              {(stats.studySubjectDistribution.human > 0 || stats.studySubjectDistribution.review > 0) && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-3 text-center">Research Breakdown</div>
                  <div className="grid grid-cols-5 gap-3 text-center">
                    {stats.studySubjectDistribution.human > 0 && (
                      <div>
                        <div className="text-lg font-bold text-blue-600">👤 {stats.studySubjectDistribution.human}</div>
                        <div className="text-[10px] text-gray-600">Human Clinical</div>
                      </div>
                    )}
                    {stats.studySubjectDistribution.review > 0 && (
                      <div>
                        <div className="text-lg font-bold text-teal-600">📚 {stats.studySubjectDistribution.review}</div>
                        <div className="text-[10px] text-gray-600">Reviews</div>
                      </div>
                    )}
                    {stats.studySubjectDistribution.animal > 0 && (
                      <div>
                        <div className="text-lg font-bold text-orange-600">🐭 {stats.studySubjectDistribution.animal}</div>
                        <div className="text-[10px] text-gray-600">Preclinical</div>
                      </div>
                    )}
                    {stats.studySubjectDistribution.in_vitro > 0 && (
                      <div>
                        <div className="text-lg font-bold text-purple-600">🧫 {stats.studySubjectDistribution.in_vitro}</div>
                        <div className="text-[10px] text-gray-600">In Vitro</div>
                      </div>
                    )}
                    {stats.countryCount > 0 && (
                      <div>
                        <div className="text-lg font-bold text-green-600">🌍 {stats.countryCount}</div>
                        <div className="text-[10px] text-gray-600">Countries</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Supporting Stats */}
              <div className="flex flex-wrap justify-center gap-6 text-center border-t border-gray-200 pt-6">
                {stats.humanParticipants > 0 && (
                  <div>
                    <div className="text-2xl font-bold text-gray-700">{stats.humanParticipantsDisplay}</div>
                    <div className="text-xs text-gray-500">Human Participants</div>
                  </div>
                )}
                <div>
                  <div className="text-2xl font-bold text-gray-700">{stats.healthTopics}</div>
                  <div className="text-xs text-gray-500">Health Conditions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-700">{stats.glossaryTerms}</div>
                  <div className="text-xs text-gray-500">Terms Explained</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-700">{stats.yearRange}</div>
                  <div className="text-xs text-gray-500">Years of Research</div>
                </div>
              </div>

              {/* Data Sources - builds journalist trust */}
              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-widest">
                  Trusted Data Sources
                </p>
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
                  <SourceBadge name="PubMed" icon="🔬" />
                  <SourceBadge name="ClinicalTrials.gov" icon="🏥" />
                  <SourceBadge name="Cochrane" icon="📚" />
                  <SourceBadge name="Europe PMC" icon="🇪🇺" />
                  <SourceBadge name="Semantic Scholar" icon="🎓" />
                  <SourceBadge name="bioRxiv" icon="🧬" />
                  <SourceBadge name="CrossRef" icon="🔗" />
                  <SourceBadge name="OpenAlex" icon="📖" />
                </div>
                <Link
                  href="/research/methodology"
                  className="inline-block mt-4 text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  View our scoring methodology →
                </Link>
              </div>

              {/* Trust Badges - No selling */}
              <div className="mt-4 flex justify-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="text-green-500">✓</span> No products sold
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-green-500">✓</span> No sponsored content
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-green-500">✓</span> Independent research
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats Section */}
        <div className="md:hidden bg-white rounded-2xl shadow-lg p-6">
          {/* Trust Headline */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              We Analyze Global Research and Present the Facts.
            </h2>
            <p className="text-sm text-gray-600">
              Every CBD study summarized in plain language and scored for quality.
            </p>
          </div>

          {/* Primary Stats - Mobile */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Link href="/research" className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.totalScannedStudies.toLocaleString()}</div>
              <div className="text-xs font-semibold text-gray-800">Scanned</div>
            </Link>
            <Link href="/research" className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.researchStudies}</div>
              <div className="text-xs font-semibold text-gray-800">Published</div>
            </Link>
            <Link href="/research/methodology" className="text-center">
              <div className="text-3xl font-bold text-purple-600">100%</div>
              <div className="text-xs font-semibold text-gray-800">Scored</div>
            </Link>
          </div>

          {/* Study Subject Breakdown - Mobile */}
          {(stats.studySubjectDistribution.human > 0 || stats.studySubjectDistribution.review > 0) && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-5 gap-2 text-center">
                {stats.studySubjectDistribution.human > 0 && (
                  <div>
                    <div className="text-sm font-bold text-blue-600">👤 {stats.studySubjectDistribution.human}</div>
                    <div className="text-[9px] text-gray-600">Human</div>
                  </div>
                )}
                {stats.studySubjectDistribution.review > 0 && (
                  <div>
                    <div className="text-sm font-bold text-teal-600">📚 {stats.studySubjectDistribution.review}</div>
                    <div className="text-[9px] text-gray-600">Reviews</div>
                  </div>
                )}
                {stats.studySubjectDistribution.animal > 0 && (
                  <div>
                    <div className="text-sm font-bold text-orange-600">🐭 {stats.studySubjectDistribution.animal}</div>
                    <div className="text-[9px] text-gray-600">Preclinical</div>
                  </div>
                )}
                {stats.studySubjectDistribution.in_vitro > 0 && (
                  <div>
                    <div className="text-sm font-bold text-purple-600">🧫 {stats.studySubjectDistribution.in_vitro}</div>
                    <div className="text-[9px] text-gray-600">In Vitro</div>
                  </div>
                )}
                {stats.countryCount > 0 && (
                  <div>
                    <div className="text-sm font-bold text-green-600">🌍 {stats.countryCount}</div>
                    <div className="text-[9px] text-gray-600">Countries</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Supporting Stats - Mobile */}
          <div className={`grid ${stats.humanParticipants > 0 ? 'grid-cols-4' : 'grid-cols-3'} gap-2 text-center border-t border-gray-200 pt-4`}>
            {stats.humanParticipants > 0 && (
              <div>
                <div className="text-lg font-bold text-gray-700">{stats.humanParticipantsDisplay}</div>
                <div className="text-[10px] text-gray-500">Humans</div>
              </div>
            )}
            <div>
              <div className="text-lg font-bold text-gray-700">{stats.healthTopics}</div>
              <div className="text-[10px] text-gray-500">Conditions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-700">{stats.glossaryTerms}</div>
              <div className="text-[10px] text-gray-500">Terms</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-700">{stats.yearRange}</div>
              <div className="text-[10px] text-gray-500">Years</div>
            </div>
          </div>

          {/* Data Sources - Mobile */}
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">
              Trusted Data Sources
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
              <SourceBadge name="PubMed" icon="🔬" />
              <SourceBadge name="ClinicalTrials" icon="🏥" />
              <SourceBadge name="Cochrane" icon="📚" />
              <SourceBadge name="Europe PMC" icon="🇪🇺" />
              <SourceBadge name="Semantic Scholar" icon="🎓" />
              <SourceBadge name="bioRxiv" icon="🧬" />
              <SourceBadge name="CrossRef" icon="🔗" />
              <SourceBadge name="OpenAlex" icon="📖" />
            </div>
            <Link
              href="/research/methodology"
              className="text-green-600 text-xs font-medium mt-3 inline-block hover:underline"
            >
              View our methodology →
            </Link>
          </div>

          {/* Trust Badges - Mobile */}
          <div className="mt-3 flex flex-wrap justify-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> No products sold
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> No sponsored content
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> Independent
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
