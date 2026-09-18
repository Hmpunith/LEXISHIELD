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
      className={`bg-navy-900/70 border rounded-xl p-4 transition-all ${
        isRisky ? 'border-amber-600/30 shadow-md shadow-amber-950/10' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
            #{clause.clauseIndex}
          </span>
          <h3 id={`clause-${clause.id}-title`} className="text-sm font-bold text-white">
            {clause.title}
          </h3>
          <span className="text-[11px] text-slate-400 hidden md:inline">({clause.clauseType})</span>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge level={clause.riskLevel as any} />
          <span className="text-xs font-mono text-slate-400">Score: {clause.riskScore}/100</span>
        </div>
      </div>

      {/* Plain English Summary */}
      <div className="bg-navy-950/60 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-200 mb-3 leading-relaxed">
        <strong className="text-brand-300 font-semibold">Plain-English Impact:</strong> {clause.plainEnglishSummary}
      </div>

      {/* Market Deviation Analysis */}
      <div className="text-xs text-slate-400 mb-3 flex items-start gap-2">
        <Scale className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
        <span>{clause.deviationAnalysis}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-white flex items-center gap-1 font-medium"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Hide Original Legal Text' : 'View Original Contract Text'}
        </button>

        {clause.counterProposal && (
          <button
            onClick={() => onOpenCounterDraft(clause)}
            className="bg-brand-600/20 hover:bg-brand-600/40 border border-brand-500/40 text-brand-300 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
          >
            <FileEdit className="w-3.5 h-3.5" />
            Counter-Draft Proposal
          </button>
        )}
      </div>

      {/* Expandable Original Text & Benchmark Comparison */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3">
          <div>
            <div className="text-[11px] font-bold text-slate-400 mb-1">RAW CONTRACT PROVISION:</div>
            <pre className="bg-navy-950 p-2.5 rounded text-xs text-slate-300 font-mono whitespace-pre-wrap">
              {clause.text}
            </pre>
          </div>

          {clause.matchedBenchmarkText && (
            <div>
              <div className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                FAIR MARKET BENCHMARK STANDARD:
              </div>
              <pre className="bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded text-xs text-emerald-200 font-mono whitespace-pre-wrap">
                {clause.matchedBenchmarkText}
              </pre>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
