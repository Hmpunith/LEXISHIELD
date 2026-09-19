import { describe, it, expect } from 'vitest';
import { generateFallbackEmbedding, embedBatch, embedText, getEmbeddingDimensions } from '../../server/services/embeddingService';

describe('Embedding Service & Resilience Engine', () => {
  it('should return fixed 768-dimensional normalized fallback vectors', () => {
    const vec = generateFallbackEmbedding('This is a confidential contract clause.');
    expect(vec.length).toBe(768);
    expect(getEmbeddingDimensions()).toBe(768);

    // Verify vector is normalized: sum(v_i^2) ~ 1
    let sumSq = 0;
    for (const v of vec) {
      sumSq += v * v;
    }
    expect(Math.sqrt(sumSq)).toBeCloseTo(1.0, 1);
  });

  it('should generate deterministic vectors for identical inputs', () => {
    const text = 'Contractor shall defend and indemnify the Client.';
    const vec1 = generateFallbackEmbedding(text);
    const vec2 = generateFallbackEmbedding(text);
    expect(vec1).toEqual(vec2);
  });

  it('should batch-embed multiple text clauses efficiently', async () => {
    const texts = [
      'Clause 1: Payment within 30 days.',
      'Clause 2: Mutual non-disclosure for 2 years.',
      'Clause 3: Capped liability to 12 months fees.',
    ];
    const embeddings = await embedBatch(texts);
    expect(embeddings.length).toBe(3);
    for (const emb of embeddings) {
      expect(emb.length).toBe(768);
    }
  });

  it('should handle single embedText query with caching', async () => {
    const text = 'Limitation of Liability: No indirect or punitive damages.';
    const emb1 = await embedText(text);
    expect(emb1.length).toBe(768);

    // Second call should return cached embedding immediately
    const emb2 = await embedText(text);
    expect(emb2).toEqual(emb1);
  });
});
