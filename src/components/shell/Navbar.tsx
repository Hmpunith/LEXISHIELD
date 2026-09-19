import React from 'react';
import { Shield, FileSearch, MessageSquareText, GitCompare, CheckSquare, Briefcase, Sparkles } from 'lucide-react';

export type NavTab = 'audit' | 'counsel' | 'compare' | 'checklist' | 'brief';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  hasAnalyzedDoc: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, hasAnalyzedDoc }) => {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode; requiresDoc?: boolean }> = [
    { id: 'audit', label: 'Risk Audit & Gotchas', icon: <FileSearch className="w-4 h-4" /> },
    { id: 'counsel', label: 'Document Counsel (Q&A)', icon: <MessageSquareText className="w-4 h-4" />, requiresDoc: true },
    { id: 'compare', label: 'Contract Comparator', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'checklist', label: 'Compliance Tracker', icon: <CheckSquare className="w-4 h-4" />, requiresDoc: true },
    { id: 'brief', label: 'Attorney Brief', icon: <Briefcase className="w-4 h-4" />, requiresDoc: true },
  ];

  return (
    <header role="banner" className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 pt-3 pb-2">
      <div className="max-w-7xl mx-auto stitch-glass rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between shadow-2xl">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-indigo-600 p-2 rounded-xl text-white flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Lexi<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Shield</span>
              <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                AI
              </span>
            </span>
          </div>
        </div>

        {/* Navigation Landmark & Segmented Tab Switcher */}
        <nav role="tablist" aria-label="Primary Workspace Navigation" className="flex items-center gap-1 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isDisabled = tab.requiresDoc && !hasAnalyzedDoc;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-label={tab.label}
                aria-selected={isActive}
                onClick={() => {
                  if (!isDisabled) {
                    onSelectTab(tab.id);
                  }
                }}
                disabled={isDisabled}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20 font-bold'
                    : isDisabled
                    ? 'text-slate-600 cursor-not-allowed opacity-40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {tab.icon}
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
