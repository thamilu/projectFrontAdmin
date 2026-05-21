/**
 * Shared Generic React Hooks
 * Reusable utility hooks for UI/UX interaction and state
 */

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';

/**
 * Hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for async operations
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as Error);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      Promise.resolve().then(() => {
        execute();
      });
    }
  }, [execute, immediate]);

  return {
    execute,
    status,
    data,
    error,
    isLoading: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}

/**
 * Hook for pagination
 */
export function usePagination(initialPage: number = 0, initialSize: number = 20) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const prevPage = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const goToPage = useCallback((newPage: number) => setPage(newPage), []);
  const changeSize = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0); // Reset to first page when size changes
  }, []);

  return {
    page,
    size,
    nextPage,
    prevPage,
    goToPage,
    changeSize,
  };
}

/**
 * Hook for local storage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  };

  return [storedValue, setValue, removeValue];
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    useCallback(
      (callback) => {
        if (typeof window === 'undefined') {
          return () => {};
        }
        const media = window.matchMedia(query);
        media.addEventListener('change', callback);
        return () => media.removeEventListener('change', callback);
      },
      [query]
    ),
    () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false),
    () => false
  );
}

/**
 * Hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const [state, setState] = useState<{ current: T; previous: T | undefined }>(() => ({
    current: value,
    previous: undefined,
  }));

  if (value !== state.current) {
    setState({
      current: value,
      previous: state.current,
    });
  }

  return state.previous;
}

/**
 * Hook for click outside
 */
export function useClickOutside<T extends HTMLElement>(
  callback: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);

  return ref;
}

/**
 * Hook for window size
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
