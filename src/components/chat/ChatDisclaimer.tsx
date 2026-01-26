'use client';

/**
 * ChatDisclaimer Component
 * Medical disclaimer banner
 */

export function ChatDisclaimer() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <p className="text-xs text-amber-800">
        <span className="font-medium">Disclaimer:</span> I&apos;m an AI assistant, not a doctor.
        The information provided is for educational purposes only. Always consult a healthcare
        provider before using CBD.
      </p>
    </div>
  );
}
