'use client';

import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

// Size styles for the header
const sizeStyles = {
  sm: {
    container: 'p-4 gap-3',
    title: 'text-base font-semibold',
    subtitle: 'text-xs',
    icon: 'w-8 h-8',
  },
  md: {
    container: 'p-5 gap-4',
    title: 'text-lg font-semibold',
    subtitle: 'text-sm',
    icon: 'w-10 h-10',
  },
  lg: {
    container: 'p-6 gap-4',
    title: 'text-xl font-bold',
    subtitle: 'text-base',
    icon: 'w-12 h-12',
  },
} as const;

export type CardHeaderSize = keyof typeof sizeStyles;

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Header title */
  title?: ReactNode;
  /** Subtitle text below the title */
  subtitle?: ReactNode;
  /** Action element (button, menu, etc.) - positioned on the right */
  action?: ReactNode;
  /** Icon element - positioned on the left before title */
  icon?: ReactNode;
  /** Size of the header */
  size?: CardHeaderSize;
  /** Additional CSS classes */
  className?: string;
  /** Children - if provided, replaces default title/subtitle structure */
  children?: ReactNode;
}

/**
 * CardHeader component for card titles, subtitles, icons, and actions.
 *
 * @example
 * // Basic header with title
 * <CardHeader title="Card Title" />
 *
 * @example
 * // Header with title and subtitle
 * <CardHeader title="Card Title" subtitle="A brief description" />
 *
 * @example
 * // Header with icon and action
 * <CardHeader
 *   icon={<IconComponent />}
 *   title="Card Title"
 *   action={<Button>Action</Button>}
 * />
 *
 * @example
 * // Custom children layout
 * <CardHeader>
 *   <CustomLayout />
 * </CardHeader>
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader(
    {
      title,
      subtitle,
      action,
      icon,
      size = 'md',
      className = '',
      children,
      ...props
    },
    ref
  ) {
    const styles = sizeStyles[size];

    // If children are provided, render them directly
    if (children) {
      return (
        <div
          ref={ref}
          className={`flex items-start justify-between ${styles.container} ${className}`}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`flex items-start justify-between ${styles.container} ${className}`}
        {...props}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon slot */}
          {icon && (
            <div
              className={`flex-shrink-0 flex items-center justify-center ${styles.icon}`}
            >
              {icon}
            </div>
          )}

          {/* Title and subtitle */}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={`text-gray-900 leading-tight ${styles.title}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-gray-500 mt-1 leading-snug ${styles.subtitle}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action slot */}
        {action && <div className="flex-shrink-0 ml-4">{action}</div>}
      </div>
    );
  }
);

export default CardHeader;
