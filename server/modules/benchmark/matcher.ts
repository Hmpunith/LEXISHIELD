import { ClauseType, DocumentType, MarketBenchmark } from '../../types/legal';
import { MARKET_BENCHMARKS } from './repository';
import { VectorScorer } from '../scoring/vectorScorer';

/**
 * Finds the nearest market standard benchmark using vector cosine similarity.
 * Evaluates semantic distance against curated legal benchmark corpus.
 */
export function findNearestBenchmark(
  clauseText: string,
  clauseType: ClauseType,
  _docType: DocumentType = DocumentType.GeneralAgreement
): { benchmark: MarketBenchmark; similarity: number } {
  const typeMatches = MARKET_BENCHMARKS.filter((b) => b.clauseType === clauseType);
  const pool = typeMatches.length > 0 ? typeMatches : MARKET_BENCHMARKS;

  let bestMatch = pool[0];
  let highestSimilarity = -1;

  for (const bm of pool) {
    const sim = VectorScorer.calculateCosineSimilarity(clauseText, bm.benchmarkText);
    if (sim > highestSimilarity) {
      highestSimilarity = sim;
      bestMatch = bm;
    }
  }

  // Normalize similarity to a standard commercial scale (0.35 - 0.95)
  const normalized = Math.min(0.95, Math.max(0.35, Math.round(highestSimilarity * 100) / 100 + 0.35));

  return {
    benchmark: bestMatch,
    similarity: normalized,
  };
}

/**
 * Market standard similarity threshold for Stage 2 LLM semantic analysis.
 * Clauses with similarity >= 0.55 are analyzed for nuanced legal delta.
 * Clauses below this threshold are flagged as non-standard / bespoke without expensive LLM calls.
 */
export const SIMILARITY_THRESHOLD = 0.55;
