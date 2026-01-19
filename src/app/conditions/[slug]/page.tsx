import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: condition } = await supabase
    .from('kb_conditions')
    .select('name, display_name, meta_title, meta_description, short_description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!condition) {
    return { title: 'Condition Not Found | CBD Portal' };
  }

  return {
    title: condition.meta_title || `CBD for ${condition.display_name || condition.name} | CBD Portal`,
    description: condition.meta_description || condition.short_description,
    alternates: {
      canonical: `/conditions/${slug}`,
    },
  };
}

export default async function ConditionPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get condition details
  const { data: condition } = await supabase
    .from('kb_conditions')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!condition) notFound();

  // Get related research studies
  const { data: research } = await supabase
    .from('kb_research_queue')
    .select('id, title, slug, year, study_type, study_subject, sample_size, quality_score, plain_summary')
    .eq('status', 'approved')
    .or(`primary_topic.eq.${slug},relevant_topics.cs.{${slug}}`)
    .order('quality_score', { ascending: false })
    .limit(10);

  // Get related conditions
  let relatedConditions = [];
  if (condition.related_condition_slugs && condition.related_condition_slugs.length > 0) {
    const { data } = await supabase
      .from('kb_conditions')
      .select('slug, name, display_name, short_description, research_count')
      .in('slug', condition.related_condition_slugs)
      .eq('is_published', true);
    relatedConditions = data || [];
  }

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Conditions', url: 'https://cbd-portal.vercel.app/conditions' },
    { name: condition.display_name || condition.name, url: `https://cbd-portal.vercel.app/conditions/${slug}` }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          CBD and {condition.display_name || condition.name}
        </h1>
        <p className="text-xl text-gray-600">
          {condition.short_description}
        </p>

        {/* Stats */}
        {condition.research_count > 0 && (
          <div className="mt-4 flex items-center gap-4">
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {condition.research_count} Research Studies
            </span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="prose prose-lg max-w-none mb-12">
        {condition.description ? (
          <div dangerouslySetInnerHTML={{ __html: condition.description }} />
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="text-amber-800 font-semibold mb-2">Article Coming Soon</h3>
            <p className="text-amber-700">
              We&apos;re currently preparing a comprehensive article on CBD and {condition.display_name || condition.name}.
              In the meantime, you can explore the research studies below.
            </p>
          </div>
        )}
      </div>

      {/* Research Studies */}
      {research && research.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Related Research</h2>
          <div className="space-y-4">
            {research.map((study) => (
              <Link
                key={study.id}
                href={`/research/study/${study.slug}`}
                className="block p-5 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {study.title}
                    </h3>
                    {study.plain_summary && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {study.plain_summary}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-gray-500">{study.year}</span>
                      {study.study_type && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {study.study_type}
                        </span>
                      )}
                      {study.study_subject && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {study.study_subject}
                        </span>
                      )}
                      {study.sample_size && (
                        <span className="text-gray-500">n={study.sample_size}</span>
                      )}
                    </div>
                  </div>
                  {study.quality_score && (
                    <div className="flex-shrink-0 text-center">
                      <div className={`text-lg font-bold ${
                        study.quality_score >= 70 ? 'text-green-600' :
                        study.quality_score >= 50 ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                        {study.quality_score}
                      </div>
                      <div className="text-xs text-gray-400">Quality</div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <Link
            href={`/research/${slug}`}
            className="inline-flex items-center gap-2 mt-4 text-green-700 hover:text-green-800 font-medium"
          >
            View all research on {condition.display_name || condition.name}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Related Conditions */}
      {relatedConditions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Related Conditions</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {relatedConditions.map((related: { slug: string; name: string; display_name?: string; short_description?: string; research_count?: number }) => (
              <Link
                key={related.slug}
                href={`/conditions/${related.slug}`}
                className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all"
              >
                <h3 className="font-semibold text-gray-900">
                  {related.display_name || related.name}
                </h3>
                {related.short_description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {related.short_description}
                  </p>
                )}
                {related.research_count && related.research_count > 0 && (
                  <span className="text-xs text-green-600 mt-2 inline-block">
                    {related.research_count} studies
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back Navigation */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-8">
        <Link
          href="/conditions"
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Conditions
        </Link>
        <Link
          href="/research"
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
        >
          Research Database
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="mt-12 p-6 bg-gray-50 rounded-xl text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-2">Medical Disclaimer</p>
        <p>
          This information is for educational purposes only and is not intended as medical advice.
          Always consult with a healthcare professional before using CBD, especially if you have a
          medical condition or are taking medications.
        </p>
      </div>
    </div>
  );
}
