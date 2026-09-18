import { describe, it, expect } from 'vitest';
import { forgeComplianceChecklist } from '../../server/modules/intelligence/checklistForge';
import { AuditedClause, ClauseType, RiskLevel } from '../../server/types/legal';

describe('Compliance Checklist Forge Unit Tests', () => {
  const mockClauses: AuditedClause[] = [
    {
      id: 'c-pay',
      clauseIndex: 2,
      clauseType: ClauseType.PaymentTerms,
      title: 'Payment Terms',
      text: 'Invoices payable in 30 days.',
      wordCount: 5,
      contentHash: 'hpay',
      riskLevel: RiskLevel.Standard,
      riskScore: 20,
      similarityToBenchmark: 0.85,
      plainEnglishSummary: 'Net 30 terms.',
      deviationAnalysis: 'Fair.',
    },
    {
      id: 'c-term',
      clauseIndex: 4,
      clauseType: ClauseType.Termination,
      title: 'Termination',
      text: 'Either party may terminate upon 30 days written notice.',
      wordCount: 8,
      contentHash: 'hterm',
      riskLevel: RiskLevel.Standard,
      riskScore: 20,
      similarityToBenchmark: 0.88,
      plainEnglishSummary: 'Bilateral termination.',
      deviationAnalysis: 'Fair.',
    },
  ];

  it('should generate financial and termination milestone items', () => {
    const items = forgeComplianceChecklist(mockClauses);
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items.some((i) => i.category === 'Financial Milestone')).toBe(true);
    expect(items.some((i) => i.category === 'Exit Strategy')).toBe(true);
  });

  it('should initialize all checklist items with completed = false', () => {
    const items = forgeComplianceChecklist(mockClauses);
    expect(items.every((i) => i.completed === false)).toBe(true);
  });

  it('should include actionable risk warning descriptions if ignored', () => {
    const items = forgeComplianceChecklist(mockClauses);
    expect(items[0].riskIfIgnored).toBeTruthy();
  });
});
