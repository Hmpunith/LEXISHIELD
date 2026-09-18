import { describe, it, expect } from 'vitest';
import { synthesizeGotchas } from '../../server/modules/intelligence/gotchasSynthesizer';
import { AuditedClause, ClauseType, RiskLevel } from '../../server/types/legal';

describe('Gotchas Synthesizer Unit Tests', () => {
  const mockClauses: AuditedClause[] = [
    {
      id: 'c-1',
      clauseIndex: 1,
      clauseType: ClauseType.Indemnification,
      title: 'Uncapped Indemnity',
      text: 'Contractor shall indemnify Client without limit.',
      wordCount: 7,
      contentHash: 'h1',
      riskLevel: RiskLevel.Critical,
      riskScore: 95,
      similarityToBenchmark: 0.4,
      plainEnglishSummary: 'You are liable for unlimited third-party damages.',
      deviationAnalysis: 'One-sided deviation.',
    },
    {
      id: 'c-2',
      clauseIndex: 2,
      clauseType: ClauseType.PaymentTerms,
      title: 'Delayed Compensation',
      text: 'Client shall pay within 90 days.',
      wordCount: 6,
      contentHash: 'h2',
      riskLevel: RiskLevel.Unfavorable,
      riskScore: 80,
      similarityToBenchmark: 0.5,
      plainEnglishSummary: 'Extreme 90-day delayed payment terms.',
      deviationAnalysis: 'Standard is 30 days.',
    },
  ];

  it('should extract top critical gotchas from risky clauses', () => {
    const gotchas = synthesizeGotchas(mockClauses);
    expect(gotchas.length).toBeGreaterThanOrEqual(1);
    expect(gotchas[0].riskLevel).toBe(RiskLevel.Critical);
    expect(gotchas[0].relatedClauseIndex).toBe(1);
  });

  it('should provide clear action recommendations in gotcha warnings', () => {
    const gotchas = synthesizeGotchas(mockClauses);
    expect(gotchas[0].recommendation).toBeTruthy();
    expect(gotchas[0].recommendation.length).toBeGreaterThan(10);
  });

  it('should generate fallback reassurance if all clauses are standard', () => {
    const safeClauses: AuditedClause[] = [
      {
        id: 'safe-1',
        clauseIndex: 1,
        clauseType: ClauseType.Confidentiality,
        title: 'Mutual Confidentiality',
        text: 'Mutual reasonable standard of care.',
        wordCount: 5,
        contentHash: 'hs',
        riskLevel: RiskLevel.Standard,
        riskScore: 15,
        similarityToBenchmark: 0.9,
        plainEnglishSummary: 'Balanced mutual confidentiality.',
        deviationAnalysis: 'Complies with market standards.',
      },
    ];

    const gotchas = synthesizeGotchas(safeClauses);
    expect(gotchas.length).toBe(1);
    expect(gotchas[0].riskLevel).toBe(RiskLevel.Standard);
  });
});
