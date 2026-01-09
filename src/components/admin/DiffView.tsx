'use client';

import { useMemo } from 'react';
import { computeDiff, getDiffStats, DiffSegment } from '@/lib/utils/text-diff';

interface DiffViewProps {
  oldText: string;
  newText: string;
  mode?: 'word' | 'line';
  viewType?: 'diff' | 'side-by-side';
}

export function DiffView({ oldText, newText, mode = 'word', viewType = 'diff' }: DiffViewProps) {
  const diff = useMemo(() => computeDiff(oldText, newText, mode), [oldText, newText, mode]);
  const stats = useMemo(() => getDiffStats(diff), [diff]);

  if (viewType === 'side-by-side') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-red-800">Original</span>
          </div>
          <div className="p-4 bg-white max-h-96 overflow-y-auto">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
              {oldText}
            </div>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-green-50 px-4 py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-green-800">Updated</span>
          </div>
          <div className="p-4 bg-white max-h-96 overflow-y-auto">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
              {newText}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-100 rounded"></span>
          <span className="text-green-700">+{stats.additions} words added</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-100 rounded"></span>
          <span className="text-red-700">-{stats.deletions} words removed</span>
        </span>
      </div>

      {/* Diff view */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
        <div className="prose prose-sm max-w-none">
          {diff.map((segment, index) => (
            <DiffSegmentView key={index} segment={segment} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DiffSegmentView({ segment }: { segment: DiffSegment }) {
  const className = segment.type === 'added'
    ? 'bg-green-100 text-green-900 px-0.5 rounded'
    : segment.type === 'removed'
    ? 'bg-red-100 text-red-900 line-through px-0.5 rounded'
    : '';

  // Handle whitespace-only segments
  if (segment.text.match(/^\s+$/)) {
    return <span>{segment.text}</span>;
  }

  return (
    <span className={className} style={{ whiteSpace: 'pre-wrap' }}>
      {segment.text}
    </span>
  );
}
