'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';

// ============================================================================
// CONSTANTS
// ============================================================================

const SIZE_STYLES = {
  sm: 'h-9 text-sm px-3 pr-8',     // 36px height
  md: 'h-11 text-base px-4 pr-10', // 44px height
  lg: 'h-13 text-base px-4 pr-10', // 52px height
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

export type SelectSize = keyof typeof SIZE_STYLES;
export type SelectVariant = keyof typeof VARIANT_STYLES;

export interface SelectOption {
  /** Value to be submitted */
  value: string;
  /** Display label */
  label: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Size of the select */
  size?: SelectSize;
  /** Visual variant */
  variant?: SelectVariant;
  /** Whether the select has an error */
  error?: boolean;
  /** Array of options */
  options: SelectOption[];
  /** Placeholder text (shown as disabled first option) */
  placeholder?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Select Component
 *
 * A styled select dropdown with size variants and visual variants.
 * Uses 16px font size on mobile to prevent iOS zoom.
 *
 * @example
 * // Basic select
 * <Select
 *   options={[
 *     { value: 'opt1', label: 'Option 1' },
 *     { value: 'opt2', label: 'Option 2' },
 *   ]}
 *   placeholder="Choose an option"
 * />
 *
 * @example
 * // With error state
 * <Select
 *   error
 *   options={[{ value: 'a', label: 'A' }]}
 * />
 *
 * @example
 * // Different sizes and variants
 * <Select size="lg" variant="filled" options={options} />
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    size = 'md',
    variant = 'default',
    error = false,
    options,
    placeholder,
    className = '',
    disabled,
    ...props
  },
  ref
) {
  // Base styles
  const baseStyles = [
    'w-full rounded-lg border transition-colors duration-200',
    'appearance-none cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100',
    // 16px font size on mobile prevents iOS zoom
    'text-[16px] sm:text-sm md:text-base',
  ].join(' ');

  // Size styles
  const sizeStyles = SIZE_STYLES[size];

  // Variant styles
  const variantStyles = error ? ERROR_STYLES : VARIANT_STYLES[variant];

  // Combine styles
  const selectClassName = [
    baseStyles,
    sizeStyles,
    variantStyles,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="relative">
      <select
        ref={ref}
        disabled={disabled}
        className={selectClassName}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {/* Custom dropdown arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
});

export default Select;
