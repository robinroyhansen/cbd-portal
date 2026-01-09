'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

type PublicationMode = 'draft' | 'published' | 'scheduled';

interface PublicationStatusProps {
  isPublished: boolean;
  scheduledPublishAt: string | null;
  onPublish: () => void;
  onUnpublish: () => void;
  onSchedule: (scheduledAt: string) => void;
  onCancelSchedule: () => void;
  disabled?: boolean;
}

export function PublicationStatus({
  isPublished,
  scheduledPublishAt,
  onPublish,
  onUnpublish,
  onSchedule,
  onCancelSchedule,
  disabled = false
}: PublicationStatusProps) {
  // Determine current mode
  const getMode = (): PublicationMode => {
    if (isPublished) return 'published';
    if (scheduledPublishAt) return 'scheduled';
    return 'draft';
  };

  const [mode, setMode] = useState<PublicationMode>(getMode());
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [timezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Sync mode when props change
  useEffect(() => {
    setMode(getMode());
    if (scheduledPublishAt) {
      const date = new Date(scheduledPublishAt);
      setScheduledDate(format(date, 'yyyy-MM-dd'));
      setScheduledTime(format(date, 'HH:mm'));
    }
  }, [isPublished, scheduledPublishAt]);

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return format(tomorrow, 'yyyy-MM-dd');
  };

  const handleModeChange = (newMode: PublicationMode) => {
    setMode(newMode);

    if (newMode === 'published') {
      onPublish();
    } else if (newMode === 'draft') {
      if (isPublished) {
        onUnpublish();
      }
      if (scheduledPublishAt) {
        onCancelSchedule();
      }
    }
    // For 'scheduled', we wait for user to set date/time and click Schedule
  };

  const handleSchedule = () => {
    if (!scheduledDate || !scheduledTime) return;

    // Combine date and time into ISO string
    const dateTimeStr = `${scheduledDate}T${scheduledTime}:00`;
    const scheduledDateTime = new Date(dateTimeStr);
    onSchedule(scheduledDateTime.toISOString());
  };

  const formatScheduledDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Publication Status</h3>

      <div className="space-y-3">
        {/* Draft Option */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="publication-status"
            checked={mode === 'draft'}
            onChange={() => handleModeChange('draft')}
            disabled={disabled}
            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">Draft</span>
            <p className="text-xs text-gray-500">Not visible to the public</p>
          </div>
        </label>

        {/* Publish Now Option */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="publication-status"
            checked={mode === 'published'}
            onChange={() => handleModeChange('published')}
            disabled={disabled}
            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">Publish Now</span>
            <p className="text-xs text-gray-500">Immediately visible to the public</p>
          </div>
        </label>

        {/* Schedule Option */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="publication-status"
            checked={mode === 'scheduled'}
            onChange={() => setMode('scheduled')}
            disabled={disabled}
            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900">Schedule for later</span>
            <p className="text-xs text-gray-500">Automatically publish at a specific time</p>
          </div>
        </label>

        {/* Date/Time Picker (shown when scheduled mode is selected) */}
        {mode === 'scheduled' && (
          <div className="ml-7 mt-2 space-y-3">
            <div className="flex flex-wrap gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={getMinDate()}
                  disabled={disabled}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  disabled={disabled}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Timezone: {timezone}
            </p>

            {scheduledPublishAt ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-600">
                  Scheduled for {formatScheduledDate(scheduledPublishAt)}
                </span>
                <button
                  type="button"
                  onClick={onCancelSchedule}
                  disabled={disabled}
                  className="text-xs text-red-600 hover:text-red-700 underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSchedule}
                disabled={disabled || !scheduledDate || !scheduledTime}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule Publication
              </button>
            )}
          </div>
        )}
      </div>

      {/* Current Status Badge */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Current status:</span>
          <StatusBadge
            isPublished={isPublished}
            scheduledPublishAt={scheduledPublishAt}
          />
        </div>
      </div>
    </div>
  );
}

// Status badge component for use in lists
interface StatusBadgeProps {
  isPublished: boolean;
  scheduledPublishAt?: string | null;
  size?: 'sm' | 'md';
}

export function StatusBadge({ isPublished, scheduledPublishAt, size = 'sm' }: StatusBadgeProps) {
  const baseClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs font-medium rounded-full'
    : 'px-3 py-1 text-sm font-medium rounded-full';

  if (isPublished) {
    return (
      <span className={`${baseClasses} bg-green-100 text-green-800`}>
        Published
      </span>
    );
  }

  if (scheduledPublishAt) {
    const date = new Date(scheduledPublishAt);
    const formatted = format(date, "MMM d, HH:mm");
    return (
      <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
        Scheduled {formatted}
      </span>
    );
  }

  return (
    <span className={`${baseClasses} bg-gray-100 text-gray-600`}>
      Draft
    </span>
  );
}
