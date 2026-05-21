/**
 * Design System - Semantic Component Variants
 * Centralized layout-safe presets for standard UI items.
 */
export const semanticVariants = {
  buttons: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
    ghost: 'hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]',
  },
  badges: {
    success: 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20',
    error: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
    neutral: 'bg-muted text-muted-foreground border border-border',
  },
  cards: {
    default: 'bg-card text-card-foreground border border-border shadow-sm',
    elevated: 'bg-card text-card-foreground border border-border shadow-md transition-shadow hover:shadow-lg',
    glass: 'bg-background/80 backdrop-blur-md border border-white/10 dark:border-white/5 shadow-sm',
  }
} as const;

export type SemanticVariants = typeof semanticVariants;
