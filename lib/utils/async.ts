/**
 * Async Utilities
 * 
 * Provides reusable async operation patterns
 * Eliminates duplicate async handling logic
 * 
 * @module lib/utils/async
 */

/**
 * Delays execution for specified milliseconds
 * 
 * @example
 * ```ts
 * await delay(1000); // Wait 1 second
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a debounced function
 * Function will only execute after specified delay since last call
 * 
 * @example
 * ```ts
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300);
 * 
 * debouncedSearch('hello'); // Won't execute immediately
 * debouncedSearch('world'); // Previous call cancelled, will execute after 300ms
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Creates a throttled function
 * Function will execute at most once per specified interval
 * 
 * @example
 * ```ts
 * const throttledScroll = throttle(() => {
 *   console.log('Scrolled');
 * }, 100);
 * 
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Executes async function with timeout
 * Throws error if operation takes longer than timeout
 * 
 * @example
 * ```ts
 * const data = await withTimeout(
 *   fetch('/api/data'),
 *   5000,
 *   'Request timed out'
 * );
 * ```
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

/**
 * Executes multiple promises in parallel and returns all results
 * Unlike Promise.all, doesn't fail fast - collects all results/errors
 * 
 * @example
 * ```ts
 * const results = await promiseAllSettled([
 *   fetch('/api/users'),
 *   fetch('/api/products'),
 *   fetch('/api/orders'),
 * ]);
 * 
 * results.forEach((result) => {
 *   if (result.status === 'fulfilled') {
 *     console.log(result.value);
 *   } else {
 *     console.error(result.reason);
 *   }
 * });
 * ```
 */
export async function promiseAllSettled<T>(
  promises: Promise<T>[]
): Promise<Array<{ status: 'fulfilled'; value: T } | { status: 'rejected'; reason: any }>> {
  return Promise.allSettled(promises);
}

/**
 * Executes promises sequentially (one after another)
 * Useful when you need to control execution order or rate limiting
 * 
 * @example
 * ```ts
 * const results = await promiseSequence([
 *   () => fetch('/api/step1'),
 *   () => fetch('/api/step2'),
 *   () => fetch('/api/step3'),
 * ]);
 * ```
 */
export async function promiseSequence<T>(
  promiseFns: Array<() => Promise<T>>
): Promise<T[]> {
  const results: T[] = [];

  for (const promiseFn of promiseFns) {
    const result = await promiseFn();
    results.push(result);
  }

  return results;
}

/**
 * Executes promises in batches
 * Useful for rate limiting or memory management
 * 
 * @example
 * ```ts
 * const urls = ['url1', 'url2', 'url3', 'url4', 'url5'];
 * const results = await batchExecute(
 *   urls,
 *   (url) => fetch(url),
 *   2 // Execute 2 at a time
 * );
 * ```
 */
export async function batchExecute<T, R>(
  items: T[],
  executor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(executor));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Retries async operation with exponential backoff
 * 
 * @example
 * ```ts
 * const data = await retry(
 *   () => fetch('/api/data'),
 *   {
 *     maxAttempts: 3,
 *     delayMs: 1000,
 *     backoff: 2,
 *     shouldRetry: (error) => error.statusCode >= 500
 *   }
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoff?: number;
    shouldRetry?: (error: any) => boolean;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = 2,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts - 1 && shouldRetry(error)) {
        const waitTime = delayMs * Math.pow(backoff, attempt);

        if (onRetry) {
          onRetry(attempt + 1, error);
        }

        await delay(waitTime);
      } else {
        break;
      }
    }
  }

  throw lastError;
}

/**
 * Creates a cancelable promise
 * 
 * @example
 * ```ts
 * const { promise, cancel } = makeCancelable(fetch('/api/data'));
 * 
 * // Later...
 * cancel();
 * 
 * try {
 *   await promise;
 * } catch (error) {
 *   if (error.isCanceled) {
 *     console.log('Request was cancelled');
 *   }
 * }
 * ```
 */
export function makeCancelable<T>(
  promise: Promise<T>
): {
  promise: Promise<T>;
  cancel: () => void;
} {
  let isCanceled = false;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise
      .then((value) => {
        if (!isCanceled) {
          resolve(value);
        }
      })
      .catch((error) => {
        if (!isCanceled) {
          reject(error);
        }
      });
  });

  return {
    promise: wrappedPromise,
    cancel: () => {
      isCanceled = true;
    },
  };
}

/**
 * Polls a function until a condition is met
 * 
 * @example
 * ```ts
 * const result = await poll(
 *   async () => {
 *     const status = await checkStatus();
 *     return status;
 *   },
 *   (status) => status === 'complete',
 *   { interval: 1000, maxAttempts: 30 }
 * );
 * ```
 */
export async function poll<T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  options: {
    interval?: number;
    maxAttempts?: number;
    onPoll?: (attempt: number, result: T) => void;
  } = {}
): Promise<T> {
  const { interval = 1000, maxAttempts = 10, onPoll } = options;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await fn();

    if (onPoll) {
      onPoll(attempt + 1, result);
    }

    if (condition(result)) {
      return result;
    }

    if (attempt < maxAttempts - 1) {
      await delay(interval);
    }
  }

  throw new Error('Polling timeout: condition not met');
}

/**
 * Creates a memoized async function
 * Caches results based on arguments
 * 
 * @example
 * ```ts
 * const getUser = memoizeAsync(async (id: string) => {
 *   const response = await fetch(`/api/users/${id}`);
 *   return response.json();
 * });
 * 
 * await getUser('123'); // Fetches from API
 * await getUser('123'); // Returns cached result
 * ```
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    cacheKey?: (...args: Parameters<T>) => string;
    ttl?: number;
  } = {}
): T {
  const cache = new Map<string, { value: any; timestamp: number }>();
  const { cacheKey = (...args) => JSON.stringify(args), ttl } = options;

  return (async (...args: Parameters<T>) => {
    const key = cacheKey(...args);
    const cached = cache.get(key);

    if (cached) {
      if (!ttl || Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
    }

    const value = await fn(...args);
    cache.set(key, { value, timestamp: Date.now() });
    return value;
  }) as T;
}
