/**
 * Data Transformation Utilities
 * 
 * Provides reusable data transformation patterns
 * Eliminates duplicate mapping and transformation logic
 * 
 * @module lib/utils/data-transform
 */

/**
 * Safely accesses nested object properties
 * Returns default value if path doesn't exist
 * 
 * @example
 * ```ts
 * const user = { profile: { name: 'John' } };
 * const name = getNestedValue(user, 'profile.name', 'Unknown');
 * // Returns: 'John'
 * 
 * const age = getNestedValue(user, 'profile.age', 0);
 * // Returns: 0
 * ```
 */
export function getNestedValue<T = any>(
  obj: any,
  path: string,
  defaultValue?: T
): T {
  const value = path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);

  return value !== undefined ? value : (defaultValue as T);
}

/**
 * Maps array of objects with a transformation function
 * Handles null/undefined and ensures array output
 * 
 * @example
 * ```ts
 * const users = mapArray(response.data, (user) => ({
 *   id: user.userId,
 *   name: user.fullName,
 * }));
 * ```
 */
export function mapArray<T, R>(
  data: T[] | null | undefined,
  mapper: (item: T, index: number) => R
): R[] {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map(mapper);
}

/**
 * Filters and maps array in one operation
 * 
 * @example
 * ```ts
 * const activeUsers = filterMap(
 *   users,
 *   (user) => user.active,
 *   (user) => ({ id: user.id, name: user.name })
 * );
 * ```
 */
export function filterMap<T, R>(
  data: T[] | null | undefined,
  predicate: (item: T) => boolean,
  mapper: (item: T) => R
): R[] {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.filter(predicate).map(mapper);
}

/**
 * Groups array by a key
 * 
 * @example
 * ```ts
 * const users = [
 *   { id: 1, role: 'admin', name: 'John' },
 *   { id: 2, role: 'user', name: 'Jane' },
 *   { id: 3, role: 'admin', name: 'Bob' },
 * ];
 * 
 * const byRole = groupBy(users, (user) => user.role);
 * // Returns: { admin: [...], user: [...] }
 * ```
 */
export function groupBy<T>(
  data: T[],
  keyFn: (item: T) => string | number
): Record<string, T[]> {
  return data.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Removes duplicate items from array
 * 
 * @example
 * ```ts
 * const unique = uniqueBy(users, (user) => user.email);
 * ```
 */
export function uniqueBy<T>(
  data: T[],
  keyFn: (item: T) => any
): T[] {
  const seen = new Set();
  return data.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Converts string to safe ID (lowercase, hyphens)
 * 
 * @example
 * ```ts
 * toSlug('Hello World!') // 'hello-world'
 * ```
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Converts snake_case to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts camelCase to snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Converts object keys from snake_case to camelCase
 * 
 * @example
 * ```ts
 * const backendData = { user_id: 1, first_name: 'John' };
 * const frontendData = keysToCamelCase(backendData);
 * // Returns: { userId: 1, firstName: 'John' }
 * ```
 */
export function keysToCamelCase<T = any>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map(keysToCamelCase) as any;
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = toCamelCase(key);
      result[camelKey] = keysToCamelCase(obj[key]);
      return result;
    }, {} as any);
  }

  return obj;
}

/**
 * Converts object keys from camelCase to snake_case
 */
export function keysToSnakeCase<T = any>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map(keysToSnakeCase) as any;
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = toSnakeCase(key);
      result[snakeKey] = keysToSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }

  return obj;
}

/**
 * Picks specific keys from an object
 * 
 * @example
 * ```ts
 * const user = { id: 1, name: 'John', email: 'john@example.com', age: 30 };
 * const basic = pick(user, ['id', 'name']);
 * // Returns: { id: 1, name: 'John' }
 * ```
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (key in obj) {
      (result as any)[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
}

/**
 * Omits specific keys from an object
 * 
 * @example
 * ```ts
 * const user = { id: 1, name: 'John', password: 'secret' };
 * const safe = omit(user, ['password']);
 * // Returns: { id: 1, name: 'John' }
 * ```
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj } as T;
  keys.forEach((key) => {
    delete (result as any)[key];
  });
  return result as Omit<T, K>;
}

/**
 * Merges multiple objects deeply
 */
export function deepMerge<T extends object>(...objects: Partial<T>[]): Partial<T> {
  return objects.reduce((result, obj) => {
    Object.keys(obj).forEach((key) => {
      const value = obj[key as keyof typeof obj];
      const existing = (result as any)[key];

      if (
        existing &&
        typeof existing === 'object' &&
        !Array.isArray(existing) &&
        value &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        (result as any)[key] = deepMerge(existing, value);
      } else {
        (result as any)[key] = value;
      }
    });
    return result;
  }, {} as Partial<T>);
}

/**
 * Converts value to array if it isn't already
 * 
 * @example
 * ```ts
 * ensureArray('hello') // ['hello']
 * ensureArray(['hello']) // ['hello']
 * ensureArray(null) // []
 * ```
 */
export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

/**
 * Chunks array into smaller arrays
 * 
 * @example
 * ```ts
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flattens nested array
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce<T[]>((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
}
