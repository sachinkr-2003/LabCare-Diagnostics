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
    <div className="space-y-6 print:hidden">
      <div className="flex justify-between items-center border-b border-slate-400 pb-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-800 uppercase tracking-tight">Search Reports</h2>
          <p className="text-slate-600 text-[12px] uppercase tracking-wider mt-1">Find patient historical records instantly from database</p>
        </div>
      </div>

      <div className="bg-white border border-slate-400 p-8 shadow-none rounded-none text-center max-w-3xl mx-auto mt-6">
         <div className="flex justify-center mb-4">
            <div className="p-3 bg-cyan-50 border border-cyan-200">
              <FileSearch size={40} className="text-cyan-600" />
            </div>
         </div>
         <h3 className="text-[18px] font-bold text-slate-800 uppercase mb-1 tracking-wide">Enter Search Query</h3>
         <p className="text-[12px] text-slate-500 mb-6 uppercase tracking-wider">You can search via Patient ID, Mobile Number, Full Name or Order ID</p>

         <form onSubmit={handleSearch} className="flex border border-slate-400 max-w-xl mx-auto rounded-none overflow-hidden">
            <div className="p-3 bg-slate-100 border-r border-slate-400 flex items-center justify-center">
               <Search size={18} className="text-slate-500" />
            </div>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. P-001, 9876543210, Rahul, ORD-1001..." 
              className="flex-1 p-3 text-[14px] outline-none"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 font-bold uppercase tracking-wider text-[12px] border-l border-cyan-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Searching...' : 'Find'}
            </button>
         </form>

         {hasSearched && (
           <div className="mt-8 text-left">
             <div className="border-b border-slate-300 pb-2 mb-4 flex justify-between items-center">
               <h4 className="text-xs uppercase font-bold text-slate-700">Search Results ({results.length})</h4>
               <span className="text-[11px] text-slate-500 font-mono">Query: "{query}"</span>
             </div>

             {results.length > 0 ? (
               <div className="space-y-3">
                 {results.map((r) => (
                   <div key={r.id} className="border border-slate-300 p-4 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-blue-50/40 transition-colors">
                     <div>
                       <div className="flex items-center gap-2">
                         <span className="font-bold text-slate-900 text-sm">{r.patient_name}</span>
                         <span className="text-xs text-blue-700 font-mono font-bold">({r.patient_id})</span>
                         <span className={`text-[10px] font-bold px-2 py-0.5 border uppercase ${
                           r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                         }`}>
                           {r.status}
                         </span>
                       </div>
                       <p className="text-xs text-slate-600 mt-1 font-medium">Tests: {r.test_name}</p>
                       <p className="text-[11px] text-slate-400 mt-0.5">Order ID: {r.id} • Phone: {r.patient_phone || '-'} • Date: {formatDate(r.date)} • Ref: {r.doctor_name || 'Self / Walk-in'}</p>
                     </div>
                     <div className="flex gap-2 items-center">
                       <button 
                         onClick={() => openReceiptModal(r.id)}
                         className="bg-emerald-600 text-white px-2.5 py-1.5 text-xs font-bold uppercase border border-emerald-800 rounded-none hover:bg-emerald-700 flex items-center gap-1 cursor-pointer transition-colors"
                         title="Print Patient Bill Slip / Receipt"
                       >
                         <Receipt size={13} /> Bill Slip
                       </button>
                       {r.status === 'Completed' ? (
                         <button 
                           onClick={() => openReportModal(r.id)}
                           className="bg-blue-600 text-white px-3 py-1.5 text-xs font-bold uppercase border border-blue-800 rounded-none hover:bg-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                         >
                           <Eye size={14} /> View Report
                         </button>
                       ) : (
                         <button 
                           onClick={() => navigate(`/enter-result?orderId=${r.id}`)}
                           className="bg-purple-600 text-white px-3 py-1.5 text-xs font-bold uppercase border border-purple-800 rounded-none hover:bg-purple-700 flex items-center gap-1 cursor-pointer transition-colors"
                         >
                           <Edit3 size={14} /> Enter Results
                         </button>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-6 border border-slate-300 bg-slate-50 text-center">
                 <p className="text-[13px] text-slate-600">No matching records found for <span className="font-bold text-slate-800">'{query}'</span> in the database.</p>
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
