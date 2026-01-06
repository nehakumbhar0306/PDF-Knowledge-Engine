
import React, { useState } from 'react';
import { DocumentKnowledge, ExtractedTable, ExtractedSection, ExtractedVisual } from '../types';
import { LayoutGrid, Table as TableIcon, Image as ImageIcon, FileText, ChevronRight, Download } from 'lucide-react';

interface DocumentDetailsProps {
  doc: DocumentKnowledge;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ doc }) => {
  const [activeView, setActiveView] = useState<'sections' | 'tables' | 'visuals'>('sections');

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(doc, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `${doc.fileName.split('.')[0]}_knowledge.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row h-[calc(100vh-220px)]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 border-r border-slate-100 bg-slate-50/50 p-6 flex flex-col">
        <div className="mb-8">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-2">Local Asset Insight</span>
          <h3 className="font-bold text-slate-900 leading-tight truncate" title={doc.fileName}>{doc.fileName}</h3>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-tighter">
            Size: {(doc.fileSize / 1024).toFixed(1)} KB
          </p>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button
            onClick={() => setActiveView('sections')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeView === 'sections' ? 'bg-white shadow-sm border border-slate-200 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText size={18} />
              <span className="text-sm">Sections</span>
            </div>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{doc.sections.length}</span>
          </button>
          
          <button
            onClick={() => setActiveView('tables')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeView === 'tables' ? 'bg-white shadow-sm border border-slate-200 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <TableIcon size={18} />
              <span className="text-sm">Data Tables</span>
            </div>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{doc.tables.length}</span>
          </button>

          <button
            onClick={() => setActiveView('visuals')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeView === 'visuals' ? 'bg-white shadow-sm border border-slate-200 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <ImageIcon size={18} />
              <span className="text-sm">Visual Assets</span>
            </div>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{doc.visuals.length}</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
           <button 
            onClick={exportData}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200"
           >
             <Download size={16} />
             Export Knowledge
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-10 bg-white">
        {activeView === 'sections' && (
          <div className="space-y-12">
            {doc.sections.map((section, i) => (
              <div key={section.id} className="animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black text-slate-300">SECTION 0{i+1}</span>
                  <h4 className={`font-black text-slate-900 tracking-tight ${section.level === 1 ? 'text-3xl' : 'text-xl'}`}>
                    {section.title}
                  </h4>
                </div>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === 'tables' && (
          <div className="space-y-12">
            {doc.tables.length > 0 ? doc.tables.map((table, i) => (
              <div key={table.id} className="animate-in zoom-in-95 duration-300">
                <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                  {table.caption || `Extracted Table ${i + 1}`}
                </h5>
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          {table.headers.map((h, hi) => (
                            <th key={hi} className="px-6 py-4 font-black text-slate-700 whitespace-nowrap uppercase tracking-tighter text-[10px]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {table.rows.map((row, ri) => (
                          <tr key={ri} className="hover:bg-slate-50/50 transition-colors">
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-6 py-4 text-slate-600 font-medium">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )) : (
              <EmptyState message="No tables detected in this document." icon={<TableIcon size={40} />} />
            )}
          </div>
        )}

        {activeView === 'visuals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {doc.visuals.length > 0 ? doc.visuals.map((visual, i) => (
              <div key={visual.id} className="bg-slate-50 rounded-3xl border border-slate-100 p-8 hover:border-indigo-200 transition-all group relative overflow-hidden">
                <div className="relative z-10">
                  <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 mb-6 shadow-sm transition-colors">
                    <ImageIcon size={24} />
                  </div>
                  <h6 className="font-black text-slate-900 mb-3 uppercase text-[10px] tracking-widest">
                    {visual.type} Detection
                  </h6>
                  <p className="text-base text-slate-600 leading-relaxed italic">
                    "{visual.description}"
                  </p>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-900 font-black text-6xl pointer-events-none">
                  0{i+1}
                </div>
              </div>
            )) : (
              <div className="col-span-full">
                <EmptyState message="No visuals or charts detected." icon={<ImageIcon size={40} />} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ message, icon }: { message: string, icon: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-24 text-slate-300">
    <div className="mb-4 opacity-10">{icon}</div>
    <p className="font-bold text-slate-400 tracking-tight">{message}</p>
  </div>
);

export default DocumentDetails;
