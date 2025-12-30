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
          includeExtendedSources: includeExtended
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
            disabled={scanning}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 text-lg ${
              scanning
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {scanning ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Scanning...
              </>
            ) : (
              <>
                🔍 Start Manual Scan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scan Options */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Scan Options</h3>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeExtended}
              onChange={(e) => setIncludeExtended(e.target.checked)}
              disabled={scanning}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Include Extended Sources
            </span>
          </label>
          <div className="text-sm text-gray-500">
            {includeExtended ? (
              <span className="text-blue-600">
                ✓ Cochrane, JAMA, Nature, ScienceDirect, BMJ, Springer
              </span>
            ) : (
              <span>
                Standard: PubMed, ClinicalTrials.gov, PMC
              </span>
            )}
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

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Debug Information</h2>
        <div className="space-y-3 text-blue-800">
          <p>🔍 <strong>What this does:</strong> Scans PubMed, ClinicalTrials.gov, and PMC for new CBD research</p>
          <p>📊 <strong>Search terms:</strong> 60+ keywords covering CBD, cannabis, and medical cannabis</p>
          <p>🎯 <strong>Expected results:</strong> 10-50 new research papers per scan</p>
          <p>⏱️ <strong>Scan time:</strong> 2-4 minutes to complete</p>
        </div>

        <div className="mt-4 p-3 bg-white rounded border">
          <p className="text-sm text-gray-600">
            <strong>Debug mode:</strong> Detailed errors and responses will be shown above.
            Check the browser console (F12) for additional logging information.
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