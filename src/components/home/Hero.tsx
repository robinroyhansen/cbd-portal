import Link from 'next/link';
import { HomePageStats } from '@/lib/stats';

interface HeroProps {
  stats: HomePageStats;
}

interface StatCardProps {
  number: string | number;
  label: string;
  sublabel?: string;
  href: string;
  gradient: string;
  textColor: string;
}

function StatCard({ number, label, sublabel, href, gradient, textColor }: StatCardProps) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl p-6 ${gradient} hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
    >
      <div className="relative z-10">
        <div className={`text-4xl md:text-5xl font-bold ${textColor} mb-1`}>
          {number}
        </div>
        <div className="text-sm font-semibold text-gray-700">{label}</div>
        {sublabel && (
          <div className="text-xs text-gray-500 mt-0.5">{sublabel}</div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
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
              The world&apos;s largest CBD information resource featuring the latest research, comprehensive guides,
              expert articles, product reviews, and evidence-based insights to help you understand CBD&apos;s potential.
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
              <div className="bg-white rounded-2xl shadow-xl p-6">
                {/* Headline */}
                <div className="text-center mb-6">
                  <h2 className="text-lg font-bold text-gray-800">
                    The Most Comprehensive CBD Research Database
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.researchStudies}+ Studies Analyzed. Zero Bias. 100% Evidence-Based.
                  </p>
                </div>

                {/* Stats Grid - 2 rows of 3 */}
                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    number={`${stats.researchStudies}+`}
                    label="Research Studies"
                    sublabel="Analyzed & Scored"
                    href="/research"
                    gradient="bg-gradient-to-br from-green-50 to-green-100"
                    textColor="text-green-700"
                  />
                  <StatCard
                    number={stats.participantsDisplay}
                    label="Participants"
                    sublabel="In clinical trials"
                    href="/research"
                    gradient="bg-gradient-to-br from-blue-50 to-blue-100"
                    textColor="text-blue-700"
                  />
                  <StatCard
                    number={`${stats.expertAnalyses}+`}
                    label="Expert Analyses"
                    sublabel="Plain language"
                    href="/research"
                    gradient="bg-gradient-to-br from-purple-50 to-purple-100"
                    textColor="text-purple-700"
                  />
                  <StatCard
                    number={`${stats.healthTopics}+`}
                    label="Health Conditions"
                    sublabel="Covered in depth"
                    href="/research"
                    gradient="bg-gradient-to-br from-amber-50 to-amber-100"
                    textColor="text-amber-700"
                  />
                  <StatCard
                    number={`${stats.glossaryTerms}+`}
                    label="Glossary Terms"
                    sublabel="Medical terms explained"
                    href="/glossary"
                    gradient="bg-gradient-to-br from-teal-50 to-teal-100"
                    textColor="text-teal-700"
                  />
                  <StatCard
                    number={`${stats.yearsOfResearch}+`}
                    label="Years of Research"
                    sublabel={stats.yearRange}
                    href="/research"
                    gradient="bg-gradient-to-br from-rose-50 to-rose-100"
                    textColor="text-rose-700"
                  />
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100">
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
