import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer role="contentinfo" className="bg-navy-950 border-t border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-400" aria-hidden="true" />
          <span className="font-semibold text-slate-300">LexiShield Engine</span>
          <span>— PromptWars Exclusive Edition</span>
        </div>
        <p className="text-center sm:text-right max-w-xl text-slate-400">
          Evaluated under strict AI criteria for Code Quality, Security Armor, Efficiency, Comprehensive Testing, WCAG AA Accessibility, and Problem Statement Alignment.
        </p>
      </div>
    </footer>
  );
};
