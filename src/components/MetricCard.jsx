import React from 'react';

export default function MetricCard({ title, value, trend = 'Live', subtitle, icon, accentColor = 'blue', WatermarkIcon }) {
  const themes = {
    blue:    { bar: 'bg-blue-600',    iconBox: 'bg-blue-600 text-white',    badge: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500' },
    emerald: { bar: 'bg-emerald-600', iconBox: 'bg-emerald-600 text-white', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    purple:  { bar: 'bg-purple-600',  iconBox: 'bg-purple-600 text-white',  badge: 'bg-purple-50 text-purple-700 border-purple-200',  dot: 'bg-purple-500' },
    amber:   { bar: 'bg-amber-500',   iconBox: 'bg-amber-500 text-white',   badge: 'bg-amber-50 text-amber-800 border-amber-200',   dot: 'bg-amber-500' },
  };
  const t = themes[accentColor] || themes.blue;

  return (
    <div className="relative bg-white border border-slate-300 py-3 px-3.5 shadow-sm flex flex-col justify-between overflow-hidden">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${t.bar}`} />

      {/* Icon + Badge */}
      <div className="flex justify-between items-center mt-1">
        <div className={`p-2 ${t.iconBox}`}>{icon}</div>
        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border ${t.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${t.dot} animate-pulse`} />
          {trend}
        </span>
      </div>

      {/* Value */}
      <div className="mt-2.5">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-none tracking-tight">
          {value}
        </h3>
        <p className="text-slate-800 text-[11px] font-bold uppercase tracking-wider mt-1.5">{title}</p>
        {subtitle && <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
