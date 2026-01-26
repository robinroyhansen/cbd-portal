'use client';

/**
 * GuidedFlowUI Component
 * Displays guided flow steps with options and progress tracking
 */

import { useState, useCallback } from 'react';
import type { GuidedFlow } from '@/lib/chat/guided-flows';

interface GuidedFlowUIProps {
  flow: GuidedFlow;
  onComplete: (answers: Record<string, string>) => void;
  onCancel: () => void;
}

export function GuidedFlowUI({ flow, onComplete, onCancel }: GuidedFlowUIProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentStep = flow.steps[currentStepIndex];
  const totalSteps = flow.steps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const handleOptionSelect = useCallback((value: string) => {
    const newAnswers = {
      ...answers,
      [currentStep.id]: value,
    };
    setAnswers(newAnswers);

    if (isLastStep) {
      // Flow complete - trigger callback
      onComplete(newAnswers);
    } else {
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [answers, currentStep.id, isLastStep, onComplete]);

  const handleBack = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [isFirstStep]);

  return (
    <div className="border-t border-gray-200 bg-gradient-to-b from-emerald-50 to-white p-4">
      {/* Flow Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="font-medium text-emerald-800">{flow.name}</span>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Cancel guided flow"
        >
          Cancel
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Step {currentStepIndex + 1} of {totalSteps}</span>
          {!isFirstStep && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
              Back
            </button>
          )}
        </div>
        {/* Progress Bar */}
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <p className="mb-4 text-gray-800 font-medium">{currentStep.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {currentStep.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleOptionSelect(option.value)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-emerald-200 bg-white text-left transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
          >
            {option.icon && (
              <span className="text-lg" role="img" aria-hidden="true">
                {option.icon}
              </span>
            )}
            <span className="text-gray-700">{option.label}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="ml-auto h-5 w-5 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ))}
      </div>

      {/* Help Text */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        Select an option to continue
      </p>
    </div>
  );
}
