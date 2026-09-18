import { describe, it, expect } from 'vitest';
import { compareTwoAgreements } from '../../server/modules/intelligence/comparisonDiff';

describe('Two-Agreement Comparison Unit Tests', () => {
  const docA = `1. Indemnification\nEach party shall mutually indemnify the other.\n\n2. Payment Terms\nPayment due in 30 days.`;
  const docB = `1. Indemnification\nContractor shall unilaterally indemnify client.\n\n2. Payment Terms\nPayment due in 90 days.`;

  it('should perform side-by-side clause diff and identify winner for mutual terms', () => {
    const comparison = compareTwoAgreements(docA, 'Bilateral Agreement', docB, 'One-Sided Agreement');
    expect(comparison.clauseComparisons.length).toBeGreaterThanOrEqual(2);

    const indemComp = comparison.clauseComparisons.find((c) => c.clauseType === 'Indemnification');
    expect(indemComp).toBeDefined();
    expect(indemComp?.winner).toBe('Document A');
  });

  it('should summarize overall risk divergence', () => {
    const comparison = compareTwoAgreements(docA, 'DocA', docB, 'DocB');
    expect(comparison.riskDivergence).toBeDefined();
    expect(comparison.summaryOfDifferences).toBeTruthy();
  });
});
