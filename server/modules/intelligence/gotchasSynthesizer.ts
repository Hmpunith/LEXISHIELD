import { AuditedClause, RiskLevel, GotchaWarning } from '../../types/legal';

export function synthesizeGotchas(clauses: AuditedClause[]): GotchaWarning[] {
  const riskyClauses = clauses
    .filter((c) => c.riskLevel === RiskLevel.Critical || c.riskLevel === RiskLevel.Unfavorable)
    .sort((a, b) => b.riskScore - a.riskScore);

  const warnings: GotchaWarning[] = [];

  riskyClauses.slice(0, 5).forEach((clause, i) => {
    warnings.push({
      id: `gotcha-${i + 1}`,
      title: `Dangerous ${clause.clauseType} Terms`,
      riskLevel: clause.riskLevel,
      clauseType: clause.clauseType,
      concern: clause.plainEnglishSummary,
      recommendation: clause.counterProposal?.negotiationStrategy || 'Insist on mutual protections or cap your total exposure before signing.',
      relatedClauseIndex: clause.clauseIndex,
    });
  });

  if (warnings.length === 0) {
    warnings.push({
      id: 'gotcha-fair-01',
      title: 'No Critical Traps Detected',
      riskLevel: RiskLevel.Standard,
      clauseType: clauses[0]?.clauseType || ('General' as any),
      concern: 'The agreement clauses largely comply with recognized fair market standards.',
      recommendation: 'Perform a final routine read-through and verify operational dates and payment sums.',
      relatedClauseIndex: 1,
    });
  }

  return warnings;
}
