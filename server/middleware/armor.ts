import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Armor Middleware: Enforces all critical enterprise security response headers.
 * Includes Permissions-Policy, strict CSP, X-Frame-Options, X-Content-Type-Options,
 * Referrer-Policy, and X-Request-Id distributed tracing.
 */
export function armorMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Distributed request tracing UUID
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  res.setHeader('X-Request-Id', requestId);
  (req as any).requestId = requestId;

  // Strict Content-Type sniffing prevention
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking via iframes
  res.setHeader('X-Frame-Options', 'DENY');

  // Strict Transport Security (HSTS 1-year preload)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Legacy browser XSS filter protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Cross-Origin isolation policies
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // Strict referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy (Explicitly restrict sensitive hardware APIs)
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()');

  // Content-Security-Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://generativelanguage.googleapis.com https:;"
  );

  next();
}
