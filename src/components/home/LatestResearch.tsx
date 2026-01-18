import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

function QualityBadge({ score }: { score: number }) {
  let color = 'bg-gray-100 text-gray-600';
  let label = 'Unrated';

  if (score >= 80) {
    color = 'bg-green-100 text-green-700';
    label = 'High';
  } else if (score >= 60) {
    color = 'bg-blue-100 text-blue-700';
    label = 'Good';
  } else if (score >= 40) {
    color = 'bg-yellow-100 text-yellow-700';
    label = 'Moderate';
  } else if (score > 0) {
    color = 'bg-orange-100 text-orange-700';
    label = 'Low';
  }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {score > 0 ? `${score}% ${label}` : label}
    </span>
  );
}

function StudyTypeBadge({ type }: { type: string }) {
  const badges: Record<string, { color: string; label: string }> = {
    human: { color: 'bg-blue-50 text-blue-600', label: '👤 Human' },
    animal: { color: 'bg-orange-50 text-orange-600', label: '🐭 Preclinical' },
    review: { color: 'bg-purple-50 text-purple-600', label: '📚 Review' },
    in_vitro: { color: 'bg-cyan-50 text-cyan-600', label: '🧫 In Vitro' },
  };

  const badge = badges[type] || { color: 'bg-gray-50 text-gray-600', label: type };

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded ${badge.color}`}>
      {badge.label}
    </span>
  );
}

export async function LatestResearch() {
  const supabase = await createClient();

  // Get latest high-quality research
  const { data: latestResearch, count: totalCount } = await supabase
    .from('kb_research_queue')
    .select('id, title, authors, publication, year, url, relevant_topics, quality_score, study_subject, plain_summary', { count: 'exact' })
    .eq('status', 'approved')
    .order('year', { ascending: false })
    .order('quality_score', { ascending: false })
    .limit(4);

  // Get top-rated research (highest quality scores)
  const { data: topRatedResearch } = await supabase
    .from('kb_research_queue')
    .select('id, title, authors, publication, year, url, quality_score, study_subject')
    .eq('status', 'approved')
    .not('quality_score', 'is', null)
    .gte('quality_score', 70)
    .order('quality_score', { ascending: false })
    .limit(4);

  const research = latestResearch || [];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Left side - info */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Research Database</h2>
            <p className="text-gray-600 mb-6">
              We continuously monitor PubMed, ClinicalTrials.gov, and peer-reviewed journals
              for the latest CBD and cannabis research.
            </p>
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <div className="text-4xl font-bold text-green-700 mb-1">{totalCount?.toLocaleString() || 0}</div>
              <div className="text-gray-600 mb-3">Peer-reviewed studies</div>
              <div className="text-sm text-gray-500">
                Each study is quality-scored and summarized in plain language
              </div>
            </div>

            {/* Top rated preview */}
            {topRatedResearch && topRatedResearch.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Highest Rated
                </h3>
                <div className="space-y-2">
                  {topRatedResearch.slice(0, 2).map((study) => (
                    <a
                      key={study.id}
                      href={study.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <QualityBadge score={study.quality_score || 0} />
                        {study.study_subject && <StudyTypeBadge type={study.study_subject} />}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-1">{study.title}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/research"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Browse Research
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Right side - research list */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Latest Studies
              </h3>
              <Link href="/research" className="text-sm text-green-600 hover:text-green-700">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {research.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {item.quality_score && <QualityBadge score={item.quality_score} />}
                    {item.study_subject && <StudyTypeBadge type={item.study_subject} />}
                    <span className="text-xs text-gray-400 ml-auto">{item.year}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-green-700 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  {item.plain_summary && (
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                      {item.plain_summary}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {item.authors?.split(',').slice(0, 2).join(', ')}
                      {item.authors?.split(',').length > 2 ? ' et al.' : ''}
                      {item.publication && ` • ${item.publication}`}
                    </p>
                    <span className="text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      View study →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
