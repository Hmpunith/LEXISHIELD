<div align="center">

# 🛡️ LexiShield

**Autonomous Legal Document Intelligence, Market Benchmark Auditing & Client Self-Advocacy**

*Transforming complex, one-sided agreements into plain-English risk assessments, verified benchmark comparisons, and negotiation leverage.*

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-5.x_Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Google Gemini 2.5 Flash](https://img.shields.io/badge/GenAI-Gemini_2.5_Flash-8E75C2?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Test Suite](https://img.shields.io/badge/Vitest-61_Passing_(100%25)-10B981?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Accessibility](https://img.shields.io/badge/WCAG-2.1_AA_Compliant-0284C7?style=flat-square)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Linter](https://img.shields.io/badge/ESLint-0_Errors_|_0_Warnings-purple?style=flat-square)](https://eslint.org/)
[![License](https://img.shields.io/badge/License-MIT-slate?style=flat-square)](LICENSE)

[**Explore Live Production App →**](https://lexishield-roan.vercel.app)

</div>

---

### ⚖️ Regulatory Notice & Ethical Guardrails
> **LexiShield operates strictly as an educational self-advocacy and document review aid.**  
> Complex contracts disproportionately disadvantage individuals who lack direct legal counsel. LexiShield levels this playing field by explaining clause mechanics, flagging market standard deviations, and assisting users in preparing targeted questions for licensed legal counsel. It does not provide legal representation, formal legal opinions, or attorney-client privilege.

---

## 📋 Challenge Specification & Solution Matrix

PromptWars challenged developers to create an AI-powered system that makes legal information and assistance accessible, understandable, and actionable. Below is LexiShield's architectural response to each core requirement:

| Challenge Objective | LexiShield Engineering Solution | Primary Code Artifacts | Impact on User Access |
| :--- | :--- | :--- | :--- |
| **Simplifying complex legal documents** | Multi-pass regex boundary parser segments unstructured contracts into discrete, categorized clauses accompanied by plain-English explanations. | [`clauseSplitter.ts`](server/modules/ingestion/clauseSplitter.ts)<br>[`ClauseCard.tsx`](src/components/audit/ClauseCard.tsx) | Demystifies legal jargon into clear, digestible operational impacts. |
| **Comparing contracts, agreements, or policies** | **Dual Comparison Mode**: (1) Benchmarks clauses against 36+ established industry standards (ABA, URLTA, Silicon Valley models); (2) Side-by-side comparative diff of two competing user contracts. | [`matcher.ts`](server/modules/benchmark/matcher.ts)<br>[`repository.ts`](server/modules/benchmark/repository.ts)<br>[`ContractCompare.tsx`](src/components/compare/ContractCompare.tsx) | Reveals hidden contractual shifts and one-sided clauses across competing proposals. |
| **Highlighting important clauses, obligations, risks, or inconsistencies** | Multi-tier risk engine flags provisions into non-color-only tiers (`Standard`, `Caution`, `Unfavorable`, `Critical`) and synthesizes an executive **"Before You Sign — Top Gotchas"** warning dashboard. | [`riskAuditor.ts`](server/modules/audit/riskAuditor.ts)<br>[`gotchasSynthesizer.ts`](server/modules/intelligence/gotchasSynthesizer.ts)<br>[`GotchasSummary.tsx`](src/components/audit/GotchasSummary.tsx) | Alerts users immediately to predatory terms like uncapped indemnities or perpetual non-competes. |
| **Answering questions based on provided legal documents** | **Document Counsel**: Context-aware conversational assistant grounded strictly on the uploaded text, providing verbatim clause citations and preventing hallucinations. | [`counselChat.ts`](server/modules/intelligence/counselChat.ts)<br>[`DocumentChat.tsx`](src/components/counsel/DocumentChat.tsx) | Empowers users to query termination rights, payment schedules, and liabilities directly. |
| **Helping users understand their options and potential next steps** | **Counter-Draft Engine**: Generates negotiation-ready alternative clause language paired with written legal justifications and ready-to-send counter-offer emails. | [`counterDraftEngine.ts`](server/modules/negotiation/counterDraftEngine.ts)<br>[`CounterDraftModal.tsx`](src/components/audit/CounterDraftModal.tsx) | Provides immediate, actionable leverage to push back against unfair terms. |
| **Generating summaries, checklists, or other actionable outputs** | **Compliance Forge**: Synthesizes an interactive compliance and milestone checklist with completion tracking, trigger deadlines, and penalties for non-performance. | [`checklistForge.ts`](server/modules/intelligence/checklistForge.ts)<br>[`ComplianceChecklist.tsx`](src/components/prep/ComplianceChecklist.tsx) | Prevents missed notice periods, deposit forfeitures, and operational defaults. |
| **Helping users prepare information or questions for a legal professional** | **Attorney Consultation Prep Kit**: Auto-compiles an executive legal brief summarizing flagged clauses and generating high-priority questions to ask an attorney. | [`attorneyBrief.ts`](server/modules/intelligence/attorneyBrief.ts)<br>[`AttorneyBriefView.tsx`](src/components/prep/AttorneyBriefView.tsx) | Drastically reduces attorney billable hours by focusing consultations on high-risk clauses. |
| **Providing assistance rather than replacing legal advice** | Global disclaimer banner, system-level Gemini guardrails, export disclaimers, and clear educational framing throughout the entire UI. | [`DisclaimerBanner.tsx`](src/components/shell/DisclaimerBanner.tsx)<br>[`geminiService.ts`](server/services/geminiService.ts) | Ensures responsible AI boundaries and protects users from relying on automated advice. |

---

## 🏛️ System Design & Processing Pipeline

```
 ┌──────────────────────┐
 │  Contract Ingestion  │ (PDF / TXT / MD Upload or Direct Paste)
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │  Sanitize & Extract  │ (Strip Scripts, Neutralize Null Bytes, Normalize Layout)
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │  Clause Segmentation │ (Multi-Pass Boundary Regex & SHA-256 Hash Generation)
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │  MemoVault Cache     │ ──[Cache Hit]──► Instant Verified Response (<10ms)
 └──────────┬───────────┘
            │ [Cache Miss]
            ▼
 ┌──────────────────────────────────────────────────────────┐
 │ Dual-Tier Audit Pipeline                                 │
 │  1. Benchmark Pairing (Cosine/Jaccard vs 36+ ABA Models) │
 │  2. Semantic Delta Engine (Google Gemini 2.5 Flash)      │
 └──────────┬───────────────────────────────────────────────┘
            ▼
 ┌──────────────────────────────────────────────────────────┐
 │ Intelligence Synthesis                                   │
 │  • Top Gotchas & Critical Exposure Cards                 │
 │  • Negotiation Counter-Drafts with Email Scripts         │
 │  • Grounded Document Counsel (Q&A with Citations)        │
 │  • Compliance Checklist & Attorney Brief Dossier         │
 └──────────────────────────────────────────────────────────┘
```

---

## 🛡️ Enterprise Security & Privacy Architecture

LexiShield implements zero-trust defensive engineering across all request vectors:

* **Six Enforced Security Headers**:
  * `Permissions-Policy`: Restricts browser hardware access (`camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()`).
  * `Content-Security-Policy`: Restricts script execution to verified origins.
  * `X-Request-Id`: Cryptographic UUID v4 generated per request for distributed tracing.
  * `X-Content-Type-Options: nosniff`: Prevents MIME-type confusion attacks.
  * `X-Frame-Options: DENY`: Prevents clickjacking and unauthorized embedding.
  * `Referrer-Policy: strict-origin-when-cross-origin`: Shields origin headers during outbound calls.
* **Confidentiality Safeguards**: Server logs use `truncateLogString` to guarantee that proprietary contract text never leaks into stdout or logging aggregates.
* **XSS Sanitization (`purify.ts`)**: Recursively sanitizes JSON request payloads, stripping `<script>` tags, null bytes, and pseudo-protocols.
* **Rate Limiting (`gate.ts`)**: Sliding-window IP rate limiter protects against abusive request spikes.

---

## ♿ Universal Design & Accessibility (WCAG 2.1 AA)

* **Semantic HTML5 Structure**: Fully partitioned with `<header role="banner">`, `<nav role="navigation">`, `<main id="main-content">`, and `<footer role="contentinfo">`.
* **Keyboard Navigation**: Includes an accessible skip-link directly to `#main-content` as the first focusable node.
* **Three CSS Media Queries**:
  1. `@media (prefers-reduced-motion: reduce)`: Disables all decorative transitions for users sensitive to motion.
  2. `@media (prefers-contrast: high)`: Enhances card outlines and interactive borders for high-contrast viewing.
  3. `@media print`: Formats the entire audit dossier for paper or PDF printing, suppressing navigational chrome.
* **Non-Color-Only Indicators**: Every risk badge pairs color with an explicit semantic icon (`ShieldCheck`, `AlertTriangle`, `AlertOctagon`) and textual label.

---

## 🔬 Test Suite & Quality Verification

61 automated tests across 16 specialized test files pass with 100% coverage across core domains:

```
Test Files  16 passed (16)
Tests       61 passed (61)
Duration    3.78s
```

* **Unit Tests**: Clause segmentation, heading classification, SHA-256 caching, benchmark matching, text extraction, checklist forging, and attorney brief synthesis.
* **Security Tests**: Header verification (Permissions-Policy, CSP, X-Request-Id) and input sanitization defenses.
* **Accessibility Tests**: Static inspection of `lang="en"`, landmarks, and all 3 required media queries.
* **Edge Cases & Boundaries**: Null inputs, empty strings, symbol-only provisions, and high-risk clause classification.
* **Component Rendering**: React Testing Library execution in `happy-dom` verifying ARIA states and accessible status elements.

---

## 🚀 Local Setup & Development

```bash
# 1. Clone the repository
git clone https://github.com/Hmpunith/LEXISHIELD.git
cd LEXISHIELD

# 2. Install dependencies
npm install

# 3. Configure environment (optional - built-in offline engine runs without keys)
cp .env.example .env

# 4. Start development server
npm run dev

# 5. Run test suite
npm test

# 6. Run linter
npm run lint
```

---

## ⚖️ License
Distributed under the MIT License. Built for the PromptWars AI for Legal Assistance & Access Challenge.
