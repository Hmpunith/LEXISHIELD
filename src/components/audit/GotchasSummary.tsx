import React from 'react';
import { AlertOctagon, Lightbulb } from 'lucide-react';
import { GotchaWarning } from '../../../server/types/legal';
import { RiskBadge } from '../shared/RiskBadge';

interface GotchasSummaryProps {
  gotchas: GotchaWarning[];
}

export const GotchasSummary: React.FC<GotchasSummaryProps> = ({ gotchas }) => {
  if (!gotchas || gotchas.length === 0) {return null;}

  return (
    <section aria-labelledby="gotchas-heading" className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertOctagon className="w-5 h-5 text-rose-400" aria-hidden="true" />
        <h2 id="gotchas-heading" className="text-base sm:text-lg font-bold text-white">
          Before You Sign — Top Gotchas & Critical Liabilities
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {gotchas.map((item) => (
          <div
            key={item.id}
            className="bg-navy-900/80 border border-rose-500/20 rounded-xl p-4 flex flex-col justify-between shadow-lg shadow-rose-950/20 backdrop-blur-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <RiskBadge level={item.riskLevel as any} />
                <span className="text-[11px] font-mono text-slate-400">Clause #{item.relatedClauseIndex}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{item.title}</h3>
              <p className="text-xs text-slate-300 mb-3">{item.concern}</p>
            </div>

            <div className="bg-navy-950/80 border border-slate-800 rounded-lg p-2.5 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-[11px] text-amber-200/90 font-medium">
                <strong>Action:</strong> {item.recommendation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
