import { describe, it, expect } from 'vitest';
import { evaluateHeuristicRisk } from '../../server/modules/audit/riskAuditor';
import { ParsedClause, ClauseType, RiskLevel } from '../../server/types/legal';

describe('Boundary and Edge Case Tests', () => {
  it('should classify unilateral uncapped indemnity as Critical risk', () => {
    const clause: ParsedClause = {
      id: 'c-1',
      clauseIndex: 1,
      clauseType: ClauseType.Indemnification,
      title: 'Indemnification',
      text: 'Contractor shall defend, indemnify and hold harmless Client from any and all claims. Contractor liability shall be unlimited.',
      wordCount: 20,
      contentHash: 'hash1',
    };

    const audit = evaluateHeuristicRisk(clause);
    expect(audit.riskLevel).toBe(RiskLevel.Critical);
    expect(audit.riskScore).toBeGreaterThanOrEqual(90);
  });

  it('should classify perpetual worldwide non-compete as Critical risk', () => {
    const clause: ParsedClause = {
      id: 'c-2',
      clauseIndex: 2,
      clauseType: ClauseType.NonCompete,
      title: 'Non-Compete',
      text: 'Contractor shall not engage in any competitive business worldwide for a period of two (2) years.',
      wordCount: 18,
      contentHash: 'hash2',
    };

    const audit = evaluateHeuristicRisk(clause);
    expect(audit.riskLevel).toBe(RiskLevel.Critical);
    expect(audit.riskScore).toBeGreaterThanOrEqual(90);
  });

  it('should classify mutual bilateral provisions as Standard fair risk', () => {
    const clause: ParsedClause = {
      id: 'c-3',
      clauseIndex: 3,
      clauseType: ClauseType.Confidentiality,
      title: 'Confidentiality',
      text: 'Each party agrees to hold the other party confidential information in reasonable standard of care.',
      wordCount: 16,
      contentHash: 'hash3',
    };

    const audit = evaluateHeuristicRisk(clause);
    expect(audit.riskLevel).toBe(RiskLevel.Standard);
    expect(audit.riskScore).toBeLessThan(40);
  });

  it('should gracefully handle empty or symbol-only inputs', () => {
    const clause: ParsedClause = {
      id: 'c-empty',
      clauseIndex: 99,
      clauseType: ClauseType.Miscellaneous,
      title: 'Clause 99',
      text: '### --- @@@ %%%',
      wordCount: 4,
      contentHash: 'hashempty',
    };

    const audit = evaluateHeuristicRisk(clause);
    expect(audit.riskLevel).toBeDefined();
    expect(audit.riskScore).toBeDefined();
  });
});
