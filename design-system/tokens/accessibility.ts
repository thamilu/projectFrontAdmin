/**
 * Design System - Accessibility (A11y) Tokens
 * Enforces keyboard navigation focus rings, contrast safeguards, and screen reader helpers.
 */
export const accessibility = {
  focus: {
    ring: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    ringOffset: 'focus-visible:ring-offset-background',
  },
  contrast: {
    wcagAaMinRatio: 4.5, // 4.5:1 ratio for standard text
    wcagAaaMinRatio: 7.0, // 7:1 ratio for enhanced readability
  },
  srOnly: 'absolute w-px h-px p-0 -m-px overflow-hidden clip-rect-0 border-0 whitespace-nowrap',
  srOnlyFocusable: 'not-sr-only focus:static focus:w-auto focus:h-auto focus:p-0 focus:m-0 focus:overflow-visible focus:clip-auto',
} as const;

export type AccessibilityTokens = typeof accessibility;
