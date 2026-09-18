import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Legal Disclaimer"
      className="bg-slate-900/50 border-b border-slate-800/60 px-4 py-2 text-[11px] text-slate-300 flex items-center justify-center gap-2 backdrop-blur-md"
    >
      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
      <span>
        <strong className="text-slate-200">Educational Legal Assistance Tool:</strong> LexiShield provides automated clause breakdowns and market benchmark auditing for informational self-advocacy. It does <span className="underline decoration-amber-400 font-medium">not</span> provide legal representation or attorney-client privilege. Consult a licensed attorney for binding legal matters.
      </span>
      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0 hidden md:inline" aria-hidden="true" />
    </div>
  );
};
