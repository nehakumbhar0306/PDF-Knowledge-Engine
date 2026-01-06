
import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface UploaderProps {
  onFilesAccepted: (files: File[]) => void;
  isProcessing: boolean;
  progress: number;
}

const Uploader: React.FC<UploaderProps> = ({ onFilesAccepted, isProcessing, progress }) => {
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const validFiles: File[] = [];
    let hasError = false;

    Array.from(files).forEach(file => {
      if (file.type !== 'application/pdf') {
        hasError = true;
      } else {
        validFiles.push(file);
      }
    });

    if (hasError) {
      setError("Document type restricted to PDF for structural fidelity.");
      setTimeout(() => setError(null), 4000);
    }

    if (validFiles.length > 0) {
      onFilesAccepted(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-8">
      <div 
        className={`relative border-2 border-dashed rounded-[2.5rem] p-16 transition-all flex flex-col items-center justify-center bg-white overflow-hidden ${
          dragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-200 hover:border-indigo-300'
        } ${isProcessing ? 'opacity-40 pointer-events-none grayscale' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          multiple 
          accept=".pdf"
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={(e) => handleFiles(e.target.files)}
        />
        
        <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-200 transform -rotate-6 group-hover:rotate-0 transition-transform">
          <Upload size={32} />
        </div>
        
        <h3 className="text-2xl font-black mb-2 tracking-tight">Add Enterprise Assets</h3>
        <p className="text-slate-500 mb-8 text-center max-w-sm font-medium leading-relaxed">
          Reports, manuals, or scans. Our multimodal engine extracts structure, tables, and charts.
        </p>
        
        <button 
          onClick={() => inputRef.current?.click()}
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-500/30 transition-all active:scale-95"
        >
          Select PDF Files
        </button>

        {error && (
          <div className="mt-8 flex items-center gap-2 text-rose-500 font-bold bg-rose-50 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-200">
            <AlertCircle size={18} />
            <span className="text-xs uppercase tracking-tight">{error}</span>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute bottom-6 right-6 opacity-20 pointer-events-none flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400">
           <ShieldCheck size={14} />
           ENCRYPTED UPLOAD
        </div>
      </div>

      {isProcessing && (
        <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-top-10 duration-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500 w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse">
                <Loader2 className="animate-spin" size={24} />
              </div>
              <div>
                <h4 className="font-black text-xl tracking-tight">Deconstructing Structure...</h4>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Gemini 3 Multimodal Pipeline</p>
              </div>
            </div>
            <div className="text-right">
               <span className="text-4xl font-black text-indigo-400">{Math.round(progress)}%</span>
            </div>
          </div>
          
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-8">
            <div 
              className="bg-indigo-500 h-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatusStep label="Layout Parsing" active={progress > 15} />
            <StatusStep label="Table Extraction" active={progress > 45} />
            <StatusStep label="OCR Enhancement" active={progress > 75} />
            <StatusStep label="Vector Sync" active={progress > 90} />
          </div>
        </div>
      )}
    </div>
  );
};

const StatusStep = ({ label, active }: { label: string, active: boolean }) => (
  <div className={`flex items-center gap-3 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-30'}`}>
    <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`} />
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </div>
);

export default Uploader;
