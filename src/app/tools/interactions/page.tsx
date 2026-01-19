'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DrugSearchInput,
  InteractionResultCard,
  InteractionDisclaimer,
} from '@/components/tools/interactions';
import type {
  DrugSearchResult,
  InteractionCheckResult,
} from '@/types/drug-interactions';

type ResultState =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'result'; data: InteractionCheckResult }
  | { type: 'error'; message: string };

export default function InteractionCheckerPage() {
  const [result, setResult] = useState<ResultState>({ type: 'idle' });
  const [selectedDrug, setSelectedDrug] = useState<DrugSearchResult | null>(
    null
  );

  const handleDrugSelect = async (drug: DrugSearchResult) => {
    setSelectedDrug(drug);
    setResult({ type: 'loading' });

    try {
      const response = await fetch(`/api/tools/interactions/${drug.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch interaction data');
      }
      const data = await response.json();
      setResult({ type: 'result', data });
    } catch (error) {
      console.error('Error fetching interaction:', error);
      setResult({
        type: 'error',
        message: 'Failed to check interaction. Please try again.',
      });
    }
  };

  const handleClear = () => {
    setResult({ type: 'idle' });
    setSelectedDrug(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                CBD Drug Interaction Checker
              </h1>
              <p className="text-gray-600 mt-1">
                Check potential interactions between CBD and your medications
              </p>
            </div>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Tools
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Search for a Medication
              </h2>
              <DrugSearchInput
                onSelect={handleDrugSelect}
                placeholder="Enter medication name (generic or brand)..."
                autoFocus
              />

              {selectedDrug && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
                  <span className="text-blue-800">
                    Checking:{' '}
                    <strong>{selectedDrug.display_name}</strong>
                  </span>
                  <button
                    onClick={handleClear}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Educational content when idle */}
              {result.type === 'idle' && (
                <div className="mt-6 space-y-4 text-sm text-gray-700">
                  <h3 className="font-semibold text-gray-900">
                    How CBD Interacts with Medications
                  </h3>
                  <p>
                    CBD (cannabidiol) can affect how your body processes certain
                    medications through the cytochrome P450 enzyme system. The
                    most significant interactions involve:
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">
                        CYP3A4
                      </div>
                      <div className="text-xs text-gray-600">
                        Metabolizes ~50% of all medications
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">
                        CYP2C19
                      </div>
                      <div className="text-xs text-gray-600">
                        Important for psychiatric drugs
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">
                        CYP2D6
                      </div>
                      <div className="text-xs text-gray-600">
                        Antidepressants, opioids
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">
                        CYP2C9
                      </div>
                      <div className="text-xs text-gray-600">
                        Warfarin, NSAIDs
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Common Interactions Preview */}
            {result.type === 'idle' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  High-Risk Drug Categories
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      name: 'Blood Thinners',
                      example: 'Warfarin, Rivaroxaban, Apixaban',
                      severity: 'major',
                    },
                    {
                      name: 'Seizure Medications',
                      example: 'Clobazam, Valproate, Phenytoin',
                      severity: 'major',
                    },
                    {
                      name: 'Immunosuppressants',
                      example: 'Cyclosporine, Tacrolimus',
                      severity: 'major',
                    },
                    {
                      name: 'Benzodiazepines',
                      example: 'Diazepam, Alprazolam, Lorazepam',
                      severity: 'moderate',
                    },
                    {
                      name: 'SSRIs',
                      example: 'Sertraline, Fluoxetine, Escitalopram',
                      severity: 'moderate',
                    },
                  ].map((cat) => (
                    <div
                      key={cat.name}
                      className={`p-3 rounded-lg border ${
                        cat.severity === 'major'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-orange-50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">
                          {cat.name}
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            cat.severity === 'major'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {cat.severity === 'major' ? 'Major' : 'Moderate'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {cat.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div>
            {result.type === 'loading' && (
              <div className="bg-white rounded-xl shadow-sm p-6 flex justify-center items-center min-h-[300px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Checking interaction...
                  </p>
                </div>
              </div>
            )}

            {result.type === 'result' && (
              <InteractionResultCard result={result.data} />
            )}

            {result.type === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-red-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-red-900">Error</h3>
                    <p className="text-red-800 mt-1">{result.message}</p>
                    <button
                      onClick={handleClear}
                      className="mt-3 text-red-700 hover:text-red-900 font-medium text-sm"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {result.type === 'idle' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Understanding Interaction Severity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-20 flex-shrink-0 px-2 py-1 text-xs font-medium text-center rounded-full bg-red-100 text-red-800 border border-red-200">
                      Major
                    </span>
                    <p className="text-sm text-gray-600">
                      Avoid this combination unless under close medical
                      supervision. Significant risk of adverse effects.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-20 flex-shrink-0 px-2 py-1 text-xs font-medium text-center rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                      Moderate
                    </span>
                    <p className="text-sm text-gray-600">
                      Use with caution. Monitor for side effects and consider
                      timing separation or dose adjustments.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-20 flex-shrink-0 px-2 py-1 text-xs font-medium text-center rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                      Minor
                    </span>
                    <p className="text-sm text-gray-600">
                      Low risk interaction. Be aware of potential effects but
                      generally considered safe.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-20 flex-shrink-0 px-2 py-1 text-xs font-medium text-center rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                      Unknown
                    </span>
                    <p className="text-sm text-gray-600">
                      Insufficient research data. Exercise caution and consult
                      your healthcare provider.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Medical Disclaimer */}
        <InteractionDisclaimer className="mt-8" />

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                How does CBD interact with medications?
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                CBD primarily interacts with medications through the cytochrome
                P450 enzyme system in the liver. CBD can inhibit certain CYP
                enzymes (especially CYP3A4 and CYP2C19), which can slow down how
                your body processes certain drugs. This may lead to higher
                levels of the medication in your blood.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                Should I stop my medication to use CBD?
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                Never stop or change your prescribed medications without
                consulting your doctor. If you want to use CBD, discuss it with
                your healthcare provider first. They can advise on potential
                interactions, timing, and whether any medication adjustments are
                needed.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                Can I take CBD at a different time than my medication?
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                While spacing CBD and medications apart may reduce some
                interactions, it doesn&apos;t eliminate them. CBD has a long
                half-life and its effects on liver enzymes can persist. Always
                consult your healthcare provider about timing strategies.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                How accurate is this interaction checker?
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                This tool is based on current published research and provides
                general guidance. However, individual responses vary, and new
                interactions may be discovered. It should not replace
                professional medical advice. Always consult your doctor or
                pharmacist for personalised guidance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
