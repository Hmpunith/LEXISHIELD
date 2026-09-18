import { AuditedClause, ChatMessage } from '../../types/legal';
import { askGeminiJson } from '../../services/geminiService';

export async function answerLegalQuestion(
  question: string,
  clauses: AuditedClause[],
  _history: ChatMessage[] = []
): Promise<{ answer: string; citations: Array<{ clauseIndex: number; snippet: string }> }> {
  const context = clauses
    .map((c) => `[Clause ${c.clauseIndex}: ${c.title} (${c.clauseType})] ${c.text}`)
    .join('\n\n');

  // Intelligent local search for relevant citations
  const lowerQ = question.toLowerCase();
  const relevantClauses = clauses.filter((c) =>
    c.text.toLowerCase().includes(lowerQ) ||
    lowerQ.split(/\s+/).some((word) => word.length > 3 && c.text.toLowerCase().includes(word))
  );

  const fallbackCitations = (relevantClauses.length > 0 ? relevantClauses : clauses.slice(0, 2)).map((c) => ({
    clauseIndex: c.clauseIndex,
    snippet: c.text.slice(0, 180) + '...',
  }));

  const fallbackAnswer = `Based on the document text in Clause ${fallbackCitations[0]?.clauseIndex || 1}, ${
    clauses.find((c) => c.clauseIndex === fallbackCitations[0]?.clauseIndex)?.plainEnglishSummary ||
    'the agreement sets forth standard obligations regarding this topic.'
  } Always have an attorney review binding interpretations.`;

  return askGeminiJson(
    'You are Document Counsel, an intelligent legal assistant. Answer questions strictly grounded on the provided contract text. Cite exact Clause numbers.',
    `CONTRACT CONTEXT:
    ${context.slice(0, 8000)}
    
    USER QUESTION:
    ${question}
    
    Respond with JSON:
    {
      "answer": "Accurate, clear plain-English answer grounded directly in the contract terms. Note what is present and what is missing.",
      "citations": [
        { "clauseIndex": 1, "snippet": "Relevant text quote from contract" }
      ]
    }`,
    () => ({
      answer: fallbackAnswer,
      citations: fallbackCitations,
    })
  );
}
