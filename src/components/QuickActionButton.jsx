import React from 'react';
import { Link } from 'react-router-dom';

export default function QuickActionButton({ title, subtitle, icon, bgColor = 'bg-blue-600', hoverColor = 'hover:bg-blue-700', to }) {
  return (
    <Link
      to={to || '#'}
      className={`${bgColor} ${hoverColor} text-white p-3.5 flex flex-col items-center justify-center gap-2 transition-colors text-center cursor-pointer border border-white/10 relative overflow-hidden`}
    >
      <div className="w-9 h-9 bg-white/15 flex items-center justify-center">
        {icon}
      </div>
      <div className="text-center">
        <h4 className="font-bold text-[11px] uppercase tracking-wide text-white leading-tight">{title}</h4>
        <p className="text-[9px] text-white/70 font-medium mt-0.5">{subtitle}</p>
      </div>
    </Link>
  );
}
