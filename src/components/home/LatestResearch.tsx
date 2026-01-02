import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import researchStudiesData from '@/data/comprehensive-research-studies.json';

export async function LatestResearch() {
  const supabase = await createClient();

  let research: any[] = [];
  let count = 0;

  try {
    // Try to get research from database first
    const { data: dbResearch, count: dbCount } = await supabase
      .from('kb_research_queue')
      .select('id, title, authors, publication, year, url, relevant_topics', { count: 'exact' })
      .eq('status', 'approved')
      .order('year', { ascending: false })
      .limit(4);

    if (dbResearch && dbResearch.length > 0) {
      research = dbResearch;
      count = dbCount || 0;
    } else {
      throw new Error('No database research found');
    }
  } catch (error) {
    console.log('Using static research data for homepage');

    // Use static research data
    const staticResearch = researchStudiesData as any[];
    research = staticResearch
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .slice(0, 4)
      .map((study, index) => ({
        id: `study-${index + 1}`,
        title: study.title,
        authors: study.authors,
        publication: study.publication,
        year: study.year,
        url: study.url,
        relevant_topics: study.relevant_topics || []
      }));

    count = staticResearch.length;
  }

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
              <div className="text-4xl font-bold text-green-700 mb-1">{count || 0}+</div>
              <div className="text-gray-600">Peer-reviewed studies</div>
            </div>
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
            <div className="space-y-4">
              {research?.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <h3 className="font-medium text-gray-900 group-hover:text-green-700 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {item.authors?.split(',').slice(0, 3).join(', ')}
                    {item.authors?.split(',').length > 3 ? ' et al.' : ''}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {item.publication} • {item.year}
                    </span>
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