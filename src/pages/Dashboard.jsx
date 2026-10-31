import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  FlaskConical, 
  FileText, 
  Calendar, 
  UserPlus, 
  FileDown, 
  Search, 
  ChevronRight, 
  Edit3, 
  Eye, 
  Clock, 
  CheckCircle,
  Activity,
  ArrowUpRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import QuickActionButton from '../components/QuickActionButton';
import DiagnosticReportModal from '../components/DiagnosticReportModal';
import { dashboardApi, patientApi, reportApi, settingsApi } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalPatients: 0,
    totalTests: 0,
    totalReports: 0,
    todayReports: 0,
    recentReports: []
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickSearch, setQuickSearch] = useState('');

  // Direct modal viewing for completed reports from dashboard
  const [activeReport, setActiveReport] = useState(null);
  const [labSettings, setLabSettings] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [dashData, patientsData] = await Promise.all([
          dashboardApi.getStats(),
          patientApi.getAll()
        ]);
        if (dashData) setStats(dashData);
        if (patientsData) setRecentPatients(patientsData.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  const handleOpenReport = async (orderId) => {
    try {
      setLoadingReport(true);
      const [detail, lab] = await Promise.all([
        reportApi.getById(orderId),
        settingsApi.get().catch(() => null)
      ]);
      setActiveReport(detail);
      if (lab) setLabSettings(lab);
    } catch (err) {
      console.error('Failed to load report modal:', err);
      navigate(`/reports?orderId=${orderId}`);
    } finally {
      setLoadingReport(false);
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
    <div className="flex flex-col xl:flex-row gap-6 font-sans">
      {/* Left/Center Main Column */}
      <div className="flex-1 space-y-6">
        
        {/* Page Title & Status Header */}
        <div className="border-b border-slate-300 pb-3.5 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Dashboard Overview
            </h2>
            <p className="text-slate-500 font-medium text-xs uppercase tracking-wide mt-0.5">
              Live Laboratory Metrics & Diagnostic Activity
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Lab System Online</span>
          </div>
        </div>

        {/* Executive Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Patients" 
            value={loading ? '...' : String(stats.totalPatients)} 
            trend="Registered" 
            subtitle="Clinical Patient Directory"
            icon={<Users size={20} />} 
            accentColor="blue"
            WatermarkIcon={Users}
          />
          <MetricCard 
            title="Tests Catalog" 
            value={loading ? '...' : String(stats.totalTests)} 
            trend="Active Panels" 
            subtitle="Bio-Range Test Master"
            icon={<FlaskConical size={20} />} 
            accentColor="emerald"
            WatermarkIcon={FlaskConical}
          />
          <MetricCard 
            title="Reports Generated" 
            value={loading ? '...' : String(stats.totalReports)} 
            trend="Completed" 
            subtitle="Signed Diagnostic Records"
            icon={<FileText size={20} />} 
            accentColor="purple"
            WatermarkIcon={FileText}
          />
          <MetricCard 
            title="Today's Orders" 
            value={loading ? '...' : String(stats.todayReports)} 
            trend="Live Log" 
            subtitle="New Tests Booked Today"
            icon={<Calendar size={20} />} 
            accentColor="amber"
            WatermarkIcon={Calendar}
          />
        </div>

        {/* Quick Actions (Vibrant Colored Cards) */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-2">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <QuickActionButton 
              to="/patients" 
              title="Add Patient" 
              subtitle="New Register" 
              icon={<UserPlus size={19} />} 
              bgColor="bg-blue-600" 
              hoverColor="hover:bg-blue-700" 
            />
            <QuickActionButton 
              to="/create-order" 
              title="Create Order" 
              subtitle="Book Tests" 
              icon={<FlaskConical size={19} />} 
              bgColor="bg-emerald-600" 
              hoverColor="hover:bg-emerald-700" 
            />
            <QuickActionButton 
              to="/enter-result" 
              title="Enter Result" 
              subtitle="Update Data" 
              icon={<Edit3 size={19} />} 
              bgColor="bg-purple-600" 
              hoverColor="hover:bg-purple-700" 
            />
            <QuickActionButton 
              to="/reports" 
              title="View Reports" 
              subtitle="Lab Reports" 
              icon={<FileText size={19} />} 
              bgColor="bg-red-600" 
              hoverColor="hover:bg-red-700" 
            />
            <QuickActionButton 
              to="/search" 
              title="Search Report" 
              subtitle="Find Records" 
              icon={<Search size={19} />} 
              bgColor="bg-cyan-600" 
              hoverColor="hover:bg-cyan-700" 
            />
          </div>
        </div>

        {/* Recent Reports Table */}
        <div className="bg-white border border-slate-300 shadow-xs rounded-none">
          <div className="px-5 py-3.5 border-b border-slate-300 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-slate-600" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                Recent Activity Reports
              </h3>
            </div>
            <Link 
              to="/reports" 
              className="text-blue-600 text-xs font-bold uppercase hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-300">
                <tr>
                  <th className="px-4 py-3 border-r border-slate-300">Order ID</th>
                  <th className="px-4 py-3 border-r border-slate-300">Patient</th>
                  <th className="px-4 py-3 border-r border-slate-300">Patient ID</th>
                  <th className="px-4 py-3 border-r border-slate-300">Test Detail</th>
                  <th className="px-4 py-3 border-r border-slate-300">Date Logged</th>
                  <th className="px-4 py-3 border-r border-slate-300 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-slate-800 font-medium">
                {stats.recentReports && stats.recentReports.map((r) => (
                  <tr key={r.id} className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 border-r border-slate-200 whitespace-nowrap">
                      <span className="font-mono text-purple-700 font-black text-xs bg-purple-50 px-2 py-0.5 border border-purple-200">
                        {r.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 font-bold text-slate-900 uppercase">
                      {r.patient_name}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 text-slate-600 font-mono text-[11px]">
                      {r.patient_id}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 text-slate-700 max-w-[200px] truncate" title={r.test_name}>
                      {r.test_name || 'Standard Lab Test'}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 text-slate-600 font-medium">
                      {formatDate(r.date)}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 text-center">
                      {r.status === 'Completed' ? (
                        <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.status === 'Completed' ? (
                        <button 
                          type="button"
                          onClick={() => handleOpenReport(r.id)} 
                          className="inline-flex items-center gap-1 bg-blue-600 text-white px-2.5 py-1 text-[11px] font-bold uppercase hover:bg-blue-700 transition-colors cursor-pointer"
                          title="View & Print Diagnostic Report"
                        >
                          <Eye size={12} /> View Report
                        </button>
                      ) : (
                        <Link 
                          to={`/enter-result?orderId=${r.id}`} 
                          className="inline-flex items-center gap-1 bg-purple-600 text-white px-2.5 py-1 text-[11px] font-bold uppercase hover:bg-purple-700 transition-colors cursor-pointer"
                          title="Enter Test Results (Step 2)"
                        >
                          <Edit3 size={12} /> Enter Result
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
                {(!stats.recentReports || stats.recentReports.length === 0) && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 uppercase tracking-wider text-xs">
                      No recent activities recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Sidebar Column */}
      <div className="w-full xl:w-[320px] space-y-5">
        
        {/* Quick Search Card */}
        <div className="bg-white border border-slate-300 p-5 shadow-xs rounded-none">
          <h3 className="text-xs font-black text-slate-800 mb-2 uppercase tracking-wider">
            Quick Patient Search
          </h3>
          <p className="text-[11px] text-slate-500 mb-3">
            Search by Patient Name, ID, or Mobile number:
          </p>
          <form onSubmit={handleQuickSearch} className="flex border-2 border-slate-700 rounded-none overflow-hidden focus-within:border-blue-600">
            <input 
              type="text" 
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="e.g. Priya, ORD-1002, 987..." 
              className="w-full px-3 py-2 text-xs outline-none text-slate-800 font-medium" 
            />
            <button 
              type="submit" 
              className="bg-slate-900 text-white px-3.5 flex items-center hover:bg-blue-600 transition-colors cursor-pointer"
              title="Search"
            >
              <Search size={15} />
            </button>
          </form>
        </div>

        {/* Recent Registered Patients */}
        <div className="bg-white border border-slate-300 shadow-xs rounded-none">
          <div className="px-5 py-3.5 border-b border-slate-300 flex justify-between items-center bg-slate-50">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
              Registered Patients
            </h3>
            <Link 
              to="/patients" 
              className="text-blue-600 text-xs font-bold uppercase hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-slate-200">
            {recentPatients.map((p) => {
              const initials = p.name ? p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'PT';
              return (
                <div 
                  key={p.id} 
                  onClick={() => navigate('/patients')} 
                  className="p-3.5 flex items-center gap-3 hover:bg-blue-50/50 cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white font-black text-xs border border-slate-700 shrink-0 group-hover:bg-blue-600 transition-colors">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-900 uppercase truncate group-hover:text-blue-700 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium font-mono mt-0.5 truncate">
                      {p.id} • {p.phone || '-'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold bg-slate-100 px-2 py-0.5 border border-slate-300 text-slate-700">
                      {p.age}Y
                    </span>
                  </div>
                </div>
              );
            })}

            {recentPatients.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500 italic">
                No patients registered yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Diagnostic Report Modal (Direct Preview & Print from Dashboard) */}
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
