import React from 'react';
import { Link } from 'react-router-dom';

export default function QuickActionButton({ title, subtitle, icon, bgColor = 'bg-blue-600', hoverColor = 'hover:bg-blue-700', to, step }) {
  return (
    <Link 
      to={to || '#'} 
      className={`${bgColor} ${hoverColor} text-white p-3 py-2.5 flex flex-col items-center justify-center gap-1 transition-all shadow-xs hover:shadow-md hover:scale-[1.02] duration-200 text-center cursor-pointer rounded-none border border-black/10 relative`}
    >
      {step && (
        <span className="absolute top-1 right-1 bg-black/30 text-white text-[8.5px] font-black px-1.5 py-0.2 rounded-xs uppercase tracking-tighter border border-white/20">
          {step}
        </span>
      )}
      <div className="text-white mt-0.5">
        {icon}
      </div>
      <div className="text-center">
        <h4 className="font-black text-xs uppercase tracking-wider text-white leading-tight">
          {title}
        </h4>
        <p className="text-[10px] text-white/85 font-medium uppercase tracking-wider mt-0.5">
          {subtitle}
        </p>
      </div>
    </Link>
  );
}
