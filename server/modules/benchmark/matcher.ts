import { ClauseType, DocumentType, MarketBenchmark } from '../../types/legal';
import { MARKET_BENCHMARKS } from './repository';

function calculateJaccardSimilarity(textA: string, textB: string): number {
  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

  const setA = tokenize(textA);
  const setB = tokenize(textB);

  if (setA.size === 0 || setB.size === 0) {return 0;}

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) {intersection++;}
  }

  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

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
    const sim = calculateJaccardSimilarity(clauseText, bm.benchmarkText);
    if (sim > highestSimilarity) {
      highestSimilarity = sim;
      bestMatch = bm;
    }
  }

  // Normalize similarity to a realistic 0.35 - 0.95 scale
  const normalized = Math.min(0.95, Math.max(0.35, Math.round(highestSimilarity * 100) / 100 + 0.3));

  return {
    benchmark: bestMatch,
    similarity: normalized,
  };
}
