'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

// ============================================================================
// CONSTANTS
// ============================================================================

const SIZE_STYLES = {
  sm: 'h-9 text-sm px-3',      // 36px height
  md: 'h-11 text-base px-4',   // 44px height
  lg: 'h-13 text-base px-4',   // 52px height
} as const;

const VARIANT_STYLES = {
  default: 'bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500',
  filled: 'bg-gray-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-emerald-500',
  outlined: 'bg-transparent border-gray-300 border-2 focus:border-emerald-500 focus:ring-emerald-500',
} as const;

const ERROR_STYLES = 'border-red-500 focus:border-red-500 focus:ring-red-500';

// ============================================================================
// TYPES
// ============================================================================

export type InputSize = keyof typeof SIZE_STYLES;
export type InputVariant = keyof typeof VARIANT_STYLES;

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Size of the input */
  size?: InputSize;
  /** Visual variant */
  variant?: InputVariant;
  /** Whether the input has an error */
  error?: boolean;
  /** Icon to display on the left side */
  leftIcon?: ReactNode;
  /** Icon to display on the right side */
  rightIcon?: ReactNode;
  /** Container class name for wrapper div */
  containerClassName?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Input Component
 *
 * A flexible text input with size variants, visual variants, and icon support.
 * Uses 16px font size on mobile to prevent iOS zoom on focus.
 *
 * @example
 * // Basic input
 * <Input placeholder="Enter your name" />
 *
 * @example
 * // With icons
 * <Input
 *   leftIcon={<SearchIcon />}
 *   rightIcon={<ClearIcon />}
 *   placeholder="Search..."
 * />
 *
 * @example
 * // With error state
 * <Input error placeholder="Email" />
 *
 * @example
 * // Different sizes and variants
 * <Input size="lg" variant="filled" placeholder="Large filled input" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    variant = 'default',
    error = false,
    leftIcon,
    rightIcon,
    className = '',
    containerClassName = '',
    disabled,
    ...props
  },
  ref
) {
  // Base input styles
  const baseStyles = [
    'w-full rounded-lg border transition-colors duration-200',
    'placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100',
    // 16px font size on mobile prevents iOS zoom - we use text-base which is 16px
    'text-[16px] sm:text-sm md:text-base',
  ].join(' ');

  // Size styles
  const sizeStyles = SIZE_STYLES[size];

  // Variant styles
  const variantStyles = error ? ERROR_STYLES : VARIANT_STYLES[variant];

  // Padding adjustments for icons
  const leftPadding = leftIcon ? 'pl-10' : '';
  const rightPadding = rightIcon ? 'pr-10' : '';

  // Combine all styles
  const inputClassName = [
    baseStyles,
    sizeStyles,
    variantStyles,
    leftPadding,
    rightPadding,
    className,
  ].filter(Boolean).join(' ');

  // If no icons, render simple input
  if (!leftIcon && !rightIcon) {
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={inputClassName}
        {...props}
      />
    );
  }

  // With icons, wrap in a relative container
  return (
    <div className={`relative ${containerClassName}`}>
      {leftIcon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        disabled={disabled}
        className={inputClassName}
        {...props}
      />
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
          {rightIcon}
        </div>
      )}
    </div>
  );
});

export default Input;
