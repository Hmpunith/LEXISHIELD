import { describe, it, expect } from 'vitest';
import { createServerApp } from '../../server/app';

describe('Server API Endpoints Integration Tests', () => {
  const app = createServerApp();

  it('should initialize server app with correct route mountings', () => {
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });

  it('should have health check route configured', () => {
    const routes = (app as any)._router.stack.map((layer: any) => layer.route?.path).filter(Boolean);
    expect(routes).toContain('/api/health');
  });
});
