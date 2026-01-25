'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth, useAdminFetch } from '@/lib/admin-auth';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/translation-service';

// Exclude English (source language)
const TARGET_LANGUAGES = Object.entries(SUPPORTED_LANGUAGES)
  .filter(([code]) => code !== 'en')
  .map(([code, info]) => ({
    code: code as LanguageCode,
    ...info,
  }));

type ContentType = 'conditions' | 'glossary' | 'articles' | 'research';
type TranslationStatus = 'all' | 'translated' | 'missing';

interface ContentTypeStats {
  total: number;
  translated: Record<LanguageCode, number>;
  missing: Record<LanguageCode, number>;
  percentage: Record<LanguageCode, number>;
}

interface TranslationStatusData {
  conditions: ContentTypeStats;
  glossary: ContentTypeStats;
  articles: ContentTypeStats;
  research: ContentTypeStats;
  overall: {
    totalItems: number;
    totalTranslations: number;
    averagePercentage: number;
    byLanguage: Record<
      LanguageCode,
      { total: number; translated: number; percentage: number }
    >;
  };
}

interface MissingItem {
  id: string;
  name: string;
  description?: string;
  missingLanguages: LanguageCode[];
  translatedLanguages: LanguageCode[];
}

interface PreviewData {
  original: Record<string, unknown>;
  translation: Record<string, unknown>;
  qualityIndicators: {
    characterCount: { original: number; translated: number; ratio: number };
    wordCount: { original: number; translated: number; ratio: number };
    preservedTerms: string[];
    warnings: string[];
  };
}

interface BulkTranslationProgress {
  isRunning: boolean;
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: string[];
}

export default function TranslationsPage() {
  const adminFetch = useAdminFetch();
  const { getAuthHeaders } = useAdminAuth();

  // State
  const [statusData, setStatusData] = useState<TranslationStatusData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('da');
  const [selectedContentType, setSelectedContentType] = useState<ContentType>('conditions');
  const [translationStatus, setTranslationStatus] = useState<TranslationStatus>('missing');
  const [items, setItems] = useState<MissingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [previewItem, setPreviewItem] = useState<MissingItem | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<BulkTranslationProgress>({
    isRunning: false,
    totalProcessed: 0,
    successful: 0,
    failed: 0,
    errors: [],
  });

  // Load translation status
  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch('/api/admin/translations/status');
      if (response.ok) {
        const data = await response.json();
        setStatusData(data);
      }
    } catch (error) {
      console.error('Failed to load translation status:', error);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  // Load items for selected content type and language
  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const params = new URLSearchParams({
        type: selectedContentType,
        language: selectedLanguage,
        limit: '100',
      });

      const response = await adminFetch(`/api/admin/translations/missing?${params}`);
      if (response.ok) {
        const data = await response.json();
        let filteredItems = data.items || [];

        // Filter by translation status
        if (translationStatus === 'translated') {
          filteredItems = filteredItems.filter(
            (item: MissingItem) => item.translatedLanguages.includes(selectedLanguage)
          );
        } else if (translationStatus === 'missing') {
          filteredItems = filteredItems.filter(
            (item: MissingItem) => item.missingLanguages.includes(selectedLanguage)
          );
        }

        setItems(filteredItems);
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoadingItems(false);
    }
  }, [adminFetch, selectedContentType, selectedLanguage, translationStatus]);

  // Load preview
  const loadPreview = useCallback(
    async (item: MissingItem) => {
      setPreviewItem(item);
      setLoadingPreview(true);
      setPreviewData(null);

      try {
        const response = await adminFetch('/api/admin/translations/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contentType: selectedContentType,
            id: item.id,
            targetLanguage: selectedLanguage,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setPreviewData(data);
        } else {
          const error = await response.json();
          console.error('Preview error:', error);
        }
      } catch (error) {
        console.error('Failed to load preview:', error);
      } finally {
        setLoadingPreview(false);
      }
    },
    [adminFetch, selectedContentType, selectedLanguage]
  );

  // Bulk translate selected items
  const handleBulkTranslate = async () => {
    if (selectedItems.size === 0) return;

    setBulkProgress({
      isRunning: true,
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      errors: [],
    });

    try {
      const response = await adminFetch('/api/admin/translations/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: selectedContentType,
          targetLanguages: [selectedLanguage],
          ids: Array.from(selectedItems),
          batchSize: selectedItems.size,
        }),
      });

      const data = await response.json();

      setBulkProgress({
        isRunning: false,
        totalProcessed: data.totalProcessed || 0,
        successful: data.successful || 0,
        failed: data.failed || 0,
        errors: data.errors || [],
      });

      // Refresh data after translation
      if (data.successful > 0) {
        setSelectedItems(new Set());
        await loadStatus();
        await loadItems();
      }
    } catch (error) {
      setBulkProgress((prev) => ({
        ...prev,
        isRunning: false,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error'],
      }));
    }
  };

  // Save single translation from preview
  const handleSaveTranslation = async () => {
    if (!previewItem || !previewData) return;

    setBulkProgress({
      isRunning: true,
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      errors: [],
    });

    try {
      const response = await adminFetch('/api/admin/translations/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: selectedContentType,
          targetLanguages: [selectedLanguage],
          ids: [previewItem.id],
          batchSize: 1,
        }),
      });

      const data = await response.json();

      setBulkProgress({
        isRunning: false,
        totalProcessed: data.totalProcessed || 0,
        successful: data.successful || 0,
        failed: data.failed || 0,
        errors: data.errors || [],
      });

      if (data.successful > 0) {
        setPreviewItem(null);
        setPreviewData(null);
        await loadStatus();
        await loadItems();
      }
    } catch (error) {
      setBulkProgress((prev) => ({
        ...prev,
        isRunning: false,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error'],
      }));
    }
  };

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select/deselect all items
  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  // Initial load
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Load items when filters change
  useEffect(() => {
    loadItems();
    setSelectedItems(new Set());
  }, [loadItems]);

  // Get percentage color
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Get quality color
  const getQualityColor = (ratio: number) => {
    if (ratio >= 0.8 && ratio <= 1.5) return 'text-green-600';
    if (ratio >= 0.5 && ratio <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Translation Management</h1>
        <p className="text-gray-600">
          Manage translations for conditions, glossary terms, articles, and research summaries
          across {TARGET_LANGUAGES.length} languages.
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Status Overview */}
      {statusData && !loading && (
        <>
          {/* Language Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-4 overflow-x-auto pb-1" aria-label="Languages">
                {TARGET_LANGUAGES.map((lang) => {
                  const stats = statusData.overall.byLanguage[lang.code];
                  const isSelected = selectedLanguage === lang.code;

                  return (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`
                        whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors
                        ${
                          isSelected
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{lang.nativeName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getPercentageColor(stats?.percentage || 0)}`}>
                          {stats?.percentage || 0}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {(['conditions', 'glossary', 'articles', 'research'] as ContentType[]).map((type) => {
              const stats = statusData[type];
              const translated = stats.translated[selectedLanguage] || 0;
              const missing = stats.missing[selectedLanguage] || 0;
              const percentage = stats.percentage[selectedLanguage] || 0;
              const isSelected = selectedContentType === type;

              return (
                <button
                  key={type}
                  onClick={() => setSelectedContentType(type)}
                  className={`
                    text-left p-4 rounded-lg border-2 transition-all
                    ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <h3 className="text-sm font-medium text-gray-500 capitalize">{type}</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{translated}</span>
                    <span className="text-sm text-gray-500">/ {stats.total}</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage >= 90
                            ? 'bg-green-500'
                            : percentage >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {missing} missing translations
                  </p>
                </button>
              );
            })}
          </div>

          {/* Content Filter */}
          <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              {(['all', 'missing', 'translated'] as TranslationStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setTranslationStatus(status)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      translationStatus === status
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {status === 'all' ? 'All' : status === 'missing' ? 'Missing' : 'Translated'}
                </button>
              ))}
            </div>

            {/* Bulk Actions */}
            {selectedItems.size > 0 && translationStatus === 'missing' && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleBulkTranslate}
                  disabled={bulkProgress.isRunning}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {bulkProgress.isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Translating...
                    </>
                  ) : (
                    <>
                      Translate Selected to {SUPPORTED_LANGUAGES[selectedLanguage].nativeName}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Progress indicator */}
          {bulkProgress.isRunning && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-blue-800">
                  Translating... {bulkProgress.totalProcessed} items processed
                </span>
              </div>
            </div>
          )}

          {/* Results summary */}
          {!bulkProgress.isRunning && bulkProgress.totalProcessed > 0 && (
            <div
              className={`mb-4 p-4 border rounded-lg ${
                bulkProgress.failed > 0
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <p className={bulkProgress.failed > 0 ? 'text-yellow-800' : 'text-green-800'}>
                Translation complete: {bulkProgress.successful} successful, {bulkProgress.failed} failed
              </p>
              {bulkProgress.errors.length > 0 && (
                <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                  {bulkProgress.errors.slice(0, 3).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                  {bulkProgress.errors.length > 3 && (
                    <li>...and {bulkProgress.errors.length - 3} more errors</li>
                  )}
                </ul>
              )}
            </div>
          )}

          {/* Items Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loadingItems ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {translationStatus === 'missing'
                  ? 'All items are translated!'
                  : translationStatus === 'translated'
                  ? 'No translated items found.'
                  : 'No items found.'}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {translationStatus === 'missing' && (
                      <th className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.size === items.length && items.length > 0}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 text-primary-600 rounded border-gray-300"
                        />
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => {
                    const isMissing = item.missingLanguages.includes(selectedLanguage);
                    const isSelected = selectedItems.has(item.id);

                    return (
                      <tr key={item.id} className={isSelected ? 'bg-primary-50' : ''}>
                        {translationStatus === 'missing' && (
                          <td className="w-12 px-4 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleItemSelection(item.id)}
                              className="h-4 w-4 text-primary-600 rounded border-gray-300"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500 truncate max-w-md">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isMissing
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {isMissing ? 'Missing' : 'Translated'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => loadPreview(item)}
                            className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                          >
                            {isMissing ? 'Preview Translation' : 'View'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => {
                setPreviewItem(null);
                setPreviewData(null);
              }}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Translation Preview
                  </h2>
                  <p className="text-sm text-gray-500">
                    {previewItem.name} - {SUPPORTED_LANGUAGES[selectedLanguage].nativeName}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPreviewItem(null);
                    setPreviewData(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {loadingPreview ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : previewData ? (
                  <div className="space-y-6">
                    {/* Quality Indicators */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Quality Indicators</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Character ratio:</span>
                          <span
                            className={`ml-2 font-medium ${getQualityColor(
                              previewData.qualityIndicators.characterCount.ratio
                            )}`}
                          >
                            {(previewData.qualityIndicators.characterCount.ratio * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Word ratio:</span>
                          <span
                            className={`ml-2 font-medium ${getQualityColor(
                              previewData.qualityIndicators.wordCount.ratio
                            )}`}
                          >
                            {(previewData.qualityIndicators.wordCount.ratio * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Preserved terms:</span>
                          <span className="ml-2 font-medium text-green-600">
                            {previewData.qualityIndicators.preservedTerms.length > 0
                              ? previewData.qualityIndicators.preservedTerms.join(', ')
                              : 'None'}
                          </span>
                        </div>
                      </div>

                      {/* Warnings */}
                      {previewData.qualityIndicators.warnings.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm font-medium text-yellow-800 mb-1">Warnings:</p>
                          <ul className="text-sm text-yellow-700 list-disc list-inside">
                            {previewData.qualityIndicators.warnings.map((warning, i) => (
                              <li key={i}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Side by side comparison */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Original */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs">
                            EN
                          </span>
                          Original (English)
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(previewData.original).map(([key, value]) => {
                            if (key === 'id') return null;
                            return (
                              <div key={key} className="bg-gray-50 rounded p-3">
                                <label className="text-xs font-medium text-gray-500 uppercase">
                                  {key.replace(/_/g, ' ')}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                  {typeof value === 'string'
                                    ? value.length > 300
                                      ? value.substring(0, 300) + '...'
                                      : value
                                    : String(value)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Translation */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs">
                            {selectedLanguage.toUpperCase().substring(0, 2)}
                          </span>
                          Translation ({SUPPORTED_LANGUAGES[selectedLanguage].nativeName})
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(previewData.translation).map(([key, value]) => {
                            return (
                              <div key={key} className="bg-primary-50 rounded p-3">
                                <label className="text-xs font-medium text-gray-500 uppercase">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                  {typeof value === 'string'
                                    ? value.length > 300
                                      ? value.substring(0, 300) + '...'
                                      : value
                                    : String(value)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    Failed to load preview. Please try again.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {previewData && !loadingPreview && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setPreviewItem(null);
                      setPreviewData(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Cancel
                  </button>
                  {previewItem.missingLanguages.includes(selectedLanguage) && (
                    <button
                      onClick={handleSaveTranslation}
                      disabled={bulkProgress.isRunning}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {bulkProgress.isRunning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Translation'
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">About Bulk Translation</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            - Translations are powered by Claude AI (Haiku model) for fast, accurate results
          </li>
          <li>
            - Medical and CBD terminology is preserved to maintain accuracy
          </li>
          <li>
            - Quality indicators help identify potential issues before saving
          </li>
          <li>
            - Preview translations before saving to verify quality
          </li>
          <li>
            - Bulk translate up to 10 items at once for efficiency
          </li>
        </ul>
      </div>
    </div>
  );
}
