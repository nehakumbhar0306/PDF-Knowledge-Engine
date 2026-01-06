
import React, { useState } from 'react';
import { Search as SearchIcon, FileText, ChevronRight, Table as TableIcon, Image as ImageIcon, ExternalLink, ArrowRight, LayoutGrid } from 'lucide-react';
import { DocumentKnowledge } from '../types';

interface SearchProps {
  knowledgeBase: DocumentKnowledge[];
  onSearch: (query: string) => Promise<any[]>;
  onViewDoc: (id: string) => void;
}

const Search: React.FC<SearchProps> = ({ knowledgeBase, onSearch, onViewDoc }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const data = await onSearch(query);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <SearchIcon className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={24} />
        </div>
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Query the knowledge base..."
          className="w-full bg-white border-2 border-slate-100 rounded-[2rem] py-6 pl-16 pr-36 text-xl focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-xl shadow-slate-200/50"
        />
        <button 
          type="submit"
          disabled={isSearching}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 disabled:bg-slate-300 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
        >
          {isSearching ? 'Processing...' : 'Search'}
        </button>
      </form>

      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((res, i) => {
            const doc = knowledgeBase.find(d => d.id === res.docId);
            return (
              <div key={i} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg leading-tight">{doc?.fileName || 'Extracted Fragment'}</h4>
                      <p className="text-xs font-black text-emerald-500 tracking-widest mt-0.5">MATCH CONFIDENCE: {Math.round((res.relevance || 0.8) * 100)}%</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border-l-4 border-indigo-500 italic text-slate-700 leading-relaxed text-base mb-6 relative">
                    <div className="absolute top-2 right-4 text-slate-200 font-serif text-4xl leading-none">"</div>
                    {res.snippet}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <TableIcon size={14} /> {doc?.tables.length || 0} Tables
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <ImageIcon size={14} /> {doc?.visuals.length || 0} Visual Assets
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] font-black px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-tighter">
                        {res.reason || 'Semantic Match'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:w-48 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                  <button 
                    onClick={() => onViewDoc(res.docId)}
                    className="flex flex-col items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors group/btn"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center group-hover/btn:bg-indigo-600 group-hover/btn:text-white transition-all">
                      <ArrowRight size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Deep View</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : query && !isSearching ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
               <SearchIcon size={40} />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">No definitive matches found</h3>
             <p className="text-slate-400 max-w-sm mx-auto">Try refining your query or check if the relevant document has been indexed in the intake tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
             <FeatureCard 
              title="Vector Retrieval" 
              desc="Information is retrieved using high-dimensional embeddings."
              icon={<LayoutGrid className="text-indigo-500" />}
             />
             <FeatureCard 
              title="Table Precision" 
              desc="Direct access to extracted financial and technical data tables."
              icon={<TableIcon className="text-emerald-500" />}
             />
             <FeatureCard 
              title="Visual Context" 
              desc="AI-generated descriptions make charts and diagrams searchable."
              icon={<ImageIcon className="text-amber-500" />}
             />
          </div>
        )}
      </div>
    </div>
  );
};

const FeatureCard = ({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) => (
  <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="mb-4">{icon}</div>
    <h5 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-2">{title}</h5>
    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default Search;
