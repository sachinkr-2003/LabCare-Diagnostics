import React from 'react';
import { TrendingUp } from 'lucide-react';

const themes = {
  blue: {
    gradient: 'from-blue-600 to-indigo-600',
    glow: 'hover:shadow-blue-500/20',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    bar: 'from-blue-500 via-blue-400 to-indigo-400',
    topBar: 'from-blue-500 to-indigo-500',
    ring: 'ring-blue-500/20',
    iconBg: 'from-blue-600 to-indigo-600',
    valueBg: 'from-blue-600 to-indigo-600',
    shimmer: 'rgba(59,130,246,0.06)',
  },
  emerald: {
    gradient: 'from-emerald-600 to-teal-500',
    glow: 'hover:shadow-emerald-500/20',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    bar: 'from-emerald-500 via-teal-400 to-cyan-400',
    topBar: 'from-emerald-500 to-teal-400',
    ring: 'ring-emerald-500/20',
    iconBg: 'from-emerald-600 to-teal-500',
    valueBg: 'from-emerald-600 to-teal-500',
    shimmer: 'rgba(16,185,129,0.06)',
  },
  purple: {
    gradient: 'from-purple-600 to-violet-500',
    glow: 'hover:shadow-purple-500/20',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    bar: 'from-purple-500 via-violet-400 to-fuchsia-400',
    topBar: 'from-purple-500 to-violet-500',
    ring: 'ring-purple-500/20',
    iconBg: 'from-purple-600 to-violet-500',
    valueBg: 'from-purple-600 to-violet-500',
    shimmer: 'rgba(139,92,246,0.06)',
  },
  amber: {
    gradient: 'from-amber-500 to-orange-500',
    glow: 'hover:shadow-amber-500/20',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    bar: 'from-amber-500 via-orange-400 to-red-400',
    topBar: 'from-amber-500 to-orange-400',
    ring: 'ring-amber-500/20',
    iconBg: 'from-amber-500 to-orange-500',
    valueBg: 'from-amber-500 to-orange-500',
    shimmer: 'rgba(245,158,11,0.06)',
  },
};

export default function MetricCard({ title, value, trend = 'Live', subtitle, icon, accentColor = 'blue', WatermarkIcon }) {
  const t = themes[accentColor] || themes.blue;

  return (
    <div
      className={`relative bg-white rounded-2xl border border-slate-100/80 p-4 shadow-sm hover:shadow-xl ${t.glow} transition-all duration-300 overflow-hidden group cursor-default card-hover`}
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.9) inset' }}
    >
      {/* Top gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${t.topBar} rounded-t-2xl`} />

      {/* Background shimmer on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at top left, ${t.shimmer} 0%, transparent 70%)` }}
      />

      {/* Watermark */}
      {WatermarkIcon && (
        <div className="absolute -right-4 -bottom-4 opacity-[0.035] group-hover:opacity-[0.065] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 pointer-events-none">
          <WatermarkIcon size={88} strokeWidth={1} />
        </div>
      )}

      {/* Icon + Badge */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.iconBg} flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
          {icon}
        </div>
        <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${t.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${t.dot} animate-pulse`} />
          {trend}
        </span>
      </div>

      {/* Value */}
      <div className="relative z-10">
        <h3 className={`text-3xl font-black leading-none tracking-tight tabular-nums metric-value bg-gradient-to-br ${t.valueBg} bg-clip-text text-transparent animate-count-up`}>
          {value}
        </h3>
        <p className="text-slate-700 text-[11px] font-bold uppercase tracking-wider mt-2">
          {title}
        </p>
        {subtitle && (
          <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 rounded-b-2xl overflow-hidden">
        <div className={`h-full w-3/4 bg-gradient-to-r ${t.bar} opacity-40 group-hover:opacity-70 group-hover:w-full transition-all duration-700`} />
      </div>
    </div>
  );
}
