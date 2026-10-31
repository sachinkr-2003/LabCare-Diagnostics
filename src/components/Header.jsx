import React, { useState, useEffect } from 'react';
import { Calendar, User } from 'lucide-react';
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
    try {
      const u = JSON.parse(localStorage.getItem('lms_user'));
      return u?.name || 'Admin';
    } catch {
      return 'Admin';
    }
  });

  const loadAvatar = async () => {
    const local = localStorage.getItem('lms_avatar');
    if (local) {
      setAvatar(local);
    }
    try {
      const settings = await settingsApi.get();
      if (settings?.admin_avatar) {
        setAvatar(settings.admin_avatar);
        localStorage.setItem('lms_avatar', settings.admin_avatar);
      } else if (!local) {
        setAvatar(defaultAvatar);
      }
      if (settings?.admin_name) {
        setAdminName(settings.admin_name);
      }
    } catch {
      if (!local) setAvatar(defaultAvatar);
    }
  };

  useEffect(() => {
    loadAvatar();

    const handleAvatarUpdate = () => {
      const updated = localStorage.getItem('lms_avatar');
      setAvatar(updated || defaultAvatar);
    };

    window.addEventListener('lms_avatar_updated', handleAvatarUpdate);
    return () => window.removeEventListener('lms_avatar_updated', handleAvatarUpdate);
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
    <header className="bg-white border-b border-slate-300 h-[72px] flex items-center justify-between px-8 shrink-0 rounded-none">
      <div className="hidden md:flex items-center text-[13px] text-slate-500 font-semibold uppercase tracking-wider">
        <span>Accurate Reports</span>
        <span className="mx-3 text-slate-300">|</span>
        <span>Better Health</span>
        <span className="mx-3 text-slate-300">|</span>
        <span>Trusted Diagnostics</span>
      </div>
      
      <div className="flex items-center gap-6 ml-auto">
        <div className="flex items-center gap-3 text-slate-500 bg-slate-100 px-4 py-2 border border-slate-300 rounded-none">
          <Calendar size={18} className="text-slate-600" />
          <div className="text-right">
            <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">{currentDateTime.date}</p>
            <p className="text-[10px] font-medium tracking-wide">{currentDateTime.time}</p>
          </div>
        </div>

        <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-slate-300 hover:bg-slate-50 transition-colors p-2 cursor-pointer group">
          <div className="w-10 h-10 bg-slate-200 border-2 border-slate-400 group-hover:border-blue-600 transition-colors rounded-none overflow-hidden shrink-0 shadow-xs">
            <img 
              src={avatar} 
              alt="Admin Profile" 
              className="w-full h-full object-cover" 
              onError={(e) => { e.target.src = defaultAvatar; }}
            />
          </div>
          <div className="text-sm">
            <p className="font-bold text-slate-800 text-[13px] uppercase tracking-wider group-hover:text-blue-700">{adminName}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Administrator</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
