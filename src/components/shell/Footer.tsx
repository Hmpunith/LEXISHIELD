import React from 'react';
import { Shield, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer role="contentinfo" className="bg-navy-950 border-t border-slate-800/80 pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1: Brand & Mission */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-brand-500/20 p-1.5 rounded-lg border border-brand-500/30">
              <Shield className="w-4 h-4 text-brand-400" aria-hidden="true" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">LexiShield</span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              Enterprise v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            Autonomous legal risk intelligence and contract navigation. Helping independent professionals, tenants, and growing enterprises decode complex agreements, benchmark terms, and negotiate with leverage.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Operational · In-Memory Fast Engine Active</span>
          </div>
        </div>

        {/* Col 2: Capabilities */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Capabilities</h3>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>Clause Segmentation</li>
            <li>Market Benchmarking</li>
            <li>Counter-Draft Engine</li>
            <li>Document Counsel Q&A</li>
            <li>Side-by-Side Diff</li>
          </ul>
        </div>

        {/* Col 3: Regulatory & Privacy */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-brand-400" />
            Privacy & Trust
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Zero third-party retention. Ingested legal agreements are processed ephemerally in volatile memory and never persisted for model retraining.
          </p>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Legal Disclaimer */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} LexiShield Systems. All rights reserved.</p>
        <p className="text-center sm:text-right max-w-xl text-[11px] text-slate-400">
          <strong>Notice:</strong> LexiShield is an informational self-advocacy and document review aid. It does not provide legal advice, legal representation, or attorney-client privilege.
        </p>
      </div>
    </footer>
  );
};
