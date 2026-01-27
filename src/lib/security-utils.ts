/**
 * Security utility functions for input validation and sanitization
 */

import { z } from 'zod';

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Email validation schema
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters')
  .transform((email) => email.toLowerCase().trim());

// Phone validation schema
export const phoneSchema = z
  .string()
  .regex(/^[0-9+\s-]{10,15}$/, 'Invalid phone number format')
  .transform((phone) => phone.replace(/[\s-]/g, ''));

// Name validation schema
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .transform((name) => name.trim());

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  return input.replace(/[&<>"'`=/]/g, (char) => map[char]);
}

/**
 * Validate and sanitize URL to prevent open redirect attacks
 */
export function sanitizeRedirectUrl(url: string, allowedOrigins: string[]): string {
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Allow same-origin redirects
    if (parsed.origin === window.location.origin) {
      return parsed.pathname + parsed.search + parsed.hash;
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(parsed.origin)) {
      return url;
    }
    
    // Default to home page for unsafe URLs
    return '/';
  } catch {
    // If URL parsing fails, return home
    return '/';
  }
}

/**
 * Check if a string contains potential XSS patterns
 */
export function containsXssPatterns(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:\s*text\/html/gi,
    /<\s*iframe/gi,
    /<\s*object/gi,
    /<\s*embed/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
  ];
  
  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Generate a secure random string for CSRF tokens
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Validate password strength and return feedback
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('At least 8 characters');

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password)) score++;
  else feedback.push('One lowercase letter');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('One uppercase letter');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('One number');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('One special character');

  // Check for common weak patterns
  const commonPatterns = [
    /^123456/,
    /password/i,
    /qwerty/i,
    /^abc123/i,
    /^111111/,
    /^letmein/i,
  ];

  if (commonPatterns.some((p) => p.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns');
  }

  return {
    isValid: score >= 5 && feedback.length <= 1,
    score: Math.min(score, 6),
    feedback,
  };
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  
  const start = data.slice(0, visibleChars);
  const end = data.slice(-visibleChars);
  const masked = '*'.repeat(Math.min(data.length - visibleChars * 2, 8));
  
  return `${start}${masked}${end}`;
}
