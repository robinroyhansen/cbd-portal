'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import {
  DrugSearchInput,
  InteractionResultCard,
  InteractionDisclaimer,
} from '@/components/tools/interactions';
import type {
  DrugSearchResult,
  InteractionCheckResult,
} from '@/types/drug-interactions';
import { generateHowToSchema } from '@/lib/seo/howto-schema';

type ResultState =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'result'; data: InteractionCheckResult }
  | { type: 'error'; message: string };

export default function InteractionCheckerPage() {
  const { t } = useLocale();
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

  const howToSchema = generateHowToSchema({
    title: 'How to Check CBD Drug Interactions',
    description: 'Use our interaction checker to identify potential interactions between CBD and your medications. Learn about severity levels and safety precautions.',
    steps: [
      {
        name: 'Search for Your Medication',
        text: 'Type the name of your medication in the search box. You can search by brand name or generic name.'
      },
      {
        name: 'Select Your Medication',
        text: 'Choose your exact medication from the search results. The database includes thousands of prescription and over-the-counter drugs.'
      },
      {
        name: 'Review Interaction Results',
        text: 'View the interaction severity level (major, moderate, minor, or none) and detailed information about how CBD may affect your medication.'
      },
      {
        name: 'Understand the Mechanism',
        text: 'Learn which liver enzymes (CYP450) are involved and how CBD may increase or decrease your medication levels.'
      },
      {
        name: 'Consult Your Healthcare Provider',
        text: 'Always discuss the results with your doctor or pharmacist before combining CBD with any medication.'
      }
    ],
    totalTime: 'PT2M'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t('interactionChecker.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('interactionChecker.subtitle')}
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
              {t('interactionChecker.backToTools')}
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
                {t('interactionChecker.searchMedication')}
              </h2>
              <DrugSearchInput
                onSelect={handleDrugSelect}
                placeholder={t('interactionChecker.searchPlaceholder')}
                autoFocus
              />

              {selectedDrug && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
                  <span className="text-blue-800">
                    {t('interactionChecker.checking')}:{' '}
                    <strong>{selectedDrug.display_name}</strong>
                  </span>
                  <button
                    onClick={handleClear}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    {t('interactionChecker.clear')}
                  </button>
                </div>
              )}

              {/* Educational content when idle */}
              {result.type === 'idle' && (
                <div className="mt-6 space-y-4 text-sm text-gray-700">
                  <h3 className="font-semibold text-gray-900">
                    {t('interactionChecker.howCBDInteracts')}
                  </h3>
                  <p>
                    {t('interactionChecker.howCBDInteractsDesc')}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">
                        CYP3A4
                      </div>
                      <div className="text-xs text-gray-600">
                        {t('interactionChecker.metabolizes')}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">
                        CYP2C19
                      </div>
                      <div className="text-xs text-gray-600">
                        {t('interactionChecker.psychiatricDrugs')}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">
                        CYP2D6
                      </div>
                      <div className="text-xs text-gray-600">
                        {t('interactionChecker.antidepressantsOpioids')}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1">
                        CYP2C9
                      </div>
                      <div className="text-xs text-gray-600">
                        {t('interactionChecker.warfarinNSAIDs')}
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
                  {t('interactionChecker.highRiskCategories')}
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      name: t('interactionChecker.bloodThinners'),
                      example: 'Warfarin, Rivaroxaban, Apixaban',
                      severity: 'major',
                    },
                    {
                      name: t('interactionChecker.seizureMedications'),
                      example: 'Clobazam, Valproate, Phenytoin',
                      severity: 'major',
                    },
                    {
                      name: t('interactionChecker.immunosuppressants'),
                      example: 'Cyclosporine, Tacrolimus',
                      severity: 'major',
                    },
                    {
                      name: t('interactionChecker.benzodiazepines'),
                      example: 'Diazepam, Alprazolam, Lorazepam',
                      severity: 'moderate',
                    },
                    {
                      name: t('interactionChecker.ssris'),
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
                          {cat.severity === 'major' ? t('interactionChecker.major') : t('interactionChecker.moderate')}
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
                    {t('interactionChecker.checkingInteraction')}
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
                    <h3 className="font-semibold text-red-900">{t('interactionChecker.error')}</h3>
                    <p className="text-red-800 mt-1">{result.message}</p>
                    <button
                      onClick={handleClear}
                      className="mt-3 text-red-700 hover:text-red-900 font-medium text-sm"
                    >
                      {t('interactionChecker.tryAgain')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {result.type === 'idle' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {t('interactionChecker.understandingSeverity')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-20 flex-shrink-0 px-2 py-1 text-xs font-medium text-center rounded-full bg-red-100 text-red-800 border border-red-200">
                      {t('interactionChecker.major')}
                    </span>
                    <p className="text-sm text-gray-600">
                      {t('interactionChecker.majorDesc')}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-20 flex-shrink-0 px-2 py-1 text-xs font-medium text-center rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                      {t('interactionChecker.moderate')}
                    </span>
                    <p className="text-sm text-gray-600">
                      {t('interactionChecker.moderateDesc')}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-20 flex-shrink-0 px-2 py-1 text-xs font-medium text-center rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                      {t('interactionChecker.minor')}
                    </span>
                    <p className="text-sm text-gray-600">
                      {t('interactionChecker.minorDesc')}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-20 flex-shrink-0 px-2 py-1 text-xs font-medium text-center rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                      {t('interactionChecker.unknown')}
                    </span>
                    <p className="text-sm text-gray-600">
                      {t('interactionChecker.unknownDesc')}
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
            {t('interactionChecker.faqTitle')}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                {t('interactionChecker.faqHowInteract')}
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                {t('interactionChecker.faqHowInteractAnswer')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('interactionChecker.faqStopMedication')}
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                {t('interactionChecker.faqStopMedicationAnswer')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('interactionChecker.faqDifferentTime')}
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                {t('interactionChecker.faqDifferentTimeAnswer')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('interactionChecker.faqAccuracy')}
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                {t('interactionChecker.faqAccuracyAnswer')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
