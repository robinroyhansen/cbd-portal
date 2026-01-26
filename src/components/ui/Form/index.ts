/**
 * Form Component System
 *
 * A unified form component system for the CBD Portal.
 * Provides consistent styling and accessibility across all form elements.
 *
 * @example
 * // Import form components
 * import { Input, Select, Textarea, Checkbox, FormField, FormError } from '@/components/ui/Form';
 *
 * // Build a form
 * <form>
 *   <FormField label="Email" htmlFor="email" required>
 *     <Input id="email" type="email" placeholder="you@example.com" />
 *   </FormField>
 *
 *   <FormField label="Country" htmlFor="country">
 *     <Select
 *       id="country"
 *       options={[
 *         { value: 'us', label: 'United States' },
 *         { value: 'uk', label: 'United Kingdom' },
 *       ]}
 *       placeholder="Select a country"
 *     />
 *   </FormField>
 *
 *   <FormField label="Message" htmlFor="message">
 *     <Textarea id="message" rows={4} />
 *   </FormField>
 *
 *   <Checkbox label="Subscribe to newsletter" />
 * </form>
 */

// Form Error
export { FormError, default as FormErrorDefault } from './FormError';
export type { FormErrorProps } from './FormError';

// Input
export { Input, default as InputDefault } from './Input';
export type { InputProps, InputSize, InputVariant } from './Input';

// Select
export { Select, default as SelectDefault } from './Select';
export type { SelectProps, SelectOption, SelectSize, SelectVariant } from './Select';

// Textarea
export { Textarea, default as TextareaDefault } from './Textarea';
export type { TextareaProps, TextareaSize, TextareaVariant, TextareaResize } from './Textarea';

// Checkbox
export { Checkbox, default as CheckboxDefault } from './Checkbox';
export type { CheckboxProps } from './Checkbox';

// FormField
export { FormField, default as FormFieldDefault } from './FormField';
export type { FormFieldProps } from './FormField';
