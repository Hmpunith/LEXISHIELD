import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { RiskBadge } from '../../src/components/shared/RiskBadge';

describe('RiskBadge Component Rendering Tests', () => {
  it('should render Standard Fair Terms badge with correct accessible status', () => {
    render(<RiskBadge level="Standard" />);
    expect(screen.getByText('Standard Fair Terms')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Risk Tier: Standard Fair Terms');
  });

  it('should render Caution badge with correct icon and text', () => {
    render(<RiskBadge level="Caution" />);
    expect(screen.getByText('Caution / Review')).toBeInTheDocument();
  });

  it('should render Unfavorable badge', () => {
    render(<RiskBadge level="Unfavorable" />);
    expect(screen.getByText('Unfavorable Deviation')).toBeInTheDocument();
  });

  it('should render Critical Legal Trap badge', () => {
    render(<RiskBadge level="Critical" />);
    expect(screen.getByText('Critical Legal Trap')).toBeInTheDocument();
  });
});
