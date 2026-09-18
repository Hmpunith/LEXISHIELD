import React from 'react';
import { Shield, FileSearch, MessageSquareText, GitCompare, CheckSquare, Briefcase } from 'lucide-react';

export type NavTab = 'audit' | 'counsel' | 'compare' | 'checklist' | 'brief';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  hasAnalyzedDoc: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, hasAnalyzedDoc }) => {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode; requiresDoc?: boolean }> = [
    { id: 'audit', label: 'Contract Audit & Gotchas', icon: <FileSearch className="w-4 h-4" /> },
    { id: 'counsel', label: 'Document Counsel (Q&A)', icon: <MessageSquareText className="w-4 h-4" />, requiresDoc: true },
    { id: 'compare', label: 'Contract Comparator', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'checklist', label: 'Compliance Checklist', icon: <CheckSquare className="w-4 h-4" />, requiresDoc: true },
    { id: 'brief', label: 'Attorney Brief', icon: <Briefcase className="w-4 h-4" />, requiresDoc: true },
  ];

  return (
    <header role="banner" className="bg-navy-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-brand-500/20 border border-brand-500/40 p-2 rounded-xl text-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/10">
              <Shield className="w-6 h-6 text-brand-400" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Lexi<span className="text-brand-400">Shield</span>
                <span className="bg-brand-500/10 text-brand-400 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-brand-500/30">
                  v1.0 AI
                </span>
              </span>
              <p className="text-xs text-slate-400 hidden sm:block">Legal Risk Intelligence & Benchmark Auditing</p>
            </div>
          </div>

          {/* Navigation Landmarks & Tabs */}
          <nav role="navigation" aria-label="Primary Navigation" className="flex items-center gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isDisabled = tab.requiresDoc && !hasAnalyzedDoc;

              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && onSelectTab(tab.id)}
                  disabled={isDisabled}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                      : isDisabled
                      ? 'text-slate-600 cursor-not-allowed opacity-50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
