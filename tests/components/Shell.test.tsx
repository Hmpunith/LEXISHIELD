import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DisclaimerBanner } from '../../src/components/shell/DisclaimerBanner';
import { SkipLink } from '../../src/components/shell/SkipLink';

describe('Shell Components Accessibility Tests', () => {
  it('should render DisclaimerBanner with role="region" and accessible label', () => {
    render(<DisclaimerBanner />);
    expect(screen.getByRole('region', { name: /Legal Disclaimer/i })).toBeInTheDocument();
    expect(screen.getByText(/Educational Legal Assistance Tool/i)).toBeInTheDocument();
  });

  it('should render SkipLink pointing to #main-content', () => {
    render(<SkipLink />);
    const link = screen.getByText('Skip to main content');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
    expect(link).toHaveClass('skip-link');
  });
});
