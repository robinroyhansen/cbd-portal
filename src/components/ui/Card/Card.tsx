'use client';

import { forwardRef, type ElementType, type ComponentPropsWithoutRef } from 'react';
import { LocaleLink as Link } from '@/components/LocaleLink';

// Variant styles
const variantStyles = {
  default: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-lg border border-gray-100',
  outlined: 'bg-transparent border-2 border-gray-300',
  ghost: 'bg-transparent border-transparent',
} as const;

// Padding styles
const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const;

// Hover effect styles
const hoverEffectStyles = {
  none: '',
  lift: 'hover:-translate-y-1 hover:shadow-lg',
  glow: 'hover:shadow-lg hover:shadow-emerald-500/10',
  border: 'hover:border-emerald-500',
} as const;

export type CardVariant = keyof typeof variantStyles;
export type CardPadding = keyof typeof paddingStyles;
export type CardHoverEffect = keyof typeof hoverEffectStyles;

// Props that are specific to our Card component
export interface CardOwnProps {
  /** The element type to render as */
  as?: ElementType;
  /** Visual variant of the card */
  variant?: CardVariant;
  /** Padding size */
  padding?: CardPadding;
  /** Hover effect style */
  hoverEffect?: CardHoverEffect;
  /** Whether the card is interactive (clickable) */
  interactive?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Card content */
  children?: React.ReactNode;
}

// Type for polymorphic component
type PolymorphicCardProps<E extends ElementType> = CardOwnProps &
  Omit<ComponentPropsWithoutRef<E>, keyof CardOwnProps>;

// Default element type
type CardComponent = <E extends ElementType = 'div'>(
  props: PolymorphicCardProps<E> & { ref?: React.Ref<Element> }
) => React.ReactElement | null;

/**
 * Unified Card component with polymorphic rendering support.
 * Can render as div, article, Link, or any other element type.
 *
 * @example
 * // Basic card
 * <Card>Content</Card>
 *
 * @example
 * // Elevated card with hover lift
 * <Card variant="elevated" hoverEffect="lift">Content</Card>
 *
 * @example
 * // Card as a link
 * <Card as={Link} href="/page" interactive>Clickable Card</Card>
 *
 * @example
 * // Card as article element
 * <Card as="article" variant="outlined" padding="lg">Article content</Card>
 */
export const Card: CardComponent = forwardRef(function Card<
  E extends ElementType = 'div'
>(
  {
    as,
    variant = 'default',
    padding = 'none',
    hoverEffect = 'none',
    interactive = false,
    className = '',
    children,
    ...props
  }: PolymorphicCardProps<E>,
  ref: React.Ref<Element>
) {
  // Determine the component to render
  const Component = as || 'div';

  // Build class names
  const baseStyles = 'rounded-2xl overflow-hidden transition-all duration-200';
  const interactiveStyles = interactive
    ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2'
    : '';

  const combinedClassName = [
    baseStyles,
    variantStyles[variant],
    paddingStyles[padding],
    hoverEffectStyles[hoverEffect],
    interactiveStyles,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Add tabIndex for interactive non-link elements
  const tabIndexProp =
    interactive && Component !== Link && Component !== 'a' && Component !== 'button'
      ? { tabIndex: 0, role: 'button' }
      : {};

  return (
    <Component
      ref={ref}
      className={combinedClassName}
      {...tabIndexProp}
      {...props}
    >
      {children}
    </Component>
  );
}) as CardComponent;

export default Card;
