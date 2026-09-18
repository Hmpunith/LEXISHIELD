import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('WCAG AA Accessibility Static Verification', () => {
  const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  const indexCss = fs.readFileSync(path.join(process.cwd(), 'src/index.css'), 'utf8');

  it('should have lang="en" on the html tag', () => {
    expect(indexHtml).toMatch(/<html[^>]*lang=["']en["']/i);
  });

  it('should declare an accessible meta viewport', () => {
    expect(indexHtml).toContain('width=device-width, initial-scale=1.0');
  });

  it('should declare an SEO and a11y descriptive meta description', () => {
    expect(indexHtml).toMatch(/<meta[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i);
  });

  it('should include prefers-reduced-motion media query in CSS', () => {
    expect(indexCss).toContain('prefers-reduced-motion: reduce');
  });

  it('should include prefers-contrast: high media query in CSS', () => {
    expect(indexCss).toContain('prefers-contrast: high');
  });

  it('should include print media query in CSS', () => {
    expect(indexCss).toContain('@media print');
  });

  it('should define explicit :focus-visible styles in CSS', () => {
    expect(indexCss).toContain(':focus-visible');
  });

  it('should define an accessible skip-link class', () => {
    expect(indexCss).toContain('.skip-link');
  });
});
