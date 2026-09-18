import { describe, it, expect } from 'vitest';
import { purifyInputMiddleware } from '../../server/middleware/purify';

describe('Input Sanitization & XSS Defense Tests', () => {
  it('should strip script tags from request body', () => {
    const req: any = {
      body: {
        text: 'Hello <script>alert("xss")</script> World',
        title: 'Safe Title',
      },
    };
    purifyInputMiddleware(req, {} as any, () => {});
    expect(req.body.text).toBe('Hello  World');
    expect(req.body.title).toBe('Safe Title');
  });

  it('should strip javascript: pseudo-protocol strings', () => {
    const req: any = {
      body: {
        link: 'javascript:stealCookies()',
      },
    };
    purifyInputMiddleware(req, {} as any, () => {});
    expect(req.body.link).not.toContain('javascript:');
  });

  it('should strip dangerous null bytes', () => {
    const req: any = {
      body: {
        text: 'Dangerous\0NullByte',
      },
    };
    purifyInputMiddleware(req, {} as any, () => {});
    expect(req.body.text).toBe('DangerousNullByte');
  });
});
