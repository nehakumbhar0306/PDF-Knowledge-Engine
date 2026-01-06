
import React from 'react';
import { Search, FileUp, Database, ShieldCheck, Activity, Wifi, WifiOff } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'upload' | 'search' | 'stats';
  onTabChange: (tab: 'upload' | 'search' | 'stats') => void;
  isOnline?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, isOnline = true }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Database size={24} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">PDF Engine</h1>
            <span className="text-xs text-slate-500 font-medium">Enterprise Knowledge</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => onTabChange('upload')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-800'
            }`}
          >
            <FileUp size={20} />
            <span className="font-medium">Knowledge Intake</span>
          </button>
          <button
            onClick={() => onTabChange('search')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'search' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-800'
            }`}
          >
            <Search size={20} />
            <span className="font-medium">Smart Search</span>
          </button>
          <button
            onClick={() => onTabChange('stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-800'
            }`}
          >
            <Activity size={20} />
            <span className="font-medium">Benchmarks</span>
          </button>
        </nav>

        <div className="p-4 space-y-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
             {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
             <span className="text-[10px] font-black uppercase tracking-widest">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="text-indigo-400" size={16} />
              <span className="text-xs font-bold text-white uppercase tracking-tighter">Privacy First</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400">
              Extracted data resides locally in your browser's persistent storage.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-10 px-8 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            {activeTab === 'upload' ? 'Upload & Process' : activeTab === 'search' ? 'Knowledge Search' : 'System Performance'}
          </h2>
          <div className="flex items-center gap-4">
             <div className="flex -space-x-2">
               <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">LC</div>
             </div>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
