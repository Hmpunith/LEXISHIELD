import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Mail } from 'lucide-react';
import { AuditedClause } from '../../../server/types/legal';

interface CounterDraftModalProps {
  clause: AuditedClause | null;
  onClose: () => void;
}

export const CounterDraftModal: React.FC<CounterDraftModalProps> = ({ clause, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!clause || !clause.counterProposal) {return null;}

  const emailDraft = `Dear Counterparty,

Regarding Section ${clause.clauseIndex} (${clause.title}):
In reviewing our agreement against customary commercial standards, we noted that the current ${clause.clauseType} language imposes unilateral exposure. To ensure a balanced and mutually protective relationship, we propose replacing the current clause with the following standard language:

"${clause.counterProposal.proposedClause}"

Rationale:
${clause.counterProposal.rationale}

Please let us know if this works so we can finalize the agreement.

Best regards,`;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-navy-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close Counter-Draft Dialog"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand-400" />
          <h3 id="modal-title" className="text-lg font-bold text-white">
            Negotiation-Ready Counter-Draft & Email Script
          </h3>
        </div>

        <div className="bg-navy-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="text-xs font-semibold text-brand-300">Original Risky Term:</div>
          <p className="text-xs text-slate-300 italic">"{clause.text}"</p>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
          <div className="text-xs font-semibold text-emerald-400">Fair Counter-Proposal:</div>
          <p className="text-xs text-emerald-200 font-medium">"{clause.counterProposal.proposedClause}"</p>
        </div>

        <div>
          <div className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-brand-400" />
            Ready-to-Send Negotiation Email
          </div>
          <pre className="bg-navy-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
            {emailDraft}
          </pre>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-600/20"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Negotiation Email'}
          </button>
        </div>
      </div>
    </div>
  );
};
