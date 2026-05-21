/**
 * E-Shop Admin Design System - Theme Provider
 *
 * Wraps next-themes to support system preference detection,
 * smooth theme transitions, and programmatic access to color variables.
 */

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';
import { colors, getColorVar, type ColorToken } from '../tokens/colors';

/**
 * Enterprise Theme Provider Component
 *
 * Implements smooth transition blocks, local storage preference caching,
 * and standard system color scheme queries.
 */
export function ThemeProvider({
  children,
  ...props
}: React.PropsWithChildren<ThemeProviderProps>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="eshop-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * High-performance hook for managing application theme states
 * with access to semantic design-system color helpers.
 */
export function useAppTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();

  /**
   * Retrieves programmatic hex/hsl value of a design system token
   * based on the currently active light/dark theme.
   */
  const getSemanticColor = React.useCallback(
    (token: ColorToken): string => {
      const mode = (resolvedTheme || theme || 'light') as 'light' | 'dark';
      // Ensure fallbacks are correct if mode is unrecognized
      const activeMode = mode === 'dark' ? 'dark' : 'light';
      return colors[activeMode][token];
    },
    [resolvedTheme, theme]
  );

  /**
   * Retrieves the CSS variable reference for a design system token
   */
  const getCSSVariable = React.useCallback((token: ColorToken): string => {
    return getColorVar(token);
  }, []);

  return {
    theme,
    setTheme,
    resolvedTheme,
    systemTheme,
    isDark: resolvedTheme === 'dark',
    getSemanticColor,
    getCSSVariable,
  };
}
