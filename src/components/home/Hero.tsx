import Link from 'next/link';

export function Hero() {
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
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-3xl font-bold text-green-700">76+</div>
                    <div className="text-sm text-gray-600">Research Studies</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-3xl font-bold text-blue-700">50+</div>
                    <div className="text-sm text-gray-600">Years Combined Experience</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-3xl font-bold text-purple-700">25+</div>
                    <div className="text-sm text-gray-600">Health Topics</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <div className="text-3xl font-bold text-orange-700">100K+</div>
                    <div className="text-sm text-gray-600">Readers Helped</div>
                  </div>
                </div>

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