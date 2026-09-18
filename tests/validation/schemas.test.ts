import { describe, it, expect } from 'vitest';
import { DocumentType, ClauseType, RiskLevel } from '../../server/types/legal';

describe('Data Schema and Enum Integrity Tests', () => {
  it('should define expected legal document types', () => {
    expect(DocumentType.FreelanceContract).toBe('freelance_contract');
    expect(DocumentType.LeaseAgreement).toBe('lease_agreement');
    expect(DocumentType.NonDisclosureAgreement).toBe('nda');
    expect(DocumentType.SaaSAgreement).toBe('saas_agreement');
  });

  it('should define complete clause taxonomy', () => {
    expect(ClauseType.Indemnification).toBe('Indemnification');
    expect(ClauseType.PaymentTerms).toBe('Payment Terms');
    expect(ClauseType.Termination).toBe('Termination');
    expect(ClauseType.IntellectualProperty).toBe('Intellectual Property');
    expect(ClauseType.NonCompete).toBe('Non-Compete & Restrictive Covenants');
    expect(ClauseType.LimitationOfLiability).toBe('Limitation of Liability');
  });

  it('should support four distinct risk tiers', () => {
    expect(RiskLevel.Standard).toBe('Standard');
    expect(RiskLevel.Caution).toBe('Caution');
    expect(RiskLevel.Unfavorable).toBe('Unfavorable');
    expect(RiskLevel.Critical).toBe('Critical');
  });
});
