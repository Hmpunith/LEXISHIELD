import React, { useState } from 'react';
import { UploadCloud, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
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
    if (e.type === 'dragenter' || e.type === 'dragover') {setDragActive(true);}
    else if (e.type === 'dragleave') {setDragActive(false);}
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
    if (!manualText.trim()) {return;}
    onUploadText(manualText, filename);
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Sample Selectors */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <h2 className="text-sm font-semibold text-slate-200">Test Instantly with Curated Market Agreements</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_CONTRACTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                selectedSampleId === sample.id
                  ? 'bg-brand-950/60 border-brand-500 shadow-md shadow-brand-500/10'
                  : 'bg-navy-900/50 border-slate-800 hover:border-slate-700 hover:bg-navy-900'
              }`}
            >
              {selectedSampleId === sample.id && (
                <CheckCircle2 className="w-4 h-4 text-brand-400 absolute top-3 right-3" />
              )}
              <div className="text-xs font-bold text-white mb-1 pr-5">{sample.name}</div>
              <div className="text-[11px] text-brand-400 font-semibold mb-1.5">{sample.category}</div>
              <div className="text-[11px] text-slate-400 line-clamp-2">{sample.riskDescription}</div>
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
            ? 'border-brand-400 bg-brand-500/10'
            : 'border-slate-800 bg-navy-900/40 hover:border-slate-700'
        }`}
      >
        <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" aria-hidden="true" />
        <h3 className="text-sm font-bold text-white mb-1">
          Drag & Drop your contract file here, or{' '}
          <label className="text-brand-400 hover:text-brand-300 underline cursor-pointer">
            browse files
            <input
              type="file"
              accept=".txt,.pdf,.md"
              onChange={handleFileInput}
              className="sr-only"
            />
          </label>
        </h3>
        <p className="text-xs text-slate-400 mb-4">Supported formats: .txt, .pdf, .md (Up to 10 MB)</p>

        {/* Text Area for Pasting */}
        <div className="text-left mt-4">
          <label htmlFor="contract-text-input" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-brand-400" />
            Or paste legal contract text directly:
          </label>
          <textarea
            id="contract-text-input"
            rows={7}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Paste your legal agreement terms, clauses, lease, or NDA here..."
            className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono resize-y"
          />
        </div>

        {/* Submit Button */}
        <div className="mt-4 flex items-center justify-end gap-3">
          {manualText.length > 0 && (
            <span className="text-xs text-slate-400">
              {manualText.split(/\s+/).filter(Boolean).length} words ready
            </span>
          )}
          <button
            onClick={handleTriggerAnalysis}
            disabled={!manualText.trim() || isLoading}
            className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-brand-600/20 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isLoading ? 'Auditing Contract...' : 'Run Dual-Stage Audit'}
          </button>
        </div>
      </div>
    </div>
  );
};
