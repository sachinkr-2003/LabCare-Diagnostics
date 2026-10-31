import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FlaskConical, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Activity, 
  Database 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { authApi } from '../services/api';
import labBanner from '../assets/lab-banner.jpg';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Credentials Required',
        text: 'Please enter both username and password!',
        customClass: { popup: 'rounded-none' }
      });
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login({ username, password });
      
      localStorage.setItem('lms_token', res.token);
      localStorage.setItem('lms_user', JSON.stringify(res.user));

      Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        text: `Logged in as ${res.user.name}`,
        timer: 1200,
        showConfirmButton: false,
        customClass: { popup: 'rounded-none' }
      });

      navigate('/');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Failed',
        text: err.message || 'Invalid username or password',
        customClass: { popup: 'rounded-none' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-slate-950 font-sans overflow-hidden select-none">
      
      {/* LEFT SIDE: Visual Showcase (Large, Crisp & Modern) */}
      <div className="relative lg:w-7/12 h-full flex flex-col justify-between p-8 sm:p-10 lg:p-12 overflow-hidden">
        {/* Background Image */}
        <img 
          src={labBanner} 
          alt="Laboratory Diagnostics" 
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90"
        />

        {/* Contrast Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/40" />
        <div className="absolute inset-0 bg-blue-950/30 mix-blend-multiply" />

        {/* Top Header Branding on Image */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center border-2 border-blue-400 shadow-xl">
            <FlaskConical size={26} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              LabCare <span className="text-blue-400">Diagnostics</span>
            </h2>
            <p className="text-xs text-slate-300 uppercase tracking-widest font-semibold">
              Research Centre & Pathology Management
            </p>
          </div>
        </div>

        {/* Middle Content: Taglines & Sleek Feature Grid */}
        <div className="relative z-10 my-auto py-4 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Activity size={15} className="text-blue-400 animate-pulse" />
            Clinical Excellence & Diagnostics
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tight">
            Precision Testing. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-300">
              Trusted Results.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
            Enterprise pathology laboratory information system with automated bio-range evaluation, instant billing receipts, and secure clinical records.
          </p>

          {/* Feature Grid with Bigger, Clearer Typography */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="bg-slate-900/85 border border-slate-700/80 p-3 backdrop-blur-xs flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white uppercase text-xs">Instant Bill Slips</p>
                <p className="text-slate-300 text-[11px] mt-0.5">Auto patient receipts</p>
              </div>
            </div>

            <div className="bg-slate-900/85 border border-slate-700/80 p-3 backdrop-blur-xs flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-blue-400 shrink-0" />
              <div>
                <p className="font-bold text-white uppercase text-xs">Bio-Range Analysis</p>
                <p className="text-slate-300 text-[11px] mt-0.5">High/Low auto flags</p>
              </div>
            </div>

            <div className="bg-slate-900/85 border border-slate-700/80 p-3 backdrop-blur-xs flex items-center gap-2.5">
              <Database size={18} className="text-purple-400 shrink-0" />
              <div>
                <p className="font-bold text-white uppercase text-xs">1-Click DB Backup</p>
                <p className="text-slate-300 text-[11px] mt-0.5">SQLite & Excel CSV</p>
              </div>
            </div>

            <div className="bg-slate-900/85 border border-slate-700/80 p-3 backdrop-blur-xs flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-white uppercase text-xs">Role Security</p>
                <p className="text-slate-300 text-[11px] mt-0.5">256-bit encrypted data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">System Operational</span>
          </div>
          <div className="font-mono text-xs text-slate-300">
            ISO 15189:2022 • NABL Standards
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Panel (Readable, Bold, Professional) */}
      <div className="lg:w-5/12 h-full bg-slate-900 flex flex-col justify-between p-8 sm:p-10 lg:p-12 border-t lg:border-t-0 lg:border-l-2 border-slate-800 overflow-hidden">
        
        {/* Top Header */}
        <div className="space-y-1.5 max-w-md w-full mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-900/40 border border-blue-500/40 text-blue-300 text-xs font-bold uppercase tracking-widest">
            <Lock size={13} />
            Restricted Staff Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Sign In to Dashboard
          </h2>
          <p className="text-sm text-slate-300">
            Enter authorized credentials to access clinical records.
          </p>
        </div>

        {/* Form Area */}
        <form onSubmit={handleLogin} className="my-auto py-2 space-y-4 max-w-md w-full mx-auto">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-200">
              Staff Username / ID
            </label>
            <div className="flex border-2 border-slate-700 bg-slate-950 focus-within:border-blue-500 transition-colors">
              <div className="p-3 border-r border-slate-800 text-slate-400 flex items-center justify-center">
                <User size={19} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full p-3 text-sm text-white placeholder-slate-500 outline-none bg-transparent font-medium"
                required
              />
            </div>
          </div>

          {/* Password with Show/Hide Toggle */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200">
                Security Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? (
                  <>
                    <EyeOff size={14} /> Hide
                  </>
                ) : (
                  <>
                    <Eye size={14} /> Show
                  </>
                )}
              </button>
            </div>
            <div className="flex border-2 border-slate-700 bg-slate-950 focus-within:border-blue-500 transition-colors">
              <div className="p-3 border-r border-slate-800 text-slate-400 flex items-center justify-center">
                <Lock size={19} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-3 text-sm text-white placeholder-slate-500 outline-none bg-transparent font-medium"
                required
              />
            </div>
          </div>

          {/* Remember Me & SSL Security */}
          <div className="flex items-center justify-between text-xs text-slate-300 pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-none accent-blue-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-200">Remember this terminal</span>
            </label>
            <span className="text-xs text-slate-400 font-mono font-semibold">256-bit SSL</span>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3.5 text-sm font-black uppercase tracking-wider border-2 border-blue-500 rounded-none flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Validating...
              </span>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-center max-w-md w-full mx-auto space-y-1">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            LabCare Diagnostics • Laboratory Management System
          </p>
          <p className="text-xs text-blue-400 font-bold tracking-wider">
            Develop by Sachin
          </p>
        </div>
      </div>
    </div>
  );
}
