'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Research Citations Component
 * Displays related scientific studies with quality indicators
 */

// ============================================================================
// Types
// ============================================================================

export interface ResearchStudy {
  id: string;
  title: string;
  slug?: string;
  url: string;
  authors?: string | null;
  publication?: string | null;
  year?: number | null;
  doi?: string | null;
  abstract?: string | null;
  source?: string;
  relevanceScore?: number;
  qualityScore?: number;
  studyType?: string;
  sampleSize?: number;
  topics?: string[];
}

interface ResearchCitationsProps {
  studies: ResearchStudy[];
  title?: string;
  showAbstracts?: boolean;
  maxDisplay?: number;
  compact?: boolean;
  className?: string;
}

// ============================================================================
// Helper Components
// ============================================================================

function QualityBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 70) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getLabel = () => {
    if (score >= 70) return 'High Quality';
    if (score >= 40) return 'Moderate';
    return 'Preliminary';
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getColor()}`}>
      <span>{score}</span>
      <span className="hidden sm:inline">- {getLabel()}</span>
    </span>
  );
}

function StudyTypeBadge({ type }: { type: string }) {
  const typeColors: Record<string, string> = {
    'RCT': 'bg-purple-100 text-purple-700',
    'Meta-Analysis': 'bg-indigo-100 text-indigo-700',
    'Systematic Review': 'bg-blue-100 text-blue-700',
    'Clinical Trial': 'bg-teal-100 text-teal-700',
    'Cohort Study': 'bg-cyan-100 text-cyan-700',
    'Case Study': 'bg-amber-100 text-amber-700',
    'In Vitro': 'bg-pink-100 text-pink-700',
    'Animal Study': 'bg-orange-100 text-orange-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-600'}`}>
      {type}
    </span>
  );
}

function CopyDOIButton({ doi }: { doi: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(`https://doi.org/${doi}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-xs px-2 py-1 rounded transition-colors ${
        copied
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title={copied ? 'Copied!' : 'Copy DOI link'}
    >
      {copied ? 'Copied!' : 'DOI'}
    </button>
  );
}

// ============================================================================
// Study Card Components
// ============================================================================

function CompactStudyCard({ study }: { study: ResearchStudy }) {
  const StudyContent = () => (
    <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-green-400 hover:shadow-sm transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {study.year && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
              {study.year}
            </span>
          )}
          {study.studyType && <StudyTypeBadge type={study.studyType} />}
          {study.qualityScore !== undefined && <QualityBadge score={study.qualityScore} />}
        </div>
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-green-700">
          {study.title}
        </h4>
        {study.publication && (
          <p className="text-xs text-gray-500 mt-1 truncate">{study.publication}</p>
        )}
      </div>
    </div>
  );

  if (study.slug) {
    return (
      <Link href={`/research/study/${study.slug}`} className="group block">
        <StudyContent />
      </Link>
    );
  }

  return (
    <a href={study.url} target="_blank" rel="noopener noreferrer" className="group block">
      <StudyContent />
    </a>
  );
}

function FullStudyCard({ study, showAbstract }: { study: ResearchStudy; showAbstract: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-green-400 hover:shadow-md transition-all">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {study.year && (
            <span className="text-sm px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-medium">
              {study.year}
            </span>
          )}
          {study.studyType && <StudyTypeBadge type={study.studyType} />}
          {study.sampleSize && study.sampleSize > 0 && (
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
              n={study.sampleSize}
            </span>
          )}
        </div>
        {study.qualityScore !== undefined && <QualityBadge score={study.qualityScore} />}
      </div>

      {/* Title */}
      {study.slug ? (
        <Link href={`/research/study/${study.slug}`} className="group">
          <h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors mb-2">
            {study.title}
          </h4>
        </Link>
      ) : (
        <a href={study.url} target="_blank" rel="noopener noreferrer" className="group">
          <h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors mb-2">
            {study.title}
          </h4>
        </a>
      )}

      {/* Authors & Publication */}
      <div className="text-sm text-gray-600 mb-3">
        {study.authors && <p className="line-clamp-1">{study.authors}</p>}
        {study.publication && (
          <p className="text-gray-500 italic">{study.publication}</p>
        )}
      </div>

      {/* Abstract (expandable) */}
      {showAbstract && study.abstract && (
        <div className="mb-3">
          <p className={`text-sm text-gray-600 ${expanded ? '' : 'line-clamp-3'}`}>
            {study.abstract}
          </p>
          {study.abstract.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-green-600 hover:text-green-700 font-medium mt-1"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Topics */}
      {study.topics && study.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {study.topics.slice(0, 4).map((topic, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
            >
              {topic}
            </span>
          ))}
          {study.topics.length > 4 && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
              +{study.topics.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {study.slug ? (
          <Link
            href={`/research/study/${study.slug}`}
            className="text-sm font-medium text-green-600 hover:text-green-700"
          >
            View Details
          </Link>
        ) : (
          <a
            href={study.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-green-600 hover:text-green-700 inline-flex items-center gap-1"
          >
            View Original
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
        {study.doi && <CopyDOIButton doi={study.doi} />}
        {study.source && (
          <span className="text-xs text-gray-400 ml-auto">{study.source}</span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ResearchCitations({
  studies,
  title = 'Related Research',
  showAbstracts = false,
  maxDisplay = 5,
  compact = false,
  className = '',
}: ResearchCitationsProps) {
  const [showAll, setShowAll] = useState(false);

  if (!studies || studies.length === 0) {
    return null;
  }

  const displayedStudies = showAll ? studies : studies.slice(0, maxDisplay);
  const hasMore = studies.length > maxDisplay;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-blue-500">📚</span>
          {title}
        </h3>
        <span className="text-sm text-gray-500">
          {studies.length} {studies.length === 1 ? 'study' : 'studies'}
        </span>
      </div>

      <div className={compact ? 'space-y-2' : 'space-y-4'}>
        {displayedStudies.map((study) =>
          compact ? (
            <CompactStudyCard key={study.id} study={study} />
          ) : (
            <FullStudyCard key={study.id} study={study} showAbstract={showAbstracts} />
          )
        )}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
        >
          {showAll ? 'Show fewer' : `Show all ${studies.length} studies`}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Inline Citation Component (for use within articles)
// ============================================================================

interface InlineCitationProps {
  study: ResearchStudy;
  format?: 'numbered' | 'author-year' | 'simple';
  number?: number;
}

export function InlineCitation({ study, format = 'author-year', number }: InlineCitationProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getLabel = () => {
    switch (format) {
      case 'numbered':
        return `[${number}]`;
      case 'author-year':
        const firstAuthor = study.authors?.split(',')[0]?.split(' ').pop() || 'Unknown';
        return `(${firstAuthor}, ${study.year || 'n.d.'})`;
      case 'simple':
        return `[${study.year || 'n.d.'}]`;
      default:
        return `[${number}]`;
    }
  };

  const LinkWrapper = study.slug ? Link : 'a';
  const linkProps = study.slug
    ? { href: `/research/study/${study.slug}` }
    : { href: study.url, target: '_blank', rel: 'noopener noreferrer' };

  return (
    <span className="relative inline-block">
      <LinkWrapper
        {...(linkProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        className="text-green-600 hover:text-green-700 hover:underline cursor-pointer text-sm font-medium"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {getLabel()}
      </LinkWrapper>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50">
          <p className="font-medium line-clamp-2 mb-1">{study.title}</p>
          {study.authors && (
            <p className="text-gray-300 line-clamp-1">{study.authors}</p>
          )}
          {study.publication && (
            <p className="text-gray-400 italic">{study.publication}, {study.year}</p>
          )}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </span>
  );
}

// ============================================================================
// Citation List Component (for article footers)
// ============================================================================

interface CitationListProps {
  studies: ResearchStudy[];
  format?: 'apa' | 'numbered';
  className?: string;
}

export function CitationList({ studies, format = 'numbered', className = '' }: CitationListProps) {
  if (!studies || studies.length === 0) return null;

  return (
    <div className={`bg-gray-50 rounded-xl border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">References</h3>
      <ol className="space-y-3 text-sm">
        {studies.map((study, idx) => {
          const authors = study.authors || 'Unknown Author';
          const year = study.year || 'n.d.';
          const title = study.title;
          const publication = study.publication || '';
          const doi = study.doi ? `https://doi.org/${study.doi}` : '';

          if (format === 'apa') {
            return (
              <li key={study.id} className="text-gray-700 pl-6 -indent-6">
                {authors} ({year}). {title}. <em>{publication}</em>.
                {doi && (
                  <a href={doi} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline ml-1">
                    {doi}
                  </a>
                )}
              </li>
            );
          }

          return (
            <li key={study.id} className="text-gray-700 flex gap-2">
              <span className="text-gray-400 font-medium">[{idx + 1}]</span>
              <div>
                <span className="font-medium">{title}</span>
                {authors !== 'Unknown Author' && <span className="text-gray-500"> - {authors}</span>}
                {publication && <span className="text-gray-500 italic"> ({publication}, {year})</span>}
                {study.url && (
                  <a
                    href={study.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline ml-1"
                  >
                    [Link]
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default ResearchCitations;
