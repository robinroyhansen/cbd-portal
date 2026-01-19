'use client';

import type { InteractionCheckResult } from '@/types/drug-interactions';
import {
  DRUG_CATEGORY_LABELS,
  MECHANISM_LABELS,
} from '@/types/drug-interactions';
import { getMechanismExplanation } from '@/lib/interactions/severity-config';
import { SeverityBadge } from './SeverityBadge';
import { CitationsList } from './CitationsList';

interface InteractionResultCardProps {
  result: InteractionCheckResult;
}

export function InteractionResultCard({ result }: InteractionResultCardProps) {
  const { drug, interaction, severity_info } = result;

  // No interaction found
  if (!interaction || !severity_info) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-green-900 text-lg">
              No Known Interaction
            </h3>
            <p className="text-green-800 mt-1">{result.message}</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-green-100/50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">General Advice</h4>
          <p className="text-green-800 text-sm">{result.general_advice}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="text-sm text-green-700">
            <span className="font-medium">Medication:</span> {drug.display_name}
            {drug.drug_class && (
              <span className="text-green-600"> ({drug.drug_class})</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Has interaction
  return (
    <div
      className={`${severity_info.bgColor} border ${severity_info.borderColor} rounded-xl overflow-hidden`}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full ${
                severity_info.level === 'major'
                  ? 'bg-red-100'
                  : severity_info.level === 'moderate'
                    ? 'bg-orange-100'
                    : severity_info.level === 'minor'
                      ? 'bg-yellow-100'
                      : 'bg-gray-100'
              } flex items-center justify-center`}
            >
              {severity_info.level === 'major' && (
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
              {severity_info.level === 'moderate' && (
                <svg
                  className="w-6 h-6 text-orange-600"
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
              )}
              {severity_info.level === 'minor' && (
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {severity_info.level === 'unknown' && (
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${severity_info.textColor}`}>
                {severity_info.label}
              </h3>
              <p className={`text-sm ${severity_info.textColor} opacity-90 mt-1`}>
                CBD + {drug.display_name}
              </p>
            </div>
          </div>
          <SeverityBadge severity={interaction.severity} size="lg" />
        </div>

        <p className={`mt-4 ${severity_info.textColor}`}>
          {severity_info.description}
        </p>
      </div>

      {/* Details */}
      <div className="bg-white p-6 space-y-6">
        {/* Recommendation */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Recommendation
          </h4>
          <p className="text-gray-700">{interaction.recommendation}</p>
        </div>

        {/* Clinical Effects */}
        {interaction.clinical_effects.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Potential Effects
            </h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {interaction.clinical_effects.map((effect, index) => (
                <li key={index}>{effect}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Potential Outcomes */}
        {interaction.potential_outcomes && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What Could Happen</h4>
            <p className="text-gray-700">{interaction.potential_outcomes}</p>
          </div>
        )}

        {/* Mechanism */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            How This Interaction Works
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Mechanism:</span>{' '}
            {MECHANISM_LABELS[interaction.mechanism]}
          </p>
          <p className="text-gray-700 text-sm">
            {interaction.mechanism_description ||
              getMechanismExplanation(interaction.mechanism)}
          </p>
          {drug.primary_cyp_enzymes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {drug.primary_cyp_enzymes.map((enzyme) => (
                <span
                  key={enzyme}
                  className="text-xs px-2 py-1 bg-white rounded border border-gray-200 text-gray-600"
                >
                  {enzyme}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Monitoring */}
        {interaction.monitoring_parameters.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              What to Monitor
            </h4>
            <div className="flex flex-wrap gap-2">
              {interaction.monitoring_parameters.map((param, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {param}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dose Adjustment */}
        {interaction.dose_adjustment_guidance && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">
              Dosing Considerations
            </h4>
            <p className="text-yellow-800 text-sm">
              {interaction.dose_adjustment_guidance}
            </p>
          </div>
        )}

        {/* Special Populations */}
        {interaction.special_populations_notes && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">
              Special Populations
            </h4>
            <p className="text-purple-800 text-sm">
              {interaction.special_populations_notes}
            </p>
          </div>
        )}

        {/* Citations */}
        {interaction.citations && interaction.citations.length > 0 && (
          <CitationsList citations={interaction.citations} />
        )}

        {/* Evidence Level */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-sm text-gray-500">
          <div>
            <span className="font-medium">Drug Category:</span>{' '}
            {DRUG_CATEGORY_LABELS[drug.category]}
          </div>
          {interaction.evidence_level && (
            <div>
              <span className="font-medium">Evidence:</span>{' '}
              {interaction.evidence_level}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
