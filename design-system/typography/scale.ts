/**
 * E-Shop Admin Design System - Typography scale
 *
 * Governs font families, font sizes, line heights, font weights,
 * and provides fluid responsive typography scaling helpers.
 */

export const fontFamilies = {
  sans: "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
  mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
} as const;

export const fontSizes = {
  xs: { size: '0.75rem', lineHeight: '1rem' },      // 12px
  sm: { size: '0.875rem', lineHeight: '1.25rem' },  // 14px
  base: { size: '1rem', lineHeight: '1.5rem' },     // 16px
  lg: { size: '1.125rem', lineHeight: '1.75rem' },  // 18px
  xl: { size: '1.25rem', lineHeight: '1.75rem' },   // 20px
  '2xl': { size: '1.5rem', lineHeight: '2rem' },    // 24px
  '3xl': { size: '1.875rem', lineHeight: '2.25rem' },// 30px
  '4xl': { size: '2.25rem', lineHeight: '2.5rem' },  // 36px
  '5xl': { size: '3rem', lineHeight: '1' },         // 48px
  '6xl': { size: '3.75rem', lineHeight: '1' },       // 60px
} as const;

export const fontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

export type FontSizeKey = keyof typeof fontSizes;
export type FontWeightKey = keyof typeof fontWeights;
export type LineHeightKey = keyof typeof lineHeights;

/**
 * Calculates a CSS clamp function for fluid typography.
 * Scales font size fluidly between minWidth and maxWidth.
 *
 * @param minSizeRem Minimum font size in Rem
 * @param maxSizeRem Maximum font size in Rem
 * @param minWidthPx Minimum viewport width in Px (default 320px)
 * @param maxWidthPx Maximum viewport width in Px (default 1280px)
 * @returns CSS clamp() string
 */
export function getFluidFontSize(
  minSizeRem: number,
  maxSizeRem: number,
  minWidthPx: number = 320,
  maxWidthPx: number = 1280
): string {
  const minWidthRem = minWidthPx / 16;
  const maxWidthRem = maxWidthPx / 16;
  const slope = (maxSizeRem - minSizeRem) / (maxWidthRem - minWidthRem);
  const yIntersection = -minWidthRem * slope + minSizeRem;

  return `clamp(${minSizeRem}rem, ${yIntersection.toFixed(4)}rem + ${(slope * 100).toFixed(4)}vw, ${maxSizeRem}rem)`;
}
