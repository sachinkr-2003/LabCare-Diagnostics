import React from 'react';

export default function MetricCard({ 
  title, 
  value, 
  trend = 'Live', 
  subtitle,
  icon, 
  accentColor = 'blue', // 'blue' | 'emerald' | 'purple' | 'amber'
  WatermarkIcon
}) {
  const colorThemes = {
    blue: {
      bar: 'bg-blue-600',
      iconBox: 'bg-blue-600 text-white shadow-blue-500/20',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      hoverBorder: 'hover:border-blue-500',
      dot: 'bg-blue-500'
    },
    emerald: {
      bar: 'bg-emerald-600',
      iconBox: 'bg-emerald-600 text-white shadow-emerald-500/20',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      hoverBorder: 'hover:border-emerald-500',
      dot: 'bg-emerald-500'
    },
    purple: {
      bar: 'bg-purple-600',
      iconBox: 'bg-purple-600 text-white shadow-purple-500/20',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      hoverBorder: 'hover:border-purple-500',
      dot: 'bg-purple-500'
    },
    amber: {
      bar: 'bg-amber-500',
      iconBox: 'bg-amber-500 text-white shadow-amber-500/20',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      hoverBorder: 'hover:border-amber-500',
      dot: 'bg-amber-500'
    }
  };

  const theme = colorThemes[accentColor] || colorThemes.blue;

  return (
    <div className={`relative bg-white border border-slate-300 py-3 px-3.5 sm:px-4 shadow-xs hover:shadow-md ${theme.hoverBorder} transition-all duration-200 flex flex-col justify-between group overflow-hidden rounded-none`}>
      {/* 3px Top Accent Stripe */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${theme.bar}`} />

      {/* Subtle Background Watermark Icon (Scaled down for compact height) */}
      {WatermarkIcon && (
        <div className="absolute -right-2 -bottom-2 text-slate-900/[0.04] group-hover:text-slate-900/[0.07] group-hover:scale-105 transition-all duration-300 pointer-events-none">
          <WatermarkIcon size={70} strokeWidth={1.5} />
        </div>
      )}

      {/* Top Row: Icon + Status Pill */}
      <div className="flex justify-between items-center relative z-10">
        <div className={`p-2 border shadow-xs ${theme.iconBox} group-hover:scale-105 transition-transform duration-200`}>
          {icon}
        </div>
        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border ${theme.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} animate-pulse`} />
          {trend}
        </span>
      </div>

      {/* Compact Main Metric Value & Labels */}
      <div className="mt-2.5 relative z-10">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-none tracking-tight font-sans">
          {value}
        </h3>
        <p className="text-slate-800 text-[11px] font-bold uppercase tracking-wider mt-1.5">
          {title}
        </p>
        {subtitle && (
          <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
