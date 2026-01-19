'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useScanProgress, useActiveScanJobs } from '@/hooks/useScanProgress';

export default function AdminResearchPage() {
  // Job management state
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Scan configuration state
  const [selectedSources, setSelectedSources] = useState<string[]>(['pubmed', 'clinicaltrials', 'pmc']);
  const [customKeywords, setCustomKeywords] = useState<string>(`cannabidiol, CBD, cannabis, medical cannabis, medicinal cannabis, medical marijuana, cannabinoids, THC, tetrahydrocannabinol, CBG, cannabigerol, CBN, cannabinol, CBC, cannabichromene, hemp oil, cannabis therapy, cannabis treatment, cannabinoid therapy, endocannabinoid system, cannabis pharmacology, phytocannabinoids, cannabis medicine, therapeutic cannabis, pharmaceutical cannabis, cannabis clinical trial, cannabidiol oil, CBD oil, cannabis extract, cannabis research, marijuana medicine, cannabis therapeutics, cannabinoid receptors, CB1 receptor, CB2 receptor, cannabis safety, cannabis efficacy, cannabis dosing, cannabis pharmacokinetics, hemp-derived CBD, full spectrum CBD, broad spectrum CBD, CBD isolate, cannabis terpenes, entourage effect, cannabis pain management, cannabis anxiety, cannabis epilepsy, cannabis inflammation, cannabis neuroprotection, cannabis oncology, cannabis addiction, cannabis withdrawal, cannabis tolerance`);
  const [scanDepth, setScanDepth] = useState<'quick' | 'standard' | 'deep' | '1year' | '2years' | '5years' | 'comprehensive'>('standard');

  // Real-time scan progress
  const { job: currentJob, recentEvents, loading: progressLoading, error: progressError, isConnected } = useScanProgress(currentJobId);
  const { jobs: activeJobs, refetch: refetchActiveJobs } = useActiveScanJobs();

  // Check for existing active jobs on mount
  useEffect(() => {
    if (activeJobs.length > 0 && !currentJobId) {
      // Set the most recent active job as current
      const mostRecent = activeJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      setCurrentJobId(mostRecent.id);
    }
  }, [activeJobs, currentJobId]);

  const isScanning = currentJob && ['queued', 'running'].includes(currentJob.status);

  const startScan = async () => {
    setLastError(null);

    try {
      console.log('🚀 Starting background scan job...');

      const response = await fetch('/api/admin/scan-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scanType: 'manual',
          scanDepth: scanDepth,
          selectedSources: selectedSources,
          customKeywords: customKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to start scan');
      }

      console.log('📊 Scan job created:', result.job);
      setCurrentJobId(result.job.id);
      refetchActiveJobs();

    } catch (error) {
      console.error('💥 Scan creation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setLastError(errorMessage);
    }
  };

  const cancelScan = async () => {
    if (!currentJobId) return;

    try {
      const response = await fetch(`/api/admin/scan-jobs/${currentJobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'cancel' })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel scan');
      }

      refetchActiveJobs();
    } catch (error) {
      console.error('Error canceling scan:', error);
      setLastError(error instanceof Error ? error.message : 'Failed to cancel scan');
    }
  };

  const clearCurrentJob = () => {
    setCurrentJobId(null);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Scanner</h1>
          <p className="text-gray-600 mt-2">
            Discover new research with real-time progress tracking
            {isConnected && <span className="ml-2 inline-flex items-center text-green-600 text-sm">🟢 Live</span>}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/research/queue"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            📚 View Research Queue
          </Link>

          {currentJob && ['completed', 'failed', 'cancelled'].includes(currentJob.status) && (
            <button
              onClick={clearCurrentJob}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              🆕 New Scan
            </button>
          )}

          {isScanning && (
            <button
              onClick={cancelScan}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              ⏹️ Cancel Scan
            </button>
          )}

          <button
            onClick={startScan}
            disabled={isScanning || selectedSources.length === 0}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 text-lg ${
              isScanning
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : selectedSources.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isScanning ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Scanning...
              </>
            ) : selectedSources.length === 0 ? (
              <>
                ❌ Select sources to scan
              </>
            ) : (
              <>
                🔍 Start Scan ({selectedSources.length} sources)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Progress Display */}
      {currentJob && (
        <div className="mb-6">
          <div className={`p-6 rounded-lg border-2 ${
            currentJob.status === 'completed'
              ? 'bg-green-50 border-green-200'
              : currentJob.status === 'failed' || currentJob.status === 'cancelled'
              ? 'bg-red-50 border-red-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {currentJob.status === 'running' && <div className="animate-pulse w-3 h-3 bg-blue-500 rounded-full"></div>}
                  {currentJob.status === 'completed' && '✅'}
                  {currentJob.status === 'failed' && '❌'}
                  {currentJob.status === 'cancelled' && '⏹️'}
                  {currentJob.status === 'queued' && '⏳'}

                  Scan Job - {currentJob.status.charAt(0).toUpperCase() + currentJob.status.slice(1)}
                </h3>
                <p className="text-sm text-gray-600">
                  {currentJob.scanDepth} scan across {currentJob.totalSources} sources
                  {currentJob.estimatedDurationMinutes && (
                    <span className="ml-2">(~{currentJob.estimatedDurationMinutes} min estimated)</span>
                  )}
                </p>
              </div>

              <div className="text-right text-sm text-gray-500">
                <div>Job ID: {currentJob.id.slice(0, 8)}...</div>
                <div>Started: {currentJob.startedAt ? new Date(currentJob.startedAt).toLocaleTimeString() : 'Pending'}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Overall Progress: {currentJob.sourcesCompleted} / {currentJob.totalSources} sources
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {currentJob.progressPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    currentJob.status === 'completed'
                      ? 'bg-green-500'
                      : currentJob.status === 'failed'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.max(currentJob.progressPercentage, 2)}%` }}
                ></div>
              </div>
            </div>

            {/* Current Activity */}
            {currentJob.status === 'running' && (
              <div className="mb-4 p-3 bg-white rounded border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Currently scanning: {currentJob.currentSource || 'Preparing...'}</span>
                </div>
                {currentJob.currentSearchTerm && (
                  <div className="text-xs text-gray-600">
                    Search term: "{currentJob.currentSearchTerm}"
                  </div>
                )}
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-2xl font-bold text-green-600">{currentJob.itemsAdded}</div>
                <div className="text-xs text-gray-600">Added</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-2xl font-bold text-gray-600">{currentJob.itemsSkipped}</div>
                <div className="text-xs text-gray-600">Skipped</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-2xl font-bold text-red-600">{currentJob.itemsRejected}</div>
                <div className="text-xs text-gray-600">Rejected</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-2xl font-bold text-blue-600">{currentJob.totalItemsFound}</div>
                <div className="text-xs text-gray-600">Total Found</div>
              </div>
            </div>

            {/* Recent Activity */}
            {recentEvents && recentEvents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
                <div className="bg-white rounded border max-h-32 overflow-y-auto">
                  {recentEvents.slice(0, 5).map((event, index) => (
                    <div key={event.id} className={`px-3 py-2 text-sm ${index === 0 ? 'bg-blue-50' : ''} ${index < recentEvents.length - 1 ? 'border-b' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {event.eventType === 'item_found' && event.itemTitle && (
                            <span className="text-green-700">📄 Found: {event.itemTitle.substring(0, 60)}...</span>
                          )}
                          {event.eventType === 'source_started' && (
                            <span className="text-blue-700">🔍 Started scanning: {event.sourceName}</span>
                          )}
                          {event.eventType === 'source_completed' && (
                            <span className="text-green-700">✅ Completed: {event.sourceName}</span>
                          )}
                          {event.eventType === 'job_completed' && (
                            <span className="text-green-700 font-medium">🎉 Scan completed!</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 ml-2">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Display */}
            {currentJob.errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
                <strong>Error:</strong> {currentJob.errorMessage}
              </div>
            )}

            {/* Completion Summary */}
            {currentJob.status === 'completed' && currentJob.completedAt && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800">
                <div className="font-medium">✅ Scan completed successfully!</div>
                <div className="text-sm mt-1">
                  Finished at {new Date(currentJob.completedAt).toLocaleString()} •
                  Duration: {currentJob.startedAt ? Math.round((new Date(currentJob.completedAt).getTime() - new Date(currentJob.startedAt).getTime()) / 60000) : '?'} minutes
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Scan Options */}
      <div className="mb-6 space-y-6">
        {/* Source Selection */}
        <div className="p-6 bg-white rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Research Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Primary Sources */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-sm uppercase tracking-wide">Primary Medical</h4>
              {[
                { id: 'pubmed', name: 'PubMed', desc: '33M+ biomedical literature' },
                { id: 'pmc', name: 'PMC', desc: 'Full-text research articles' },
                { id: 'clinicaltrials', name: 'ClinicalTrials.gov', desc: 'Clinical trial database' },
                { id: 'cochrane', name: 'Cochrane', desc: 'Systematic reviews' }
              ].map((source) => (
                <label key={source.id} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSources([...selectedSources, source.id]);
                      } else {
                        setSelectedSources(selectedSources.filter(s => s !== source.id));
                      }
                    }}
                    disabled={scanning}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{source.name}</span>
                    <p className="text-xs text-gray-500">{source.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Academic Journals */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-sm uppercase tracking-wide">Academic Journals</h4>
              {[
                { id: 'nature', name: 'Nature', desc: 'High-impact research' },
                { id: 'science', name: 'Science', desc: 'Peer-reviewed research' },
                { id: 'jama', name: 'JAMA', desc: 'Medical association journal' },
                { id: 'bmj', name: 'BMJ', desc: 'British Medical Journal' }
              ].map((source) => (
                <label key={source.id} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSources([...selectedSources, source.id]);
                      } else {
                        setSelectedSources(selectedSources.filter(s => s !== source.id));
                      }
                    }}
                    disabled={scanning}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{source.name}</span>
                    <p className="text-xs text-gray-500">{source.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Specialized Databases */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-sm uppercase tracking-wide">Specialized</h4>
              {[
                { id: 'sciencedirect', name: 'ScienceDirect', desc: 'Elsevier database' },
                { id: 'springer', name: 'Springer', desc: 'Academic publisher' },
                { id: 'wiley', name: 'Wiley', desc: 'Scientific publications' },
                { id: 'arxiv', name: 'arXiv', desc: 'Preprint repository' }
              ].map((source) => (
                <label key={source.id} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSources([...selectedSources, source.id]);
                      } else {
                        setSelectedSources(selectedSources.filter(s => s !== source.id));
                      }
                    }}
                    disabled={scanning}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{source.name}</span>
                    <p className="text-xs text-gray-500">{source.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Quick Source Presets */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 text-sm mb-3">Quick Actions:</h4>

            {/* Select/Deselect All Row */}
            <div className="flex gap-2 mb-3 pb-3 border-b border-gray-100">
              <button
                onClick={() => setSelectedSources(['pubmed', 'pmc', 'clinicaltrials', 'cochrane', 'nature', 'science', 'jama', 'bmj', 'sciencedirect', 'springer', 'wiley', 'arxiv'])}
                disabled={scanning}
                className="px-4 py-2 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50 font-medium border border-emerald-300"
              >
                ✅ Select All Sources (12)
              </button>
              <button
                onClick={() => setSelectedSources([])}
                disabled={scanning}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium border border-gray-300"
              >
                ❌ Deselect All
              </button>
              <div className="flex items-center text-sm text-gray-600 ml-2">
                <span className="font-medium">{selectedSources.length}</span>
                <span className="ml-1">of 12 sources selected</span>
              </div>
            </div>

            {/* Preset Combinations */}
            <h5 className="font-medium text-gray-700 text-xs mb-2 uppercase tracking-wide">Preset Combinations:</h5>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedSources(['pubmed', 'pmc', 'clinicaltrials'])}
                disabled={scanning}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                📚 Standard Medical
              </button>
              <button
                onClick={() => setSelectedSources(['pubmed', 'pmc', 'cochrane', 'jama', 'bmj'])}
                disabled={scanning}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
              >
                🎯 High Impact
              </button>
              <button
                onClick={() => setSelectedSources(['pubmed', 'pmc', 'nature', 'science', 'springer', 'wiley'])}
                disabled={scanning}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
              >
                🔬 Research Intensive
              </button>
              <button
                onClick={() => setSelectedSources(['pubmed', 'pmc', 'clinicaltrials', 'nature', 'science', 'jama', 'bmj', 'springer', 'wiley', 'sciencedirect'])}
                disabled={scanning}
                className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 disabled:opacity-50"
              >
                🌍 Comprehensive
              </button>
            </div>
          </div>
        </div>

        {/* Search Configuration */}
        <div className="p-6 bg-white rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Search Configuration</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Custom Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Keywords (optional)
              </label>
              <textarea
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                disabled={scanning}
                placeholder="Add additional keywords or modify the default list..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                <strong>Pre-loaded with 50+ CBD/cannabis keywords.</strong> Separate terms with commas. Modify as needed for targeted research discovery.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCustomKeywords('')}
                  disabled={scanning}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  🗑️ Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setCustomKeywords(`cannabidiol, CBD, cannabis, medical cannabis, medicinal cannabis, medical marijuana, cannabinoids, THC, tetrahydrocannabinol, CBG, cannabigerol, CBN, cannabinol, CBC, cannabichromene, hemp oil, cannabis therapy, cannabis treatment, cannabinoid therapy, endocannabinoid system, cannabis pharmacology, phytocannabinoids, cannabis medicine, therapeutic cannabis, pharmaceutical cannabis, cannabis clinical trial, cannabidiol oil, CBD oil, cannabis extract, cannabis research, marijuana medicine, cannabis therapeutics, cannabinoid receptors, CB1 receptor, CB2 receptor, cannabis safety, cannabis efficacy, cannabis dosing, cannabis pharmacokinetics, hemp-derived CBD, full spectrum CBD, broad spectrum CBD, CBD isolate, cannabis terpenes, entourage effect, cannabis pain management, cannabis anxiety, cannabis epilepsy, cannabis inflammation, cannabis neuroprotection, cannabis oncology, cannabis addiction, cannabis withdrawal, cannabis tolerance`)}
                  disabled={scanning}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50"
                >
                  🔄 Restore Defaults
                </button>
              </div>
            </div>

            {/* Scan Depth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scan Depth
              </label>
              <select
                value={scanDepth}
                onChange={(e) => setScanDepth(e.target.value as 'quick' | 'standard' | 'deep' | '1year' | '2years' | '5years' | 'comprehensive')}
                disabled={isScanning}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="quick">🚀 Quick (Last 30 days, top results)</option>
                <option value="standard">⚖️ Standard (Last 90 days, balanced)</option>
                <option value="deep">🔍 Deep (Last 6 months, comprehensive)</option>
                <option value="1year">📅 Extended (Last 1 year, thorough)</option>
                <option value="2years">📈 Historical (Last 2 years, detailed)</option>
                <option value="5years">🗂️ Archive (Last 5 years, extensive)</option>
                <option value="comprehensive">🌐 Comprehensive (All available data)</option>
              </select>
              <div className="text-xs text-gray-500 mt-1">
                {scanDepth === 'quick' && '~2-5 minutes, 20-50 results'}
                {scanDepth === 'standard' && '~5-10 minutes, 50-150 results'}
                {scanDepth === 'deep' && '~15-25 minutes, 100-500 results'}
                {scanDepth === '1year' && '~30-45 minutes, 200-800 results'}
                {scanDepth === '2years' && '~45-60 minutes, 400-1,500 results'}
                {scanDepth === '5years' && '~60-75 minutes, 1,000-5,000 results'}
                {scanDepth === 'comprehensive' && '~90+ minutes, 2,000-10,000+ results'}
              </div>
              <div className="text-xs text-blue-600 mt-1 font-medium">
                ✨ Background processing enables long scans beyond 5-minute limit!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {lastError && (
        <div className="mb-6 p-4 bg-red-50 border-red-200 border rounded-lg">
          <h3 className="text-red-800 font-semibold">❌ Error:</h3>
          <p className="text-red-700">{lastError}</p>
          <button
            onClick={() => setLastError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Enhanced Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">🚀 Real-Time Research Scanner</h2>

        {/* New Features Highlight */}
        <div className="mb-6 p-4 bg-white rounded-lg border">
          <h3 className="font-semibold text-green-700 mb-3">✨ New Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600">📊</span>
              <span><strong>Real-time Progress:</strong> Watch live percentage completion</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">⚡</span>
              <span><strong>Background Processing:</strong> No 5-minute timeout limit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-600">🔴</span>
              <span><strong>Live Queue Updates:</strong> Studies appear immediately</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3 text-blue-800">
            <h3 className="font-semibold">📚 Available Sources</h3>
            <div className="text-sm space-y-1">
              <p>• <strong>Primary:</strong> PubMed (33M+ articles), PMC, ClinicalTrials.gov, Cochrane</p>
              <p>• <strong>Academic:</strong> Nature, Science, JAMA, BMJ</p>
              <p>• <strong>Publishers:</strong> ScienceDirect, Springer, Wiley</p>
              <p>• <strong>Preprints:</strong> arXiv for cutting-edge research</p>
            </div>
          </div>

          <div className="space-y-3 text-blue-800">
            <h3 className="font-semibold">⚡ Background Processing</h3>
            <div className="text-sm space-y-1">
              <p>• <strong>Chunked execution:</strong> Processes sources sequentially</p>
              <p>• <strong>Auto-scheduling:</strong> Self-manages long-running scans</p>
              <p>• <strong>Real-time updates:</strong> Live progress and statistics</p>
              <p>• <strong>Comprehensive scans:</strong> Up to 90+ minutes, 10,000+ results</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded border">
            <h4 className="font-semibold text-gray-900 mb-2">🔍 Search Intelligence</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 100+ default CBD/cannabis keywords</li>
              <li>• Relevance scoring with AI filtering</li>
              <li>• Duplicate detection across sources</li>
              <li>• Real-time item classification</li>
            </ul>
          </div>

          <div className="p-4 bg-white rounded border">
            <h4 className="font-semibold text-gray-900 mb-2">📊 Live Monitoring</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Real-time progress percentage</li>
              <li>• Live activity feed with timestamps</li>
              <li>• Current source and search term display</li>
              <li>• Instant statistics updates</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded border border-green-200">
          <p className="text-sm text-gray-700">
            <strong>🎯 Professional Feature:</strong> This enhanced scanner supports comprehensive research projects
            with real-time progress tracking, background processing, and immediate queue updates.
            Perfect for systematic reviews and large-scale literature discovery.
          </p>
        </div>
      </div>
    </div>
  );
}