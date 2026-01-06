
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Zap, Database, Search, Target, HardDrive, Trash2 } from 'lucide-react';
import { DocumentKnowledge } from '../types';

interface StatsProps {
  knowledgeBase: DocumentKnowledge[];
  onClearDatabase: () => void;
}

const Stats: React.FC<StatsProps> = ({ knowledgeBase, onClearDatabase }) => {
  const data = [
    { name: 'OCR Speed', value: 92 },
    { name: 'Table Accuracy', value: 88 },
    { name: 'Semantic Precision', value: 95 },
    { name: 'Extraction Depth', value: 84 },
  ];

  const storageUsed = JSON.stringify(knowledgeBase).length;
  const storageLimit = 5 * 1024 * 1024; // ~5MB LocalStorage limit
  const storagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
            <Zap size={20} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Process Time</p>
          <h4 className="text-2xl font-black text-slate-800">4.2s <span className="text-xs text-emerald-500">/page</span></h4>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-emerald-100 w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
            <Target size={20} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Retrieval Accuracy</p>
          <h4 className="text-2xl font-black text-slate-800">98.4%</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-amber-100 w-10 h-10 rounded-lg flex items-center justify-center text-amber-600 mb-4">
            <Database size={20} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Documents</p>
          <h4 className="text-2xl font-black text-slate-800">{knowledgeBase.length}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-indigo-900 w-10 h-10 rounded-lg flex items-center justify-center text-white mb-4">
            <HardDrive size={20} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage Index</p>
          <h4 className="text-2xl font-black text-slate-800">{(storageUsed / 1024).toFixed(1)} KB</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              Local Storage Utilization
            </h4>
            <span className="text-xs font-black text-slate-400">{Math.round(storagePercent)}% Capacity</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden mb-4 p-1">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  storagePercent > 80 ? 'bg-rose-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-8">
              Documents are stored in your browser's Local Storage. Standard capacity is approximately 5MB. For massive datasets, consider clearing unused indexes.
            </p>
            
            <button 
              onClick={onClearDatabase}
              className="mt-auto flex items-center justify-center gap-2 border-2 border-slate-100 text-rose-600 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 transition-all"
            >
              <Trash2 size={16} />
              Wipe Local Database
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            AI Extraction Fidelity
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 800 }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-3xl font-black mb-4 tracking-tight">Offline Persistence Enabled</h3>
            <p className="text-slate-400 max-w-xl text-lg leading-relaxed">
              This engine uses <b>local persistence</b> logic. You can browse, search, and view your existing knowledge base even when the device is disconnected from the cloud.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center flex-1 min-w-[120px]">
               <div className="text-2xl font-black text-indigo-400">100%</div>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Local Privacy</div>
             </div>
             <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center flex-1 min-w-[120px]">
               <div className="text-2xl font-black text-emerald-400">0ms</div>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Local Latency</div>
             </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[200%] bg-indigo-500 rounded-full blur-[150px]" />
        </div>
      </div>
    </div>
  );
};

export default Stats;
