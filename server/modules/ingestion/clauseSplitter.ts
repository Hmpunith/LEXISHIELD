import crypto from 'crypto';
import { ClauseType, ParsedClause } from '../../types/legal';

const CLAUSE_PATTERNS: Array<{ type: ClauseType; regex: RegExp }> = [
  { type: ClauseType.Indemnification, regex: /\b(indemn\w*|hold\s+harmless|defend\s+and\s+hold)\b/i },
  { type: ClauseType.PaymentTerms, regex: /\b(payment\w*|fee\w*|invoice\w*|compensation|remuneration|deposit|rent|interest)\b/i },
  { type: ClauseType.Termination, regex: /\b(terminat\w*|cancellation|rescission|cure\s+period)\b/i },
  { type: ClauseType.IntellectualProperty, regex: /\b(intellectual\s+property|work\s+for\s+hire|patent\w*|trademark\w*|copyright\w*|ownership\s+of\s+deliverables)\b/i },
  { type: ClauseType.NonCompete, regex: /\b(non-compete|covenant\s+not\s+to\s+compete|restrictive\s+covenant|non-solicitation)\b/i },
  { type: ClauseType.Confidentiality, regex: /\b(confidential\w*|nondisclosure|proprietary\s+information|trade\s+secret\w*)\b/i },
  { type: ClauseType.LimitationOfLiability, regex: /\b(limitation\s+of\s+liability|aggregate\s+liability|consequential\s+damages|maximum\s+liability)\b/i },
  { type: ClauseType.GoverningLaw, regex: /\b(governing\s+law|jurisdiction|venue|laws\s+of\s+the\s+state)\b/i },
  { type: ClauseType.ForceMajeure, regex: /\b(force\s+majeure|acts\s+of\s+god|unforeseen\s+circumstances)\b/i },
  { type: ClauseType.Warranties, regex: /\b(warrant\w*|as-is|disclaimer\s+of\s+warranties|guarantee\w*)\b/i },
  { type: ClauseType.DisputeResolution, regex: /\b(arbitration|mediation|dispute\s+resolution|jury\s+trial\s+waiver)\b/i },
];

export function inferClauseType(heading: string, bodyText: string): ClauseType {
  const combined = `${heading} ${bodyText}`;
  for (const { type, regex } of CLAUSE_PATTERNS) {
    if (regex.test(heading)) {
      return type;
    }
  }
  for (const { type, regex } of CLAUSE_PATTERNS) {
    if (regex.test(combined)) {
      return type;
    }
  }
  return ClauseType.Miscellaneous;
}

export function splitDocumentIntoClauses(rawText: string): ParsedClause[] {
  const cleaned = rawText.replace(/\r\n/g, '\n').trim();
  if (!cleaned) {
    return [];
  }

  // Split by common numbered headings: "1. ", "Section 1", "Article I", "IV. ", etc.
  const sectionSplitter = /(?:\n\s*(?:Section\s+\d+|Article\s+[IVXLCDM\d]+|\d+\.\d*|[A-Z][.)])\s*[:-–]?\s*)/gi;

  const rawSections = cleaned.split(sectionSplitter).map((s) => s.trim()).filter((s) => s.length > 20);

  // If sectionSplitter found fewer than 2 sections, fallback to paragraph blocks
  const blocks = rawSections.length >= 2 
    ? rawSections 
    : cleaned.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 25);

  const results: ParsedClause[] = [];

  blocks.forEach((block, index) => {
    const lines = block.split('\n');
    let title = lines[0].slice(0, 60).replace(/[^\w\s-]/g, '').trim();
    if (title.length < 5) {
      title = `Clause ${index + 1}`;
    }

    const clauseType = inferClauseType(title, block);
    const hash = crypto.createHash('sha256').update(block).digest('hex');

    results.push({
      id: `clause-${index + 1}-${hash.slice(0, 8)}`,
      clauseIndex: index + 1,
      clauseType,
      title,
      text: block,
      wordCount: block.split(/\s+/).length,
      contentHash: hash,
    });
  });

  return results;
}
