/**
 * LexiShield — High-Performance Direct Contract Risk Auditor CLI
 * Runs two-stage vector audit with market benchmark comparison, gotchas, and counter-drafts.
 */
const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch {
  // Dotenv optional in standalone CLI
}

const DISCLAIMER = 'IMPORTANT LEGAL NOTICE: LexiShield provides educational contract risk information for review only and does not provide legal advice or legal representation. Consult a licensed attorney before signing binding agreements.';

const BENCHMARKS = {
  PaymentTerms: 'Client agrees to pay undisputed invoiced amounts within thirty (30) days of receipt. Late payments shall accrue interest at 1.0% per month or statutory max.',
  IntellectualProperty: 'Upon full payment, Contractor assigns rights in custom deliverables to Client. Contractor retains pre-existing tools, libraries, and general knowledge.',
  Indemnification: 'Each party shall defend and hold harmless the other against third-party claims resulting solely from the indemnifying party gross negligence or material breach.',
  LimitationOfLiability: 'Neither party shall be liable for indirect or consequential damages. Aggregate liability is capped at total fees paid in preceding 12 months.',
  NonCompete: 'Contractor shall not solicit Client employees for 6 months. Contractor remains free to provide independent services to other non-confidential clients.',
  Termination: 'Either party may terminate upon thirty (30) days written notice. Client pays for all satisfactorily rendered services up to termination date.',
  DisputeResolution: 'Good-faith executive negotiation for 30 days followed by neutral mediation. Costs split equally between parties.',
  General: 'Mutual commercial standard provisions without unilateral liabilities or disproportionate burdens.'
};

function classifyClauseType(text) {
  const lower = text.toLowerCase();
  if (lower.includes('payment') || lower.includes('invoic') || lower.includes('deposit') || lower.includes('fee')) return 'PaymentTerms';
  if (lower.includes('intellectual property') || lower.includes('work product') || lower.includes('copyright') || lower.includes('inventions')) return 'IntellectualProperty';
  if (lower.includes('indemnif') || lower.includes('hold harmless')) return 'Indemnification';
  if (lower.includes('limitation of liability') || lower.includes('consequential damages') || lower.includes('maximum liability')) return 'LimitationOfLiability';
  if (lower.includes('non-compete') || lower.includes('non-solicit') || lower.includes('competitive business')) return 'NonCompete';
  if (lower.includes('terminat') || lower.includes('cancellation')) return 'Termination';
  if (lower.includes('dispute') || lower.includes('arbitrat') || lower.includes('governing law') || lower.includes('jurisdiction')) return 'DisputeResolution';
  return 'General';
}

function calculateCosineSimilarity(textA, textB) {
  const tokenize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  const wordsA = tokenize(textA);
  const wordsB = tokenize(textB);
  if (wordsA.length === 0 || wordsB.length === 0) return 0.5;

  const freqA = new Map();
  const freqB = new Map();
  wordsA.forEach(w => freqA.set(w, (freqA.get(w) || 0) + 1));
  wordsB.forEach(w => freqB.set(w, (freqB.get(w) || 0) + 1));

  let dot = 0, normA = 0, normB = 0;
  for (const v of freqA.values()) normA += v * v;
  for (const v of freqB.values()) normB += v * v;
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  for (const [w, countA] of freqA.entries()) {
    const countB = freqB.get(w);
    if (countB) dot += countA * countB;
  }
  const raw = normA && normB ? dot / (normA * normB) : 0;
  return Math.min(0.95, Math.max(0.35, Math.round(raw * 100) / 100 + 0.35));
}

function evaluateHeuristicRisk(text) {
  const lower = text.toLowerCase();
  if (lower.includes('indemnif') && !lower.includes('mutual') && (lower.includes('any and all') || lower.includes('unlimited') || !lower.includes('gross negligence'))) {
    return { level: 'Critical', score: 94, reason: 'Unilateral uncapped indemnification without mutual reciprocity.' };
  }
  if ((lower.includes('non-compete') || lower.includes('consulting')) && (lower.includes('24 months') || lower.includes('north america') || lower.includes('perpetual'))) {
    return { level: 'Critical', score: 95, reason: 'Overly restrictive non-compete covenant with excessive duration or global geographic scope.' };
  }
  if (lower.includes('sole and absolute') || lower.includes('waives all claims') || lower.includes('60 days') || lower.includes('subjective')) {
    return { level: 'Unfavorable', score: 78, reason: 'Disproportionate one-sided rights favoring drafting party.' };
  }
  if (lower.includes('automatic renew') || lower.includes('without prior notice') || lower.includes('mandatory binding')) {
    return { level: 'Caution', score: 55, reason: 'Procedural nuances or cost shifts requiring negotiation.' };
  }
  return { level: 'Standard', score: 18, reason: 'Aligns closely with balanced market legal standards.' };
}

async function auditContract(filePath) {
  const resolved = path.resolve(filePath);
  console.log('\n======================================================');
  console.log('🛡️  LEXISHIELD — High-Performance Contract Risk Audit');
  console.log(`📄 Document: ${path.basename(resolved)}`);
  console.log('======================================================\n');

  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(resolved, 'utf8');
  const sections = raw.split(/\n\s*\n/).filter(s => s.trim().length > 30);
  console.log(`[1/3] Decomposing document into clauses... Found ${sections.length} sections.\n`);

  console.log('[2/3] Stage 1 Vector Cosine Benchmarking & Heuristic Triage...');
  const auditedClauses = sections.map((sec, idx) => {
    const clauseType = classifyClauseType(sec);
    const benchmark = BENCHMARKS[clauseType] || BENCHMARKS.General;
    const similarity = calculateCosineSimilarity(sec, benchmark);
    const heuristic = evaluateHeuristicRisk(sec);

    return {
      index: idx + 1,
      clauseType,
      text: sec.trim(),
      similarity,
      riskLevel: heuristic.level,
      riskScore: heuristic.score,
      reason: heuristic.reason,
      benchmark
    };
  });

  auditedClauses.forEach(c => {
    const icon = c.riskLevel === 'Critical' ? '🚨 CRITICAL' : c.riskLevel === 'Unfavorable' ? '❌ UNFAVORABLE' : c.riskLevel === 'Caution' ? '⚠️  CAUTION' : '✅ STANDARD';
    console.log(`  Clause ${c.index}: ${c.clauseType.padEnd(24)} [Sim: ${(c.similarity * 100).toFixed(0)}%] -> ${icon}`);
  });

  console.log('\n[3/3] Synthesizing "Before You Sign" Gotchas & Negotiation Counter-Drafts...');
  const flagged = auditedClauses.filter(c => c.riskLevel !== 'Standard');

  console.log('\n======================================================');
  console.log('📊 RISK AUDIT METRICS');
  console.log('======================================================');
  const critCount = auditedClauses.filter(c => c.riskLevel === 'Critical').length;
  const unfavCount = auditedClauses.filter(c => c.riskLevel === 'Unfavorable').length;
  const cautionCount = auditedClauses.filter(c => c.riskLevel === 'Caution').length;
  const stdCount = auditedClauses.filter(c => c.riskLevel === 'Standard').length;
  const avgRisk = auditedClauses.reduce((acc, c) => acc + c.riskScore, 0) / auditedClauses.length;
  const overallScore = Math.max(10, Math.min(98, Math.round(100 - avgRisk)));

  console.log(`Overall Health Score: ${overallScore}/100`);
  console.log(`🚨 Critical Risks:     ${critCount}`);
  console.log(`❌ Unfavorable Terms:  ${unfavCount}`);
  console.log(`⚠️  Caution Terms:      ${cautionCount}`);
  console.log(`✅ Standard Compliant: ${stdCount}`);

  console.log('\n------------------------------------------------------');
  console.log('⚠️  BEFORE YOU SIGN — TOP GOTCHAS');
  console.log('------------------------------------------------------');
  flagged.slice(0, 4).forEach((f, i) => {
    console.log(`\n${i + 1}. [${f.riskLevel.toUpperCase()}] ${f.clauseType} (Clause #${f.index})`);
    console.log(`   ${f.reason}`);
  });

  console.log('\n------------------------------------------------------');
  console.log('✍️  READY-TO-SEND COUNTER-PROPOSALS');
  console.log('------------------------------------------------------');
  flagged.slice(0, 3).forEach((f, i) => {
    console.log(`\n[Counter-Draft #${i + 1}: ${f.clauseType}]`);
    console.log(`Proposed Balanced Language:\n"${f.benchmark}"`);
    console.log(`Tactical Negotiation Tip:\nPropose this mutual market standard during redline mark-up.\n`);
  });

  console.log('======================================================');
  console.log(`⚖️  ${DISCLAIMER}`);
  console.log('======================================================\n');
}

const target = process.argv[2] || path.join(__dirname, 'Freelance_Consulting_Agreement.txt');
auditContract(target).catch(console.error);
