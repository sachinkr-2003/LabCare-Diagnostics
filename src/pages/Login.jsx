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
  Database,
  Zap
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

  const features = [
    { icon: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />, title: 'Instant Bill Slips', desc: 'Auto patient receipts' },
    { icon: <CheckCircle2 size={16} className="text-blue-400 shrink-0" />, title: 'Bio-Range Analysis', desc: 'High/Low auto flags' },
    { icon: <Database size={16} className="text-purple-400 shrink-0" />, title: '1-Click DB Backup', desc: 'SQLite & Excel CSV' },
    { icon: <ShieldCheck size={16} className="text-amber-400 shrink-0" />, title: 'Role Security', desc: '256-bit encrypted data' },
  ];

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden select-none" style={{ background: '#060d1a' }}>

      {/* LEFT SIDE */}
      <div className="relative lg:w-7/12 h-48 lg:h-full flex flex-col justify-between p-6 sm:p-8 lg:p-12 overflow-hidden">
        <img
          src={labBanner}
          alt="Laboratory Diagnostics"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.55) saturate(1.1)' }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #060d1a 0%, rgba(6,13,26,0.7) 50%, rgba(6,13,26,0.3) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(29,78,216,0.25) 0%, transparent 60%)' }} />

        {/* Decorative circles */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 animate-spin-slow" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', filter: 'blur(40px)' }} />

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center rounded-xl shadow-xl shadow-blue-500/30 border border-blue-400/30">
            <FlaskConical size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
              LabCare <span className="text-blue-400">Diagnostics</span>
            </h2>
            <p className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold">
              Research Centre & Pathology Management
            </p>
          </div>
        </div>

        {/* Middle Content */}
        <div className="relative z-10 hidden lg:block my-auto py-4 max-w-xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(59,130,246,0.12)', backdropFilter: 'blur(8px)' }}>
            <Activity size={13} className="text-blue-400 animate-pulse" />
            Clinical Excellence & Diagnostics
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tight">
            Precision Testing. <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              Trusted Results.
            </span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md">
            Enterprise pathology laboratory information system with automated bio-range evaluation, instant billing receipts, and secure clinical records.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-3 flex items-center gap-2.5 rounded-xl border border-white/8 transition-all hover:border-white/15"
                style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}
              >
                {f.icon}
                <div>
                  <p className="font-bold text-white text-xs uppercase">{f.title}</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Status */}
        <div className="relative z-10 hidden lg:flex pt-3 border-t border-white/10 items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">System Operational</span>
          </div>
          <div className="font-mono text-xs text-slate-400">ISO 15189:2022 • NABL Standards</div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Panel */}
      <div
        className="lg:w-5/12 flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-12 overflow-auto"
        style={{
          background: 'linear-gradient(180deg, #0d1526 0%, #0f172a 50%, #0a1020 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        {/* Top Header */}
        <div className="space-y-2 max-w-md w-full mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-widest" style={{ background: 'rgba(59,130,246,0.1)' }}>
            <Lock size={11} />
            Restricted Staff Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Sign In to <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Dashboard</span>
          </h2>
          <p className="text-sm text-slate-400">
            Enter authorized credentials to access clinical records.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="my-auto py-4 space-y-4 max-w-md w-full mx-auto">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Staff Username / ID
            </label>
            <div
              className="flex border transition-all focus-within:border-blue-500"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}
            >
              <div className="p-3 border-r flex items-center justify-center text-slate-500" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full p-3 text-sm text-white placeholder-slate-600 outline-none bg-transparent font-medium"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Security Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {showPassword ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}
              </button>
            </div>
            <div
              className="flex border transition-all focus-within:border-blue-500"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}
            >
              <div className="p-3 border-r flex items-center justify-center text-slate-500" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-3 text-sm text-white placeholder-slate-600 outline-none bg-transparent font-medium"
                required
              />
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
              />
              <span className="text-xs font-medium text-slate-300">Remember this terminal</span>
            </label>
            <span className="text-xs text-slate-500 font-mono font-semibold flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-500" /> 256-bit SSL
            </span>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white p-3.5 text-sm font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg disabled:opacity-60 btn-press relative overflow-hidden group"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', boxShadow: '0 4px 24px rgba(37,99,235,0.4)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Validating...
              </span>
            ) : (
              <>
                <Zap size={16} />
                <span>Secure Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Quick credentials hint */}
          <div className="text-center">
            <p className="text-[10px] text-slate-600 font-mono">
              Default: <span className="text-slate-400">admin</span> / <span className="text-slate-400">admin123</span>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="pt-3 border-t max-w-md w-full mx-auto space-y-1 text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            LabCare Diagnostics • Laboratory Management System
          </p>
          <p className="text-xs text-blue-500 font-bold tracking-wider">
            Developed by Sachin
          </p>
        </div>
      </div>
    </div>
  );
}
