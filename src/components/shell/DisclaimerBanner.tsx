import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Legal Disclaimer"
      className="bg-amber-950/40 border-b border-amber-600/30 px-4 py-2.5 text-xs text-amber-200/90 flex items-center justify-center gap-2 backdrop-blur-sm"
    >
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
      <span>
        <strong className="font-semibold text-amber-300">Educational Legal Assistance Tool:</strong> LexiShield produces automated risk indicators and benchmark comparisons for informational guidance. It does <span className="underline font-medium">not</span> provide legal advice or create an attorney-client relationship. Always consult a licensed attorney before signing binding agreements.
      </span>
      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 hidden md:inline" aria-hidden="true" />
    </div>
  );
};
