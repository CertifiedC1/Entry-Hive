/**
 * Client-side rate limiter for API calls
 * Uses sliding window algorithm with localStorage persistence
 */

interface RateLimitEntry {
  timestamps: number[];
  blockedUntil?: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

const STORAGE_KEY = 'entryhive_rate_limits';

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  auth: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 requests per minute
    blockDurationMs: 5 * 60 * 1000, // 5 minute block
  },
  payment: {
    maxRequests: 3,
    windowMs: 60 * 1000, // 3 requests per minute
    blockDurationMs: 2 * 60 * 1000, // 2 minute block
  },
  contact: {
    maxRequests: 3,
    windowMs: 5 * 60 * 1000, // 3 requests per 5 minutes
    blockDurationMs: 10 * 60 * 1000, // 10 minute block
  },
  api: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 requests per minute
    blockDurationMs: 60 * 1000, // 1 minute block
  },
};

function getStoredLimits(): Record<string, RateLimitEntry> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setStoredLimits(limits: Record<string, RateLimitEntry>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limits));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if a request is allowed and track it
 * @returns Object with allowed status and optional retry time
 */
export function checkRateLimit(
  endpoint: string,
  config?: RateLimitConfig
): { allowed: boolean; retryAfter?: number; remainingRequests?: number } {
  const cfg = config || RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS.api;
  const now = Date.now();
  const limits = getStoredLimits();
  const entry = limits[endpoint] || { timestamps: [] };

  // Check if currently blocked
  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  // Remove expired timestamps (outside the window)
  entry.timestamps = entry.timestamps.filter(
    (ts) => now - ts < cfg.windowMs
  );

  // Check if limit exceeded
  if (entry.timestamps.length >= cfg.maxRequests) {
    entry.blockedUntil = now + (cfg.blockDurationMs || cfg.windowMs);
    limits[endpoint] = entry;
    setStoredLimits(limits);

    return {
      allowed: false,
      retryAfter: Math.ceil((cfg.blockDurationMs || cfg.windowMs) / 1000),
    };
  }

  // Add current request timestamp
  entry.timestamps.push(now);
  entry.blockedUntil = undefined;
  limits[endpoint] = entry;
  setStoredLimits(limits);

  return {
    allowed: true,
    remainingRequests: cfg.maxRequests - entry.timestamps.length,
  };
}

/**
 * Reset rate limit for an endpoint (e.g., after successful auth)
 */
export function resetRateLimit(endpoint: string): void {
  const limits = getStoredLimits();
  delete limits[endpoint];
  setStoredLimits(limits);
}

/**
 * Clear all rate limits (useful for logout)
 */
export function clearAllRateLimits(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * HOC/wrapper for rate-limited API calls
 */
export async function withRateLimit<T>(
  endpoint: string,
  fn: () => Promise<T>,
  config?: RateLimitConfig
): Promise<T> {
  const check = checkRateLimit(endpoint, config);
  
  if (!check.allowed) {
    throw new Error(
      `Rate limit exceeded. Please try again in ${check.retryAfter} seconds.`
    );
  }

  return fn();
}
