import React, { useState } from 'react';
import { Navbar, NavTab } from './components/shell/Navbar';
import { Footer } from './components/shell/Footer';
import { SkipLink } from './components/shell/SkipLink';
import { DisclaimerBanner } from './components/shell/DisclaimerBanner';
import { FileUpload } from './components/shared/FileUpload';
import { LoadingState } from './components/shared/LoadingState';
import { GotchasSummary } from './components/audit/GotchasSummary';
import { ClauseCard } from './components/audit/ClauseCard';
import { CounterDraftModal } from './components/audit/CounterDraftModal';
import { DocumentChat } from './components/counsel/DocumentChat';
import { ContractCompare } from './components/compare/ContractCompare';
import { ComplianceChecklist } from './components/prep/ComplianceChecklist';
import { AttorneyBriefView } from './components/prep/AttorneyBriefView';
import { AuditReport, AuditedClause, DocumentType } from '../server/types/legal';
import { Shield, Sparkles, Filter } from 'lucide-react';

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
        body: JSON.stringify({ documentType: docType }),
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
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* WCAG Accessible Skip Link */}
      <SkipLink />

      {/* Prominent Legal Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Semantic Accessible Header & Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasAnalyzedDoc={Boolean(report)}
      />

      {/* Main Content Landmark */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
        {/* Document Ingestion Zone */}
        {!report && !isLoading && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-3 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                Autonomous Contract Risk Intelligence & Self-Advocacy
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Demystify Complex Contracts with <span className="text-brand-400">AI Risk Intelligence</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Scan agreements against market benchmarks, detect predatory liabilities, generate negotiation counter-drafts, and ask questions grounded directly in your legal text.
              </p>
            </div>

            <FileUpload onUploadText={handleUploadAndAnalyze} isLoading={isLoading} />
          </div>
        )}

        {/* Loading Spinner with Accessible Status */}
        {isLoading && <LoadingState />}

        {/* Post-Audit Dashboard */}
        {report && !isLoading && (
          <div className="space-y-8">
            {/* Top Document Status & Score Banner */}
            <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono font-bold bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded">
                    {report.documentType.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{report.clauseCount} clauses indexed</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{report.filename}</h2>
                <p className="text-xs text-slate-400">
                  Benchmarked against ABA, URLTA, and Commercial Tech Standards.
                </p>
              </div>

              {/* Overall Health Score Card */}
              <div className="flex items-center gap-4 bg-navy-950 p-4 rounded-xl border border-slate-800 shrink-0">
                <div className="text-center">
                  <div
                    className={`text-3xl font-black ${
                      report.overallScore >= 75
                        ? 'text-emerald-400'
                        : report.overallScore >= 50
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {report.overallScore}/100
                  </div>
                  <div className="text-[10px] uppercase font-mono text-slate-400">Fairness Index</div>
                </div>

                <div className="h-10 w-px bg-slate-800" />

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <span className="text-emerald-400 font-semibold">{report.riskDistribution.standard} Fair</span>
                  <span className="text-amber-400 font-semibold">{report.riskDistribution.caution} Caution</span>
                  <span className="text-rose-400 font-semibold">{report.riskDistribution.unfavorable + report.riskDistribution.critical} Traps</span>
                  <span className="text-slate-400">{report.wordCount} words</span>
                </div>
              </div>
            </div>

            {/* Tab 1: Audit & Gotchas */}
            {activeTab === 'audit' && (
              <div className="space-y-8">
                {/* Gotchas Warning Cards */}
                <GotchasSummary gotchas={report.gotchas} />

                {/* Clause Breakdown with Filter Controls */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-400" />
                      Clause-by-Clause Risk Breakdown & Market Deviations
                    </h3>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-2 self-start sm:self-auto bg-navy-900 border border-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => setSelectedFilter('all')}
                        className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                          selectedFilter === 'all'
                            ? 'bg-brand-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All Clauses ({report.clauses.length})
                      </button>
                      <button
                        onClick={() => setSelectedFilter('risky')}
                        className={`text-xs px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                          selectedFilter === 'risky'
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Filter className="w-3 h-3" />
                        Flagged Risks ({report.riskDistribution.caution + report.riskDistribution.unfavorable + report.riskDistribution.critical})
                      </button>
                    </div>
                  </div>

                  {/* Clause Cards List */}
                  <div className="grid grid-cols-1 gap-4">
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

            {/* Tab 2: Document Counsel Q&A Chat */}
            {activeTab === 'counsel' && <DocumentChat report={report} />}

            {/* Tab 3: Contract Comparator */}
            {activeTab === 'compare' && <ContractCompare />}

            {/* Tab 4: Compliance Checklist */}
            {activeTab === 'checklist' && <ComplianceChecklist items={report.checklist} />}

            {/* Tab 5: Attorney Brief */}
            {activeTab === 'brief' && <AttorneyBriefView brief={report.attorneyBrief} />}

            {/* Reset / New Audit Button */}
            <div className="pt-6 flex justify-center">
              <button
                onClick={() => setReport(null)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Upload or test another agreement
              </button>
            </div>
          </div>
        )}

        {/* If user clicks Compare tab without an uploaded document */}
        {!report && !isLoading && activeTab === 'compare' && (
          <div className="space-y-6">
            <ContractCompare />
          </div>
        )}
      </main>

      {/* Ready-to-Send Counter-Draft Modal */}
      <CounterDraftModal
        clause={selectedClauseForDraft}
        onClose={() => setSelectedClauseForDraft(null)}
      />

      {/* Semantic Accessible Footer Landmark */}
      <Footer />
    </div>
  );
}
