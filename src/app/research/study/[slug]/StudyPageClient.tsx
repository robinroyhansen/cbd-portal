'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { getSubjectIcon, SampleInfo } from '@/lib/study-analysis';

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
  slug: string;
}

interface RelatedStudy {
  id: string;
  title: string;
  slug: string;
  year: number | null;
  publication: string | null;
}

interface ResearchContext {
  totalInTopic: number;
  qualityScore: number;
  qualityRank: number;
  currentSampleSize: number;
  medianSampleSize: number;
  sampleComparison: 'larger' | 'smaller' | 'average' | 'unknown';
  studyTypeName: string;
  rctCount: number;
  bottomLine: string;
}

interface StudyPageData {
  study: Study;
  readableTitle: string;
  studyTypeLabel: string;
  studyTypeColorClass: string;
  country: { flag: string; name: string } | null;
  primaryTopic: string | null;
  sampleInfo: SampleInfo | null;
  statusInfo: { label: string; icon: string; color: string };
  treatment: string | null;
  readingTime: number;
  findings: KeyFinding[];
  limitations: KeyFinding[];
  assessment: {
    score: number;
    tier: string;
    strengths: string[];
    limitations: string[];
  };
  scoreBreakdown: {
    studyDesign: { score: number };
    methodology: { score: number };
    sampleSize: { score: number };
    relevance: { score: number };
  };
  relatedStudies: RelatedStudy[];
  researchContext: ResearchContext;
  pageUrl: string;
  breadcrumbs: { name: string; url: string }[];
  scholarlyArticleSchema: object;
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

// Share buttons component
function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      '_blank'
    );
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={shareOnTwitter}
        className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
        title="Share on Twitter"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </button>
      <button
        onClick={shareOnLinkedIn}
        className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        title="Share on LinkedIn"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </button>
      <button
        onClick={copyLink}
        className={`p-2 rounded-lg transition-colors ${copied ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        )}
      </button>
    </div>
  );
}

// Citation modal component
function CiteButton({ study }: { study: Study }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const authors = study.authors || 'Unknown Author';
  const year = study.year || 'n.d.';
  const title = study.title;
  const publication = study.publication || 'Unknown Journal';
  const doi = study.doi ? `https://doi.org/${study.doi}` : '';
  const citation = `${authors} (${year}). ${title}. ${publication}${doi ? `. ${doi}` : ''}`;

  const copyCitation = async () => {
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Cite
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Cite This Study</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-2">APA Format</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 font-serif">
                {citation}
              </div>
            </div>

            <button
              onClick={copyCitation}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {copied ? '✓ Copied to clipboard!' : 'Copy to clipboard'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function StudyPageClient({ data }: { data: StudyPageData }) {
  const {
    study,
    readableTitle,
    studyTypeLabel,
    studyTypeColorClass,
    country,
    primaryTopic,
    sampleInfo,
    statusInfo,
    treatment,
    readingTime,
    findings,
    limitations,
    assessment,
    scoreBreakdown,
    relatedStudies,
    researchContext,
    pageUrl,
    breadcrumbs,
    scholarlyArticleSchema,
  } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(scholarlyArticleSchema) }}
      />

      {/* 1. Header with Breadcrumbs */}
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

        {/* 2. Study Type + Year + Country Badge Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${studyTypeColorClass}`}>
            {studyTypeLabel}
          </span>
          {study.year && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
              {study.year}
            </span>
          )}
          {country && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
              {country.flag} {country.name}
            </span>
          )}
        </div>

        {/* 3. Two-Level Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
          {readableTitle}
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Original study: <span className="italic">{study.title}</span>
        </p>

        {/* 4. Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
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

          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.color}`}>
            <span>{statusInfo.icon}</span>
            {statusInfo.label}
          </span>

          {treatment && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
              <span>💊</span>
              {treatment}
            </span>
          )}
        </div>

        {/* 5. Reading Time + Share Buttons */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <span className="text-sm text-gray-500">
            ⏱ {readingTime} min read
          </span>
          <ShareButtons url={pageUrl} title={readableTitle} />
        </div>

        {/* 6. What You Need to Know - MOVED UP */}
        {study.plain_summary && (
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              What You Need to Know
            </h2>
            <p className="text-blue-800 leading-relaxed text-lg">
              {study.plain_summary}
            </p>
          </div>
        )}

        {/* 6.5. Research Context */}
        {primaryTopic && researchContext && researchContext.totalInTopic >= 1 && (
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-200 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Research Context
            </h2>

            {researchContext.totalInTopic === 1 ? (
              /* Only 1 study in topic */
              <p className="text-gray-700 mb-4">
                This is the only {primaryTopic} study in our database so far. More research is needed.
              </p>
            ) : (
              <>
                <p className="text-gray-600 mb-5">
                  This is <span className="font-semibold text-gray-900">1 of {researchContext.totalInTopic}</span>{' '}
                  {primaryTopic} studies in our database.
                </p>

                {/* How This Study Compares */}
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    How This Study Compares
                  </h3>
                  <ul className="space-y-2.5 text-gray-700">
                    {/* Quality */}
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>
                        <span className="font-medium">Quality:</span>{' '}
                        {researchContext.qualityScore}/100 — ranks #{researchContext.qualityRank} of {researchContext.totalInTopic} {primaryTopic} studies
                      </span>
                    </li>

                    {/* Sample Size */}
                    {researchContext.currentSampleSize > 0 && researchContext.medianSampleSize > 0 && (
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>
                          <span className="font-medium">Sample:</span>{' '}
                          {researchContext.currentSampleSize} participants —{' '}
                          {researchContext.sampleComparison === 'larger' && 'larger than average'}
                          {researchContext.sampleComparison === 'smaller' && 'smaller than average'}
                          {researchContext.sampleComparison === 'average' && 'about average'}
                          {' '}({researchContext.medianSampleSize})
                        </span>
                      </li>
                    )}

                    {/* Design */}
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>
                        <span className="font-medium">Design:</span>{' '}
                        {researchContext.studyTypeName}
                        {(researchContext.studyTypeName === 'RCT' ||
                          researchContext.studyTypeName === 'Meta-Analysis' ||
                          researchContext.studyTypeName === 'Systematic Review') && (
                          <span className="text-green-700"> — gold standard</span>
                        )}
                        {researchContext.rctCount > 0 && (
                          <span className="text-gray-500"> ({researchContext.rctCount} of {researchContext.totalInTopic} are gold-standard)</span>
                        )}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Link to filtered research */}
                <Link
                  href={`/research?condition=${primaryTopic}`}
                  className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm mb-5"
                >
                  See all {researchContext.totalInTopic} {primaryTopic} studies →
                </Link>
              </>
            )}

            {/* Bottom Line */}
            <div className="bg-white/80 rounded-lg border border-gray-200 p-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span>💡</span>
                The Bottom Line
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {researchContext.bottomLine}
              </p>
            </div>
          </div>
        )}

        {/* 7. Key Findings */}
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

        {/* 8. Limitations */}
        {(limitations.length > 0 || assessment.limitations.length > 0) && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
              <span>⚠</span>
              Limitations & Considerations
            </h2>
            <ul className="space-y-2">
              {limitations.map((limitation, idx) => (
                <li key={idx} className="flex items-start gap-2 text-amber-700">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {limitation.text}
                </li>
              ))}
              {assessment.limitations.map((limitation, idx) => (
                <li key={`auto-${idx}`} className="flex items-start gap-2 text-amber-700">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {limitation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 9. Quality Assessment - MOVED DOWN (with strengths merged) */}
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
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
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

              {/* Strengths merged in */}
              {assessment.strengths.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-green-700 mb-2">✓ Strengths</h3>
                  <ul className="space-y-1">
                    {assessment.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Circular Score */}
            <div className="flex-shrink-0">
              <CircularQualityScore score={assessment.score} size={72} />
            </div>
          </div>
          <Link
            href="/research/methodology"
            className="inline-block mt-4 text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            How we calculate this →
          </Link>
        </div>

        {/* 10. Study Details (expanded with authors, original title) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Study Details</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <th className="py-3 pr-4 text-gray-500 font-medium w-1/3">Original Title</th>
                  <td className="py-3 text-gray-900 italic">{study.title}</td>
                </tr>
                {study.authors && (
                  <tr>
                    <th className="py-3 pr-4 text-gray-500 font-medium">Authors</th>
                    <td className="py-3 text-gray-900">{study.authors}</td>
                  </tr>
                )}
                {study.publication && (
                  <tr>
                    <th className="py-3 pr-4 text-gray-500 font-medium">Publication</th>
                    <td className="py-3 text-gray-900">{study.publication}</td>
                  </tr>
                )}
                {study.year && (
                  <tr>
                    <th className="py-3 pr-4 text-gray-500 font-medium">Published</th>
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
                {country && (
                  <tr>
                    <th className="py-3 pr-4 text-gray-500 font-medium">Country</th>
                    <td className="py-3 text-gray-900">{country.flag} {country.name}</td>
                  </tr>
                )}
                {study.source_site && (
                  <tr>
                    <th className="py-3 pr-4 text-gray-500 font-medium">Source</th>
                    <td className="py-3 text-gray-900">{study.source_site}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
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
                View Original
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
                Full Text (DOI)
              </a>
            )}
            <CiteButton study={study} />
          </div>
        </div>

        {/* 11. Original Abstract (collapsible) */}
        {study.abstract && (
          <details className="bg-gray-50 rounded-xl border border-gray-200 mb-6 group">
            <summary className="p-6 cursor-pointer select-none flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium list-none">
              <span>📄</span>
              <span>Original Abstract</span>
              <span className="text-sm text-gray-500 ml-1">(click to expand)</span>
              <svg className="w-5 h-5 ml-auto transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-6 pb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-serif">
                {study.abstract}
              </p>
            </div>
          </details>
        )}

        {/* 12. Related Research */}
        {relatedStudies.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Related Research
              {primaryTopic && <span className="text-gray-500 font-normal text-base ml-2">in {primaryTopic}</span>}
            </h2>
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

        {/* 13. Related Articles Placeholder */}
        {primaryTopic && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span>📚</span>
              Related Articles
            </h2>
            <p className="text-gray-500">
              Articles about {primaryTopic.charAt(0).toUpperCase() + primaryTopic.slice(1)} coming soon.
            </p>
          </div>
        )}

        {/* 14. Questions Placeholder */}
        <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-2xl">💬</span>
            Questions About This Study?
          </h2>
          <p className="text-gray-600">
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
