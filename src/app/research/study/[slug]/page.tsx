import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import {
  assessStudyQuality,
  calculateQualityScoreWithBreakdown,
  detectStudyType,
  StudyType,
  getStudyTypeColor
} from '@/lib/quality-tiers';
import {
  extractSampleInfo,
  extractStudyStatus,
  extractTreatment,
  getSubjectIcon,
  getStudyStatusInfo
} from '@/lib/study-analysis';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cbd-portal.vercel.app';

interface Props {
  params: Promise<{ slug: string }>;
}

interface KeyFinding {
  text: string;
  type: 'finding' | 'limitation';
}

interface Study {
  id: string;
  title: string;
  authors: string | null;
  publication: string | null;
  year: number | null;
  abstract: string | null;
  plain_summary: string | null;
  url: string;
  doi: string | null;
  source_site: string | null;
  relevant_topics: string[] | null;
  relevance_score: number | null;
  slug: string;
  key_findings: KeyFinding[] | null;
  study_quality: string | null;
  study_type: string | null;
  meta_title: string | null;
  meta_description: string | null;
  discovered_at: string;
}

// Topic/condition colors
const TOPIC_COLORS: Record<string, string> = {
  'anxiety': 'bg-purple-100 text-purple-700',
  'pain': 'bg-red-100 text-red-700',
  'sleep': 'bg-indigo-100 text-indigo-700',
  'epilepsy': 'bg-yellow-100 text-yellow-700',
  'depression': 'bg-blue-100 text-blue-700',
  'inflammation': 'bg-orange-100 text-orange-700',
  'cancer': 'bg-pink-100 text-pink-700',
  'nausea': 'bg-teal-100 text-teal-700',
  'skin': 'bg-rose-100 text-rose-700',
  'arthritis': 'bg-amber-100 text-amber-700',
  'stress': 'bg-violet-100 text-violet-700',
  'neurological': 'bg-cyan-100 text-cyan-700',
  'addiction': 'bg-slate-100 text-slate-700',
  'ptsd': 'bg-fuchsia-100 text-fuchsia-700',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Circular quality score component
function CircularQualityScore({ score, size = 56 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return { stroke: '#22c55e', bg: '#dcfce7', text: '#166534' };
    if (s >= 40) return { stroke: '#eab308', bg: '#fef9c3', text: '#854d0e' };
    return { stroke: '#ef4444', bg: '#fee2e2', text: '#991b1b' };
  };

  const colors = getColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={colors.bg}
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-bold"
        style={{ color: colors.text, fontSize: size * 0.3 }}
      >
        {score}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: study } = await supabase
    .from('kb_research_queue')
    .select('title, authors, year, publication, meta_title, meta_description, plain_summary')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single();

  if (!study) {
    return {
      title: 'Study Not Found | CBD Portal Research',
      description: 'This research study could not be found.',
      robots: { index: false, follow: false }
    };
  }

  const year = study.year || new Date().getFullYear();
  const defaultTitle = study.title.length > 55
    ? `${study.title.substring(0, 55)}... (${year})`
    : `${study.title} (${year})`;

  const title = study.meta_title || defaultTitle;

  const defaultDescription = study.plain_summary
    ? study.plain_summary.substring(0, 155) + (study.plain_summary.length > 155 ? '...' : '')
    : `Read our plain-language summary of this ${year} CBD research study published in ${study.publication || 'a peer-reviewed journal'}.`;

  const description = study.meta_description || defaultDescription;
  const canonicalUrl = `${SITE_URL}/research/study/${slug}`;

  return {
    title: `${title} | CBD Portal Research`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      siteName: 'CBD Portal'
    },
    twitter: { card: 'summary', title, description },
    robots: { index: true, follow: true }
  };
}

export default async function ResearchStudyPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: study, error } = await supabase
    .from('kb_research_queue')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single();

  if (error || !study) {
    notFound();
  }

  // Analyze study using shared utilities
  const studyText = `${study.title || ''} ${study.abstract || ''}`;
  const assessment = assessStudyQuality(study);
  const scoreBreakdown = calculateQualityScoreWithBreakdown(study);
  const detectedStudyType = detectStudyType(study);
  const sampleInfo = extractSampleInfo(studyText, detectedStudyType);
  const studyStatus = extractStudyStatus(studyText, study.url);
  const treatment = extractTreatment(studyText);
  const statusInfo = getStudyStatusInfo(studyStatus);

  // Get primary topic
  const primaryTopic = study.relevant_topics?.[0] || null;

  // Fetch related studies
  let relatedStudies: Study[] = [];
  if (study.relevant_topics && study.relevant_topics.length > 0) {
    const { data } = await supabase
      .from('kb_research_queue')
      .select('id, title, slug, year, publication, relevant_topics')
      .eq('status', 'approved')
      .neq('id', study.id)
      .overlaps('relevant_topics', study.relevant_topics)
      .limit(4);
    relatedStudies = data || [];
  }

  // Fetch citing articles
  const { data: citingArticles } = await supabase
    .from('kb_article_research')
    .select(`
      article_id,
      kb_articles (title, slug)
    `)
    .eq('research_id', study.id)
    .limit(5);

  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Research', url: `${SITE_URL}/research` },
    { name: 'Study Details', url: `${SITE_URL}/research/study/${slug}` }
  ];

  const keyFindings = (study.key_findings as KeyFinding[]) || [];
  const findings = keyFindings.filter(f => f.type === 'finding');
  const limitations = keyFindings.filter(f => f.type === 'limitation');

  // Schema.org ScholarlyArticle
  const scholarlyArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    '@id': `${SITE_URL}/research/study/${slug}`,
    'headline': study.title,
    'name': study.title,
    ...(study.authors && { 'author': study.authors.split(',').map((name: string) => ({ '@type': 'Person', 'name': name.trim() })) }),
    ...(study.publication && { 'isPartOf': { '@type': 'Periodical', 'name': study.publication } }),
    ...(study.year && { 'datePublished': `${study.year}` }),
    ...(study.doi && { 'identifier': { '@type': 'PropertyValue', 'propertyID': 'doi', 'value': study.doi } }),
    ...(study.abstract && { 'abstract': study.abstract }),
    ...(study.url && { 'url': study.url }),
    'publisher': { '@type': 'Organization', 'name': study.source_site || 'Academic Publisher' }
  };

  // Study type display info
  const studyTypeLabel = detectedStudyType !== StudyType.UNKNOWN ? detectedStudyType : (study.study_type || 'Research Study');
  const studyTypeColorClass = getStudyTypeColor(detectedStudyType);

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(scholarlyArticleSchema) }}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/research"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Research Database
        </Link>

        {/* Main Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
          {/* Study Type Badge & Year Row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${studyTypeColorClass}`}>
              {studyTypeLabel}
            </span>
            {study.year && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {study.year}
              </span>
            )}
            {study.publication && (
              <span className="text-sm text-gray-500 hidden sm:inline">
                {study.publication}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {study.title}
          </h1>

          {/* Authors */}
          {study.authors && (
            <p className="text-gray-600 mb-5">
              <span className="font-medium">Authors:</span> {study.authors}
            </p>
          )}

          {/* Info Badges Row - Like List View */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
            {/* Primary Topic */}
            {primaryTopic && (
              <Link
                href={`/research/${primaryTopic}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-opacity hover:opacity-80 ${
                  TOPIC_COLORS[primaryTopic] || 'bg-gray-100 text-gray-700'
                }`}
              >
                <span>🎯</span>
                {primaryTopic.charAt(0).toUpperCase() + primaryTopic.slice(1)}
              </Link>
            )}

            {/* Sample Size */}
            {sampleInfo && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                sampleInfo.subjectType === 'cells' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                sampleInfo.subjectType === 'mice' || sampleInfo.subjectType === 'rats' || sampleInfo.subjectType === 'animals' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                <span>{getSubjectIcon(sampleInfo.subjectType)}</span>
                {sampleInfo.label}
              </span>
            )}

            {/* Study Status */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.color}`}>
              <span>{statusInfo.icon}</span>
              {statusInfo.label}
            </span>

            {/* Treatment */}
            {treatment && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                <span>💊</span>
                {treatment}
              </span>
            )}
          </div>
        </div>

        {/* Quality Score Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Quality Assessment</h2>
              <p className="text-gray-600 mb-4">{assessment.tier}</p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    assessment.score >= 70 ? 'bg-green-500' :
                    assessment.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${assessment.score}%` }}
                />
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Study Design</span>
                  <span className="font-medium">{scoreBreakdown.studyDesign.score}/50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Methodology</span>
                  <span className="font-medium">{scoreBreakdown.methodology.score}/25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sample Size</span>
                  <span className="font-medium">{scoreBreakdown.sampleSize.score}/15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Relevance</span>
                  <span className="font-medium">{scoreBreakdown.relevance.score}/10</span>
                </div>
              </div>
            </div>

            {/* Circular Score */}
            <div className="flex-shrink-0">
              <CircularQualityScore score={assessment.score} size={72} />
            </div>
          </div>
        </div>

        {/* Study Strengths */}
        {assessment.strengths.length > 0 && (
          <div className="bg-green-50 rounded-xl border border-green-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
              <span>✓</span>
              Study Strengths
            </h2>
            <ul className="space-y-2">
              {assessment.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-green-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* In Simple Terms (Plain Language Summary) */}
        {study.plain_summary && (
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              In Simple Terms
            </h2>
            <p className="text-blue-800 leading-relaxed text-lg">
              {study.plain_summary}
            </p>

            <div className="mt-6 pt-6 border-t border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">What This Means For You</h3>
              <p className="text-blue-700">
                This research contributes to our understanding of CBD and its potential applications.
                Always consult with a healthcare professional before making decisions based on research findings.
              </p>
            </div>
          </div>
        )}

        {/* Key Findings */}
        {findings.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-500">📋</span>
              Key Findings
            </h2>
            <ul className="space-y-3">
              {findings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5 text-lg">✓</span>
                  <span className="text-gray-700">{finding.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Limitations */}
        {(limitations.length > 0 || assessment.limitations.length > 0) && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
              <span>⚠</span>
              Limitations & Considerations
            </h2>
            <ul className="space-y-2">
              {limitations.map((limitation, idx) => (
                <li key={idx} className="flex items-start gap-2 text-amber-700">
                  <span className="text-amber-500 mt-0.5">⚠</span>
                  {limitation.text}
                </li>
              ))}
              {assessment.limitations.map((limitation, idx) => (
                <li key={`auto-${idx}`} className="flex items-start gap-2 text-amber-700">
                  <span className="text-amber-500 mt-0.5">⚠</span>
                  {limitation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Original Abstract */}
        {study.abstract && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-gray-500">📄</span>
              Original Abstract
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-serif">
              {study.abstract}
            </p>
          </div>
        )}

        {/* Study Details Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Study Details</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-100">
                {study.publication && (
                  <tr>
                    <th className="py-3 pr-4 text-gray-500 font-medium w-1/3">Publication</th>
                    <td className="py-3 text-gray-900">{study.publication}</td>
                  </tr>
                )}
                {study.year && (
                  <tr>
                    <th className="py-3 pr-4 text-gray-500 font-medium">Year</th>
                    <td className="py-3 text-gray-900">{study.year}</td>
                  </tr>
                )}
                {study.doi && (
                  <tr>
                    <th className="py-3 pr-4 text-gray-500 font-medium">DOI</th>
                    <td className="py-3">
                      <a
                        href={`https://doi.org/${study.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 hover:underline"
                      >
                        {study.doi}
                      </a>
                    </td>
                  </tr>
                )}
                {sampleInfo && sampleInfo.size > 0 && (
                  <tr>
                    <th className="py-3 pr-4 text-gray-500 font-medium">Sample Size</th>
                    <td className="py-3 text-gray-900">{sampleInfo.label}</td>
                  </tr>
                )}
                {treatment && (
                  <tr>
                    <th className="py-3 pr-4 text-gray-500 font-medium">Treatment</th>
                    <td className="py-3 text-gray-900">{treatment}</td>
                  </tr>
                )}
                {study.source_site && (
                  <tr>
                    <th className="py-3 pr-4 text-gray-500 font-medium">Source</th>
                    <td className="py-3 text-gray-900">{study.source_site}</td>
                  </tr>
                )}
                <tr>
                  <th className="py-3 pr-4 text-gray-500 font-medium">Added to Database</th>
                  <td className="py-3 text-gray-900">{formatDate(study.discovered_at)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* External Links */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
            {study.url && (
              <a
                href={study.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on {study.source_site || 'Source'}
              </a>
            )}
            {study.doi && (
              <a
                href={`https://doi.org/${study.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Full Text (DOI)
              </a>
            )}
          </div>
        </div>

        {/* Cited In Articles */}
        {citingArticles && citingArticles.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cited In Our Articles</h2>
            <div className="space-y-3">
              {citingArticles.map((item: any) => (
                <Link
                  key={item.article_id}
                  href={`/articles/${item.kb_articles?.slug}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <span className="text-green-600">→</span>
                  <span className="text-gray-700 group-hover:text-green-700 transition-colors">
                    {item.kb_articles?.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Studies */}
        {relatedStudies.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Research</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {relatedStudies.map((related) => (
                <Link
                  key={related.id}
                  href={`/research/study/${related.slug}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {related.year && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {related.year}
                      </span>
                    )}
                    {related.publication && (
                      <span className="text-xs text-gray-500 truncate">
                        {related.publication}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Placeholder */}
        <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-2xl">💬</span>
            Questions About This Study?
          </h2>
          <p className="text-gray-600 mb-4">
            Have questions about this research? Our comment system is coming soon.
            In the meantime, feel free to{' '}
            <Link href="/contact" className="text-green-600 hover:text-green-700 underline">
              contact us
            </Link>{' '}
            with your questions.
          </p>
        </div>

        {/* Back to Research */}
        <div className="text-center pt-4">
          <Link
            href="/research"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Research Database
          </Link>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
