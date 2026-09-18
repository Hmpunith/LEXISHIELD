import React, { useState } from 'react';
import { CheckSquare, Check, Copy, AlertTriangle } from 'lucide-react';
import { ComplianceChecklistItem } from '../../../server/types/legal';

interface ComplianceChecklistProps {
  items: ComplianceChecklistItem[];
}

export const ComplianceChecklist: React.FC<ComplianceChecklistProps> = ({ items }) => {
  const [checklist, setChecklist] = useState(items);
  const [copied, setCopied] = useState(false);

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = checklist.filter((i) => i.completed).length;
  const progressPct = Math.round((completedCount / (checklist.length || 1)) * 100);

  const handleCopy = () => {
    const text = checklist
      .map(
        (i) =>
          `[${i.completed ? 'X' : ' '}] (${i.category}) ${i.task} | Deadline: ${i.deadlineOrTrigger} | Risk: ${i.riskIfIgnored}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-brand-400" />
              Actionable Compliance & Negotiation Checklist
            </h2>
            <p className="text-xs text-slate-400">
              Generated checklist of critical obligations, milestones, and pre-execution safeguards.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 self-start sm:self-auto"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Checklist Copied!' : 'Export Checklist'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Progress: {completedCount} of {checklist.length} safeguards verified</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklist.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              item.completed
                ? 'bg-navy-950/60 border-slate-800/80 opacity-70'
                : 'bg-navy-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => {}} // Handled by parent div
              className="w-4 h-4 mt-0.5 rounded border-slate-700 text-brand-600 focus:ring-brand-500"
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded border border-brand-500/20">
                  {item.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">Trigger: {item.deadlineOrTrigger}</span>
              </div>
              <h3 className={`text-xs sm:text-sm font-semibold ${item.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                {item.task}
              </h3>
              <div className="text-xs text-rose-300/80 flex items-center gap-1.5 pt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Risk If Ignored: {item.riskIfIgnored}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
