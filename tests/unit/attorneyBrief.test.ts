import { describe, it, expect } from 'vitest';
import { buildAttorneyConsultationBrief } from '../../server/modules/intelligence/attorneyBrief';
import { AuditedClause, ClauseType, DocumentType, RiskLevel } from '../../server/types/legal';

describe('Attorney Brief Builder Unit Tests', () => {
  const mockClauses: AuditedClause[] = [
    {
      id: 'c-indem',
      clauseIndex: 1,
      clauseType: ClauseType.Indemnification,
      title: 'Indemnity',
      text: 'Unilateral uncapped indemnity.',
      wordCount: 3,
      contentHash: 'hindem',
      riskLevel: RiskLevel.Critical,
      riskScore: 92,
      similarityToBenchmark: 0.4,
      plainEnglishSummary: 'Uncapped liability risk.',
      deviationAnalysis: 'Severe deviation.',
    },
  ];

  it('should generate targeted questions for a licensed attorney', () => {
    const brief = buildAttorneyConsultationBrief(mockClauses, DocumentType.FreelanceContract, 'Freelance_Contract.pdf');
    expect(brief.suggestedQuestionsForAttorney.length).toBeGreaterThanOrEqual(3);
    expect(brief.suggestedQuestionsForAttorney.some((q) => q.includes('liability caps') || q.includes('indemnification'))).toBe(true);
  });

  it('should summarize high-risk concerns identified', () => {
    const brief = buildAttorneyConsultationBrief(mockClauses, DocumentType.FreelanceContract, 'Agreement.txt');
    expect(brief.keyRisksIdentified.length).toBeGreaterThanOrEqual(1);
  });
});
