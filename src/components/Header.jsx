import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { settingsApi } from '../services/api';
import defaultAvatar from '../assets/default-avatar.jpg';

export default function Header() {
  const [currentDateTime, setCurrentDateTime] = useState({
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  });

  const [avatar, setAvatar] = useState(() => localStorage.getItem('lms_avatar') || defaultAvatar);
  const [adminName, setAdminName] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lms_user'))?.name || 'Admin'; } catch { return 'Admin'; }
  });

  useEffect(() => {
    const loadAvatar = async () => {
      const local = localStorage.getItem('lms_avatar');
      if (local) setAvatar(local);
      try {
        const settings = await settingsApi.get();
        if (settings?.admin_avatar) { setAvatar(settings.admin_avatar); localStorage.setItem('lms_avatar', settings.admin_avatar); }
        if (settings?.admin_name) setAdminName(settings.admin_name);
      } catch {}
    };
    loadAvatar();
    const handleUpdate = () => setAvatar(localStorage.getItem('lms_avatar') || defaultAvatar);
    window.addEventListener('lms_avatar_updated', handleUpdate);
    return () => window.removeEventListener('lms_avatar_updated', handleUpdate);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDateTime({
        date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="h-[60px] flex items-center justify-between px-4 md:px-6 shrink-0"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 1px 20px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.9) inset'
      }}
    >
      {/* Left: tagline */}
      <div className="hidden md:flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <Zap size={11} className="text-blue-500" />
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Accurate Reports</span>
        </div>
        <span className="text-slate-200 text-xs">•</span>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Better Health</span>
        <span className="text-slate-200 text-xs">•</span>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Trusted Diagnostics</span>
      </div>

      {/* Mobile: logo text */}
      <div className="md:hidden pl-12 text-sm font-black text-slate-800 uppercase tracking-wider">
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Lab</span>
        <span>Care</span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Date/Time pill */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200/80 rounded-xl px-3 py-1.5 hover:border-blue-200 transition-colors shadow-sm">
          <Calendar size={12} className="text-blue-500 shrink-0" />
          <div>
            <p className="font-bold text-slate-700 text-[10px] uppercase tracking-wide leading-tight">{currentDateTime.date}</p>
            <p className="text-[10px] font-semibold text-slate-400 leading-tight">{currentDateTime.time}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 mx-0.5" />

        {/* Profile */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-blue-50/80 transition-all group border border-transparent hover:border-blue-100"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full ring-2 ring-blue-500/25 group-hover:ring-blue-500/50 transition-all overflow-hidden shadow-sm">
              <img src={avatar} alt="Admin" className="w-full h-full object-cover" onError={e => { e.target.src = defaultAvatar; }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
          </div>
          <div className="hidden sm:block">
            <p className="font-black text-slate-800 text-[11px] uppercase tracking-wide group-hover:text-blue-600 transition-colors leading-tight">{adminName}</p>
            <p className="text-[9px] text-slate-400 uppercase tracking-wide leading-tight">Administrator</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
