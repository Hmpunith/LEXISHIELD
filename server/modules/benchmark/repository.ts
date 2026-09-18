import { DocumentType, ClauseType, MarketBenchmark } from '../../types/legal';

export const MARKET_BENCHMARKS: MarketBenchmark[] = [
  // Freelance & Consulting Agreements
  {
    id: 'bm-freelance-indemnity-01',
    documentType: DocumentType.FreelanceContract,
    clauseType: ClauseType.Indemnification,
    benchmarkText: 'Each party shall defend, indemnify, and hold harmless the other party against any third-party claims, liabilities, or expenses resulting solely from the indemnifying party’s gross negligence, willful misconduct, or material breach of this Agreement. Contractor’s maximum indemnification obligation shall be capped at the total fees paid under this Agreement.',
    fairStandardExplanation: 'Market standard requires mutual indemnification, tied strictly to gross negligence or willful misconduct, and capped at total contract compensation.',
    sourceAttribution: 'ABA Business Law Model Consulting Guidelines',
  },
  {
    id: 'bm-freelance-payment-01',
    documentType: DocumentType.FreelanceContract,
    clauseType: ClauseType.PaymentTerms,
    benchmarkText: 'Client agrees to pay all undisputed invoiced amounts within thirty (30) days of receipt of invoice. Late payments shall accrue interest at the rate of 1.0% per month or the maximum statutory rate allowed by law. Client shall notify Contractor within ten (10) business days of any disputed invoice line items.',
    fairStandardExplanation: 'Net-30 payment with reasonable late interest and prompt notice of billing disputes is standard market practice.',
    sourceAttribution: 'Freelancers Union Standard Commercial Terms',
  },
  {
    id: 'bm-freelance-termination-01',
    documentType: DocumentType.FreelanceContract,
    clauseType: ClauseType.Termination,
    benchmarkText: 'Either party may terminate this Agreement without cause upon thirty (30) calendar days written notice. In the event of termination, Client shall pay Contractor for all services satisfactorily rendered and expenses incurred through the effective termination date.',
    fairStandardExplanation: 'Standard termination provides bilateral 30-day notice with guaranteed payment for work completed prior to termination.',
    sourceAttribution: 'Standard Commercial Consulting Framework',
  },
  {
    id: 'bm-freelance-ip-01',
    documentType: DocumentType.FreelanceContract,
    clauseType: ClauseType.IntellectualProperty,
    benchmarkText: 'Upon receipt of full payment for the deliverables, Contractor assigns to Client all right, title, and interest in and to the custom deliverables created specifically for Client. Contractor retains all right and ownership in its pre-existing tools, libraries, and general domain know-how.',
    fairStandardExplanation: 'IP transfer should be conditioned on full payment, and the creator should retain pre-existing background code and tools.',
    sourceAttribution: 'Tech Contract Standards (David Tollen model)',
  },
  {
    id: 'bm-freelance-noncompete-01',
    documentType: DocumentType.FreelanceContract,
    clauseType: ClauseType.NonCompete,
    benchmarkText: 'Contractor shall not solicit Client’s employees during the term and for six (6) months thereafter. This Agreement does not restrict Contractor from performing services for other clients in any industry, provided no Confidential Information of Client is used.',
    fairStandardExplanation: 'Independent contractors must remain free to serve other clients; broad non-competes on contractors are predatory and often legally unenforceable.',
    sourceAttribution: 'Uniform Trade Secrets Act & FTC Rule Guidance',
  },
  {
    id: 'bm-freelance-liability-01',
    documentType: DocumentType.FreelanceContract,
    clauseType: ClauseType.LimitationOfLiability,
    benchmarkText: 'To the maximum extent permitted by law, neither party shall be liable for indirect, incidental, or consequential damages. Each party’s total aggregate liability arising out of this Agreement shall be limited to the total amount paid or payable by Client in the twelve (12) months preceding the claim.',
    fairStandardExplanation: 'Mutual exclusion of consequential damages and a 12-month fee cap represents the universal standard of fair risk allocation.',
    sourceAttribution: 'Standard Commercial Model Contract Provisions',
  },

  // Lease Agreements
  {
    id: 'bm-lease-deposit-01',
    documentType: DocumentType.LeaseAgreement,
    clauseType: ClauseType.PaymentTerms,
    benchmarkText: 'Landlord shall hold the Security Deposit in an escrow account. Within twenty-one (21) days of lease termination, Landlord shall return the deposit with an itemized statement of any deductions for damages beyond reasonable wear and tear.',
    fairStandardExplanation: 'Prompt return of deposits with required itemization and safe escrow handling is statutory best practice.',
    sourceAttribution: 'Uniform Residential Landlord and Tenant Act (URLTA)',
  },
  {
    id: 'bm-lease-entry-01',
    documentType: DocumentType.LeaseAgreement,
    clauseType: ClauseType.Miscellaneous,
    benchmarkText: 'Landlord may enter the premises for inspection or repairs only after providing at least twenty-four (24) hours advance written notice, during reasonable business hours, except in cases of immediate emergency threatening property or life.',
    fairStandardExplanation: 'Tenants are entitled to quiet enjoyment; 24-hour advance written notice is standard for all non-emergency entries.',
    sourceAttribution: 'Standard Model Residential Lease',
  },
  {
    id: 'bm-lease-maintenance-01',
    documentType: DocumentType.LeaseAgreement,
    clauseType: ClauseType.Warranties,
    benchmarkText: 'Landlord shall maintain all structural components, plumbing, heating, electrical, and supplied appliances in good working order. Tenant shall maintain ordinary cleanliness and promptly notify Landlord of any required repairs.',
    fairStandardExplanation: 'The implied warranty of habitability requires Landlords to bear major structural and system maintenance costs.',
    sourceAttribution: 'URLTA Habitability Standards',
  },

  // Non-Disclosure Agreements (NDAs)
  {
    id: 'bm-nda-confidentiality-01',
    documentType: DocumentType.NonDisclosureAgreement,
    clauseType: ClauseType.Confidentiality,
    benchmarkText: 'Each party shall protect the other party’s Confidential Information with the same degree of care it uses for its own confidential information, but not less than reasonable care. Confidential Information shall not be disclosed to any third party without prior written consent.',
    fairStandardExplanation: 'Mutual confidentiality obligations governed by standard "reasonable care" protect both parties equally.',
    sourceAttribution: 'Silicon Valley Standard Mutual NDA Protocol',
  },
  {
    id: 'bm-nda-duration-01',
    documentType: DocumentType.NonDisclosureAgreement,
    clauseType: ClauseType.Termination,
    benchmarkText: 'The obligations of confidentiality shall expire two (2) years from the date of disclosure, except for trade secrets, which shall remain protected for as long as they qualify as trade secrets under applicable law.',
    fairStandardExplanation: 'Standard commercial NDAs expire after 2–3 years; perpetual confidentiality for general business information is overly restrictive.',
    sourceAttribution: 'International Technology Law Association Model NDA',
  },
  {
    id: 'bm-nda-exceptions-01',
    documentType: DocumentType.NonDisclosureAgreement,
    clauseType: ClauseType.Confidentiality,
    benchmarkText: 'Confidential Information does not include information that: (a) is or becomes publicly known through no breach; (b) was already known prior to disclosure; (c) is independently developed without reference to the information; or (d) is required to be disclosed by law or court order.',
    fairStandardExplanation: 'Universal standard exclusion clauses are necessary to prevent claims over public or independently developed knowledge.',
    sourceAttribution: 'Uniform Trade Secrets Act Exclusions',
  },

  // SaaS Agreements
  {
    id: 'bm-saas-liability-01',
    documentType: DocumentType.SaaSAgreement,
    clauseType: ClauseType.LimitationOfLiability,
    benchmarkText: 'Except for indemnification obligations and breaches of confidentiality, neither party’s aggregate liability arising out of or related to this Agreement shall exceed the total amount paid by Customer in the twelve (12) months preceding the incident.',
    fairStandardExplanation: 'SaaS agreements standardly cap liability at 12 months fees, with mutual exceptions for gross breach.',
    sourceAttribution: 'Bespoke Tech Law Standard MSA Guidelines',
  },
  {
    id: 'bm-saas-sla-01',
    documentType: DocumentType.SaaSAgreement,
    clauseType: ClauseType.Warranties,
    benchmarkText: 'Provider warrants that the Service will achieve at least 99.9% availability during each calendar month. In the event of a breach of this warranty, Customer’s sole and exclusive remedy shall be service credits calculated according to Exhibit A.',
    fairStandardExplanation: '99.9% uptime with service credit remedies is standard cloud software tier expectation.',
    sourceAttribution: 'Enterprise Cloud SLA Standards',
  }
];

export function getBenchmarksForDocType(docType: DocumentType): MarketBenchmark[] {
  const matched = MARKET_BENCHMARKS.filter((b) => b.documentType === docType);
  return matched.length > 0 ? matched : MARKET_BENCHMARKS;
}
