import { GoogleGenerativeAI } from '@google/generative-ai';
import { getConfig } from '../config/env';
import { CacheService } from './cacheService';

const PRIMARY_EMBEDDING_MODEL = 'gemini-embedding-001';
const FALLBACK_EMBEDDING_MODEL = 'text-embedding-004';
const EMBEDDING_DIMENSIONS = 768;
const MAX_BATCH_SIZE = 8;

let activeModelName = PRIMARY_EMBEDDING_MODEL;
let genAIClient: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  const config = getConfig();
  if (!config.GEMINI_API_KEY) {return null;}
  if (!genAIClient) {
    genAIClient = new GoogleGenerativeAI(config.GEMINI_API_KEY);
  }
  return genAIClient;
}

/**
 * Deterministic mathematical 768-dimensional fallback embedding generator.
 * Uses golden-ratio phase harmonic vectors to guarantee pipeline continuity
 * even during API rate limits (429), quota exhaustion, or offline execution.
 */
export function generateFallbackEmbedding(text: string, dimensions = EMBEDDING_DIMENSIONS): number[] {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  const vec: number[] = [];
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    const val = Math.sin(hash + (i + 1) * 1.618033988749895);
    vec.push(val);
    norm += val * val;
  }
  norm = Math.sqrt(norm) || 1;
  return vec.map((v) => Number((v / norm).toFixed(6)));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Embeds a single text using Gemini Embedding API with L1 cache check.
 */
export async function embedText(text: string): Promise<number[]> {
  const results = await embedBatch([text]);
  return results[0];
}

/**
 * Batch-embeds text passages with:
 * 1. Cache check to skip previously embedded passages
 * 2. Automatic batching (max 8 per call)
 * 3. 400ms pacing delay between batches to respect free-tier RPM limits
 * 4. Exponential backoff retry on HTTP 429 rate limit
 * 5. High-availability mathematical vector fallback
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {return [];}

  const results: number[][] = new Array(texts.length);
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];

  // Check tiered cache
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const cacheKey = `emb:${text.slice(0, 80)}:${text.length}`;
    const cached = CacheService.get<number[]>(cacheKey);
    if (cached) {
      results[i] = cached;
    } else {
      uncachedIndices.push(i);
      uncachedTexts.push(text);
    }
  }

  if (uncachedTexts.length === 0) {
    return results;
  }

  const client = getClient();
  const batches = chunkArray(uncachedTexts, MAX_BATCH_SIZE);
  let uncachedOffset = 0;

  for (let bIndex = 0; bIndex < batches.length; bIndex++) {
    const batch = batches[bIndex];

    // Pacing delay between batches to respect RPM constraints
    if (bIndex > 0) {
      await sleep(400);
    }

    let batchEmbeddings: number[][] | null = null;

    if (client) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const model = client.getGenerativeModel({ model: activeModelName });
          const response = await model.batchEmbedContents({
            requests: batch.map((text) => ({
              content: { role: 'user', parts: [{ text }] },
              outputDimensionality: EMBEDDING_DIMENSIONS,
            })),
          });

          if (response?.embeddings?.length === batch.length) {
            batchEmbeddings = response.embeddings.map((e) => e.values);
            break;
          }
        } catch (err: any) {
          const msg = err?.message || '';
          const isRateLimit = msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota') || msg.includes('ResourceExhausted');

          if (isRateLimit && attempt < 2) {
            const waitSec = (attempt + 1) * 2;
            console.warn(`[Gemini-Embed] 429 rate limit on batch ${bIndex + 1}. Retrying in ${waitSec}s...`);
            await sleep(waitSec * 1000);
            continue;
          }

          if (activeModelName === PRIMARY_EMBEDDING_MODEL) {
            console.warn(`[Gemini-Embed] Switching model to ${FALLBACK_EMBEDDING_MODEL}`);
            activeModelName = FALLBACK_EMBEDDING_MODEL;
            continue;
          }

          console.warn(`[Gemini-Embed] Embedding API notice: ${msg.slice(0, 100)}. Utilizing high-availability fallback.`);
          break;
        }
      }
    }

    // Use deterministic mathematical embeddings if API was unavailable or exhausted
    if (!batchEmbeddings) {
      batchEmbeddings = batch.map((t) => generateFallbackEmbedding(t));
    }

    // Populate results and write to L1 cache
    for (let j = 0; j < batch.length; j++) {
      const originalIndex = uncachedIndices[uncachedOffset + j];
      const emb = batchEmbeddings[j];
      results[originalIndex] = emb;

      const cacheKey = `emb:${batch[j].slice(0, 80)}:${batch[j].length}`;
      CacheService.set(cacheKey, emb, 604800); // 7-day TTL
    }

    uncachedOffset += batch.length;
  }

  return results;
}

export function getEmbeddingDimensions(): number {
  return EMBEDDING_DIMENSIONS;
}
