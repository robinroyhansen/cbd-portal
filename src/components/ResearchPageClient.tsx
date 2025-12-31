'use client';

import React, { useState, useMemo } from 'react';
import {
  QualityTier,
  StudyType,
  detectStudyType,
  calculateQualityScore,
  classifyQualityTier,
  assessStudyQuality,
  sortStudiesByQuality,
  filterStudiesByQuality
} from '@/lib/quality-tiers';
import { QualityBadge, QualityScoreBadge, QualityIndicator } from '@/components/QualityBadge';
import { StudyTypeBadge, StudyTypeBadgeSimple, EvidenceLevelIndicator, StudyTypeFilter } from '@/components/StudyTypeBadge';

interface ResearchItem {
  id: string;
  title: string;
  authors: string;
  publication: string;
  year: number;
  abstract?: string;
  url: string;
  doi?: string;
  source_site?: string;
  source_type: 'research_queue' | 'citation';
  relevant_topics?: string[] | string;
  relevance_score?: number;
}

interface ResearchPageClientProps {
  initialResearch: ResearchItem[];
}

type SortOption = 'quality' | 'year' | 'title' | 'relevance';
type ViewMode = 'cards' | 'table';

export function ResearchPageClient({ initialResearch }: ResearchPageClientProps) {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQualityTiers, setSelectedQualityTiers] = useState<QualityTier[]>([]);
  const [selectedStudyTypes, setSelectedStudyTypes] = useState<StudyType[]>([]);
  const [yearRange, setYearRange] = useState<{ min: number; max: number }>({ min: 0, max: new Date().getFullYear() });
  const [sortBy, setSortBy] = useState<SortOption>('quality');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showHumanStudiesOnly, setShowHumanStudiesOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Calculate quality metrics for all studies
  const studiesWithQuality = useMemo(() => {
    return initialResearch.map(study => {
      const assessment = assessStudyQuality(study);
      return {
        ...study,
        qualityTier: assessment.tier,
        qualityScore: assessment.score,
        studyType: assessment.studyType,
        assessment: assessment
      };
    });
  }, [initialResearch]);

  // Quality tier statistics
  const qualityStats = useMemo(() => {
    const stats = {
      [QualityTier.GOLD_STANDARD]: 0,
      [QualityTier.HIGH_QUALITY]: 0,
      [QualityTier.MODERATE_QUALITY]: 0,
      [QualityTier.LIMITED_EVIDENCE]: 0,
      [QualityTier.PRECLINICAL]: 0
    };

    studiesWithQuality.forEach(study => {
      stats[study.qualityTier]++;
    });

    return stats;
  }, [studiesWithQuality]);

  // Study type statistics
  const studyTypeStats = useMemo(() => {
    const stats: Record<StudyType, number> = {} as Record<StudyType, number>;

    studiesWithQuality.forEach(study => {
      stats[study.studyType] = (stats[study.studyType] || 0) + 1;
    });

    return stats;
  }, [studiesWithQuality]);

  // Available study types and quality tiers
  const availableStudyTypes = useMemo(() => {
    return [...new Set(studiesWithQuality.map(s => s.studyType))];
  }, [studiesWithQuality]);

  const availableQualityTiers = useMemo(() => {
    return [...new Set(studiesWithQuality.map(s => s.qualityTier))];
  }, [studiesWithQuality]);

  // Filtered and sorted studies
  const filteredStudies = useMemo(() => {
    let filtered = studiesWithQuality;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(study =>
        study.title.toLowerCase().includes(query) ||
        study.authors.toLowerCase().includes(query) ||
        study.publication.toLowerCase().includes(query) ||
        (study.abstract && study.abstract.toLowerCase().includes(query))
      );
    }

    // Quality tier filter
    if (selectedQualityTiers.length > 0) {
      filtered = filtered.filter(study => selectedQualityTiers.includes(study.qualityTier));
    }

    // Study type filter
    if (selectedStudyTypes.length > 0) {
      filtered = filtered.filter(study => selectedStudyTypes.includes(study.studyType));
    }

    // Year range filter
    filtered = filtered.filter(study =>
      study.year >= yearRange.min && study.year <= yearRange.max
    );

    // Human studies filter
    if (showHumanStudiesOnly) {
      filtered = filtered.filter(study =>
        study.studyType !== StudyType.ANIMAL_STUDY &&
        study.studyType !== StudyType.IN_VITRO_STUDY
      );
    }

    // Sort
    switch (sortBy) {
      case 'quality':
        filtered.sort((a, b) => b.qualityScore - a.qualityScore);
        break;
      case 'year':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'relevance':
        filtered.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
        break;
    }

    return filtered;
  }, [studiesWithQuality, searchQuery, selectedQualityTiers, selectedStudyTypes, yearRange, sortBy, showHumanStudiesOnly]);

  // Pagination
  const totalPages = Math.ceil(filteredStudies.length / itemsPerPage);
  const paginatedStudies = filteredStudies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handler functions
  const toggleQualityTier = (tier: QualityTier) => {
    setSelectedQualityTiers(prev =>
      prev.includes(tier)
        ? prev.filter(t => t !== tier)
        : [...prev, tier]
    );
    setCurrentPage(1);
  };

  const toggleStudyType = (type: StudyType) => {
    setSelectedStudyTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedQualityTiers([]);
    setSelectedStudyTypes([]);
    setYearRange({ min: 0, max: new Date().getFullYear() });
    setShowHumanStudiesOnly(false);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Quality Overview Dashboard */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Quality Assessment Overview</h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(qualityStats).map(([tier, count]) => (
            <button
              key={tier}
              onClick={() => toggleQualityTier(tier as QualityTier)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                selectedQualityTiers.includes(tier as QualityTier)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <QualityIndicator tier={tier as QualityTier} className="mx-auto mb-1" />
              <div className="text-xl font-bold">{count}</div>
              <div className="text-xs text-gray-600 line-clamp-1">{tier}</div>
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-600 text-center">
          Average Quality Score: <strong>
            {(studiesWithQuality.reduce((sum, s) => sum + s.qualityScore, 0) / studiesWithQuality.length).toFixed(1)}/100
          </strong>
          • Human Studies: <strong>{studiesWithQuality.filter(s => s.studyType !== StudyType.ANIMAL_STUDY && s.studyType !== StudyType.IN_VITRO_STUDY).length} ({Math.round((studiesWithQuality.filter(s => s.studyType !== StudyType.ANIMAL_STUDY && s.studyType !== StudyType.IN_VITRO_STUDY).length / studiesWithQuality.length) * 100)}%)</strong>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Advanced Filters</h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear All Filters
          </button>
        </div>

        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Studies
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, authors, publication, or abstract..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Study Types Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Study Types ({selectedStudyTypes.length} selected)
            </label>
            <StudyTypeFilter
              selectedTypes={selectedStudyTypes}
              onToggleType={toggleStudyType}
              availableTypes={availableStudyTypes}
              className="max-h-32 overflow-y-auto"
            />
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showHumanStudiesOnly}
                onChange={(e) => setShowHumanStudiesOnly(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Human studies only</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="quality">Quality Score</option>
                <option value="year">Publication Year</option>
                <option value="title">Title</option>
                <option value="relevance">Relevance Score</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">View:</label>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 text-sm rounded ${viewMode === 'cards' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-sm rounded ${viewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-gray-600">
          Showing <strong>{paginatedStudies.length}</strong> of <strong>{filteredStudies.length}</strong> studies
          {filteredStudies.length !== studiesWithQuality.length && (
            <span> (filtered from {studiesWithQuality.length} total)</span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Research Results */}
      {viewMode === 'cards' ? (
        <div className="grid gap-6">
          {paginatedStudies.map((study) => (
            <ResearchCard key={study.id} study={study} />
          ))}
        </div>
      ) : (
        <ResearchTable studies={paginatedStudies} />
      )}

      {/* No Results */}
      {filteredStudies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No studies match your current filters.</p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

// Individual study card component
function ResearchCard({ study }: { study: any }) {
  const [expanded, setExpanded] = useState(false);

  const formatTopics = (topics: string[] | string | undefined) => {
    if (!topics) return [];
    if (typeof topics === 'string') {
      try {
        return JSON.parse(topics);
      } catch {
        return [topics];
      }
    }
    return topics;
  };

  const topics = formatTopics(study.relevant_topics);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg leading-tight mb-2">{study.title}</h3>
          <p className="text-sm text-gray-600 mb-3">
            {study.authors} • {study.publication} • {study.year}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <QualityScoreBadge tier={study.qualityTier} score={study.qualityScore} size="md" />
          <StudyTypeBadge studyType={study.studyType} size="sm" />
          <EvidenceLevelIndicator studyType={study.studyType} />
        </div>
      </div>

      {study.abstract && (
        <div className="mb-4">
          <p className={`text-sm text-gray-700 ${expanded ? '' : 'line-clamp-3'}`}>
            {study.abstract}
          </p>
          {study.abstract.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-blue-600 hover:text-blue-700 mt-1"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Topics */}
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {topics.slice(0, 6).map((topic: string, index: number) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {topic}
            </span>
          ))}
          {topics.length > 6 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
              +{topics.length - 6} more
            </span>
          )}
        </div>
      )}

      {/* Quality insights */}
      {study.assessment.strengths.length > 0 && (
        <div className="mb-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-green-700 font-medium mb-1">
              Study Strengths ({study.assessment.strengths.length})
            </summary>
            <ul className="text-green-600 text-xs space-y-0.5 ml-4">
              {study.assessment.strengths.map((strength: string, index: number) => (
                <li key={index}>• {strength}</li>
              ))}
            </ul>
          </details>
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>Source: {study.source_site}</span>
          {study.doi && <span>DOI: {study.doi}</span>}
          {study.relevance_score && <span>Legacy Score: {study.relevance_score}</span>}
        </div>

        <a
          href={study.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
        >
          View Study →
        </a>
      </div>
    </div>
  );
}

// Table view component
function ResearchTable({ studies }: { studies: any[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-3 text-sm font-medium text-gray-900">Study</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-900">Quality</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-900">Type</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-900">Year</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-900">Source</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {studies.map((study) => (
              <tr key={study.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="max-w-md">
                    <h4 className="font-medium text-sm line-clamp-2">{study.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{study.authors.slice(0, 50)}...</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <QualityIndicator tier={study.qualityTier} />
                  <div className="text-xs text-gray-500 mt-1">{study.qualityScore}/100</div>
                </td>
                <td className="px-4 py-3">
                  <StudyTypeBadgeSimple studyType={study.studyType} />
                </td>
                <td className="px-4 py-3 text-sm">{study.year}</td>
                <td className="px-4 py-3 text-sm">{study.source_site}</td>
                <td className="px-4 py-3">
                  <a
                    href={study.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResearchPageClient;