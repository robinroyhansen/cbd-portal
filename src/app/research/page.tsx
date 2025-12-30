import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface ResearchItem {
  id: string;
  title: string;
  authors?: string;
  publication?: string;
  year?: number;
  abstract?: string;
  url: string;
  doi?: string;
  source_site: string;
  relevance_score: number;
  relevant_topics: string[];
  search_term_matched?: string;
  discovered_at: string;
}

export const metadata = {
  title: 'CBD Research Database | Evidence-Based Cannabis Studies',
  description: 'Explore our comprehensive database of peer-reviewed CBD and cannabis research from PubMed, ClinicalTrials.gov, and other authoritative sources. Updated daily with the latest scientific evidence.',
  openGraph: {
    title: 'CBD Research Database | Evidence-Based Cannabis Studies',
    description: 'Explore our comprehensive database of peer-reviewed CBD and cannabis research from PubMed, ClinicalTrials.gov, and other authoritative sources.',
  },
};

export default async function ResearchPage() {
  const supabase = await createClient();

  // Get approved research papers (simplified query to avoid build issues)
  const { data: research, error } = await supabase
    .from('kb_research_queue')
    .select(`
      id,
      title,
      authors,
      publication,
      year,
      abstract,
      url,
      doi,
      source_site,
      relevance_score,
      relevant_topics,
      search_term_matched,
      discovered_at
    `)
    .eq('status', 'approved')
    .order('relevance_score', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching research:', error);
  }

  const researchPapers = research || [];

  // Get unique topics for filtering
  const allTopics = [...new Set(researchPapers.flatMap(r => r.relevant_topics || []))].sort();

  // Get unique sources
  const allSources = [...new Set(researchPapers.map(r => r.source_site))].sort();

  // Statistics
  const stats = {
    total: researchPapers.length,
    sources: allSources.length,
    topics: allTopics.length,
    averageScore: researchPapers.length > 0
      ? Math.round(researchPapers.reduce((sum, r) => sum + r.relevance_score, 0) / researchPapers.length)
      : 0
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          CBD Research Database
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Explore our curated collection of peer-reviewed CBD and cannabis research
          from authoritative sources like PubMed, ClinicalTrials.gov, and leading journals.
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-primary-50 p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Research Papers</div>
        </div>
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.sources}</div>
          <div className="text-sm text-gray-600">Data Sources</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.topics}</div>
          <div className="text-sm text-gray-600">Research Topics</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.averageScore}</div>
          <div className="text-sm text-gray-600">Avg Quality Score</div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mb-8 rounded-lg bg-gray-50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Research Sources</h2>
        <div className="flex flex-wrap gap-2">
          {allSources.map(source => (
            <span
              key={source}
              className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
            >
              {source}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-600">
          All research papers are automatically scanned daily from authoritative medical and scientific databases.
          Papers undergo quality assessment and relevance scoring before inclusion.
        </p>
      </div>

      {/* Research Papers */}
      {researchPapers.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">Research Database Loading</h3>
          <p className="mt-2 text-gray-600">
            Our research scanner is currently building the database.
            New papers are discovered and added daily.
          </p>
          <Link
            href="/articles"
            className="mt-4 inline-block rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            Browse Articles
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {researchPapers.map((paper) => (
            <article
              key={paper.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
                      Quality Score: {paper.relevance_score}%
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                      {paper.source_site}
                    </span>
                    {paper.year && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                        {paper.year}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {paper.title}
                  </h3>

                  {paper.authors && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Authors:</strong> {paper.authors}
                    </p>
                  )}

                  {paper.publication && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Publication:</strong> {paper.publication}
                    </p>
                  )}

                  {paper.abstract && (
                    <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                      {paper.abstract}
                    </p>
                  )}

                  {paper.relevant_topics && paper.relevant_topics.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {paper.relevant_topics.slice(0, 5).map(topic => (
                        <span
                          key={topic}
                          className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                        >
                          {topic}
                        </span>
                      ))}
                      {paper.relevant_topics.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{paper.relevant_topics.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      Discovered: {new Date(paper.discovered_at).toLocaleDateString()}
                    </span>
                    {paper.search_term_matched && (
                      <span>Matched: "{paper.search_term_matched}"</span>
                    )}
                    {paper.doi && (
                      <span>DOI: {paper.doi}</span>
                    )}
                  </div>

                </div>

                <div className="ml-6">
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    View Study
                    <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-12 rounded-lg bg-primary-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-primary-900">
          Want to explore evidence-based articles?
        </h2>
        <p className="mt-2 text-primary-700">
          Our articles reference this research and more, providing practical insights
          backed by scientific evidence.
        </p>
        <Link
          href="/articles"
          className="mt-4 inline-block rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
        >
          Browse Articles
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>Research Disclaimer:</strong> This research database is automatically curated from
          scientific sources and provided for informational purposes only. Always consult with
          healthcare professionals before making medical decisions based on research findings.
        </p>
      </div>
    </div>
  );
}