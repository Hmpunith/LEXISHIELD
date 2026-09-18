import React from 'react';
import { AlertOctagon, Lightbulb } from 'lucide-react';
import { GotchaWarning } from '../../../server/types/legal';
import { RiskBadge } from '../shared/RiskBadge';

interface GotchasSummaryProps {
  gotchas: GotchaWarning[];
}

export const GotchasSummary: React.FC<GotchasSummaryProps> = ({ gotchas }) => {
  if (!gotchas || gotchas.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="gotchas-heading" className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertOctagon className="w-4 h-4" aria-hidden="true" />
          </div>
          <h2 id="gotchas-heading" className="text-base font-bold text-white">
            Before You Sign — Top Critical Gotchas
          </h2>
        </div>
        <span className="text-xs text-slate-400">Identified {gotchas.length} primary exposure points</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {gotchas.map((item) => (
          <div
            key={item.id}
            className="stitch-glass rounded-xl p-4 flex flex-col justify-between border-rose-500/20 shadow-lg shadow-rose-950/10"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <RiskBadge level={item.riskLevel as any} />
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                  Clause #{item.relatedClauseIndex}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white mb-1.5">{item.title}</h3>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">{item.concern}</p>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3 flex items-start gap-2.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-[11px] text-amber-200/90 leading-relaxed font-medium">
                <strong className="text-amber-300">Action:</strong> {item.recommendation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
