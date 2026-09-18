export interface SampleContract {
  id: string;
  name: string;
  category: string;
  riskDescription: string;
  text: string;
}

export const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    id: 'sample-freelance',
    name: 'Freelance Software Development Agreement',
    category: 'High Risk / Unfavorable',
    riskDescription: 'Contains unilateral indemnification, 60-day delayed payment, perpetual global non-compete, and total waiver of consequential damages.',
    text: `SOFTWARE CONSULTING AND INDEPENDENT CONTRACTOR AGREEMENT

1. Scope of Work and Deliverables
Contractor agrees to provide custom full-stack software development services as specified in Exhibit A. All deliverables must satisfy Client's sole and unreviewable subjective satisfaction prior to acceptance.

2. Compensation and Payment Terms
Client shall compensate Contractor at the agreed milestone rates. Client shall issue payment within sixty (60) business days following receipt of an approved invoice. Contractor waives all rights to statutory interest or late fees on overdue balances.

3. Intellectual Property and Moral Rights Assignment
Contractor hereby irrevocably assigns to Client all right, title, and interest worldwide in and to all deliverables, inventions, discoveries, code, and trade secrets developed, whether during working hours or on personal time. Contractor unconditionally waives all moral rights and claims of authorship.

4. Unilateral Indemnification and Hold Harmless
Contractor shall defend, indemnify, and hold harmless Client, its officers, directors, and affiliates from and against any and all claims, damages, liabilities, losses, and legal costs arising from any third-party claim, defect, or alleged breach of this Agreement. Contractor's indemnification obligation under this Section shall be unlimited in amount.

5. Perpetual Non-Compete and Non-Solicitation
During the term of this Agreement and for a period of twenty-four (24) months following termination for any reason, Contractor shall not directly or indirectly engage in, perform services for, or consult with any competitive software enterprise worldwide.

6. Limitation of Liability
In no event shall Client be liable to Contractor for any indirect, incidental, or consequential damages. Client's maximum cumulative liability under this Agreement shall not exceed $100.00.

7. Termination and Governing Law
Client may terminate this Agreement at any time without cause upon twenty-four (24) hours written notice. This Agreement shall be governed exclusively by the laws and courts of Delaware, with Contractor bearing all legal expenses.`
  },
  {
    id: 'sample-lease',
    name: 'Residential Apartment Lease Agreement',
    category: 'Caution / Mixed Standard',
    riskDescription: 'Contains strict security deposit forfeiture, 24/7 landlord inspection rights, and tenant-paid structural maintenance fees.',
    text: `STANDARD RESIDENTIAL LEASE AGREEMENT

Section 1. Demised Premises and Term
Landlord leases to Tenant the premises located at Unit 4B, Elmwood Terrace for a term of twelve (12) calendar months commencing October 1st.

Section 2. Monthly Rent and Non-Refundable Holding Fees
Tenant agrees to pay monthly rent of $2,400.00 on or before the first day of each month. Any payment received after the 2nd day shall incur an immediate $150.00 administrative fee plus $15.00 per day thereafter.

Section 3. Security Deposit and Forfeiture
Tenant shall deposit $4,800.00 as security. Landlord reserves the unilateral right to retain the entire security deposit as liquidated damages if Tenant vacates before the exact anniversary date, regardless of whether a replacement tenant is secured.

Section 4. Landlord Right of Entry
Landlord and Landlord's agents reserve the right to enter the premises at any time, day or night, without prior notice, for purposes of general inspection, repair appraisal, or showing to prospective buyers.

Section 5. Repairs and Maintenance Obligations
Tenant shall be solely responsible for all plumbing repairs, HVAC filter replacements, appliance servicing, and general dwelling maintenance costs exceeding $50.00 per occurrence.

Section 6. Mutual Hold Harmless
Tenant agrees that Landlord shall have zero liability for water damage, mold, burglary, or electrical failure occurring within the leased premises.`
  },
  {
    id: 'sample-nda',
    name: 'Mutual Commercial Non-Disclosure Agreement',
    category: 'Balanced / Market Standard',
    riskDescription: 'Bilateral protection, standard 2-year duration, customary trade secret exceptions, and reciprocal confidentiality obligations.',
    text: `MUTUAL NON-DISCLOSURE AGREEMENT

1. Definition of Confidential Information
"Confidential Information" refers to any proprietary business, technical, or financial data disclosed by either party (the "Disclosing Party") to the other party (the "Receiving Party") that is marked as confidential or would reasonably be understood as confidential.

2. Exclusions from Confidentiality
Confidential Information does not include information that: (a) is or becomes publicly available without breach of this Agreement; (b) was already known to Receiving Party prior to disclosure; (c) is independently developed without reference to the Disclosing Party's data; or (d) is disclosed pursuant to a valid judicial subpoena.

3. Standard of Care and Reciprocal Obligations
Each party agrees to hold the other party's Confidential Information in strict confidence using the same degree of care it utilizes for its own confidential assets, but in no event less than a reasonable standard of care.

4. Term and Duration of Obligations
This Agreement and the confidentiality obligations herein shall remain in effect for a period of two (2) years from the initial date of disclosure, after which all obligations shall expire, except for bona fide trade secrets which shall remain protected under applicable statutory law.

5. Dispute Resolution and Governing Law
Any dispute arising under this Agreement shall be resolved through friendly executive negotiation, followed by binding arbitration in accordance with AAA Commercial Rules.`
  }
];
