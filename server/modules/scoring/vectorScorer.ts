/**
 * Mathematical Vector Cosine Similarity Engine:
 * Generates term-frequency n-gram vector representations and calculates
 * cosine distance between legal clauses and market benchmark standards.
 * Executes in sub-millisecond time with zero external network overhead.
 */
export class VectorScorer {
  /**
   * Tokenizes text into normalized word tokens
   */
  private static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }

  /**
   * Generates n-gram frequency vector
   */
  private static vectorize(tokens: string[]): Map<string, number> {
    const vector = new Map<string, number>();
    for (const token of tokens) {
      vector.set(token, (vector.get(token) || 0) + 1);
    }
    return vector;
  }

  /**
   * Computes cosine similarity between two text passages: (A · B) / (||A|| * ||B||)
   * Returns a score between 0.0 (no similarity) and 1.0 (exact match).
   */
  public static calculateCosineSimilarity(textA: string, textB: string): number {
    const tokensA = this.tokenize(textA);
    const tokensB = this.tokenize(textB);

    if (tokensA.length === 0 || tokensB.length === 0) {
      return 0.0;
    }

    const vecA = this.vectorize(tokensA);
    const vecB = this.vectorize(tokensB);

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const count of vecA.values()) {
      normA += count * count;
    }
    for (const count of vecB.values()) {
      normB += count * count;
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0.0;
    }

    for (const [term, countA] of vecA.entries()) {
      const countB = vecB.get(term);
      if (countB) {
        dotProduct += countA * countB;
      }
    }

    const similarity = dotProduct / (normA * normB);
    return Math.min(1.0, Math.max(0.0, Number(similarity.toFixed(4))));
  }

  /**
   * Batch scores a candidate clause against an array of benchmarks
   */
  public static rankBenchmarks<T extends { standardClause: string }>(
    clauseText: string,
    benchmarks: T[]
  ): Array<{ item: T; similarity: number }> {
    return benchmarks
      .map((b) => ({
        item: b,
        similarity: this.calculateCosineSimilarity(clauseText, b.standardClause),
      }))
      .sort((a, b) => b.similarity - a.similarity);
  }
}
