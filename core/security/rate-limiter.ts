/**
 * Rate Limiting Middleware
 * 
 * Implements sliding window rate limiting for:
 * - Public endpoints (anonymous users)
 * - Authenticated endpoints (per-user limits)
 * - Admin endpoints (relaxed limits)
 * 
 * Storage: In-memory with LRU eviction (production should use Redis)
 * 
 * @module lib/security/rate-limiter
 */

import { RateLimitError } from '../errors/auth-errors';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
  requests: number[]; // Timestamps of requests (sliding window)
}

/**
 * In-memory rate limit store (LRU cache)
 * 
 * PRODUCTION NOTE: Replace with Redis for distributed rate limiting
 */
class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();
  private maxSize = 10000; // Prevent memory exhaustion
  
  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key);
  }
  
  set(key: string, value: RateLimitEntry): void {
    // LRU eviction when size exceeded
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) {
        this.store.delete(firstKey);
      }
    }
    
    this.store.set(key, value);
  }
  
  delete(key: string): void {
    this.store.delete(key);
  }
  
  /**
   * Clean expired entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key);
      }
    }
  }
}

const rateLimitStore = new RateLimitStore();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimitStore.cleanup(), 5 * 60 * 1000);
}

/**
 * Rate limit configurations by endpoint type
 */
export const RATE_LIMITS = {
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 min
  },
  authenticated: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 1000,
  },
  admin: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5000,
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10, // Strict limit on auth endpoints
  },
} as const;

/**
 * Rate limiter result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check rate limit using sliding window algorithm
 * 
 * Time Complexity: O(n) where n = requests in window (typically small)
 * Space Complexity: O(m * n) where m = unique IPs/users
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  let entry = rateLimitStore.get(identifier);
  
  if (!entry) {
    // First request
    entry = {
      count: 1,
      resetAt: now + config.windowMs,
      requests: [now],
    };
    rateLimitStore.set(identifier, entry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: entry.resetAt,
    };
  }
  
  // Remove requests outside current window (sliding window)
  entry.requests = entry.requests.filter(timestamp => timestamp > windowStart);
  entry.count = entry.requests.length;
  
  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const oldestRequest = entry.requests[0] || now;
    const retryAfter = Math.ceil((oldestRequest + config.windowMs - now) / 1000);
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestRequest + config.windowMs,
      retryAfter,
    };
  }
  
  // Allow request
  entry.requests.push(now);
  entry.count++;
  rateLimitStore.set(identifier, entry);
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get rate limit identifier from request
 * 
 * Priority:
 * 1. User ID (if authenticated)
 * 2. IP address (fallback)
 */
export function getRateLimitIdentifier(
  userId: string | null,
  ipAddress: string | null,
  route: string,
): string {
  if (userId) {
    return `user:${userId}:${route}`;
  }
  
  if (ipAddress) {
    return `ip:${ipAddress}:${route}`;
  }
  
  return `anonymous:${route}`;
}

/**
 * Get rate limit config for route
 */
export function getRateLimitConfig(
  pathname: string,
  isAuthenticated: boolean,
  roles: string[] = [],
): RateLimitConfig {
  // Auth endpoints (login, register) have strictest limits
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/auth')) {
    return RATE_LIMITS.auth;
  }
  
  // Admin users get relaxed limits
  if (roles.includes('ADMIN') || roles.includes('admin')) {
    return RATE_LIMITS.admin;
  }
  
  // Authenticated users get higher limits
  if (isAuthenticated) {
    return RATE_LIMITS.authenticated;
  }
  
  // Public/anonymous users get strict limits
  return RATE_LIMITS.public;
}

/**
 * Extract IP address from request headers
 * 
 * SECURITY: Validate X-Forwarded-For to prevent spoofing
 */
export function getClientIp(headers: Headers): string | null {
  // Try standard headers (in order of preference)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2)
    // Take the leftmost (client) IP
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0] || null;
  }
  
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  return null;
}

export const callbackRateLimiter = {
  async enforce(identifier: string): Promise<void> {
    const cfg = RATE_LIMITS.auth;
    const id = identifier || 'anon';
    const res = checkRateLimit(id, cfg);
    if (!res.allowed) {
      throw new RateLimitError(res.retryAfter ?? 60, 'Rate limit exceeded');
    }
  },
};

// ===========================================================================
// Upstash Redis-Backed Rate Limiting (Moved from rate-limit.ts)
// ===========================================================================

export interface UpstashRateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // epoch ms
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let upstash: any = undefined; // undefined = not initialized yet

const memStore = new Map<string, { count: number; resetAt: number }>();
const MEM_WINDOW_MS = 60_000;
const MEM_MAX = 10;

async function initUpstashIfNeeded() {
  if (upstash !== undefined) return; // already attempted

  try {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_TOKEN;
    if (!url || !token) {
      upstash = null;
      return;
    }

    // Dynamic import to keep package optional for local/dev
    const { Redis } = await import('@upstash/redis');
    const { Ratelimit } = await import('@upstash/ratelimit');

    // Use unknown and narrow where necessary to avoid `any` usage
    const redis = (Redis as unknown as { fromEnv?: () => unknown }).fromEnv
      ? (Redis as unknown as { fromEnv: () => unknown }).fromEnv()
      : new (Redis as unknown as { new (opts: { url: string; token: string }): unknown })({ url, token });

    upstash = new (Ratelimit as unknown as { new (opts: { redis: unknown; limiter: unknown; analytics?: boolean }): unknown })({
      redis,
      limiter: (Ratelimit as unknown as { slidingWindow: (n: number, per: string) => unknown }).slidingWindow(MEM_MAX, '1 m'),
      analytics: true,
    });
  } catch {
    // If anything fails, mark as unavailable and fall back to in-memory
    upstash = null;
  }
}

export async function limit(key: string): Promise<UpstashRateLimitResult> {
  await initUpstashIfNeeded();

  if (upstash) {
    try {
      const r = await upstash.limit(key);
      return {
        success: Boolean(r?.success),
        remaining: typeof r?.remaining === 'number' ? r.remaining : 0,
        reset: typeof r?.reset === 'number' ? r.reset : Date.now() + MEM_WINDOW_MS,
      };
    } catch {
      // fall through to in-memory fallback
    }
  }

  // In-memory sliding window fallback
  const now = Date.now();
  const entry = memStore.get(key);
  if (!entry || entry.resetAt < now) {
    memStore.set(key, { count: 1, resetAt: now + MEM_WINDOW_MS });
    return { success: true, remaining: MEM_MAX - 1, reset: now + MEM_WINDOW_MS };
  }

  entry.count++;
  memStore.set(key, entry);
  return { success: entry.count <= MEM_MAX, remaining: Math.max(0, MEM_MAX - entry.count), reset: entry.resetAt };
}
