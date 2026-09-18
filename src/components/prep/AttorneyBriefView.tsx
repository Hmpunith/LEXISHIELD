import React, { useState } from 'react';
import { Briefcase, Copy, Check, HelpCircle, FileText } from 'lucide-react';
import { AttorneyBrief } from '../../../server/types/legal';

interface AttorneyBriefViewProps {
  brief: AttorneyBrief;
}

export const AttorneyBriefView: React.FC<AttorneyBriefViewProps> = ({ brief }) => {
  const [copied, setCopied] = useState(false);

  const formattedBrief = `LEXISHIELD CLIENT CONSULTATION BRIEF
==================================================
DOCUMENT AUDIT SUMMARY:
${brief.documentSummary}

KEY HIGH-RISK CONCERNS IDENTIFIED:
${brief.keyRisksIdentified.map((r, i) => `${i + 1}. ${r}`).join('\n')}

TARGETED QUESTIONS FOR LICENSED ATTORNEY:
${brief.suggestedQuestionsForAttorney.map((q, i) => `${i + 1}. ${q}`).join('\n')}

RECOMMENDED NEGOTIATION REDLINES:
${brief.recommendedNegotiationPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

JURISDICTION & VENUE OBSERVATIONS:
${brief.jurisdictionNotes}
==================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedBrief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-400" />
              Attorney Consultation Prep Kit
            </h2>
            <p className="text-xs text-slate-400">
              Save hundreds of dollars in legal billable hours by bringing targeted, high-value questions directly to your attorney.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-brand-600/20"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Brief Copied!' : 'Copy Consultation Brief'}
          </button>
        </div>

        <div className="bg-navy-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed mb-6">
          {brief.documentSummary}
        </div>

        {/* Suggested Questions */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-brand-400" />
            High-Priority Questions to Ask Your Lawyer:
          </h3>
          <div className="grid grid-cols-1 gap-2.5">
            {brief.suggestedQuestionsForAttorney.map((q, idx) => (
              <div key={idx} className="bg-navy-950 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                <span className="text-xs font-mono font-bold bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded">
                  Q{idx + 1}
                </span>
                <p className="text-xs text-slate-200 font-medium">{q}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Redline Recommendations */}
        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            Recommended Counterparty Redlines:
          </h3>
          <div className="grid grid-cols-1 gap-2.5">
            {brief.recommendedNegotiationPoints.map((p, idx) => (
              <div key={idx} className="bg-navy-950 border border-emerald-950/40 rounded-xl p-3 text-xs text-emerald-200">
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
