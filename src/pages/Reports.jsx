import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Printer, Eye, CheckCircle, Clock, X, Edit3, RefreshCw, Trash2, Receipt } from 'lucide-react';
import Swal from 'sweetalert2';
import { reportApi, settingsApi, orderApi } from '../services/api';
import BillingReceiptModal from '../components/BillingReceiptModal';
import DiagnosticReportModal from '../components/DiagnosticReportModal';

export default function Reports() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected report for printable preview modal
  const [activeReport, setActiveReport] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [labSettings, setLabSettings] = useState(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  useEffect(() => {
    const oid = searchParams.get('orderId');
    if (oid) {
      openReportModal(oid);
    }
  }, [searchParams]);

  const fetchReports = async (search = searchQuery, status = filterStatus) => {
    try {
      setLoading(true);
      const [data, lab] = await Promise.all([
        reportApi.getAll(search, status),
        settingsApi.get().catch(() => null)
      ]);
      setReports(data || []);
      if (lab) setLabSettings(lab);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(searchQuery, filterStatus);
  }, [filterStatus]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveReport(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports(searchQuery, filterStatus);
  };

  const openReportModal = async (reportId) => {
    try {
      setFetchingDetail(true);
      const detail = await reportApi.getById(reportId);
      setActiveReport(detail);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Report',
        text: err.message,
        customClass: { popup: 'rounded-none' }
      });
    } finally {
      setFetchingDetail(false);
    }
  };

  const openReceiptModal = async (orderId) => {
    try {
      setFetchingDetail(true);
      const fullOrder = await orderApi.getById(orderId);
      setActiveReceipt(fullOrder || reports.find(item => item.id === orderId));
    } catch {
      setActiveReceipt(reports.find(item => item.id === orderId));
    } finally {
      setFetchingDetail(false);
    }
  };

  const handleDeleteReport = (id) => {
    Swal.fire({
      title: 'Delete Order / Report?',
      text: `Are you sure you want to delete ${id}? This will remove the order and all associated test results.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      customClass: { popup: 'rounded-none' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await reportApi.delete(id);
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Order record removed.',
            timer: 1500,
            showConfirmButton: false,
            customClass: { popup: 'rounded-none' }
          });
          fetchReports(searchQuery, filterStatus);
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: err.message,
            customClass: { popup: 'rounded-none' }
          });
        }
      }
    });
  };

  const handlePrint = () => {
    window.print();
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
    <div className="space-y-5 print:hidden animate-fade-in-up">
      <div className="flex flex-wrap justify-between items-center pb-3 gap-2">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">Generated Reports</h2>
          <p className="text-slate-400 text-[11px] uppercase tracking-wider mt-0.5">View, print and manage patient test reports</p>
        </div>
        <button onClick={() => fetchReports(searchQuery, filterStatus)} className="bg-white text-slate-600 px-3 py-2 text-[12px] font-bold uppercase border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-sm" title="Refresh">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-slate-50/80">
           <div className="flex flex-wrap gap-2 items-center">
             <form onSubmit={handleSearchSubmit} className="flex items-center border border-slate-200 bg-white px-2 rounded-lg w-full sm:w-auto shadow-sm">
               <Search size={16} className="text-slate-400 shrink-0" />
               <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by Patient or Name..." className="p-2 text-[13px] outline-none w-full sm:w-52 bg-transparent" />
               <button type="submit" className="text-xs uppercase font-bold text-blue-600 hover:text-blue-800 px-2 shrink-0">Find</button>
             </form>
             <div className="flex items-center border border-slate-200 bg-white px-2 rounded-lg shadow-sm">
               <Filter size={16} className="text-slate-400 mr-1" />
               <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-2 text-[13px] outline-none bg-transparent cursor-pointer font-bold text-slate-700 uppercase">
                 <option value="All Status">All Status</option>
                 <option value="Completed">Completed</option>
                 <option value="Pending">Pending</option>
               </select>
             </div>
           </div>
           <span className="text-[12px] font-bold uppercase text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
             Total: {reports.length} Reports
           </span>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-3 py-2.5 border border-slate-400">Report ID</th>
                <th className="px-3 py-2.5 border border-slate-400">Patient</th>
                <th className="px-3 py-2.5 border border-slate-400 hidden md:table-cell">Test(s)</th>
                <th className="px-3 py-2.5 border border-slate-400 hidden lg:table-cell">Date</th>
                <th className="px-3 py-2.5 border border-slate-400 text-center">Status</th>
                <th className="px-3 py-2.5 border border-slate-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500 font-bold uppercase tracking-wider border border-slate-400">
                    Loading reports...
                  </td>
                </tr>
              ) : reports.map((r) => (
                <tr key={r.id} className="hover:bg-purple-50/50 transition-colors">
                  <td className="px-3 py-2.5 border border-slate-400 text-purple-700 font-bold text-xs">{r.id}</td>
                  <td className="px-3 py-2.5 border border-slate-400">
                     <p className="font-bold text-sm">{r.patient_name}</p>
                     <p className="text-[11px] text-slate-500">{r.patient_id} • {r.patient_phone || 'No phone'}</p>
                     <p className="text-[10px] text-blue-700 font-semibold mt-0.5 hidden sm:block">Ref: {r.doctor_name || 'Self / Walk-in'}</p>
                  </td>
                  <td className="px-3 py-2.5 border border-slate-400 hidden md:table-cell text-sm">{r.test_name || 'Standard Profile'}</td>
                  <td className="px-3 py-2.5 border border-slate-400 hidden lg:table-cell">{formatDate(r.date)}</td>
                  <td className="px-3 py-2.5 border border-slate-400 text-center">
                    {r.status === 'Completed' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 border border-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-none">
                        <CheckCircle size={12} /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 border border-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-none">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 border border-slate-400 text-center">
                    <div className="flex justify-center gap-1 flex-wrap">
                       <button 
                         onClick={() => openReportModal(r.id)} 
                         className="bg-slate-700 text-white px-2 py-1 text-[11px] font-bold uppercase border border-slate-900 rounded-none hover:bg-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                         title="View printable report"
                       >
                          <Eye size={12} /> View
                       </button>
                       <button 
                         onClick={() => openReceiptModal(r.id)} 
                         className="bg-emerald-600 text-white px-2 py-1 text-[11px] font-bold uppercase border border-emerald-800 rounded-none hover:bg-emerald-700 flex items-center gap-1 cursor-pointer transition-colors"
                         title="Print Patient Payment Slip / Receipt"
                       >
                          <Receipt size={12} /> Bill Slip
                       </button>
                       {r.status === 'Completed' ? (
                         <button 
                           onClick={() => openReportModal(r.id)} 
                           className="bg-blue-600 text-white px-2 py-1 text-[11px] font-bold uppercase border border-blue-800 rounded-none hover:bg-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                           title="Print report"
                         >
                            <Printer size={12} /> Print
                         </button>
                       ) : (
                         <button 
                           onClick={() => navigate(`/enter-result?orderId=${r.id}`)} 
                           className="bg-purple-600 text-white px-2 py-1 text-[11px] font-bold uppercase border border-purple-800 rounded-none hover:bg-purple-700 flex items-center gap-1 cursor-pointer transition-colors"
                           title="Enter test results"
                         >
                            <Edit3 size={12} /> Enter
                         </button>
                       )}
                       <button 
                         onClick={() => handleDeleteReport(r.id)} 
                         className="bg-red-50 text-red-600 border border-red-300 px-2 py-1 text-[11px] font-bold uppercase hover:bg-red-600 hover:text-white transition-colors"
                         title="Delete Order Record"
                       >
                         <Trash2 size={12} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && reports.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500 font-bold uppercase tracking-wider border border-slate-400">
                    No reports match the current filter or search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Diagnostic Report Modal */}
      {activeReport && (
        <DiagnosticReportModal
          report={activeReport}
          lab={labSettings}
          onClose={() => setActiveReport(null)}
        />
      )}

      {/* Patient Payment Bill Slip Modal */}
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
    </div>
  );
}
