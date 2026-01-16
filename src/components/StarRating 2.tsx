'use client';

interface StarRatingProps {
  score: number;
  maxScore: number;
  showPoints?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorCode?: boolean;
}

// Get color based on percentage for color-coded stars
function getStarColor(percentage: number, colorCode: boolean): string {
  if (!colorCode) return 'text-yellow-400';
  if (percentage >= 80) return 'text-green-500';
  if (percentage >= 60) return 'text-yellow-500';
  if (percentage >= 40) return 'text-orange-500';
  return 'text-red-400';
}

// SVG Star component that supports full, half, or empty fill
function Star({
  fill,
  size,
  colorClass
}: {
  fill: 'full' | 'half' | 'empty';
  size: number;
  colorClass: string;
}) {
  const emptyColor = 'text-gray-300';

  if (fill === 'empty') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={emptyColor}
        fill="currentColor"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }

  if (fill === 'half') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
      >
        {/* Gray background star */}
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          className={emptyColor}
          fill="currentColor"
        />
        {/* Colored half using clip path */}
        <defs>
          <clipPath id={`half-clip-${Math.random().toString(36).substr(2, 9)}`}>
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          className={colorClass}
          fill="currentColor"
          clipPath={`url(#half-clip-${Math.random().toString(36).substr(2, 9)})`}
        />
      </svg>
    );
  }

  // Full star
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={colorClass}
      fill="currentColor"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// Half-star SVG component with proper clip path
function HalfStar({ size, colorClass }: { size: number; colorClass: string }) {
  const id = `half-star-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      </defs>
      {/* Gray background */}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        className="text-gray-300"
        fill="currentColor"
      />
      {/* Colored left half */}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        className={colorClass}
        fill="currentColor"
        clipPath={`url(#${id})`}
      />
    </svg>
  );
}

/**
 * StarRating component that converts any score to a 5-star scale
 * Supports half-star increments and color coding based on percentage
 */
export function StarRating({
  score,
  maxScore,
  showPoints = false,
  size = 'sm',
  colorCode = false
}: StarRatingProps) {
  // Convert to 5-star scale with 0.5 precision
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const rawStars = (score / maxScore) * 5;
  const roundedStars = Math.round(rawStars * 2) / 2; // Round to nearest 0.5

  const fullStars = Math.floor(roundedStars);
  const hasHalfStar = roundedStars % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const colorClass = getStarColor(percentage, colorCode);

  const sizeMap = {
    sm: 14,
    md: 18,
    lg: 24
  };
  const starSize = sizeMap[size];

  const pointsSizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const ariaLabel = `Rating: ${roundedStars} out of 5 stars`;

  return (
    <span
      className="inline-flex items-center gap-1"
      role="img"
      aria-label={ariaLabel}
    >
      <span className="inline-flex items-center gap-px" aria-hidden="true">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg
            key={`full-${i}`}
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            className={colorClass}
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <HalfStar size={starSize} colorClass={colorClass} />
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg
            key={`empty-${i}`}
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            className="text-gray-300"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </span>

      {showPoints && (
        <span className={`text-gray-500 ${pointsSizeClass[size]}`}>
          ({score}/{maxScore} pts)
        </span>
      )}
    </span>
  );
}

/**
 * Overall star rating for scores out of 100
 * Displays large stars suitable for hero sections
 */
export function OverallStarRating({
  score,
  size = 'lg',
  colorCode = true
}: {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  colorCode?: boolean;
}) {
  const percentage = score;
  const rawStars = (score / 100) * 5;
  const roundedStars = Math.round(rawStars * 2) / 2;

  const fullStars = Math.floor(roundedStars);
  const hasHalfStar = roundedStars % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const colorClass = getStarColor(percentage, colorCode);

  const sizeMap = {
    sm: 20,
    md: 28,
    lg: 32
  };
  const starSize = sizeMap[size];

  const ariaLabel = `Rating: ${roundedStars} out of 5 stars`;

  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={ariaLabel}
    >
      <span aria-hidden="true" className="inline-flex items-center gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg
            key={`full-${i}`}
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            className={colorClass}
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <HalfStar size={starSize} colorClass={colorClass} />
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg
            key={`empty-${i}`}
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            className="text-gray-300"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </span>
    </span>
  );
}

/**
 * Category star rating for section headers
 * Shows stars with points below
 */
export function CategoryStarRating({
  score,
  maxScore,
  colorCode = true
}: {
  score: number;
  maxScore: number;
  colorCode?: boolean;
}) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const rawStars = (score / maxScore) * 5;
  const roundedStars = Math.round(rawStars * 2) / 2;

  const fullStars = Math.floor(roundedStars);
  const hasHalfStar = roundedStars % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const colorClass = getStarColor(percentage, colorCode);
  const starSize = 18;
  const ariaLabel = `Rating: ${roundedStars} out of 5 stars, ${score} out of ${maxScore} points`;

  return (
    <div className="flex flex-col items-end" role="img" aria-label={ariaLabel}>
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg
            key={`full-${i}`}
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            className={colorClass}
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
        {hasHalfStar && <HalfStar size={starSize} colorClass={colorClass} />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg
            key={`empty-${i}`}
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            className="text-gray-300"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </span>
      <span className="text-xs text-gray-500 mt-0.5">{score} out of {maxScore} points</span>
    </div>
  );
}

/**
 * Inline star rating for compact sub-criteria display
 * Shows: ★★★½☆ with optional (3/4 pts) suffix
 */
export function InlineStarRating({
  score,
  maxScore,
  colorCode = true,
  showPoints = false
}: {
  score: number;
  maxScore: number;
  colorCode?: boolean;
  showPoints?: boolean;
}) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const rawStars = (score / maxScore) * 5;
  const roundedStars = Math.round(rawStars * 2) / 2;

  const fullStars = Math.floor(roundedStars);
  const hasHalfStar = roundedStars % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const colorClass = getStarColor(percentage, colorCode);
  const starSize = 14;

  const ariaLabel = `Rating: ${roundedStars} out of 5 stars`;

  return (
    <span className="inline-flex items-center gap-1.5" role="img" aria-label={ariaLabel}>
      <span className="inline-flex items-center gap-px" aria-hidden="true">
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg
            key={`full-${i}`}
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            className={colorClass}
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
        {hasHalfStar && <HalfStar size={starSize} colorClass={colorClass} />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg
            key={`empty-${i}`}
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            className="text-gray-300"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </span>
      {showPoints && (
        <span className="text-xs text-gray-400">({score}/{maxScore} pts)</span>
      )}
    </span>
  );
}
