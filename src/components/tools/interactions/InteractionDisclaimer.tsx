'use client';

interface InteractionDisclaimerProps {
  className?: string;
}

export function InteractionDisclaimer({
  className = '',
}: InteractionDisclaimerProps) {
  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
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
        </div>
        <div>
          <h3 className="font-semibold text-red-900 text-lg">
            Medical Disclaimer
          </h3>
          <div className="mt-2 text-red-800 space-y-2 text-sm">
            <p>
              This tool provides general information about potential CBD-drug
              interactions based on available research.{' '}
              <strong>It is not a substitute for professional medical advice.</strong>
            </p>
            <p>
              Always consult your doctor, pharmacist, or qualified healthcare
              provider before combining CBD with any medication. They can review
              your complete medical history and current medications to provide
              personalised guidance.
            </p>
            <p>
              Individual responses to CBD vary significantly based on factors
              including genetics, dosage, product quality, and other medications.
              New research may also reveal interactions not currently documented.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-red-700 text-xs">
              <strong>If you experience any adverse effects</strong> while using
              CBD with medications, stop use immediately and contact your
              healthcare provider or seek medical attention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
