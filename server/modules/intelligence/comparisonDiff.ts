import { DocumentComparisonResult } from '../../types/legal';
import { splitDocumentIntoClauses } from '../ingestion/clauseSplitter';

export function compareTwoAgreements(
  docAText: string,
  docAName: string,
  docBText: string,
  docBName: string
): DocumentComparisonResult {
  const clausesA = splitDocumentIntoClauses(docAText);
  const clausesB = splitDocumentIntoClauses(docBText);

  const typesInA = new Set(clausesA.map((c) => c.clauseType));
  const typesInB = new Set(clausesB.map((c) => c.clauseType));

  const allTypes = Array.from(new Set([...typesInA, ...typesInB]));

  const clauseComparisons = allTypes.map((type) => {
    const clauseA = clausesA.find((c) => c.clauseType === type);
    const clauseB = clausesB.find((c) => c.clauseType === type);

    let winner: 'Document A' | 'Document B' | 'Equivalent' = 'Equivalent';
    let analysis = 'Both documents provide similar structural coverage.';

    if (clauseA && !clauseB) {
      winner = 'Document A';
      analysis = `Only present in ${docAName}. Absent in ${docBName}.`;
    } else if (!clauseA && clauseB) {
      winner = 'Document B';
      analysis = `Only present in ${docBName}. Absent in ${docAName}.`;
    } else if (clauseA && clauseB) {
      if (clauseA.text.toLowerCase().includes('mutual') && !clauseB.text.toLowerCase().includes('mutual')) {
        winner = 'Document A';
        analysis = `${docAName} provides fair mutual protections; ${docBName} uses one-sided language.`;
      } else if (!clauseA.text.toLowerCase().includes('mutual') && clauseB.text.toLowerCase().includes('mutual')) {
        winner = 'Document B';
        analysis = `${docBName} provides fair mutual protections; ${docAName} uses one-sided language.`;
      } else {
        winner = 'Equivalent';
        analysis = `Both agreements contain standard ${type} provisions with minor stylistic variance.`;
      }
    }

    return {
      clauseType: type,
      docAText: clauseA ? clauseA.text : '(Not provided in this version)',
      docBText: clauseB ? clauseB.text : '(Not provided in this version)',
      analysis,
      winner,
    };
  });

  return {
    docAName,
    docBName,
    timestamp: new Date().toISOString(),
    summaryOfDifferences: `Compared ${clausesA.length} clauses in '${docAName}' against ${clausesB.length} clauses in '${docBName}'.`,
    riskDivergence: {
      docARiskierClauses: clauseComparisons.filter((c) => c.winner === 'Document B').map((c) => c.clauseType),
      docBRiskierClauses: clauseComparisons.filter((c) => c.winner === 'Document A').map((c) => c.clauseType),
      identicalProvisions: clauseComparisons.filter((c) => c.winner === 'Equivalent').map((c) => c.clauseType),
    },
    clauseComparisons,
    negotiationRecommendation: `Use '${docAName}' as the preferred drafting baseline if bilateral terms are favored, adopting specific clarifying language from '${docBName}'.`,
    legalDisclaimer: 'This comparison provides automated clause delta indicators for informational review. Not legal advice.',
  };
}
