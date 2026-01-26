'use client';

import { ReactNode } from 'react';
import { FormError } from './FormError';

// ============================================================================
// TYPES
// ============================================================================

export interface FormFieldProps {
  /** Label text */
  label?: string;
  /** ID to link label with input via htmlFor */
  htmlFor?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Help text displayed below the input */
  helpText?: ReactNode;
  /** Error message to display */
  error?: string;
  /** The input element(s) */
  children: ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FormField Component
 *
 * A wrapper component that provides consistent layout for form inputs
 * with label, required indicator, help text, and error messages.
 *
 * @example
 * // Basic usage
 * <FormField label="Email" htmlFor="email" required>
 *   <Input id="email" type="email" placeholder="you@example.com" />
 * </FormField>
 *
 * @example
 * // With help text
 * <FormField
 *   label="Password"
 *   htmlFor="password"
 *   helpText="Must be at least 8 characters"
 * >
 *   <Input id="password" type="password" />
 * </FormField>
 *
 * @example
 * // With error
 * <FormField
 *   label="Username"
 *   htmlFor="username"
 *   error="Username is already taken"
 * >
 *   <Input id="username" error />
 * </FormField>
 *
 * @example
 * // With complex help text
 * <FormField
 *   label="Bio"
 *   htmlFor="bio"
 *   helpText={<span>Max <strong>500</strong> characters</span>}
 * >
 *   <Textarea id="bio" />
 * </FormField>
 */
export function FormField({
  label,
  htmlFor,
  required = false,
  helpText,
  error,
  children,
  className = '',
}: FormFieldProps) {
  const errorId = error && htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only">(required)</span>}
        </label>
      )}

      {/* Input slot */}
      {children}

      {/* Help text */}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}

      {/* Error message */}
      {error && <FormError id={errorId}>{error}</FormError>}
    </div>
  );
}

export default FormField;
