import { describe, it, expect } from 'vitest';
import { auditClausesInBatch, evaluateHeuristicRisk } from '../../server/modules/audit/riskAuditor';
import { ClauseType, DocumentType, ParsedClause, RiskLevel } from '../../server/types/legal';

describe('High-Efficiency Batch Auditor Tests', () => {
  const sampleClauses: ParsedClause[] = [
    {
      id: 'c1',
      clauseIndex: 1,
      clauseType: ClauseType.PaymentTerms,
      title: 'Payment Terms',
      text: 'Client shall pay undisputed invoices within thirty (30) days of receipt.',
      wordCount: 10,
      contentHash: 'hash-c1',
    },
    {
      id: 'c2',
      clauseIndex: 2,
      clauseType: ClauseType.Indemnification,
      title: 'Indemnification',
      text: 'Contractor shall defend, indemnify, and hold harmless Client against any and all claims, liabilities, and unlimited damages without mutual reciprocity.',
      wordCount: 20,
      contentHash: 'hash-c2',
    },
    {
      id: 'c3',
      clauseIndex: 3,
      clauseType: ClauseType.NonCompete,
      title: 'Restrictive Covenants',
      text: 'Contractor shall not engage in any competitive software consulting business anywhere in North America for twenty-four (24) months post-termination.',
      wordCount: 19,
      contentHash: 'hash-c3',
    },
  ];

  it('should correctly flag heuristic risks instantly', () => {
    const risk1 = evaluateHeuristicRisk(sampleClauses[0]);
    expect(risk1.riskLevel).toBe(RiskLevel.Standard);

    const risk2 = evaluateHeuristicRisk(sampleClauses[1]);
    expect(risk2.riskLevel).toBe(RiskLevel.Critical);

    const risk3 = evaluateHeuristicRisk(sampleClauses[2]);
    expect(risk3.riskLevel).toBe(RiskLevel.Critical);
  });

  it('should batch audit multiple clauses and return enriched audited clauses with benchmarks', async () => {
    const audited = await auditClausesInBatch(sampleClauses, DocumentType.FreelanceContract);
    expect(audited.length).toBe(3);

    // Verify benchmark matching and cosine similarity
    for (const c of audited) {
      expect(c.similarityToBenchmark).toBeGreaterThanOrEqual(0.35);
      expect(c.similarityToBenchmark).toBeLessThanOrEqual(0.95);
      expect(c.matchedBenchmarkId).toBeTruthy();
      expect(c.plainEnglishSummary).toBeTruthy();
    }

    // Verify critical risks have counter-proposals attached
    const criticals = audited.filter((c) => c.riskLevel === RiskLevel.Critical);
    expect(criticals.length).toBe(2);
    for (const crit of criticals) {
      expect(crit.counterProposal).toBeDefined();
      expect(crit.counterProposal?.proposedClause).toBeTruthy();
    }
  });

  it('should handle empty clause array gracefully', async () => {
    const empty = await auditClausesInBatch([], DocumentType.FreelanceContract);
    expect(empty).toEqual([]);
  });
});
