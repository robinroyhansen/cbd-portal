import Link from 'next/link';
import { HomePageStats } from '@/lib/stats';
import { SearchBar } from './SearchBar';

interface HeroProps {
  stats: HomePageStats;
}

function SourceBadge({ name, icon }: { name: string; icon: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs md:text-sm hover:text-gray-700 transition-colors">
      <span>{icon}</span>
      <span>{name}</span>
    </span>
  );
}

function StatCard({
  value,
  label,
  sublabel,
  color,
  href,
}: {
  value: string | number;
  label: string;
  sublabel?: string;
  color: 'green' | 'blue' | 'purple';
  href: string;
}) {
  const colorClasses = {
    green: 'text-emerald-600 group-hover:text-emerald-700',
    blue: 'text-blue-600 group-hover:text-blue-700',
    purple: 'text-purple-600 group-hover:text-purple-700',
  };

  return (
    <Link href={href} className="group text-center p-3 md:p-4 rounded-xl hover:bg-gray-50 transition-all">
      <div className={`text-3xl md:text-4xl lg:text-5xl font-bold ${colorClasses[color]} transition-colors`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm font-semibold text-gray-800 mt-1">{label}</div>
      {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
    </Link>
  );
}

export function Hero({ stats }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative py-12 md:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4">
          {/* Main Hero Content */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Content */}
            <div className="order-2 lg:order-1">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-emerald-200 text-emerald-700 rounded-full text-sm font-medium mb-6 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Independent Research Platform
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.1]">
                Evidence-Based
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  CBD Information
                </span>
                You Can Trust
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
                The world&apos;s largest CBD research database. We analyze peer-reviewed studies and present
                unbiased, quality-scored information to help you make informed decisions.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8">
                <Link
                  href="/conditions"
                  className="group px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 text-center flex items-center justify-center gap-2"
                >
                  Explore Health Topics
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/tools/dosage-calculator"
                  className="group px-6 py-3.5 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold hover:border-emerald-300 hover:text-emerald-700 transition-all text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Calculate Dosage
                </Link>
                <Link
                  href="/research"
                  className="px-6 py-3.5 text-emerald-700 font-semibold hover:text-emerald-800 transition-colors text-center flex items-center justify-center gap-1"
                >
                  View Research
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Search Bar */}
              <div className="w-full max-w-lg">
                <SearchBar />
              </div>
            </div>

            {/* Right side - Stats Card */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100">
                {/* Trust Headline */}
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    We Analyze Global Research
                  </h2>
                  <p className="text-gray-500 text-sm md:text-base">
                    Every study summarized in plain language, scored for quality, free from industry influence
                  </p>
                </div>

                {/* Primary Stats */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                  <StatCard
                    href="/research"
                    value={stats.totalScannedStudies.toLocaleString()}
                    label="Scanned"
                    sublabel="Peer-reviewed"
                    color="green"
                  />
                  <StatCard
                    href="/research"
                    value={stats.researchStudies.toLocaleString()}
                    label="Published"
                    sublabel="In our database"
                    color="blue"
                  />
                  <StatCard
                    href="/research/methodology"
                    value="100%"
                    label="Scored"
                    sublabel="Transparent"
                    color="purple"
                  />
                </div>

                {/* Study Subject Breakdown */}
                {(stats.studySubjectDistribution.human > 0 || stats.studySubjectDistribution.review > 0) && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-4 mb-6">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 text-center font-medium">Research Breakdown</div>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {stats.studySubjectDistribution.human > 0 && (
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <div className="text-lg font-bold text-blue-600">👤 {stats.studySubjectDistribution.human}</div>
                          <div className="text-[10px] text-gray-500 font-medium">Human</div>
                        </div>
                      )}
                      {stats.studySubjectDistribution.review > 0 && (
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <div className="text-lg font-bold text-teal-600">📚 {stats.studySubjectDistribution.review}</div>
                          <div className="text-[10px] text-gray-500 font-medium">Reviews</div>
                        </div>
                      )}
                      {stats.studySubjectDistribution.animal > 0 && (
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <div className="text-lg font-bold text-orange-600">🐭 {stats.studySubjectDistribution.animal}</div>
                          <div className="text-[10px] text-gray-500 font-medium">Preclinical</div>
                        </div>
                      )}
                      {stats.studySubjectDistribution.in_vitro > 0 && (
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <div className="text-lg font-bold text-purple-600">🧫 {stats.studySubjectDistribution.in_vitro}</div>
                          <div className="text-[10px] text-gray-500 font-medium">In Vitro</div>
                        </div>
                      )}
                      {stats.countryCount > 0 && (
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <div className="text-lg font-bold text-emerald-600">🌍 {stats.countryCount}</div>
                          <div className="text-[10px] text-gray-500 font-medium">Countries</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Supporting Stats */}
                <div className="flex flex-wrap justify-center gap-6 text-center border-t border-gray-100 pt-6 mb-6">
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{stats.healthTopics}</div>
                    <div className="text-xs text-gray-500">Health Conditions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{stats.glossaryTerms}</div>
                    <div className="text-xs text-gray-500">Terms Explained</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{stats.yearRange}</div>
                    <div className="text-xs text-gray-500">Years of Research</div>
                  </div>
                </div>

                {/* Data Sources */}
                <div className="border-t border-gray-100 pt-6">
                  <p className="text-xs text-gray-400 mb-3 text-center uppercase tracking-widest font-medium">
                    Trusted Data Sources
                  </p>
                  <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
                    <SourceBadge name="PubMed" icon="🔬" />
                    <SourceBadge name="ClinicalTrials.gov" icon="🏥" />
                    <SourceBadge name="Cochrane" icon="📚" />
                    <SourceBadge name="Europe PMC" icon="🇪🇺" />
                    <SourceBadge name="Semantic Scholar" icon="🎓" />
                    <SourceBadge name="bioRxiv" icon="🧬" />
                  </div>
                  <Link
                    href="/research/methodology"
                    className="block mt-4 text-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    View our scoring methodology →
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    No products sold
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    No sponsored content
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Independent
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
