import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  Receipt,
  Edit3,
  FileText,
  Search,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import defaultAvatar from '../assets/default-avatar.jpg';

function NavItem({ icon, label, to }) {
  return (
    <NavLink 
      to={to} 
      className={({isActive}) => `flex items-center gap-3.5 px-4 py-3 rounded-none transition-all border-l-4 ${isActive ? 'bg-blue-600 text-white font-medium border-white' : 'text-slate-400 border-transparent hover:bg-slate-700 hover:text-slate-200'}`}
    >
      {({isActive}) => (
        <>
          <div className={`${isActive ? 'text-white' : 'text-slate-400'}`}>
            {icon}
          </div>
          <span className="text-[15px] uppercase tracking-wider text-xs">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
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

  return (
    <aside className="w-[260px] bg-[#1e293b] text-white flex flex-col justify-between hidden md:flex shrink-0 rounded-none border-r border-[#1e293b]">
      <div>
        {/* Logo */}
        <div className="px-6 py-8 flex items-center gap-3 border-b border-slate-600 mb-6 bg-slate-900 rounded-none">
          <div className="text-blue-400">
            <FlaskConical size={36} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">LabCare</h1>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase mt-1">Diagnostics</p>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex flex-col gap-0">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" to="/" />
          <NavItem icon={<Users size={20} />} label="Patients" to="/patients" />
          <NavItem icon={<FlaskConical size={20} />} label="Tests Catalog" to="/tests" />
          <NavItem icon={<Receipt size={20} />} label="Create Order" to="/create-order" />
          <NavItem icon={<Edit3 size={20} />} label="Enter Results" to="/enter-result" />
          <NavItem icon={<FileText size={20} />} label="Reports" to="/reports" />
          <NavItem icon={<Search size={20} />} label="Search Report" to="/search" />
          <NavItem icon={<Settings size={20} />} label="Settings" to="/settings" />
        </nav>
      </div>

      {/* Footer Area with Profile Avatar & Logout */}
      <div>
        <Link 
          to="/profile" 
          className="px-5 py-3 border-t border-slate-700 bg-slate-900/60 flex items-center gap-3 hover:bg-slate-800 transition-colors"
          title="Go to User Profile"
        >
          <div className="w-9 h-9 border border-slate-600 rounded-none overflow-hidden shrink-0 shadow-xs">
            <img 
              src={avatar} 
              alt="Admin" 
              className="w-full h-full object-cover" 
              onError={(e) => { e.target.src = defaultAvatar; }} 
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate uppercase">{adminName}</p>
            <p className="text-[10px] text-slate-400 uppercase">Administrator</p>
          </div>
        </Link>

        {/* Logout Button */}
        <div className="px-0 py-0 border-t border-slate-700">
          <button 
            onClick={() => {
              if (window.confirm("Do you want to log out of the session?")) {
                localStorage.removeItem('lms_token');
                localStorage.removeItem('lms_user');
                window.location.href = "/login";
              }
            }}
            className="flex items-center gap-3 px-6 py-3.5 w-full text-slate-400 hover:text-white transition-colors rounded-none hover:bg-red-600 font-medium uppercase text-xs tracking-wider cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
