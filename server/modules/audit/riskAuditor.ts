import { RiskLevel, AuditedClause, ParsedClause, DocumentType } from '../../types/legal';
import { findNearestBenchmark } from '../benchmark/matcher';
import { askGeminiJson, batchEvaluateClauses, BatchClauseInput, BatchClauseOutput } from '../../services/geminiService';

export function evaluateHeuristicRisk(clause: ParsedClause): { riskLevel: RiskLevel; riskScore: number; reason: string } {
  const text = clause.text.toLowerCase();

  // Critical indicators: Unilateral uncapped indemnity
  const isTrulyMutual = text.includes('mutual') && !text.includes('without mutual') && !text.includes('non-mutual');
  if (
    text.includes('indemnif') &&
    !isTrulyMutual &&
    (text.includes('unlimited') || text.includes('any and all') || !text.includes('gross negligence'))
  ) {
    return {
      riskLevel: RiskLevel.Critical,
      riskScore: 92,
      reason: 'Unilateral, uncapped indemnification exposing you to third-party liabilities without reciprocal protection.',
    };
  }

  // Critical indicators: Restrictive non-compete
  if (
    (text.includes('non-compete') || /not\s+engage\s+in/i.test(text) || text.includes('competitive') || text.includes('non-solicit')) &&
    (text.includes('worldwide') || text.includes('perpetual') || text.includes('two (2) years') || text.includes('3 years') || text.includes('24 months') || text.includes('twenty-four') || text.includes('north america'))
  ) {
    return {
      riskLevel: RiskLevel.Critical,
      riskScore: 95,
      reason: 'Overly restrictive non-compete covenant with excessive duration or global geographic scope.',
    };
  }

  // Unfavorable indicators
  if (
    text.includes('waives all claims') ||
    text.includes('sole and absolute discretion') ||
    text.includes('all right, title, and interest... in any idea') ||
    text.includes('60 days') ||
    text.includes('90 days after invoice')
  ) {
    return {
      riskLevel: RiskLevel.Unfavorable,
      riskScore: 78,
      reason: 'Disproportionately one-sided rights favoring the drafting party (delayed payments, broad waiver, or unrestricted discretion).',
    };
  }

  // Caution indicators
  if (
    text.includes('liquidated damages') ||
    text.includes('automatic renewal') ||
    text.includes('binding arbitration') ||
    text.includes('without cause') ||
    text.includes('attorney fees to the prevailing party')
  ) {
    return {
      riskLevel: RiskLevel.Caution,
      riskScore: 55,
      reason: 'Standard clause with procedural nuances or cost implications (automatic renewals, unilateral dispute venues).',
    };
  }

  return {
    riskLevel: RiskLevel.Standard,
    riskScore: 18,
    reason: 'Aligns closely with market-standard legal norms and bilateral protections.',
  };
}

/**
 * Single clause auditor (retained for backward compatibility and focused unit tests)
 */
export async function auditClause(clause: ParsedClause, docType: DocumentType): Promise<AuditedClause> {
  const { benchmark, similarity } = findNearestBenchmark(clause.text, clause.clauseType, docType);
  const heuristic = evaluateHeuristicRisk(clause);

  const fallbackData = {
    plainEnglishSummary: heuristic.reason,
    deviationAnalysis: `Compared to ${benchmark.sourceAttribution}, this clause has a similarity index of ${(similarity * 100).toFixed(0)}%. ${heuristic.reason}`,
    counterProposal: heuristic.riskLevel !== RiskLevel.Standard ? {
      proposedClause: benchmark.benchmarkText,
      rationale: `Replace one-sided language with the established fair-market standard from ${benchmark.sourceAttribution}.`,
      negotiationStrategy: 'Request this balanced phrasing during the initial contract mark-up phase before signing.',
    } : undefined,
  };

  const aiResult = await askGeminiJson(
    'You are a senior contract auditing attorney. Analyze legal risk accurately.',
    `Analyze this contract clause against the fair market standard benchmark:
    
    CLAUSE TYPE: ${clause.clauseType}
    UPLOADED CLAUSE TEXT:
    "${clause.text}"
    
    MARKET BENCHMARK STANDARD:
    "${benchmark.benchmarkText}"
    
    Provide a JSON object with:
    {
      "plainEnglishSummary": "2-sentence plain-English breakdown of what this clause means for the signer",
      "deviationAnalysis": "How it deviates from fair market standards",
      "riskLevel": "Standard" | "Caution" | "Unfavorable" | "Critical",
      "riskScore": number from 0 to 100,
      "counterProposal": {
        "proposedClause": "Fair revised clause language",
        "rationale": "Legal reasoning",
        "negotiationStrategy": "Tactical email tip"
      }
    }`,
    () => fallbackData
  );

  const finalRiskLevel = (aiResult as any).riskLevel || heuristic.riskLevel;
  const finalRiskScore = (aiResult as any).riskScore || heuristic.riskScore;

  return {
    ...clause,
    riskLevel: finalRiskLevel,
    riskScore: finalRiskScore,
    similarityToBenchmark: similarity,
    matchedBenchmarkId: benchmark.id,
    matchedBenchmarkText: benchmark.benchmarkText,
    plainEnglishSummary: (aiResult as any).plainEnglishSummary || fallbackData.plainEnglishSummary,
    deviationAnalysis: (aiResult as any).deviationAnalysis || fallbackData.deviationAnalysis,
    counterProposal: (aiResult as any).counterProposal || fallbackData.counterProposal,
  };
}

/**
 * High-performance batched multi-clause auditor:
 * Stage 1: Fast vector cosine similarity matching against market benchmarks.
 * Stage 2: Batches non-standard or flagged clauses into a SINGLE Gemini LLM call.
 * Standard boilerplate clauses with high benchmark parity skip unnecessary LLM evaluation.
 */
export async function auditClausesInBatch(
  clauses: ParsedClause[],
  docType: DocumentType
): Promise<AuditedClause[]> {
  if (clauses.length === 0) {return [];}

  // Stage 1: Vector matching and heuristic risk triage
  const prepared = clauses.map((clause, idx) => {
    const { benchmark, similarity } = findNearestBenchmark(clause.text, clause.clauseType, docType);
    const heuristic = evaluateHeuristicRisk(clause);
    return {
      index: idx,
      clause,
      benchmark,
      similarity,
      heuristic,
    };
  });

  // Filter clauses requiring deeper AI semantic delta analysis
  // Standard boilerplate clauses with similarity >= 0.85 and standard heuristic skip LLM
  const clausesNeedingAI: BatchClauseInput[] = [];
  for (const item of prepared) {
    const isStandardHighMatch = item.similarity >= 0.85 && item.heuristic.riskLevel === RiskLevel.Standard;
    if (!isStandardHighMatch) {
      clausesNeedingAI.push({
        index: item.index,
        clauseType: item.clause.clauseType,
        clauseText: item.clause.text,
        benchmarkText: item.benchmark.benchmarkText,
      });
    }
  }

  // Fallback generator for batch
  const createFallback = (c: BatchClauseInput): BatchClauseOutput => {
    const prep = prepared[c.index];
    return {
      index: c.index,
      plainEnglishSummary: prep.heuristic.reason,
      deviationAnalysis: `Compared to ${prep.benchmark.sourceAttribution}, this clause aligns with a ${(prep.similarity * 100).toFixed(0)}% benchmark index. ${prep.heuristic.reason}`,
      riskLevel: prep.heuristic.riskLevel,
      riskScore: prep.heuristic.riskScore,
      counterProposal: prep.heuristic.riskLevel !== RiskLevel.Standard ? {
        proposedClause: prep.benchmark.benchmarkText,
        rationale: `Adopt the verified fair-market benchmark standard from ${prep.benchmark.sourceAttribution}.`,
        negotiationStrategy: 'Propose this reciprocal language during initial contract mark-up.',
      } : undefined,
    };
  };

  // Stage 2: Batched Gemini call for all candidate clauses
  const aiResultsMap = clausesNeedingAI.length > 0
    ? await batchEvaluateClauses(clausesNeedingAI, createFallback)
    : new Map<number, BatchClauseOutput>();

  // Assemble final audited clauses
  return prepared.map((item) => {
    const aiOutput = aiResultsMap.get(item.index);
    const riskLevel = (aiOutput?.riskLevel as RiskLevel) || item.heuristic.riskLevel;
    const riskScore = aiOutput?.riskScore ?? item.heuristic.riskScore;
    const summary = aiOutput?.plainEnglishSummary || item.heuristic.reason;
    const deviation = aiOutput?.deviationAnalysis || `Similarity index ${(item.similarity * 100).toFixed(0)}% against ${item.benchmark.sourceAttribution}.`;
    const counter = aiOutput?.counterProposal || (riskLevel !== RiskLevel.Standard ? {
      proposedClause: item.benchmark.benchmarkText,
      rationale: `Replace one-sided language with fair-market standard from ${item.benchmark.sourceAttribution}.`,
      negotiationStrategy: 'Request this balanced phrasing before signing.',
    } : undefined);

    return {
      ...item.clause,
      riskLevel,
      riskScore,
      similarityToBenchmark: item.similarity,
      matchedBenchmarkId: item.benchmark.id,
      matchedBenchmarkText: item.benchmark.benchmarkText,
      plainEnglishSummary: summary,
      deviationAnalysis: deviation,
      counterProposal: counter,
    };
  });
}
