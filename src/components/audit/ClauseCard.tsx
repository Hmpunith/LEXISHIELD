import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Scale, FileEdit, BookOpen } from 'lucide-react';
import { AuditedClause, RiskLevel } from '../../../server/types/legal';
import { RiskBadge } from '../shared/RiskBadge';

interface ClauseCardProps {
  clause: AuditedClause;
  onOpenCounterDraft: (clause: AuditedClause) => void;
}

export const ClauseCard: React.FC<ClauseCardProps> = ({ clause, onOpenCounterDraft }) => {
  const [expanded, setExpanded] = useState(false);

  const isRisky = clause.riskLevel === RiskLevel.Critical || clause.riskLevel === RiskLevel.Unfavorable;

  return (
    <article
      aria-labelledby={`clause-${clause.id}-title`}
      className={`stitch-glass rounded-xl p-4 sm:p-5 transition-all duration-200 ${
        isRisky ? 'border-amber-500/30 shadow-lg shadow-amber-950/15' : 'stitch-glass-hover'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-slate-800/90 text-cyan-400 px-2 py-0.5 rounded border border-slate-700">
            #{clause.clauseIndex}
          </span>
          <h3 id={`clause-${clause.id}-title`} className="text-sm font-bold text-white">
            {clause.title}
          </h3>
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">({clause.clauseType})</span>
        </div>
        <div className="flex items-center gap-2.5">
          <RiskBadge level={clause.riskLevel as any} />
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
            Risk: {clause.riskScore}/100
          </span>
        </div>
      </div>

      {/* Plain English Summary */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-200 mb-3 leading-relaxed">
        <strong className="text-cyan-300 font-semibold">Plain-English Translation:</strong> {clause.plainEnglishSummary}
      </div>

      {/* Market Deviation Analysis */}
      <div className="text-xs text-slate-400 mb-3.5 flex items-start gap-2">
        <Scale className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{clause.deviationAnalysis}</span>
      </div>

      {/* Actions Toolbar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition-colors"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Hide Raw Legal Text' : 'Inspect Raw Contract Provision'}
        </button>

        {clause.counterProposal && (
          <button
            onClick={() => onOpenCounterDraft(clause)}
            className="bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
          >
            <FileEdit className="w-3.5 h-3.5" />
            Counter-Draft Proposal
          </button>
        )}
      </div>

      {/* Expandable Dual-View Inspector */}
      {expanded && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] font-bold text-slate-400 mb-1.5 font-mono">UPLOADED AGREEMENT TEXT:</div>
            <pre className="bg-slate-950 p-3 rounded-lg text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed border border-slate-800">
              {clause.text}
            </pre>
          </div>

          {clause.matchedBenchmarkText && (
            <div>
              <div className="text-[11px] font-bold text-emerald-400 mb-1.5 font-mono flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                RECOGNIZED MARKET BENCHMARK:
              </div>
              <pre className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-lg text-xs text-emerald-200 font-mono whitespace-pre-wrap leading-relaxed">
                {clause.matchedBenchmarkText}
              </pre>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
