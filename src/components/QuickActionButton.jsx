import React from 'react';
import { Link } from 'react-router-dom';

export default function QuickActionButton({ title, subtitle, icon, bgColor = 'bg-blue-600', hoverColor = 'hover:bg-blue-700', to, step }) {
  return (
    <Link
      to={to || '#'}
      className={`${bgColor} ${hoverColor} text-white p-3.5 flex flex-col items-center justify-center gap-2 transition-all duration-200 text-center cursor-pointer rounded-xl border border-white/15 relative shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-95 active:translate-y-0 group overflow-hidden btn-press`}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Top shine line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {step && (
        <span className="absolute top-1.5 right-1.5 bg-black/20 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tight backdrop-blur-sm">
          {step}
        </span>
      )}

      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 group-hover:scale-110 transition-all duration-200 shadow-inner">
        {icon}
      </div>
      <div className="text-center relative z-10">
        <h4 className="font-bold text-[11px] uppercase tracking-wide text-white leading-tight">{title}</h4>
        <p className="text-[9px] text-white/70 font-medium mt-0.5">{subtitle}</p>
      </div>
    </Link>
  );
}
