'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';

// ============================================================================
// CONSTANTS
// ============================================================================

const SIZE_STYLES = {
  sm: 'text-sm px-3 py-2',
  md: 'text-base px-4 py-3',
  lg: 'text-base px-4 py-4',
} as const;

const VARIANT_STYLES = {
  default: 'bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500',
  filled: 'bg-gray-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-emerald-500',
  outlined: 'bg-transparent border-gray-300 border-2 focus:border-emerald-500 focus:ring-emerald-500',
} as const;

const RESIZE_STYLES = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
} as const;

const ERROR_STYLES = 'border-red-500 focus:border-red-500 focus:ring-red-500';

// ============================================================================
// TYPES
// ============================================================================

export type TextareaSize = keyof typeof SIZE_STYLES;
export type TextareaVariant = keyof typeof VARIANT_STYLES;
export type TextareaResize = keyof typeof RESIZE_STYLES;

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Size of the textarea */
  size?: TextareaSize;
  /** Visual variant */
  variant?: TextareaVariant;
  /** Whether the textarea has an error */
  error?: boolean;
  /** Resize behavior */
  resize?: TextareaResize;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Textarea Component
 *
 * A styled textarea with size variants, visual variants, and resize control.
 * Uses 16px font size on mobile to prevent iOS zoom.
 *
 * @example
 * // Basic textarea
 * <Textarea placeholder="Enter your message" rows={4} />
 *
 * @example
 * // With error and no resize
 * <Textarea error resize="none" placeholder="Description" />
 *
 * @example
 * // Different sizes and variants
 * <Textarea size="lg" variant="filled" resize="vertical" />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    size = 'md',
    variant = 'default',
    error = false,
    resize = 'vertical',
    className = '',
    disabled,
    rows = 4,
    ...props
  },
  ref
) {
  // Base styles
  const baseStyles = [
    'w-full rounded-lg border transition-colors duration-200',
    'placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100',
    // 16px font size on mobile prevents iOS zoom
    'text-[16px] sm:text-sm md:text-base',
  ].join(' ');

  // Size styles
  const sizeStyles = SIZE_STYLES[size];

  // Variant styles
  const variantStyles = error ? ERROR_STYLES : VARIANT_STYLES[variant];

  // Resize styles
  const resizeStyles = RESIZE_STYLES[resize];

  // Combine styles
  const textareaClassName = [
    baseStyles,
    sizeStyles,
    variantStyles,
    resizeStyles,
    className,
  ].filter(Boolean).join(' ');

  return (
    <textarea
      ref={ref}
      rows={rows}
      disabled={disabled}
      className={textareaClassName}
      {...props}
    />
  );
});

export default Textarea;
