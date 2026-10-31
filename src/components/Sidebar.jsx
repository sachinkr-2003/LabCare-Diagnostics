import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, FlaskConical, Receipt,
  Edit3, FileText, Search, Settings, LogOut, Menu, X, Activity
} from 'lucide-react';
import defaultAvatar from '../assets/default-avatar.jpg';

function NavItem({ icon, label, to, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl transition-all duration-200 group ${
          isActive
            ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/80 text-white shadow-lg shadow-blue-500/25 nav-active-glow'
            : 'text-slate-400 hover:bg-white/6 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-gradient-to-b from-blue-300 to-indigo-400 rounded-r-full" />
          )}
          <span className={`shrink-0 transition-all duration-200 ${
            isActive
              ? 'text-white drop-shadow-sm'
              : 'text-slate-500 group-hover:text-blue-400 group-hover:scale-110'
          }`}>
            {icon}
          </span>
          <span className="text-[12.5px] font-semibold tracking-wide flex-1">{label}</span>
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse shrink-0" />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState(() => localStorage.getItem('lms_avatar') || defaultAvatar);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const update = () => {
      const saved = localStorage.getItem('lms_avatar');
      setAvatar(saved || defaultAvatar);
      try {
        const u = JSON.parse(localStorage.getItem('lms_user') || '{}');
        if (u?.name) setAdminName(u.name);
      } catch (e) {}
    };
    update();
    window.addEventListener('lms_avatar_updated', update);
    return () => window.removeEventListener('lms_avatar_updated', update);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const close = () => setOpen(false);

  const navLinks = [
    { icon: <LayoutDashboard size={17} />, label: 'Dashboard', to: '/' },
    { icon: <Users size={17} />, label: 'Patients', to: '/patients' },
    { icon: <FlaskConical size={17} />, label: 'Tests Catalog', to: '/tests' },
    { icon: <Receipt size={17} />, label: 'Create Order', to: '/create-order' },
    { icon: <Edit3 size={17} />, label: 'Enter Results', to: '/enter-result' },
    { icon: <FileText size={17} />, label: 'Reports', to: '/reports' },
    { icon: <Search size={17} />, label: 'Search Report', to: '/search' },
    { icon: <Settings size={17} />, label: 'Settings', to: '/settings' },
  ];

  const SidebarContent = () => (
    <aside
      className="w-[240px] flex flex-col justify-between h-full select-none"
      style={{
        background: 'linear-gradient(180deg, #080d1a 0%, #0d1526 30%, #0f172a 60%, #0a1020 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      {/* Logo */}
      <div>
        <div className="px-4 py-4 flex items-center gap-3 border-b border-white/6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/40 shrink-0 animate-pulse-glow">
            <FlaskConical size={19} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[14px] font-black tracking-tight text-white uppercase leading-tight">LabCare</h1>
            <p className="text-[9px] text-blue-400/80 tracking-widest uppercase font-semibold">Diagnostics LMS</p>
          </div>
          <button onClick={close} className="ml-auto text-slate-500 hover:text-white md:hidden transition-colors p-1">
            <X size={17} />
          </button>
        </div>

        {/* System status */}
        <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/15 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">System Online</span>
          <Activity size={11} className="text-emerald-400/60 ml-auto" />
        </div>

        {/* Nav label */}
        <p className="px-5 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-600">Main Menu</p>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 pb-2">
          {navLinks.slice(0, 5).map(n => <NavItem key={n.to} {...n} onClick={close} />)}
        </nav>

        <p className="px-5 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-600 border-t border-white/5">Reports & Config</p>
        <nav className="flex flex-col gap-0.5 pb-2">
          {navLinks.slice(5).map(n => <NavItem key={n.to} {...n} onClick={close} />)}
        </nav>
      </div>

      {/* Bottom: Profile + Logout */}
      <div className="border-t border-white/6">
        <Link
          to="/profile"
          onClick={close}
          className="px-3 py-3 flex items-center gap-3 hover:bg-white/4 transition-all group"
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full ring-2 ring-blue-500/40 overflow-hidden group-hover:ring-blue-400/70 transition-all">
              <img src={avatar} alt="Admin" className="w-full h-full object-cover" onError={e => { e.target.src = defaultAvatar; }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0f172a]" />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-[11px] font-black text-white truncate uppercase tracking-wide group-hover:text-blue-300 transition-colors">{adminName}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wide">Administrator</p>
          </div>
        </Link>

        <button
          onClick={() => {
            if (window.confirm('Do you want to log out?')) {
              localStorage.removeItem('lms_token');
              localStorage.removeItem('lms_user');
              window.location.href = '/login';
            }
          }}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-all text-[11px] font-semibold uppercase tracking-wider cursor-pointer border-t border-white/5 group"
        >
          <LogOut size={15} className="group-hover:rotate-12 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3.5 left-3.5 z-50 bg-slate-900/95 backdrop-blur-sm text-white p-2.5 rounded-xl shadow-xl border border-white/10 hover:bg-slate-800 transition-colors btn-press"
        aria-label="Open menu"
      >
        <Menu size={19} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={close}
          />
          <div className="relative z-50 h-full animate-slide-left shadow-2xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full">
        <SidebarContent />
      </div>
    </>
  );
}
