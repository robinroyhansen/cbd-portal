'use client';

import { useState } from 'react';
import { DiffView } from './DiffView';
import { ToneSlider, ToneType } from './ToneSlider';

interface AdjustReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  criterionName: string;
  oldScore: number;
  newScore: number;
  maxPoints: number;
  originalText: string;
  adjustedText: string;
  tone: ToneType;
  onAccept: () => void;
  onRegenerate: (tone: ToneType) => void;
  isRegenerating?: boolean;
}

export function AdjustReviewModal({
  isOpen,
  onClose,
  criterionName,
  oldScore,
  newScore,
  maxPoints,
  originalText,
  adjustedText,
  tone,
  onAccept,
  onRegenerate,
  isRegenerating = false
}: AdjustReviewModalProps) {
  const [viewMode, setViewMode] = useState<'diff' | 'side-by-side'>('diff');
  const [diffMode, setDiffMode] = useState<'word' | 'line'>('word');
  const [currentTone, setCurrentTone] = useState<ToneType>(tone);

  if (!isOpen) return null;

  const scoreDirection = newScore > oldScore ? 'increased' : newScore < oldScore ? 'decreased' : 'unchanged';
  const scoreDiff = Math.abs(newScore - oldScore);

  const handleRegenerate = () => {
    onRegenerate(currentTone);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Review Section Adjustment</h2>
            <p className="text-sm text-gray-500 mt-1">
              {criterionName} — Score {scoreDirection === 'decreased' ? 'decreased' : 'increased'} from {oldScore} to {newScore}/{maxPoints}
              {scoreDiff > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                  scoreDirection === 'decreased'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {scoreDirection === 'decreased' ? '↓' : '↑'} {scoreDiff} pts
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* View toggles */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg bg-gray-200 p-0.5">
              <button
                onClick={() => setViewMode('diff')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'diff'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Show Diff
              </button>
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'side-by-side'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Side-by-Side
              </button>
            </div>

            {viewMode === 'diff' && (
              <div className="flex rounded-lg bg-gray-200 p-0.5">
                <button
                  onClick={() => setDiffMode('word')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    diffMode === 'word'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Word
                </button>
                <button
                  onClick={() => setDiffMode('line')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    diffMode === 'line'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Line
                </button>
              </div>
            )}
          </div>

          {/* Regenerate with different tone */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Regenerate with tone:</span>
            <ToneSlider value={currentTone} onChange={setCurrentTone} compact />
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isRegenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Regenerating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <DiffView
            oldText={originalText}
            newText={adjustedText}
            mode={diffMode}
            viewType={viewMode}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Discard
          </button>
          <button
            onClick={onAccept}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Accept Changes
          </button>
        </div>
      </div>
    </div>
  );
}
