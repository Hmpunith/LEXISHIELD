import { describe, it, expect } from 'vitest';
import { armorMiddleware } from '../../server/middleware/armor';

describe('Enterprise Security Headers (Armor) Tests', () => {
  const createMockReqRes = () => {
    const headers: Record<string, string> = {};
    const req: any = { headers: {} };
    const res: any = {
      setHeader: (name: string, value: string) => {
        headers[name.toLowerCase()] = value;
      },
    };
    return { req, res, headers };
  };

  it('should set Permissions-Policy restricting camera, microphone, and geolocation', () => {
    const { req, res, headers } = createMockReqRes();
    armorMiddleware(req, res, () => {});
    expect(headers['permissions-policy']).toBeDefined();
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['permissions-policy']).toContain('microphone=()');
    expect(headers['permissions-policy']).toContain('geolocation=()');
  });

  it('should set X-Content-Type-Options to nosniff', () => {
    const { req, res, headers } = createMockReqRes();
    armorMiddleware(req, res, () => {});
    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  it('should set X-Frame-Options to DENY', () => {
    const { req, res, headers } = createMockReqRes();
    armorMiddleware(req, res, () => {});
    expect(headers['x-frame-options']).toBe('DENY');
  });

  it('should set Referrer-Policy to strict-origin-when-cross-origin', () => {
    const { req, res, headers } = createMockReqRes();
    armorMiddleware(req, res, () => {});
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  it('should generate a distributed tracing X-Request-Id UUID', () => {
    const { req, res, headers } = createMockReqRes();
    armorMiddleware(req, res, () => {});
    expect(headers['x-request-id']).toBeDefined();
    expect(headers['x-request-id'].length).toBeGreaterThanOrEqual(16);
  });

  it('should set strict Content-Security-Policy', () => {
    const { req, res, headers } = createMockReqRes();
    armorMiddleware(req, res, () => {});
    expect(headers['content-security-policy']).toBeDefined();
    expect(headers['content-security-policy']).toContain("default-src 'self'");
  });
});
