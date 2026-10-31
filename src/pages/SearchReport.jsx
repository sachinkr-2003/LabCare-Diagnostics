import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, FileSearch, CheckCircle, Clock, Eye, Edit3, Receipt } from 'lucide-react';
import { reportApi, orderApi, settingsApi } from '../services/api';
import BillingReceiptModal from '../components/BillingReceiptModal';
import DiagnosticReportModal from '../components/DiagnosticReportModal';

export default function SearchReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [labSettings, setLabSettings] = useState(null);

  const executeSearch = async (searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return;
    try {
      setLoading(true);
      const [data, lab] = await Promise.all([
        reportApi.search(searchTerm.trim()),
        settingsApi.get().catch(() => null)
      ]);
      setResults(data || []);
      if (lab) setLabSettings(lab);
      setHasSearched(true);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      executeSearch(q);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  const openReceiptModal = async (orderId) => {
    try {
      const fullOrder = await orderApi.getById(orderId);
      setActiveReceipt(fullOrder || results.find(item => item.id === orderId));
    } catch {
      setActiveReceipt(results.find(item => item.id === orderId));
    }
  };

  const openReportModal = async (reportId) => {
    try {
      const detail = await reportApi.getById(reportId);
      setActiveReport(detail);
    } catch (err) {
      console.error('Error fetching report:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 print:hidden animate-fade-in-up">
      <div className="flex flex-wrap justify-between items-center pb-2 gap-2">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">Search Reports</h2>
          <p className="text-slate-400 text-[11px] uppercase tracking-wider mt-0.5">Find patient historical records instantly from database</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm text-center max-w-3xl mx-auto">
         <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-200/80 flex items-center justify-center text-cyan-600 shadow-sm shadow-cyan-500/10">
              <FileSearch size={32} />
            </div>
         </div>
         <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase mb-1 tracking-tight">Search Patient Database</h3>
         <p className="text-xs text-slate-500 mb-6 font-medium">Search by Patient ID (e.g. P-001), Phone, Full Name or Order ID</p>

         <form onSubmit={handleSearch} className="flex border-2 border-slate-200 rounded-xl overflow-hidden max-w-xl mx-auto focus-within:border-cyan-500 shadow-xs transition-colors">
            <div className="p-3 bg-slate-50 border-r border-slate-200 flex items-center justify-center">
               <Search size={18} className="text-slate-400" />
            </div>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. P-001, 8102002499, Sachin, ORD-1004..." 
              className="flex-1 p-3 text-sm outline-none bg-white text-slate-800 font-medium"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 sm:px-7 font-black uppercase tracking-wider text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? 'Searching...' : 'Find'}
            </button>
         </form>

         {hasSearched && (
           <div className="mt-8 text-left">
             <div className="border-b border-slate-200 pb-3 mb-4 flex justify-between items-center">
               <h4 className="text-xs uppercase font-black text-slate-800 tracking-wider">Search Results ({results.length})</h4>
               <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">Query: "{query}"</span>
             </div>

             {results.length > 0 ? (
               <div className="space-y-3">
                 {results.map((r) => (
                   <div key={r.id} className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 hover:bg-blue-50/50 hover:border-blue-200/80 transition-all shadow-xs">
                     <div className="min-w-0 flex-1">
                       <div className="flex items-center gap-2 flex-wrap">
                         <span className="font-bold text-slate-900 text-sm">{r.patient_name}</span>
                         <span className="text-xs text-blue-700 font-mono font-bold">({r.patient_id})</span>
                         <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                           r.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                         }`}>
                           {r.status}
                         </span>
                       </div>
                       <p className="text-xs text-slate-700 mt-1 font-semibold">Tests: {r.test_name || 'Standard Lab Test'}</p>
                       <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Order ID: {r.id} • Phone: {r.patient_phone || '-'} • Date: {formatDate(r.date)} • Ref: {r.doctor_name || 'Self / Walk-in'}</p>
                     </div>
                     <div className="flex gap-2 items-center shrink-0 w-full sm:w-auto justify-end flex-wrap">
                       <button 
                         onClick={() => openReceiptModal(r.id)}
                         className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95"
                         title="Print Patient Bill Slip / Receipt"
                       >
                         <Receipt size={13} /> <span>Bill Slip</span>
                       </button>
                       {r.status === 'Completed' ? (
                         <button 
                           onClick={() => openReportModal(r.id)}
                           className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-1.5 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95"
                         >
                           <Eye size={14} /> <span>View Report</span>
                         </button>
                       ) : (
                         <button 
                           onClick={() => navigate(`/enter-result?orderId=${r.id}`)}
                           className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-3.5 py-1.5 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95"
                         >
                           <Edit3 size={14} /> <span>Enter Results</span>
                         </button>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-8 rounded-xl border border-slate-200 bg-slate-50/60 text-center">
                 <p className="text-sm text-slate-500">No matching records found for <span className="font-bold text-slate-800">'{query}'</span> in the database.</p>
               </div>
             )}
           </div>
         )}
      </div>

      {/* Patient Billing Slip Modal */}
      {activeReceipt && (
        <BillingReceiptModal
          order={activeReceipt}
          lab={labSettings}
          onClose={() => setActiveReceipt(null)}
          onEnterResults={() => {
            const ordId = activeReceipt.id;
            setActiveReceipt(null);
            navigate(`/enter-result?orderId=${ordId}`);
          }}
        />
      )}

      {/* Printable Diagnostic Report Modal */}
      {activeReport && (
        <DiagnosticReportModal
          report={activeReport}
          lab={labSettings}
          onClose={() => setActiveReport(null)}
        />
      )}
    </div>
  );
}
