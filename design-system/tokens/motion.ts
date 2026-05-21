/**
 * Design System - Motion Governance Tokens
 * Standardizes micro-animations, durations, and easing functions.
 */
export const motion = {
  durations: {
    fast: '150ms',       // Hover states, toggles
    normal: '250ms',     // Transitions, dropdowns
    slow: '350ms',       // Modal entry, panel slide-in
    deliberate: '500ms', // Large canvas transitions
  },
  easings: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',   // Default entry & exit
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',   // UI entering screen
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',   // UI leaving screen
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',        // Alternate state changes
  },
  transitions: {
    all: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 250ms cubic-bezier(0, 0, 0.2, 1)',
  }
} as const;

export type MotionTokens = typeof motion;
