import { AuditedClause, AttorneyBrief, RiskLevel, DocumentType } from '../../types/legal';

export function buildAttorneyConsultationBrief(
  clauses: AuditedClause[],
  docType: DocumentType,
  filename: string
): AttorneyBrief {
  const criticals = clauses.filter((c) => c.riskLevel === RiskLevel.Critical || c.riskLevel === RiskLevel.Unfavorable);

  const suggestedQuestions: string[] = [
    `Are the liability caps in ${filename} customary for this tier of ${docType.replace('_', ' ')} in our target jurisdiction?`,
    'Does the indemnification clause expose my business or personal assets to third-party intellectual property claims?',
    'If the counterparty initiates termination without cause, what specific legal remedies protect my accrued fees?',
    'Is the dispute resolution forum and governing law jurisdiction balanced, or does it impose burdensome travel and arbitration expenses?',
  ];

  if (criticals.some((c) => c.clauseType.includes('Non-Compete'))) {
    suggestedQuestions.unshift(
      'Is the non-compete / restrictive covenant legally enforceable under current state and federal FTC regulations?'
    );
  }

  return {
    documentSummary: `Audit of '${filename}' identified ${clauses.length} distinct clauses. Found ${criticals.length} high-exposure clauses requiring legal clarification.`,
    keyRisksIdentified: criticals.map((c) => `${c.clauseType}: ${c.plainEnglishSummary}`),
    suggestedQuestionsForAttorney: suggestedQuestions,
    recommendedNegotiationPoints: criticals.map((c) => c.counterProposal?.proposedClause ? `Revise Section ${c.clauseIndex}: ${c.counterProposal.rationale}` : `Negotiate bilateral rights for Section ${c.clauseIndex}`),
    jurisdictionNotes: 'Standard recommendation: Ensure governing law resides in the signer’s local state jurisdiction to minimize venue litigation overhead.',
  };
}
