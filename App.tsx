
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import Uploader from './components/Uploader';
import Search from './components/Search';
import Stats from './components/Stats';
import DocumentDetails from './components/DocumentDetails';
import { GeminiService } from './services/geminiService';
import { DocumentKnowledge, ProcessingStatus } from './types';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';

declare const pdfjsLib: any;

const STORAGE_KEY = 'enterprise_pdf_knowledge_base';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'search' | 'stats'>('upload');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Initialize state from LocalStorage
  const [knowledgeBase, setKnowledgeBase] = useState<DocumentKnowledge[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load knowledge base from local storage", e);
      return [];
    }
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(knowledgeBase));
  }, [knowledgeBase]);

  // Handle Online/Offline Status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const geminiService = useMemo(() => new GeminiService(), []);

  const selectedDoc = useMemo(() => 
    knowledgeBase.find(d => d.id === selectedDocId),
    [knowledgeBase, selectedDocId]
  );

  const processPDF = useCallback(async (file: File) => {
    if (!isOnline) {
      alert("AI Processing requires an active internet connection. Please reconnect to process new documents.");
      return;
    }

    setProcessingStatus('processing');
    setProgress(5);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      
      let allSections: any[] = [];
      let allTables: any[] = [];
      let allVisuals: any[] = [];
      let fullText = "";

      const pagesToProcess = Math.min(numPages, 5); 
      
      for (let i = 1; i <= pagesToProcess; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          
          setProgress(10 + ((i / pagesToProcess) * 85));
          
          const extracted = await geminiService.processPage(base64Image, file.name, i);
          
          allSections = [...allSections, ...(extracted.sections || [])];
          allTables = [...allTables, ...(extracted.tables || [])];
          allVisuals = [...allVisuals, ...(extracted.visuals || [])];
          fullText += (extracted.fullText || "") + "\n\n";
        }
      }

      const newDoc: DocumentKnowledge = {
        id: crypto.randomUUID(),
        fileName: file.name,
        fileSize: file.size,
        processedAt: Date.now(),
        sections: allSections,
        tables: allTables,
        visuals: allVisuals,
        fullText
      };

      setKnowledgeBase(prev => [newDoc, ...prev]);
      setProcessingStatus('completed');
      setProgress(100);
      
      setTimeout(() => {
        setProcessingStatus('idle');
        setProgress(0);
        setSelectedDocId(newDoc.id);
      }, 1000);

    } catch (error) {
      console.error("Critical Processing Error:", error);
      setProcessingStatus('error');
      alert("Processing failed. Please check your API key and file format.");
    }
  }, [geminiService, isOnline]);

  const handleSearch = useCallback(async (query: string) => {
    if (!isOnline) {
      // Basic local fallback if offline
      return knowledgeBase
        .filter(doc => doc.fullText.toLowerCase().includes(query.toLowerCase()))
        .map(doc => ({
          docId: doc.id,
          snippet: "Offline mode: Basic keyword match found.",
          relevance: 0.5,
          reason: "LOCAL SEARCH"
        }));
    }
    return await geminiService.semanticSearch(query, knowledgeBase);
  }, [geminiService, knowledgeBase, isOnline]);

  const clearDatabase = () => {
    if (confirm("Are you sure you want to wipe the local knowledge database? This action cannot be undone.")) {
      setKnowledgeBase([]);
      localStorage.removeItem(STORAGE_KEY);
      setSelectedDocId(null);
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={(tab) => { setActiveTab(tab); setSelectedDocId(null); }}
      isOnline={isOnline}
    >
      {selectedDoc ? (
        <div className="animate-in fade-in duration-300">
          <button 
            onClick={() => setSelectedDocId(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to {activeTab === 'upload' ? 'Knowledge Intake' : 'Search Results'}
          </button>
          <DocumentDetails doc={selectedDoc} />
        </div>
      ) : (
        <>
          {activeTab === 'upload' && (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full mb-4 border border-indigo-100">
                  {isOnline ? (
                    <><Wifi size={14} className="text-emerald-500" /><span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">AI Service Online</span></>
                  ) : (
                    <><WifiOff size={14} className="text-rose-500" /><span className="text-[10px] font-bold text-rose-600 uppercase tracking-tighter">Offline - Local Only</span></>
                  )}
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Knowledge Intake</h2>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                  Structured data is stored <b>locally</b> on this device for privacy and speed.
                </p>
              </div>
              
              <Uploader 
                onFilesAccepted={(files) => processPDF(files[0])} 
                isProcessing={processingStatus === 'processing'}
                progress={progress}
              />

              {knowledgeBase.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Local Knowledge Assets</h3>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded">Total Size: {(JSON.stringify(knowledgeBase).length / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {knowledgeBase.map(doc => (
                      <button 
                        key={doc.id} 
                        onClick={() => setSelectedDocId(doc.id)}
                        className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{doc.fileName}</p>
                            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-tighter">
                              {doc.sections.length} Sections • {doc.tables.length} Tables
                            </p>
                          </div>
                        </div>
                        <div className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="animate-in fade-in duration-500">
              <Search 
                knowledgeBase={knowledgeBase} 
                onSearch={handleSearch} 
                onViewDoc={(id) => setSelectedDocId(id)} 
              />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="animate-in fade-in duration-500">
              <Stats knowledgeBase={knowledgeBase} onClearDatabase={clearDatabase} />
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default App;
