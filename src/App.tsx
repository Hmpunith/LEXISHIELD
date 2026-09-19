import React, { useState, Suspense, lazy } from 'react';
import { Navbar, NavTab } from './components/shell/Navbar';
import { Footer } from './components/shell/Footer';
import { SkipLink } from './components/shell/SkipLink';
import { DisclaimerBanner } from './components/shell/DisclaimerBanner';
import { FileUpload } from './components/shared/FileUpload';
import { LoadingState } from './components/shared/LoadingState';
import { GotchasSummary } from './components/audit/GotchasSummary';
import { ClauseCard } from './components/audit/ClauseCard';
import { CounterDraftModal } from './components/audit/CounterDraftModal';
import { AuditReport, AuditedClause, DocumentType } from '../server/types/legal';
import { Shield, Sparkles, Filter, RotateCcw } from 'lucide-react';

// Dynamic code splitting for secondary tabs to minimize initial bundle footprint
const DocumentChat = lazy(() => import('./components/counsel/DocumentChat').then((m) => ({ default: m.DocumentChat })));
const ContractCompare = lazy(() => import('./components/compare/ContractCompare').then((m) => ({ default: m.ContractCompare })));
const ComplianceChecklist = lazy(() => import('./components/prep/ComplianceChecklist').then((m) => ({ default: m.ComplianceChecklist })));
const AttorneyBriefView = lazy(() => import('./components/prep/AttorneyBriefView').then((m) => ({ default: m.AttorneyBriefView })));

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('audit');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [selectedClauseForDraft, setSelectedClauseForDraft] = useState<AuditedClause | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'risky'>('all');

  const handleUploadAndAnalyze = async (text: string, filename: string) => {
    setIsLoading(true);
    try {
      // 1. Upload
      const uploadRes = await fetch('/api/audit/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, filename }),
      });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error?.message || 'Upload failed');
      }

      // 2. Analyze
      let docType = DocumentType.FreelanceContract;
      const lower = filename.toLowerCase() + text.slice(0, 500).toLowerCase();
      if (lower.includes('lease') || lower.includes('tenant') || lower.includes('rent')) {
        docType = DocumentType.LeaseAgreement;
      } else if (lower.includes('nda') || lower.includes('confidential')) {
        docType = DocumentType.NonDisclosureAgreement;
      }

      const analyzeRes = await fetch(`/api/audit/${uploadData.documentId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType: docType, rawText: text, filename }),
      });
      const analyzeData = await analyzeRes.json();

      if (analyzeData.success) {
        setReport(analyzeData.report);
        setActiveTab('audit');
      }
    } catch (err) {
      console.error('[App] Audit execution error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const displayedClauses = report?.clauses.filter((c) => {
    if (selectedFilter === 'risky') {
      return c.riskLevel === 'Critical' || c.riskLevel === 'Unfavorable' || c.riskLevel === 'Caution';
    }
    return true;
  }) || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#07090E] text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* WCAG Accessible Skip Link */}
      <SkipLink />

      {/* Legal Disclaimer Top Bar */}
      <DisclaimerBanner />

      {/* Sleek Floating Glass Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasAnalyzedDoc={Boolean(report)}
      />

      {/* Main Content Workspace */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
        {/* Pre-Audit Ingestion Studio */}
        {!report && !isLoading && (
          <div className="space-y-8 max-w-4xl mx-auto pt-2">
            <div className="text-center space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold shadow-sm">
                <Shield className="w-3.5 h-3.5" />
                Autonomous Contract Risk Intelligence & Self-Advocacy
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Demystify Complex Contracts with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">AI Risk Intelligence</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Scan agreements against established market benchmarks, uncover hidden liabilities, generate ready-to-send negotiation counter-drafts, and ask grounded questions directly to your contract.
              </p>
            </div>

            <FileUpload onUploadText={handleUploadAndAnalyze} isLoading={isLoading} />
          </div>
        )}

        {/* Accessible Loading State */}
        {isLoading && <LoadingState />}

        {/* Post-Audit Command Dashboard */}
        {report && !isLoading && (
          <div className="space-y-7">
            {/* Top Command Bar: Document Overview & Fairness Index Gauge */}
            <div className="stitch-glass rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-slate-700/50">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                    {report.documentType.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{report.clauseCount} clauses indexed</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{report.filename}</h2>
                <p className="text-xs text-slate-400">
                  Benchmarked against American Bar Association (ABA), URLTA, and Commercial Tech Standards.
                </p>
              </div>

              {/* High-Fidelity Score Card with Circular Gauge */}
              <div className="flex items-center gap-5 bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0">
                <div className="flex items-center gap-3.5">
                  {/* Circular SVG Gauge */}
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={
                          report.overallScore >= 75
                            ? 'text-emerald-400'
                            : report.overallScore >= 50
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                        strokeDasharray={`${report.overallScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-sm font-black text-white font-mono">
                      {report.overallScore}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-200">Fairness Index</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {report.overallScore >= 75 ? 'Balanced Terms' : report.overallScore >= 50 ? 'Moderate Exposure' : 'High Liability'}
                    </div>
                  </div>
                </div>

                <div className="h-10 w-px bg-slate-800" />

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <span className="text-emerald-400 font-semibold">{report.riskDistribution.standard} Fair</span>
                  <span className="text-amber-400 font-semibold">{report.riskDistribution.caution} Caution</span>
                  <span className="text-rose-400 font-semibold">{report.riskDistribution.unfavorable + report.riskDistribution.critical} Traps</span>
                  <span className="text-slate-400 font-mono">{report.wordCount} words</span>
                </div>
              </div>
            </div>

            {/* Tab 1: Risk Audit & Gotchas */}
            {activeTab === 'audit' && (
              <div className="space-y-7">
                {/* Gotchas Warning Cards */}
                <GotchasSummary gotchas={report.gotchas} />

                {/* Clause Breakdown with Filter Controls */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Clause-by-Clause Risk Breakdown & Market Benchmarks
                    </h3>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950/80 border border-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => setSelectedFilter('all')}
                        className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                          selectedFilter === 'all'
                            ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All Clauses ({report.clauses.length})
                      </button>
                      <button
                        onClick={() => setSelectedFilter('risky')}
                        className={`text-xs px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                          selectedFilter === 'risky'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Filter className="w-3 h-3" />
                        Flagged Exposures ({report.riskDistribution.caution + report.riskDistribution.unfavorable + report.riskDistribution.critical})
                      </button>
                    </div>
                  </div>

                  {/* Clause Cards List */}
                  <div className="grid grid-cols-1 gap-3.5">
                    {displayedClauses.map((clause) => (
                      <ClauseCard
                        key={clause.id}
                        clause={clause}
                        onOpenCounterDraft={(c) => setSelectedClauseForDraft(c)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Secondary Lazy-Loaded Workspaces with Suspense Boundaries */}
            <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400 font-mono animate-pulse">Initializing workspace module...</div>}>
              {/* Tab 2: Document Counsel Q&A Chat */}
              {activeTab === 'counsel' && <DocumentChat report={report} />}

              {/* Tab 3: Contract Comparator */}
              {activeTab === 'compare' && <ContractCompare />}

              {/* Tab 4: Compliance Tracker */}
              {activeTab === 'checklist' && <ComplianceChecklist items={report.checklist} />}

              {/* Tab 5: Attorney Brief */}
              {activeTab === 'brief' && <AttorneyBriefView brief={report.attorneyBrief} />}
            </Suspense>

            {/* Reset / New Audit Button */}
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setReport(null)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 underline underline-offset-4"
              >
                <RotateCcw className="w-3 h-3" />
                Upload or test another agreement
              </button>
            </div>
          </div>
        )}

        {/* If user clicks Compare tab without an uploaded document */}
        {!report && !isLoading && activeTab === 'compare' && (
          <div className="space-y-6">
            <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400 font-mono animate-pulse">Initializing Contract Comparator...</div>}>
              <ContractCompare />
            </Suspense>
          </div>
        )}
      </main>

      {/* Ready-to-Send Counter-Draft Modal */}
      <CounterDraftModal
        clause={selectedClauseForDraft}
        onClose={() => setSelectedClauseForDraft(null)}
      />

      {/* Enterprise SaaS Footer Landmark */}
      <Footer />
    </div>
  );
}
