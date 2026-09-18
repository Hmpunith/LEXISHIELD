import React, { useState } from 'react';
import { UploadCloud, FileText, Sparkles, CheckCircle2, Shield, Zap, Lock } from 'lucide-react';
import { SAMPLE_CONTRACTS, SampleContract } from '../../data/sampleAgreements';

interface FileUploadProps {
  onUploadText: (text: string, filename: string) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadText, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [manualText, setManualText] = useState('');
  const [filename, setFilename] = useState('Agreement.txt');
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFilename(file.name);
      const text = await file.text();
      setManualText(text);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFilename(file.name);
      const text = await file.text();
      setManualText(text);
    }
  };

  const handleLoadSample = (sample: SampleContract) => {
    setSelectedSampleId(sample.id);
    setFilename(`${sample.name.replace(/\s+/g, '_')}.txt`);
    setManualText(sample.text);
  };

  const handleTriggerAnalysis = () => {
    if (!manualText.trim()) {
      return;
    }
    onUploadText(manualText, filename);
  };

  return (
    <div className="space-y-6">
      {/* 3 Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-2">
        <div className="stitch-glass p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">36+ Curated Standards</h3>
            <p className="text-[11px] text-slate-400">ABA, URLTA & Tech Model Clauses</p>
          </div>
        </div>

        <div className="stitch-glass p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Dual-Tier Risk Engine</h3>
            <p className="text-[11px] text-slate-400">Heuristic + Gemini 2.5 Flash</p>
          </div>
        </div>

        <div className="stitch-glass p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Zero Data Retention</h3>
            <p className="text-[11px] text-slate-400">Volatile In-Memory Processing</p>
          </div>
        </div>
      </div>

      {/* Pre-loaded Sample Selector */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Test Instantly with Standard Agreements</h2>
          </div>
          <span className="text-[11px] text-slate-400">Click to load pre-configured contract</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_CONTRACTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 relative ${
                selectedSampleId === sample.id
                  ? 'stitch-card-active bg-slate-900/90'
                  : 'stitch-glass stitch-glass-hover'
              }`}
            >
              {selectedSampleId === sample.id && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400 absolute top-3.5 right-3.5" />
              )}
              <div className="text-xs font-bold text-white mb-1 pr-6">{sample.name}</div>
              <div className="text-[11px] text-cyan-400 font-semibold mb-1.5">{sample.category}</div>
              <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{sample.riskDescription}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10 shadow-2xl shadow-cyan-500/20'
            : 'border-slate-800 stitch-glass hover:border-slate-700'
        }`}
      >
        <UploadCloud className="w-9 h-9 text-cyan-400 mx-auto mb-2.5" aria-hidden="true" />
        <h3 className="text-sm font-bold text-white mb-1">
          Drop your contract document here, or{' '}
          <label className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer font-semibold">
            browse local files
            <input
              type="file"
              accept=".txt,.pdf,.md"
              onChange={handleFileInput}
              className="sr-only"
            />
          </label>
        </h3>
        <p className="text-xs text-slate-400 mb-4">Supports .txt, .pdf, .md (Up to 10 MB)</p>

        {/* Text Area for Pasting */}
        <div className="text-left mt-4">
          <label htmlFor="contract-text-input" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Or inspect contract text directly:
            </span>
            {filename && <span className="text-[11px] font-mono text-slate-400">File: {filename}</span>}
          </label>
          <textarea
            id="contract-text-input"
            rows={7}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Paste your legal agreement terms, clauses, lease, or NDA here..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono resize-y leading-relaxed"
          />
        </div>

        {/* Submit Action Bar */}
        <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono">
            {manualText ? `${manualText.split(/\s+/).filter(Boolean).length} words ready for audit` : 'No document selected'}
          </span>
          <button
            onClick={handleTriggerAnalysis}
            disabled={!manualText.trim() || isLoading}
            className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isLoading ? 'Executing Audit...' : 'Run Dual-Stage Audit'}
          </button>
        </div>
      </div>
    </div>
  );
};
