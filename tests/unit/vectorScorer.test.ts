import { describe, it, expect } from 'vitest';
import { VectorScorer } from '../../server/modules/scoring/vectorScorer';

describe('VectorScorer Mathematical Cosine Engine', () => {
  it('should return 1.0 for identical legal texts', () => {
    const text = 'Contractor agrees to defend, indemnify, and hold harmless the client.';
    const sim = VectorScorer.calculateCosineSimilarity(text, text);
    expect(sim).toBe(1.0);
  });

  it('should return 0.0 for completely unrelated texts with disjoint vocabularies', () => {
    const textA = 'apple banana orange pineapple mango';
    const textB = 'quantum physics astrophysics relativity spacetime';
    const sim = VectorScorer.calculateCosineSimilarity(textA, textB);
    expect(sim).toBe(0.0);
  });

  it('should compute partial cosine similarity for overlapping legal provisions', () => {
    const textA = 'The contractor shall defend and indemnify the client against claims.';
    const textB = 'Both parties agree to defend and hold harmless against third-party claims.';
    const sim = VectorScorer.calculateCosineSimilarity(textA, textB);
    expect(sim).toBeGreaterThan(0.2);
    expect(sim).toBeLessThan(1.0);
  });

  it('should rank benchmarks by descending cosine similarity', () => {
    const candidate = 'Contractor shall indemnify Client against all claims without limitation.';
    const benchmarks = [
      { id: '1', standardClause: 'This agreement shall be governed by California law.' },
      { id: '2', standardClause: 'Each party shall indemnify the other party up to fees paid.' },
      { id: '3', standardClause: 'Payment shall be made within thirty days of invoice.' },
    ];

    const ranked = VectorScorer.rankBenchmarks(candidate, benchmarks);
    expect(ranked[0].item.id).toBe('2');
    expect(ranked[0].similarity).toBeGreaterThan(ranked[1].similarity);
  });
});
