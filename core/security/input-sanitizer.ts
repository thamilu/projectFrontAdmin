/**
 * Input Sanitization Utility
 * Prevents injection attacks by sanitizing user input
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize string input to prevent XSS and injection attacks
 * Time Complexity: O(n) where n is input length
 * Space Complexity: O(n)
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potential XSS characters
    .slice(0, 1000); // Prevent DoS via large inputs
}

/**
 * Sanitize HTML content using DOMPurify with strict eCommerce allow-lists
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Keep a conservative allow-list of tags and attributes suitable for product descriptions.
  const purifier = DOMPurify as unknown as { sanitize: (s: string, opts?: unknown) => string };
  const clean = purifier.sanitize(html, {
    USE_PROFILES: { html: true },
    SAFE_FOR_TEMPLATES: true,
    ALLOWED_TAGS: [
      'a', 'b', 'strong', 'i', 'em', 'p', 'ul', 'ol', 'li', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'img', 'blockquote', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'rel', 'target', 'class', 'height', 'width'],
  });

  return clean;
}

/**
 * Minimal client-side sanitizer that removes HTML tags and trims whitespace.
 * Use server-side validation and sanitization as authoritative.
 */
export function sanitize(input: string): string {
  if (!input) return input;
  // Remove script/style and HTML tags
  return input
    .replace(/<\/?(script|style)[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    
    if (!allowedProtocols.includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

// Keep `sanitizeHtml` as the default export and `sanitize` as a named export.
export default sanitizeHtml;
