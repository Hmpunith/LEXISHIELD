import React, { useState } from 'react';
import { GitCompare, Award } from 'lucide-react';
import { DocumentComparisonResult } from '../../../server/types/legal';
import { SAMPLE_CONTRACTS } from '../../data/sampleAgreements';

export const ContractCompare: React.FC = () => {
  const [docAName, setDocAName] = useState('Standard Fair NDA');
  const [docAText, setDocAText] = useState(SAMPLE_CONTRACTS[2].text);
  const [docBName, setDocBName] = useState('Predatory Service Agreement');
  const [docBText, setDocBText] = useState(SAMPLE_CONTRACTS[0].text);
  const [result, setResult] = useState<DocumentComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunComparison = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/compare/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docAText, docAName, docBText, docBName }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.comparison);
      }
    } catch {
      // Offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-navy-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <GitCompare className="w-5 h-5 text-brand-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            Contract Comparator & Side-by-Side Clause Diff
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Compare two versions of an agreement or evaluate competing contracts to instantly detect missing clauses, one-sided shifts, and risk divergence.
        </p>

        {/* Dual Input Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <input
              type="text"
              value={docAName}
              onChange={(e) => setDocAName(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-brand-300"
            />
            <textarea
              rows={8}
              value={docAText}
              onChange={(e) => setDocAText(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono resize-y"
            />
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={docBName}
              onChange={(e) => setDocBName(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-300"
            />
            <textarea
              rows={8}
              value={docBText}
              onChange={(e) => setDocBText(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono resize-y"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleRunComparison}
            disabled={isLoading}
            className="bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-brand-600/20"
          >
            {isLoading ? 'Comparing Clauses...' : 'Run Side-by-Side Comparison'}
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {result && (
        <div className="space-y-4">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2">Executive Comparison Summary</h3>
            <p className="text-xs text-slate-300 mb-4">{result.summaryOfDifferences}</p>
            <div className="bg-brand-950/40 border border-brand-500/30 rounded-xl p-3 text-xs text-brand-300 font-medium">
              <strong>Recommendation:</strong> {result.negotiationRecommendation}
            </div>
          </div>

          {/* Clause-by-Clause Comparison Table */}
          <div className="space-y-3">
            {result.clauseComparisons.map((item, idx) => (
              <div key={idx} className="bg-navy-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{item.clauseType}</span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      item.winner === 'Document A'
                        ? 'bg-brand-500/10 text-brand-400 border-brand-500/30'
                        : item.winner === 'Document B'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Award className="w-3 h-3" />
                    Better Terms: {item.winner}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{item.analysis}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-navy-950 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] font-bold text-brand-300 mb-1">{docAName}:</div>
                    <div className="text-xs text-slate-400 font-mono line-clamp-3">{item.docAText}</div>
                  </div>
                  <div className="bg-navy-950 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] font-bold text-amber-300 mb-1">{docBName}:</div>
                    <div className="text-xs text-slate-400 font-mono line-clamp-3">{item.docBText}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
