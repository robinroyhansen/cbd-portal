'use client';

import { useEffect, useState } from 'react';
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
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  discovered_at: string;
}

export default function AdminResearchPage() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [includeExtended, setIncludeExtended] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>(['pubmed', 'clinicaltrials', 'pmc']);
  const [customKeywords, setCustomKeywords] = useState<string>(`cannabidiol, CBD, cannabis, medical cannabis, medicinal cannabis, medical marijuana, cannabinoids, THC, tetrahydrocannabinol, CBG, cannabigerol, CBN, cannabinol, CBC, cannabichromene, hemp oil, cannabis therapy, cannabis treatment, cannabinoid therapy, endocannabinoid system, cannabis pharmacology, phytocannabinoids, cannabis medicine, therapeutic cannabis, pharmaceutical cannabis, cannabis clinical trial, cannabidiol oil, CBD oil, cannabis extract, cannabis research, marijuana medicine, cannabis therapeutics, cannabinoid receptors, CB1 receptor, CB2 receptor, cannabis safety, cannabis efficacy, cannabis dosing, cannabis pharmacokinetics, hemp-derived CBD, full spectrum CBD, broad spectrum CBD, CBD isolate, cannabis terpenes, entourage effect, cannabis pain management, cannabis anxiety, cannabis epilepsy, cannabis inflammation, cannabis neuroprotection, cannabis oncology, cannabis addiction, cannabis withdrawal, cannabis tolerance`);
  const [scanDepth, setScanDepth] = useState<'quick' | 'standard' | 'deep' | '1year' | '2years' | '5years' | 'comprehensive'>('standard');

  const triggerManualScan = async () => {
    setScanning(true);
    setScanResult(null);
    setLastError(null);

    try {
      console.log('🚀 Starting manual scan...');

      const response = await fetch('/api/admin/trigger-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          includeExtendedSources: includeExtended,
          selectedSources: selectedSources,
          customKeywords: customKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0),
          scanDepth: scanDepth
        })
      });

      console.log('📡 Response status:', response.status);

      const result = await response.json();
      console.log('📊 Response data:', result);

      setScanResult(result);

      if (!result.success && result.error) {
        setLastError(result.message || result.error);
      }
    } catch (error) {
      console.error('💥 Scan request failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setScanResult({ error: 'Request failed', message: errorMessage });
      setLastError(errorMessage);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Scanner</h1>
          <p className="text-gray-600 mt-2">Discover new research from authoritative sources</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/research/queue"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            📚 View Research Queue
          </Link>
          <button
            onClick={triggerManualScan}
            disabled={scanning || selectedSources.length === 0}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 text-lg ${
              scanning
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : selectedSources.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {scanning ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Scanning {selectedSources.length} sources...
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
                disabled={scanning}
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
                {scanDepth === 'quick' && '~1-2 minutes, 20-50 results'}
                {scanDepth === 'standard' && '~3-5 minutes, 50-150 results'}
                {scanDepth === 'deep' && '~8-15 minutes, 100-500 results'}
                {scanDepth === '1year' && '~15-25 minutes, 200-800 results'}
                {scanDepth === '2years' && '~25-40 minutes, 400-1,500 results'}
                {scanDepth === '5years' && '~40-60 minutes, 1,000-5,000 results'}
                {scanDepth === 'comprehensive' && '~60-90 minutes, 2,000-10,000+ results'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Results */}
      {scanResult && (
        <div className={`mb-8 p-6 rounded-lg border-2 ${
          scanResult.success
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <h3 className="text-lg font-semibold mb-3">
            {scanResult.success ? '✅ Scan Results' : '❌ Scan Failed'}
          </h3>

          {scanResult.success ? (
            <div className="space-y-2">
              <p><strong>Duration:</strong> {scanResult.duration}</p>
              <p><strong>Added:</strong> {scanResult.added}</p>
              <p><strong>Skipped:</strong> {scanResult.skipped}</p>
              <p><strong>Total:</strong> {scanResult.total}</p>
              <p><strong>Relevant:</strong> {scanResult.relevant}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Error:</strong> {scanResult.error}</p>
              <p><strong>Message:</strong> {scanResult.message}</p>
              {scanResult.details && (
                <div className="mt-4">
                  <p><strong>Details:</strong></p>
                  <pre className="bg-red-100 p-3 rounded text-sm overflow-auto max-h-40">
                    {JSON.stringify(scanResult.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 text-sm opacity-75">
            Timestamp: {scanResult.timestamp}
          </div>
        </div>
      )}

      {/* Error Display */}
      {lastError && (
        <div className="mb-8 p-4 bg-orange-50 border-orange-200 border rounded-lg">
          <h3 className="text-orange-800 font-semibold">Last Error:</h3>
          <p className="text-orange-700">{lastError}</p>
        </div>
      )}

      {/* Enhanced Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">🎯 Enhanced Research Scanner</h2>
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
            <h3 className="font-semibold">⚡ Performance Estimates</h3>
            <div className="text-sm space-y-1">
              <p>• <strong>Quick scan:</strong> 1-2 min, 20-50 results</p>
              <p>• <strong>Standard scan:</strong> 3-5 min, 50-150 results</p>
              <p>• <strong>Deep scan:</strong> 8-15 min, 100-500 results</p>
              <p>• <strong>Custom keywords:</strong> Targeted results</p>
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
              <li>• Publication date prioritization</li>
            </ul>
          </div>

          <div className="p-4 bg-white rounded border">
            <h4 className="font-semibold text-gray-900 mb-2">📊 Quality Metrics</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Impact factor consideration</li>
              <li>• Peer-review status validation</li>
              <li>• Citation count analysis</li>
              <li>• Research methodology scoring</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white rounded border">
          <p className="text-sm text-gray-600">
            <strong>Debug mode:</strong> Detailed scan progress, source responses, and error logs are shown above.
            Check the browser console (F12) for additional technical information.
          </p>
        </div>
      </div>

      {/* Console Output Instructions */}
      <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Debugging Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>Open Browser Developer Tools (F12)</li>
          <li>Go to Console tab</li>
          <li>Click "Start Manual Scan"</li>
          <li>Watch for console messages and errors</li>
          <li>Check Network tab for failed requests</li>
        </ol>
      </div>
    </div>
  );
}