'use client';

import { ReactNode } from 'react';

export interface FormErrorProps {
  /** Error message to display */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** ID for associating with input via aria-describedby */
  id?: string;
}

/**
 * FormError Component
 *
 * Displays form validation errors with an alert icon.
 * Uses role="alert" for screen reader accessibility.
 *
 * @example
 * <FormError>This field is required</FormError>
 *
 * @example
 * <FormError id="email-error">Please enter a valid email address</FormError>
 */
export function FormError({ children, className = '', id }: FormErrorProps) {
  if (!children) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={`flex items-center gap-1.5 text-sm text-red-600 mt-1.5 ${className}`}
    >
      <svg
        className="h-4 w-4 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export default FormError;
