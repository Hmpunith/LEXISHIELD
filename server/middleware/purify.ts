import { Request, Response, NextFunction } from 'express';

/**
 * Recursively sanitize strings to strip script tags, dangerous HTML, and null bytes.
 */
function sanitizeValue(val: unknown): unknown {
  if (typeof val === 'string') {
    return val
      .replace(/\0/g, '') // Remove null bytes
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script>
      .replace(/javascript:[^"']*/gi, '') // Remove javascript: pseudo-protocol
      .trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val !== null && typeof val === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(val as Record<string, unknown>)) {
      cleaned[key] = sanitizeValue(v);
    }
    return cleaned;
  }
  return val;
}

export function purifyInputMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query) as any;
  }
  next();
}
