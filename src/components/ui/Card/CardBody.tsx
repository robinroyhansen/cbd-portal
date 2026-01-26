'use client';

import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the body should be scrollable */
  scrollable?: boolean;
  /** Maximum height for scrollable content (e.g., '200px', '50vh') */
  maxHeight?: string;
  /** Padding size - uses default card padding if not specified */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Body content */
  children?: ReactNode;
}

// Padding styles
const paddingStyles = {
  none: '',
  sm: 'px-4 py-3',
  md: 'px-5 py-4',
  lg: 'px-6 py-5',
} as const;

/**
 * CardBody component for the main content area of a card.
 *
 * @example
 * // Basic body with default padding
 * <CardBody>
 *   <p>Card content goes here</p>
 * </CardBody>
 *
 * @example
 * // Scrollable body with max height
 * <CardBody scrollable maxHeight="300px">
 *   <LongContent />
 * </CardBody>
 *
 * @example
 * // Body with custom padding
 * <CardBody padding="lg">
 *   <p>Large padded content</p>
 * </CardBody>
 */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  function CardBody(
    {
      scrollable = false,
      maxHeight,
      padding = 'md',
      className = '',
      children,
      style,
      ...props
    },
    ref
  ) {
    const scrollableStyles = scrollable
      ? 'overflow-y-auto scrollbar-hide'
      : '';

    const combinedClassName = [
      paddingStyles[padding],
      scrollableStyles,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Build style object
    const combinedStyle = {
      ...style,
      ...(scrollable && maxHeight ? { maxHeight } : {}),
    };

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={combinedStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export default CardBody;
