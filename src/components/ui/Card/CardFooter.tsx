'use client';

import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

// Alignment styles
const alignStyles = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
} as const;

export type CardFooterAlign = keyof typeof alignStyles;

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Alignment of footer content */
  align?: CardFooterAlign;
  /** Whether to show a divider line at the top */
  divider?: boolean;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Footer content */
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
 * CardFooter component for actions, metadata, or supplementary content.
 *
 * @example
 * // Basic footer with right-aligned content
 * <CardFooter align="right">
 *   <Button>Save</Button>
 * </CardFooter>
 *
 * @example
 * // Footer with divider and space-between alignment
 * <CardFooter divider align="between">
 *   <span>Last updated: Today</span>
 *   <Button variant="ghost">Edit</Button>
 * </CardFooter>
 *
 * @example
 * // Centered footer
 * <CardFooter align="center">
 *   <Button>View All</Button>
 * </CardFooter>
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter(
    {
      align = 'left',
      divider = false,
      padding = 'md',
      className = '',
      children,
      ...props
    },
    ref
  ) {
    const dividerStyles = divider ? 'border-t border-gray-200' : '';

    const combinedClassName = [
      'flex items-center gap-3 flex-wrap',
      paddingStyles[padding],
      alignStyles[align],
      dividerStyles,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  }
);

export default CardFooter;
