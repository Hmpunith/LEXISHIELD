import { AuditedClause, ComplianceChecklistItem, RiskLevel } from '../../types/legal';

export function forgeComplianceChecklist(clauses: AuditedClause[]): ComplianceChecklistItem[] {
  const items: ComplianceChecklistItem[] = [];

  clauses.forEach((c, idx) => {
    if (c.riskLevel === RiskLevel.Critical || c.riskLevel === RiskLevel.Unfavorable) {
      items.push({
        id: `chk-risk-${idx + 1}`,
        category: 'Immediate Negotiation',
        task: `Propose counter-amendment to ${c.title} (${c.clauseType}) to remove one-sided liabilities.`,
        deadlineOrTrigger: 'Before signing or executing the agreement',
        riskIfIgnored: 'Uncapped financial liability or restrictive covenants enforceable in court.',
        completed: false,
      });
    }

    if (c.clauseType === 'Payment Terms') {
      items.push({
        id: `chk-pay-${idx + 1}`,
        category: 'Financial Milestone',
        task: 'Set calendar reminders for invoice submission dates and verify net payment terms.',
        deadlineOrTrigger: 'Monthly billing cycle',
        riskIfIgnored: 'Cashflow interruptions and disputed delayed payments.',
        completed: false,
      });
    }

    if (c.clauseType === 'Termination') {
      items.push({
        id: `chk-term-${idx + 1}`,
        category: 'Exit Strategy',
        task: 'Document required written notice periods (e.g. 30 days) and acceptable delivery methods.',
        deadlineOrTrigger: 'Prior to contract expiration or planned exit',
        riskIfIgnored: 'Automatic agreement renewal or wrongful termination claims.',
        completed: false,
      });
    }
  });

  // Default fallback items if document is minimal
  if (items.length < 3) {
    items.push(
      {
        id: 'chk-def-1',
        category: 'Pre-Execution Verification',
        task: 'Verify legal names, entity registration status, and authorized signatory powers of all parties.',
        deadlineOrTrigger: 'Prior to signature',
        riskIfIgnored: 'Contract invalidity or signing against an unverified entity.',
        completed: false,
      },
      {
        id: 'chk-def-2',
        category: 'Record Keeping',
        task: 'Archive fully-executed digital PDF copy in encrypted corporate cloud storage.',
        deadlineOrTrigger: 'Within 24 hours of countersignature',
        riskIfIgnored: 'Loss of binding evidentiary documentation in case of future audit.',
        completed: false,
      }
    );
  }

  return items;
}
