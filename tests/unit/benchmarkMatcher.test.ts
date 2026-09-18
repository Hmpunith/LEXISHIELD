import { describe, it, expect } from 'vitest';
import { findNearestBenchmark } from '../../server/modules/benchmark/matcher';
import { MARKET_BENCHMARKS } from '../../server/modules/benchmark/repository';
import { ClauseType, DocumentType } from '../../server/types/legal';

describe('Benchmark Matcher Tests', () => {
  it('should maintain a comprehensive repository of market benchmarks', () => {
    expect(MARKET_BENCHMARKS.length).toBeGreaterThanOrEqual(12);
  });

  it('should pair an indemnification clause with an indemnity benchmark', () => {
    const userClause = 'The contractor agrees to defend, indemnify, and hold harmless the client.';
    const match = findNearestBenchmark(userClause, ClauseType.Indemnification, DocumentType.FreelanceContract);
    expect(match.benchmark.clauseType).toBe(ClauseType.Indemnification);
    expect(match.similarity).toBeGreaterThan(0.3);
    expect(match.benchmark.fairStandardExplanation).toBeDefined();
  });

  it('should pair payment clause with payment benchmark', () => {
    const userClause = 'Payment is due within 60 days following the receipt of an invoice.';
    const match = findNearestBenchmark(userClause, ClauseType.PaymentTerms, DocumentType.FreelanceContract);
    expect(match.benchmark.clauseType).toBe(ClauseType.PaymentTerms);
    expect(match.similarity).toBeGreaterThan(0.3);
  });

  it('should provide reputable source attribution for benchmarks', () => {
    const sample = MARKET_BENCHMARKS[0];
    expect(sample.sourceAttribution).toBeTruthy();
    expect(sample.sourceAttribution.length).toBeGreaterThan(5);
  });

  it('should bound similarity index realistically between 0.35 and 0.95', () => {
    const match = findNearestBenchmark('Random text with zero legal meaning', ClauseType.Miscellaneous);
    expect(match.similarity).toBeGreaterThanOrEqual(0.35);
    expect(match.similarity).toBeLessThanOrEqual(0.95);
  });
});
