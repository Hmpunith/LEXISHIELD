import { describe, it, expect } from 'vitest';
import { splitDocumentIntoClauses, inferClauseType } from '../../server/modules/ingestion/clauseSplitter';
import { ClauseType } from '../../server/types/legal';

describe('Clause Splitter Unit Tests', () => {
  it('should infer Indemnification clause type correctly', () => {
    const heading = 'Indemnification & Hold Harmless';
    const body = 'Contractor shall indemnify and hold harmless the client from any claims.';
    expect(inferClauseType(heading, body)).toBe(ClauseType.Indemnification);
  });

  it('should infer Payment Terms clause type correctly', () => {
    const heading = 'Compensation';
    const body = 'Client shall issue payment within thirty days of approved invoice.';
    expect(inferClauseType(heading, body)).toBe(ClauseType.PaymentTerms);
  });

  it('should infer Termination clause type correctly', () => {
    const heading = 'Agreement Expiration and Cancellation';
    const body = 'Either party may terminate this agreement with 30 days notice.';
    expect(inferClauseType(heading, body)).toBe(ClauseType.Termination);
  });

  it('should infer Non-Compete clause type correctly', () => {
    const heading = 'Restrictive Covenants';
    const body = 'Contractor agrees to a non-compete period of 12 months.';
    expect(inferClauseType(heading, body)).toBe(ClauseType.NonCompete);
  });

  it('should split numbered sections into distinct clauses', () => {
    const contract = `1. Scope of Work\nContractor will develop the application.\n\n2. Payment Terms\nPayment is due in 30 days.\n\n3. Termination\nEither party may cancel with notice.`;
    const clauses = splitDocumentIntoClauses(contract);
    expect(clauses.length).toBeGreaterThanOrEqual(3);
    expect(clauses[0].clauseIndex).toBe(1);
    expect(clauses[1].clauseIndex).toBe(2);
    expect(clauses[2].clauseIndex).toBe(3);
  });

  it('should generate deterministic SHA-256 content hashes for each clause', () => {
    const contract = `1. Confidentiality\nAll trade secrets must be maintained in strict confidence.`;
    const clauses = splitDocumentIntoClauses(contract);
    expect(clauses[0].contentHash).toBeDefined();
    expect(clauses[0].contentHash).toHaveLength(64);
  });

  it('should handle contracts with Section headers', () => {
    const contract = `Section 1. Warranties\nServices are provided as-is.\n\nSection 2. Governing Law\nGoverned by the laws of California.`;
    const clauses = splitDocumentIntoClauses(contract);
    expect(clauses.length).toBe(2);
    expect(clauses[0].clauseType).toBe(ClauseType.Warranties);
    expect(clauses[1].clauseType).toBe(ClauseType.GoverningLaw);
  });

  it('should return empty array for empty input', () => {
    expect(splitDocumentIntoClauses('')).toEqual([]);
    expect(splitDocumentIntoClauses('   ')).toEqual([]);
  });
});
