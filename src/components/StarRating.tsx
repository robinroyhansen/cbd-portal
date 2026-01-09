'use client';

interface StarRatingProps {
  score: number;
  maxScore: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ score, maxScore, showLabel = false, size = 'sm' }: StarRatingProps) {
  const filled = Math.round(score);
  const empty = maxScore - filled;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <span className={`inline-flex items-center gap-0.5 ${sizeClasses[size]}`}>
      <span className="text-yellow-500">
        {'★'.repeat(filled)}
      </span>
      <span className="text-gray-300">
        {'☆'.repeat(empty)}
      </span>
      {showLabel && (
        <span className="ml-1 text-gray-500 text-xs">
          {score}/{maxScore}
        </span>
      )}
    </span>
  );
}

// For overall scores out of 100, convert to 5-star scale
export function OverallStarRating({ score, size = 'lg' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  // Convert 0-100 to 0-5 stars
  const stars = Math.round((score / 100) * 5);

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <span className={`inline-flex items-center gap-0.5 ${sizeClasses[size]}`}>
      <span className="text-yellow-500">
        {'★'.repeat(stars)}
      </span>
      <span className="text-gray-300">
        {'☆'.repeat(5 - stars)}
      </span>
    </span>
  );
}
