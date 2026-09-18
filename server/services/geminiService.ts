import { GoogleGenerativeAI } from '@google/generative-ai';
import { getConfig } from '../config/env';

const DISCLAIMER = 'IMPORTANT LEGAL NOTICE: You are an educational legal information assistant. Your output is for informational and educational purposes only and does NOT constitute legal advice, representation, or attorney-client privilege. Emphasize that users should consult a qualified legal professional.';

const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];

let genAIClient: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  const config = getConfig();
  if (!config.GEMINI_API_KEY) {return null;}
  if (!genAIClient) {
    genAIClient = new GoogleGenerativeAI(config.GEMINI_API_KEY);
  }
  return genAIClient;
}

export async function askGeminiJson<T>(systemPrompt: string, userPrompt: string, fallbackGenerator: () => T): Promise<T> {
  const client = getClient();
  if (!client) {
    // Return high-quality deterministic fallback if no API key is supplied
    return fallbackGenerator();
  }

  const fullSystem = `${systemPrompt}\n\n${DISCLAIMER}\n\nReturn strictly valid JSON only.`;

  for (const modelName of CANDIDATE_MODELS) {
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
    } catch (err) {
      console.warn(`[Gemini] Model ${modelName} call notice: ${(err as Error).message}. Trying next candidate or fallback...`);
    }
  }

  // Graceful fallback if Gemini API is unreachable
  return fallbackGenerator();
}
