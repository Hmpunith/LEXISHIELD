

export enum DocumentType {
  FreelanceContract = 'freelance_contract',
  LeaseAgreement = 'lease_agreement',
  NonDisclosureAgreement = 'nda',
  SaaSAgreement = 'saas_agreement',
  EmploymentContract = 'employment_contract',
  GeneralAgreement = 'general_agreement',
}

export enum ClauseType {
  Indemnification = 'Indemnification',
  PaymentTerms = 'Payment Terms',
  Termination = 'Termination',
  IntellectualProperty = 'Intellectual Property',
  NonCompete = 'Non-Compete & Restrictive Covenants',
  Confidentiality = 'Confidentiality',
  LimitationOfLiability = 'Limitation of Liability',
  GoverningLaw = 'Governing Law & Jurisdiction',
  ForceMajeure = 'Force Majeure',
  Warranties = 'Warranties & Disclaimers',
  DisputeResolution = 'Dispute Resolution & Arbitration',
  Miscellaneous = 'Miscellaneous',
}

export enum RiskLevel {
  Standard = 'Standard',
  Caution = 'Caution',
  Unfavorable = 'Unfavorable',
  Critical = 'Critical',
}

export interface ParsedClause {
  id: string;
  clauseIndex: number;
  clauseType: ClauseType;
  title: string;
  text: string;
  wordCount: number;
  contentHash: string;
}

export interface MarketBenchmark {
  id: string;
  documentType: DocumentType;
  clauseType: ClauseType;
  benchmarkText: string;
  fairStandardExplanation: string;
  sourceAttribution: string;
}

export interface AuditedClause extends ParsedClause {
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  similarityToBenchmark: number; // 0.0 to 1.0
  matchedBenchmarkId?: string;
  matchedBenchmarkText?: string;
  plainEnglishSummary: string;
  deviationAnalysis: string;
  counterProposal?: {
    proposedClause: string;
    rationale: string;
    negotiationStrategy: string;
  };
}

export interface GotchaWarning {
  id: string;
  title: string;
  riskLevel: RiskLevel;
  clauseType: ClauseType;
  concern: string;
  recommendation: string;
  relatedClauseIndex: number;
}

export interface ComplianceChecklistItem {
  id: string;
  category: string;
  task: string;
  deadlineOrTrigger: string;
  riskIfIgnored: string;
  completed: boolean;
}

export interface AttorneyBrief {
  documentSummary: string;
  keyRisksIdentified: string[];
  suggestedQuestionsForAttorney: string[];
  recommendedNegotiationPoints: string[];
  jurisdictionNotes: string;
}

export interface AuditReport {
  documentId: string;
  filename: string;
  documentType: DocumentType;
  timestamp: string;
  clauseCount: number;
  wordCount: number;
  overallScore: number; // 0 to 100 (higher = fairer/lower risk)
  riskDistribution: {
    standard: number;
    caution: number;
    unfavorable: number;
    critical: number;
  };
  gotchas: GotchaWarning[];
  clauses: AuditedClause[];
  checklist: ComplianceChecklistItem[];
  attorneyBrief: AttorneyBrief;
  legalDisclaimer: string;
}

export interface DocumentComparisonResult {
  docAName: string;
  docBName: string;
  timestamp: string;
  summaryOfDifferences: string;
  riskDivergence: {
    docARiskierClauses: string[];
    docBRiskierClauses: string[];
    identicalProvisions: string[];
  };
  clauseComparisons: Array<{
    clauseType: ClauseType;
    docAText: string;
    docBText: string;
    analysis: string;
    winner: 'Document A' | 'Document B' | 'Equivalent';
  }>;
  negotiationRecommendation: string;
  legalDisclaimer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Array<{
    clauseIndex: number;
    clauseType: ClauseType;
    snippet: string;
  }>;
}
