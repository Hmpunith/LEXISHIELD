import { GoogleGenerativeAI } from '@google/generative-ai';
import { getConfig } from '../config/env';

const DISCLAIMER = 'IMPORTANT LEGAL NOTICE: You are an educational legal information assistant. Your output is for informational and educational purposes only and does NOT constitute legal advice, representation, or attorney-client privilege. Emphasize that users should consult a qualified legal professional.';

const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];

const activeModelIndex = 0;
let genAIClient: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  const config = getConfig();
  if (!config.GEMINI_API_KEY) {return null;}
  if (!genAIClient) {
    genAIClient = new GoogleGenerativeAI(config.GEMINI_API_KEY);
  }
  return genAIClient;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Standard single-prompt JSON query with automatic model fallback & 429 backoff
 */
export async function askGeminiJson<T>(systemPrompt: string, userPrompt: string, fallbackGenerator: () => T): Promise<T> {
  const client = getClient();
  if (!client || process.env.NODE_ENV === 'test') {
    return fallbackGenerator();
  }

  const fullSystem = `${systemPrompt}\n\n${DISCLAIMER}\n\nReturn strictly valid JSON only.`;

  for (let m = 0; m < CANDIDATE_MODELS.length; m++) {
    const modelName = CANDIDATE_MODELS[(activeModelIndex + m) % CANDIDATE_MODELS.length];
    
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: fullSystem,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const result = await model.generateContent(userPrompt);
        const rawText = result.response.text();
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned) as T;
      } catch (err: any) {
        const msg = err?.message || '';
        const isTransient = msg.includes('429') || msg.includes('503') || msg.includes('quota') || msg.includes('ResourceExhausted');

        if (isTransient && attempt === 0) {
          console.warn(`[Gemini] ${modelName} transient rate limit, retrying in 1.5s...`);
          await sleep(1500);
          continue;
        }

        console.warn(`[Gemini] Model ${modelName} notice: ${msg.slice(0, 100)}. Switching candidate...`);
        break;
      }
    }
  }

  return fallbackGenerator();
}

export interface BatchClauseInput {
  index: number;
  clauseType: string;
  clauseText: string;
  benchmarkText: string;
}

export interface BatchClauseOutput {
  index: number;
  plainEnglishSummary: string;
  deviationAnalysis: string;
  riskLevel: 'Standard' | 'Caution' | 'Unfavorable' | 'Critical';
  riskScore: number;
  counterProposal?: {
    proposedClause: string;
    rationale: string;
    negotiationStrategy: string;
  };
}

/**
 * High-efficiency batch evaluator:
 * Evaluates all candidate clauses of a contract in a SINGLE Gemini API invocation.
 * Eliminates 10-15 redundant round trips, prevents RPM rate limit exhaustion,
 * and collapses document audit latency by up to 90%.
 */
export async function batchEvaluateClauses(
  clauses: BatchClauseInput[],
  fallbackGenerator: (c: BatchClauseInput) => BatchClauseOutput
): Promise<Map<number, BatchClauseOutput>> {
  const resultsMap = new Map<number, BatchClauseOutput>();
  if (clauses.length === 0) {return resultsMap;}

  const client = getClient();
  if (!client || process.env.NODE_ENV === 'test') {
    for (const c of clauses) {
      resultsMap.set(c.index, fallbackGenerator(c));
    }
    return resultsMap;
  }

  const systemPrompt = `You are a senior contract auditing attorney. ${DISCLAIMER}
You analyze multiple contract clauses against fair market benchmarks in a single batch.
For each clause, evaluate directional legal variance, unilateral obligations, and risk severity.
Respond with a JSON array of objects:
[
  {
    "index": number (matching the input clause index),
    "riskLevel": "Standard" | "Caution" | "Unfavorable" | "Critical",
    "riskScore": number (0 to 100),
    "plainEnglishSummary": "2-sentence plain-language summary of signer impact",
    "deviationAnalysis": "How the clause deviates from the fair-market benchmark",
    "counterProposal": {
      "proposedClause": "Balanced replacement clause language",
      "rationale": "Why this revision balances the contract",
      "negotiationStrategy": "Practical negotiation tip"
    }
  }
]`;

  const userPrompt = clauses.map((c) => `---
CLAUSE INDEX: ${c.index}
CLAUSE TYPE: ${c.clauseType}
CONTRACT TEXT:
"${c.clauseText}"

MARKET BENCHMARK:
"${c.benchmarkText}"`).join('\n\n');

  for (let m = 0; m < CANDIDATE_MODELS.length; m++) {
    const modelName = CANDIDATE_MODELS[(activeModelIndex + m) % CANDIDATE_MODELS.length];

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            maxOutputTokens: 4096,
          },
        });

        const response = await model.generateContent(userPrompt);
        const rawText = response.response.text();
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned) as BatchClauseOutput[];

        for (const item of parsed) {
          if (typeof item.index === 'number') {
            resultsMap.set(item.index, item);
          }
        }

        // Fill any gaps with heuristic fallback
        for (const c of clauses) {
          if (!resultsMap.has(c.index)) {
            resultsMap.set(c.index, fallbackGenerator(c));
          }
        }

        return resultsMap;
      } catch (err: any) {
        const msg = err?.message || '';
        const isTransient = msg.includes('429') || msg.includes('503') || msg.includes('quota') || msg.includes('ResourceExhausted');

        if (isTransient && attempt === 0) {
          console.warn(`[Gemini-Batch] Rate limit on ${modelName}, retrying in 2s...`);
          await sleep(2000);
          continue;
        }

        console.warn(`[Gemini-Batch] ${modelName} failed (${msg.slice(0, 100)}). Trying next candidate...`);
        break;
      }
    }
  }

  // Graceful fallback if all candidates failed
  for (const c of clauses) {
    resultsMap.set(c.index, fallbackGenerator(c));
  }
  return resultsMap;
}
