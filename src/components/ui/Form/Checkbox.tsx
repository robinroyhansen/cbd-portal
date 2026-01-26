'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Label text or element */
  label?: ReactNode;
  /** Whether the checkbox has an error */
  error?: boolean;
  /** Size of the checkbox */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class for the label container */
  labelClassName?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SIZE_STYLES = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const;

const LABEL_SIZE_STYLES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Checkbox Component
 *
 * A styled checkbox with optional label.
 * Supports error state and multiple sizes.
 *
 * @example
 * // Basic checkbox
 * <Checkbox label="I agree to the terms" />
 *
 * @example
 * // With error state
 * <Checkbox error label="This is required" />
 *
 * @example
 * // Different sizes
 * <Checkbox size="lg" label="Large checkbox" />
 *
 * @example
 * // Controlled checkbox
 * <Checkbox
 *   checked={isChecked}
 *   onChange={(e) => setIsChecked(e.target.checked)}
 *   label="Subscribe to newsletter"
 * />
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    error = false,
    size = 'md',
    className = '',
    labelClassName = '',
    disabled,
    id,
    ...props
  },
  ref
) {
  // Generate ID if not provided
  const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

  // Checkbox styles
  const checkboxStyles = [
    SIZE_STYLES[size],
    'rounded border-gray-300 text-emerald-600',
    'focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0',
    'transition-colors duration-200 cursor-pointer',
    'disabled:cursor-not-allowed disabled:opacity-50',
    error ? 'border-red-500 focus:ring-red-500' : '',
    className,
  ].filter(Boolean).join(' ');

  // Label styles
  const labelStyles = [
    LABEL_SIZE_STYLES[size],
    'text-gray-700 cursor-pointer select-none',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    error ? 'text-red-600' : '',
    labelClassName,
  ].filter(Boolean).join(' ');

  // If no label, render just the checkbox
  if (!label) {
    return (
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        disabled={disabled}
        className={checkboxStyles}
        {...props}
      />
    );
  }

  // With label, wrap in a flex container
  return (
    <div className="flex items-start gap-2">
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        disabled={disabled}
        className={`${checkboxStyles} mt-0.5`}
        {...props}
      />
      <label htmlFor={checkboxId} className={labelStyles}>
        {label}
      </label>
    </div>
  );
});

export default Checkbox;
