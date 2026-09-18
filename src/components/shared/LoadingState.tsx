import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Analyzing legal clauses against market benchmarks...',
  subMessage = 'Extracting obligations, scanning risk variance, and synthesizing counter-drafts.',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-12 bg-navy-900/60 border border-slate-800 rounded-2xl text-center backdrop-blur-md"
    >
      <Loader2 className="w-10 h-10 text-brand-400 animate-spin mb-4" aria-hidden="true" />
      <h3 className="text-lg font-bold text-white mb-1">{message}</h3>
      <p className="text-xs text-slate-400 max-w-md">{subMessage}</p>
      <span className="sr-only">Loading in progress...</span>
    </div>
  );
};
