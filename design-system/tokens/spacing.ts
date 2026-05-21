/**
 * E-Shop Admin Design System - Spacing Tokens
 *
 * Implements a strict 8px (0.5rem) baseline grid spacing scale.
 */

export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px (Baseline grid step)
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

export type SpacingScale = keyof typeof spacing;

/**
 * Layout Container Boundaries (Max-width specs)
 */
export const layoutLimits = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1400px', // Standard Radix/Shadcn container max-width
  xxxl: '1536px',
} as const;

export type LayoutBoundary = keyof typeof layoutLimits;

/**
 * Resolves a scale value to its corresponding CSS unit.
 *
 * @example
 * getSpacing(4) // Returns '1rem'
 */
export function getSpacing(scale: SpacingScale): string {
  return spacing[scale];
}

/**
 * Resolves a container boundary to its max-width CSS unit.
 *
 * @example
 * getContainerLimit('xxl') // Returns '1400px'
 */
export function getContainerLimit(boundary: LayoutBoundary): string {
  return layoutLimits[boundary];
}
