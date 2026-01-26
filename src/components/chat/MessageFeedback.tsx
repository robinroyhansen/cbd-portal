'use client';

/**
 * MessageFeedback Component
 * Thumbs up/down feedback buttons for chat messages
 */

import { useState, useEffect } from 'react';
import type { FeedbackRating, MessageFeedback as MessageFeedbackType } from '@/lib/chat/types';

interface MessageFeedbackProps {
  messageId: string;
  conversationId?: string;
  existingFeedback?: MessageFeedbackType;
  onSubmit: (messageId: string, rating: FeedbackRating, comment?: string) => Promise<void>;
}

/**
 * Thumbs Up SVG Icon
 */
function ThumbsUpIcon({ filled = false }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V2.75a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H2.25"
      />
    </svg>
  );
}

/**
 * Thumbs Down SVG Icon
 */
function ThumbsDownIcon({ filled = false }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M15.73 5.25h1.035A7.465 7.465 0 0118 9.375a7.465 7.465 0 01-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75 2.25 2.25 0 01-2.25-2.25c0-1.152.26-2.243.723-3.218C7.74 15.724 7.366 15 6.748 15H3.622c-1.026 0-1.945-.694-2.054-1.715A12.134 12.134 0 011.5 12c0-2.848.992-5.464 2.649-7.521.388-.482.987-.729 1.605-.729H9.77a4.5 4.5 0 011.423.23l3.114 1.04a4.5 4.5 0 001.423.23zM21.669 13.023c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.959 8.959 0 01-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227z" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 012.25 12c0-2.848.992-5.464 2.649-7.521C5.287 3.997 5.886 3.75 6.504 3.75h4.773a4.5 4.5 0 011.423.23l3.114 1.04a4.5 4.5 0 001.423.23h.148m-6.884 9h.148c.806 0 1.533.446 2.031 1.08a9.04 9.04 0 002.861 2.4c.723.384 1.35.956 1.653 1.715a4.498 4.498 0 01.322 1.672V21a.75.75 0 00.75.75 2.25 2.25 0 002.25-2.25c0-1.152-.26-2.243-.723-3.218-.266-.558.107-1.282.725-1.282h3.126c1.026 0 1.945-.694 2.054-1.715.045-.421.068-.85.068-1.285 0-2.848-.992-5.464-2.649-7.521-.388-.482-.987-.729-1.605-.729H18.23"
      />
    </svg>
  );
}

export function MessageFeedback({
  messageId,
  existingFeedback,
  onSubmit,
}: MessageFeedbackProps) {
  const [selectedRating, setSelectedRating] = useState<FeedbackRating | null>(
    existingFeedback?.rating || null
  );
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Handle existing feedback
  useEffect(() => {
    if (existingFeedback) {
      setSelectedRating(existingFeedback.rating);
    }
  }, [existingFeedback]);

  // Auto-hide thanks message
  useEffect(() => {
    if (showThanks) {
      const timer = setTimeout(() => {
        setShowThanks(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showThanks]);

  const handleRatingClick = async (rating: FeedbackRating) => {
    if (selectedRating || isSubmitting) return;

    setSelectedRating(rating);

    // For negative feedback, show comment box
    if (rating === 'not_helpful') {
      setShowCommentBox(true);
      return;
    }

    // For positive feedback, submit immediately
    await submitFeedback(rating);
  };

  const submitFeedback = async (rating: FeedbackRating, feedbackComment?: string) => {
    setIsSubmitting(true);
    try {
      await onSubmit(messageId, rating, feedbackComment);
      setShowThanks(true);
      setShowCommentBox(false);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      // Reset on error
      setSelectedRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (selectedRating) {
      await submitFeedback(selectedRating, comment || undefined);
    }
  };

  const handleSkipComment = async () => {
    if (selectedRating) {
      await submitFeedback(selectedRating);
    }
  };

  const isDisabled = !!existingFeedback || isSubmitting;

  // Show thanks message
  if (showThanks) {
    return (
      <div className="mt-2 flex items-center gap-1">
        <span className="text-xs text-emerald-600 animate-fade-in">
          Thanks for your feedback!
        </span>
      </div>
    );
  }

  // Show comment box for negative feedback
  if (showCommentBox && selectedRating === 'not_helpful') {
    return (
      <div className="mt-2 space-y-2">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What could be improved? (optional)"
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-xs focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-300 resize-none"
          rows={2}
          disabled={isSubmitting}
        />
        <div className="flex gap-2">
          <button
            onClick={handleCommentSubmit}
            disabled={isSubmitting}
            className="rounded-md bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Submit'}
          </button>
          <button
            onClick={handleSkipComment}
            disabled={isSubmitting}
            className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mt-2 flex items-center gap-1 transition-opacity duration-200 ${
        isHovered || selectedRating ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-xs text-gray-400 mr-1">Was this helpful?</span>

      {/* Thumbs Up Button */}
      <button
        onClick={() => handleRatingClick('helpful')}
        disabled={isDisabled}
        className={`p-1 rounded transition-all duration-200 ${
          selectedRating === 'helpful'
            ? 'text-emerald-600'
            : isDisabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-400 hover:text-emerald-600 hover:scale-110'
        }`}
        aria-label="Helpful"
        title="Helpful"
      >
        <ThumbsUpIcon filled={selectedRating === 'helpful'} />
      </button>

      {/* Thumbs Down Button */}
      <button
        onClick={() => handleRatingClick('not_helpful')}
        disabled={isDisabled}
        className={`p-1 rounded transition-all duration-200 ${
          selectedRating === 'not_helpful'
            ? 'text-emerald-600'
            : isDisabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-400 hover:text-emerald-600 hover:scale-110'
        }`}
        aria-label="Not helpful"
        title="Not helpful"
      >
        <ThumbsDownIcon filled={selectedRating === 'not_helpful'} />
      </button>
    </div>
  );
}
