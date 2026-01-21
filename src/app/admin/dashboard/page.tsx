import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Research study stats
  const { count: totalStudies } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: withSummaries } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .not('plain_summary', 'is', null);

  const { count: completeMeta } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .not('meta_title', 'is', null)
    .not('key_findings', 'is', null);

  const { count: highQuality } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .gte('relevance_score', 70);

  const { count: withCountry } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .not('country', 'is', null);

  const { count: pendingQueue } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Glossary stats
  const { count: glossaryTerms } = await supabase
    .from('kb_glossary')
    .select('*', { count: 'exact', head: true });

  // Brand stats (using correct kb_brands and kb_brand_reviews tables)
  const { count: totalBrands } = await supabase
    .from('kb_brands')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  const { count: totalReviews } = await supabase
    .from('kb_brand_reviews')
    .select('*', { count: 'exact', head: true });

  const { count: publishedReviews } = await supabase
    .from('kb_brand_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  // Get distinct topics count
  const { data: topicsData } = await supabase
    .from('kb_research_queue')
    .select('relevant_topics')
    .eq('status', 'approved');

  const uniqueTopics = new Set<string>();
  topicsData?.forEach(study => {
    if (Array.isArray(study.relevant_topics)) {
      study.relevant_topics.forEach((topic: string) => uniqueTopics.add(topic));
    }
  });
  const healthTopics = uniqueTopics.size;

  // Recent activity
  const { data: recentStudies } = await supabase
    .from('kb_research_queue')
    .select('id, title, slug, reviewed_at, status')
    .eq('status', 'approved')
    .order('reviewed_at', { ascending: false })
    .limit(5);

  // Calculate percentages
  const total = totalStudies || 1;
  const summaryPercent = Math.round(((withSummaries || 0) / total) * 100);
  const metaPercent = Math.round(((completeMeta || 0) / total) * 100);
  const countryPercent = Math.round(((withCountry || 0) / total) * 100);

  // Missing counts
  const missingSummaries = (totalStudies || 0) - (withSummaries || 0);
  const missingMeta = (totalStudies || 0) - (completeMeta || 0);
  const missingCountry = (totalStudies || 0) - (withCountry || 0);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">CBD Portal Dashboard</h1>
      <p className="text-gray-600 mb-8">Overview of research database and content status</p>

      {/* Row 1: Research Studies */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>🔬</span> Research Studies
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/research/studies"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{(totalStudies || 0).toLocaleString('de-DE')}</p>
                <p className="text-sm text-gray-600 mt-1">Total Studies</p>
              </div>
              <span className="text-3xl">🔬</span>
            </div>
          </Link>

          <Link
            href="/admin/research/summaries"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">{(withSummaries || 0).toLocaleString('de-DE')}</p>
                <p className="text-sm text-gray-600 mt-1">With Summaries</p>
                {missingSummaries > 0 && (
                  <p className="text-xs text-amber-600 mt-1">{missingSummaries.toLocaleString('de-DE')} missing</p>
                )}
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </Link>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">{(completeMeta || 0).toLocaleString('de-DE')}</p>
                <p className="text-sm text-gray-600 mt-1">Complete Meta</p>
                {missingMeta > 0 && (
                  <p className="text-xs text-amber-600 mt-1">{missingMeta.toLocaleString('de-DE')} incomplete</p>
                )}
              </div>
              <span className="text-3xl">📝</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-600">{(highQuality || 0).toLocaleString('de-DE')}</p>
                <p className="text-sm text-gray-600 mt-1">High Quality</p>
                <p className="text-xs text-gray-500 mt-1">Score 70+</p>
              </div>
              <span className="text-3xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Content & Reviews */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>📚</span> Content & Reviews
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/glossary"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{(glossaryTerms || 0).toLocaleString('de-DE')}</p>
                <p className="text-sm text-gray-600 mt-1">Glossary Terms</p>
              </div>
              <span className="text-3xl">📖</span>
            </div>
          </Link>

          <Link
            href="/admin/brands"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{(totalBrands || 0).toLocaleString('de-DE')}</p>
                <p className="text-sm text-gray-600 mt-1">Published Brands</p>
                <p className="text-xs text-green-600 mt-1">{(totalReviews || 0).toLocaleString('de-DE')} reviews ({(publishedReviews || 0).toLocaleString('de-DE')} published)</p>
              </div>
              <span className="text-3xl">⭐</span>
            </div>
          </Link>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{healthTopics.toLocaleString('de-DE')}</p>
                <p className="text-sm text-gray-600 mt-1">Health Topics</p>
              </div>
              <span className="text-3xl">🏷️</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{(withCountry || 0).toLocaleString('de-DE')}</p>
                <p className="text-sm text-gray-600 mt-1">With Country</p>
                {missingCountry > 0 && (
                  <p className="text-xs text-amber-600 mt-1">{missingCountry.toLocaleString('de-DE')} missing</p>
                )}
              </div>
              <span className="text-3xl">🌍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Content Generation Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <span>📊</span> Content Generation Progress
          </h2>
          <Link
            href="/admin/research/generation"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Continue Generation →
          </Link>
        </div>

        <div className="space-y-4">
          {/* Summaries Progress */}
          <Link href="/admin/research/generation?step=summaries" className="block hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Plain Summaries</span>
              <span className="text-gray-900 font-medium">{summaryPercent}% ({(withSummaries || 0).toLocaleString('de-DE')}/{(totalStudies || 0).toLocaleString('de-DE')})</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all"
                style={{ width: `${summaryPercent}%` }}
              />
            </div>
          </Link>

          {/* Meta Progress */}
          <Link href="/admin/research/generation?step=meta" className="block hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Meta Titles & Findings</span>
              <span className="text-gray-900 font-medium">{metaPercent}% ({(completeMeta || 0).toLocaleString('de-DE')}/{(totalStudies || 0).toLocaleString('de-DE')})</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all"
                style={{ width: `${metaPercent}%` }}
              />
            </div>
          </Link>

          {/* Country Progress */}
          <Link href="/admin/research/generation?step=country" className="block hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Country Data</span>
              <span className="text-gray-900 font-medium">{countryPercent}% ({(withCountry || 0).toLocaleString('de-DE')}/{(totalStudies || 0).toLocaleString('de-DE')})</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-purple-500 h-2.5 rounded-full transition-all"
                style={{ width: `${countryPercent}%` }}
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Row 4: Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span>🕐</span> Recent Activity
        </h2>
        <div className="space-y-3">
          {recentStudies && recentStudies.length > 0 ? (
            recentStudies.map((study) => (
              <div key={study.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-green-500">•</span>
                  <div>
                    <p className="text-sm text-gray-700 line-clamp-1">
                      Study approved: <span className="font-medium">{study.title?.substring(0, 50)}...</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {study.reviewed_at
                        ? new Date(study.reviewed_at).toLocaleDateString('en-GB', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Recently'}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/admin/research/studies/${study.id}/edit`}
                  className="text-xs text-green-600 hover:text-green-700"
                >
                  View →
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent activity</p>
          )}

          {pendingQueue && pendingQueue > 0 && (
            <div className="flex items-center justify-between py-2 bg-amber-50 rounded-lg px-3 mt-2">
              <div className="flex items-center gap-3">
                <span className="text-amber-500">⏳</span>
                <p className="text-sm text-amber-700">
                  <span className="font-medium">{pendingQueue.toLocaleString('de-DE')} studies</span> pending review
                </p>
              </div>
              <Link
                href="/admin/research/queue"
                className="text-xs text-amber-600 hover:text-amber-700 font-medium"
              >
                Review →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Row 5: Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/research"
            className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors border border-green-200"
          >
            <span className="text-3xl mb-2">🔍</span>
            <span className="text-sm font-medium text-green-700">Scan Research</span>
          </Link>

          <Link
            href="/admin/research/generation"
            className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <span className="text-3xl mb-2">✨</span>
            <span className="text-sm font-medium text-blue-700">Generate Content</span>
          </Link>

          <Link
            href="/admin/glossary"
            className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors border border-purple-200"
          >
            <span className="text-3xl mb-2">➕</span>
            <span className="text-sm font-medium text-purple-700">Add Glossary Term</span>
          </Link>

          <Link
            href="/admin/research/studies"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <span className="text-3xl mb-2">📊</span>
            <span className="text-sm font-medium text-gray-700">View Studies</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
