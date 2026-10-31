import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Printer, X, ShieldCheck, CheckCircle2, Award, 
  QrCode, Activity, Building, User, Calendar, Stethoscope, FileCheck, Phone
} from 'lucide-react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export default function DiagnosticReportModal({ report, lab, onClose }) {
  const barcodeRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Isolate print mode on body to prevent dashboard background from ever printing
  useEffect(() => {
    document.body.classList.add('report-print-mode');
    return () => {
      document.body.classList.remove('report-print-mode');
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Generate dynamic QR Code & Barcode
  useEffect(() => {
    if (!report) return;

    const reportIdentifier = report.report_id || report.id || 'ORD-1005';
    const patientName = report.patient_name || 'Patient';
    const reportDate = report.report_date || report.date || new Date().toISOString().split('T')[0];

    // QR Code payload for mobile verification
    const qrText = `APEX DIAGNOSTIC CENTRE\nVerified Report: ${reportIdentifier}\nPatient: ${patientName}\nDate: ${reportDate}\nAddress: मीरगंज रोड भोरे, पंजाब नेशनल बैंक के बगल में (भोरे)\nHelpline: 8102002499, 8084602700`;
    QRCode.toDataURL(qrText, {
      width: 160,
      margin: 1,
      color: { dark: '#0b1e3b', light: '#ffffff' }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code error:', err));

    // Barcode generation
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, reportIdentifier, {
          format: 'CODE128',
          width: 1.5,
          height: 34,
          displayValue: false,
          margin: 0,
          lineColor: '#0b1e3b'
        });
      } catch (err) {
        console.error('Barcode error:', err);
      }
    }
  }, [report]);

  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) {
      const now = new Date();
      return `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    }
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Group results by category
  const groupedResults = (report.results || []).reduce((acc, curr) => {
    const cat = curr.test_category || 'BIOCHEMISTRY';
    const normalizedCat = cat.toUpperCase();
    if (!acc[normalizedCat]) acc[normalizedCat] = [];
    acc[normalizedCat].push(curr);
    return acc;
  }, {});

  // Parse min and max for range calculation & visual indicator
  const parseRange = (rangeStr) => {
    if (!rangeStr) return null;
    const match = rangeStr.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
    if (match) {
      return { min: parseFloat(match[1]), max: parseFloat(match[2]), type: 'between' };
    }
    const matchLess = rangeStr.match(/<\s*([\d.]+)/);
    if (matchLess) {
      return { min: 0, max: parseFloat(matchLess[1]), type: 'less' };
    }
    const matchGreater = rangeStr.match(/>\s*([\d.]+)/);
    if (matchGreater) {
      return { min: parseFloat(matchGreater[1]), max: parseFloat(matchGreater[1]) * 2, type: 'greater' };
    }
    return null;
  };

  // Render Visual Range Sparkline Gauge
  const renderRangeGauge = (valStr, rangeStr) => {
    const num = parseFloat(valStr);
    const range = parseRange(rangeStr);
    if (isNaN(num) || !range) return null;

    let percent = 50;
    if (range.type === 'between') {
      const span = range.max - range.min;
      if (span > 0) {
        percent = ((num - range.min) / span) * 60 + 20; // 20% to 80% is normal
      }
    } else if (range.type === 'less') {
      percent = (num / range.max) * 70;
    }

    percent = Math.max(5, Math.min(95, percent));
    const isOut = (range.type === 'between' && (num < range.min || num > range.max)) || 
                  (range.type === 'less' && num > range.max);

    return (
      <div className="w-20 mx-auto mt-0.5 flex flex-col items-center">
        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden flex relative">
          <div className="w-[20%] h-full bg-blue-300"></div>
          <div className="w-[60%] h-full bg-emerald-300"></div>
          <div className="w-[20%] h-full bg-rose-300"></div>
          <div 
            className={`absolute top-0 w-1.5 h-1.5 -mt-[1px] rounded-full shadow-xs ${
              isOut ? 'bg-rose-600 ring-2 ring-rose-200' : 'bg-emerald-700 ring-2 ring-emerald-200'
            }`}
            style={{ left: `calc(${percent}% - 3px)` }}
          ></div>
        </div>
        <div className="w-full flex justify-between text-[7px] font-mono text-slate-400">
          <span>L</span>
          <span>N</span>
          <span>H</span>
        </div>
      </div>
    );
  };

  // Determine High / Low flag styling & indicator
  const renderObservedResult = (res) => {
    const val = (res.result_value || '').trim();
    if (!val) {
      return <span className="text-slate-400 italic font-mono text-xs">-</span>;
    }

    const flag = (res.flag || '').toLowerCase();
    const num = parseFloat(val);
    const range = parseRange(res.normal_range);

    let isHigh = flag.includes('high') || flag.includes('▲');
    let isLow = flag.includes('low') || flag.includes('▼');

    if (!isHigh && !isLow && range && !isNaN(num)) {
      if (range.type === 'between') {
        if (num > range.max) isHigh = true;
        if (num < range.min) isLow = true;
      } else if (range.type === 'less' && num > range.max) {
        isHigh = true;
      }
    }

    if (isHigh) {
      return (
        <div className="inline-flex flex-col items-center">
          <span className="font-black text-rose-600 text-xs sm:text-[13px] flex items-center gap-1">
            <span className="text-[11px] leading-none text-rose-600">▲</span>
            <span className="underline decoration-rose-400 decoration-1 underline-offset-2">{val}</span>
          </span>
          {renderRangeGauge(val, res.normal_range)}
        </div>
      );
    }

    if (isLow) {
      return (
        <div className="inline-flex flex-col items-center">
          <span className="font-black text-blue-600 text-xs sm:text-[13px] flex items-center gap-1">
            <span className="text-[11px] leading-none text-blue-600">▼</span>
            <span className="underline decoration-blue-400 decoration-1 underline-offset-2">{val}</span>
          </span>
          {renderRangeGauge(val, res.normal_range)}
        </div>
      );
    }

    return (
      <div className="inline-flex flex-col items-center">
        <span className="text-slate-900 font-bold text-xs">{val}</span>
        {renderRangeGauge(val, res.normal_range)}
      </div>
    );
  };

  // EXACT LAB DETAILS AS PROVIDED ON YELLOW CARD SLIP
  const labName = lab?.lab_name || report.lab?.lab_name || 'APEX DIAGNOSTIC CENTRE';
  const labAddressHindi = 'मीरगंज रोड भोरे, पंजाब नेशनल बैंक के बगल में (भोरे)';
  const labAddressEnglish = 'MIRGANJ ROAD BHORE, NEAR PUNJAB NATIONAL BANK (BHORE)';
  const labPhone = '8102002499, 8084602700';
  const labTagline = 'होम कलेक्शन की सुविधा • ई० सी० जी० की सुविधा • 24 घण्टे सेवा उपलब्ध';
  const rawDoctor = report.doctor_name || report.doctor || '';
  const doctorName = rawDoctor.trim() ? rawDoctor.trim() : 'Self';
  const formattedDate = formatDate(report.report_date || report.date);

  // Modal content wrapped in Portal
  const modalContent = (
    <div id="report-print-portal">
      <div 
        onClick={onClose}
        className="print-modal-backdrop fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="print-modal-card bg-white border-2 border-slate-900 max-w-[840px] w-full max-h-[95vh] flex flex-col shadow-2xl relative rounded-none overflow-hidden my-auto"
        >
          {/* Sticky Action Toolbar (Screen Only, Hidden in Print) */}
          <div className="bg-gradient-to-r from-[#0b1e3b] via-[#10376d] to-[#0ea5e9] text-white px-5 py-3 flex justify-between items-center shrink-0 border-b border-blue-900/60 shadow-md print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/10 rounded-full border border-white/20">
                <ShieldCheck size={18} className="text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-black tracking-wider text-white">
                    Diagnostic Report Preview
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                    Ready to Print (A4)
                  </span>
                </div>
                <p className="text-[10px] text-cyan-200 font-mono">
                  Order ID: <span className="font-bold text-white">{report.report_id || report.id}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-1.5 text-xs font-bold uppercase rounded-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-md border border-blue-400/30"
                title="Print to printer or save as PDF"
              >
                <Printer size={15} /> Print / Save PDF
              </button>
              <button
                onClick={onClose}
                className="bg-white/10 hover:bg-red-600 text-white px-3 py-1.5 text-xs font-bold uppercase rounded-sm flex items-center gap-1 transition-all cursor-pointer border border-white/20"
                title="Close window (Esc)"
              >
                <X size={15} /> Close
              </button>
            </div>
          </div>

          {/* Scrollable Report Canvas (A4 Styled) */}
          <div className="overflow-y-auto flex-1 bg-slate-200/70 p-2 sm:p-5 print:p-0 print:bg-white print:overflow-visible">
            
            {/* A4 Sheet Container */}
            <div 
              id="printable-diagnostic-report"
              className="bg-white mx-auto shadow-2xl p-5 sm:p-6 max-w-[794px] w-full border border-slate-300 flex flex-col justify-between text-slate-900 relative overflow-hidden"
              style={{ minHeight: '1060px' }}
            >
              {/* ================= BACKGROUND CENTER WATERMARK ================= */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                <div className="flex flex-col items-center justify-center -rotate-25 opacity-[0.05] print:opacity-[0.06] text-center w-full max-w-[620px] px-4">
                  {/* ADC Crest Ring Motif */}
                  <div className="w-72 h-72 rounded-full border-6 border-dashed border-[#0b1e3b] p-3 flex items-center justify-center mb-3">
                    <div className="w-full h-full rounded-full border-4 border-[#0284c7] flex flex-col items-center justify-center p-4">
                      <span className="text-4xl font-black text-[#0b1e3b] tracking-widest font-serif">ADC</span>
                      <span className="text-[10px] font-black tracking-widest text-[#0b1e3b] uppercase mt-1">
                        APEX DIAGNOSTIC CENTRE
                      </span>
                      <span className="text-[8px] font-bold text-slate-600 uppercase mt-0.5">
                        मीरगंज रोड भोरे
                      </span>
                    </div>
                  </div>

                  <span 
                    className="text-4xl sm:text-5xl font-black italic tracking-wider text-[#0b1e3b] uppercase leading-none whitespace-nowrap"
                    style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
                  >
                    {labName}
                  </span>
                  <span className="text-xs font-extrabold tracking-[0.25em] text-[#1d4ed8] uppercase mt-1.5">
                    DIAGNOSTIC & CLINICAL RESEARCH CENTRE
                  </span>
                </div>
              </div>

              {/* ================= TOP SECTION ================= */}
              <div className="space-y-3 relative z-10">
                
                {/* 1. Header Section */}
                <div className="relative border-b-2 border-slate-900 pb-2.5">
                  {/* Upper Accreditation Pills */}
                  <div className="flex justify-between items-center text-[8.5px] font-bold uppercase tracking-wider text-slate-500 pb-1.5 border-b border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-900 text-white px-1.5 py-0.2 rounded-xs font-black tracking-widest">
                        NABL COMPLIANT
                      </span>
                      <span className="bg-blue-50 text-blue-800 border border-blue-300 px-1.5 py-0.2 rounded-xs font-bold">
                        ISO 9001:2015 CERTIFIED
                      </span>
                      <span className="hidden sm:inline text-slate-400">•</span>
                      <span className="hidden sm:inline text-slate-600 font-semibold">
                        ICMR ALIGNED QUALITY PROTOCOLS
                      </span>
                    </div>
                    <div className="text-right font-mono text-slate-700">
                      REG. NO: <span className="font-bold text-slate-900">{lab?.reg_number || 'UP-DEO-2024-5412'}</span>
                    </div>
                  </div>

                  {/* Main Banner: Logo + Exact Address & Phones */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    {/* Left: Authentic ADC Circular Emblem (From user slip) */}
                    <div className="relative shrink-0 flex items-center justify-center">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-[#b91c1c] p-1 flex items-center justify-center bg-white shadow-xs relative">
                        <div className="w-full h-full rounded-full border border-[#0b1e3b] flex flex-col items-center justify-center bg-gradient-to-br from-amber-50/50 via-white to-red-50/30 text-center">
                          <span className="text-[7px] font-black text-[#b91c1c] uppercase tracking-tighter leading-none">APEX</span>
                          <span className="text-base sm:text-lg font-black text-[#0b1e3b] tracking-wider leading-none font-serif">ADC</span>
                          <span className="text-[6.5px] font-bold text-slate-600 uppercase tracking-tighter leading-none mt-0.5">BHORE</span>
                        </div>
                      </div>
                    </div>

                    {/* Center: Lab Name + Exact Hindi & English Address */}
                    <div className="flex-1 text-center px-1">
                      <h1 
                        className="text-2xl sm:text-[28px] font-black italic uppercase tracking-normal text-[#0b1e3b] leading-tight drop-shadow-xs"
                        style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
                      >
                        {labName}
                      </h1>
                      
                      {/* Hindi Address (Exact from slip) */}
                      <p className="text-[12px] sm:text-[13px] font-black text-[#b91c1c] tracking-wide mt-0.5">
                        📍 {labAddressHindi}
                      </p>
                      
                      {/* English Address Transliteration */}
                      <p className="text-[10px] font-extrabold text-[#1d4ed8] uppercase tracking-wide">
                        {labAddressEnglish}
                      </p>

                      {/* Phone Numbers with WhatsApp Icon */}
                      <div className="flex items-center justify-center gap-2 mt-1 text-[11px] font-black text-slate-900">
                        <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-xs">
                          📞 WhatsApp / Helpline: <span className="font-mono text-[#0b1e3b]">{labPhone}</span>
                        </span>
                      </div>

                      {/* Facilities Ribbon (From user slip) */}
                      <div className="mt-1">
                        <span className="text-[9.5px] font-black text-white bg-gradient-to-r from-[#0b1e3b] via-[#1d4ed8] to-[#0b1e3b] px-3 py-0.5 rounded-xs tracking-wider uppercase inline-block">
                          {labTagline}
                        </span>
                      </div>
                    </div>

                    {/* Right: Microscope Icon Emblem (From user slip) */}
                    <div className="relative shrink-0 hidden sm:flex items-center justify-center">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-[#0b1e3b] p-1 flex items-center justify-center bg-white shadow-xs">
                        <div className="w-full h-full rounded-full border border-blue-400 flex items-center justify-center bg-blue-50/50">
                          <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#0b1e3b]" fill="currentColor">
                            <path d="M50 12 C47 12 45 14 45 17 L45 35 C45 38 47 40 50 40 C53 40 55 38 55 35 L55 17 C55 14 53 12 50 12 Z" fill="#0b1e3b" />
                            <circle cx="50" cy="15" r="4" fill="#0ea5e9" />
                            <rect x="44" y="34" width="12" height="5" rx="1" fill="#0f2b5c" />
                            <path d="M48 39 L46 47 L54 47 L52 39 Z" fill="#64748b" />
                            <rect x="36" y="55" width="28" height="4" rx="1" fill="#0b1e3b" />
                            <path d="M60 30 C72 35 74 52 64 64 L56 56 C62 48 59 38 52 35 Z" fill="#0f2b5c" />
                            <rect x="52" y="62" width="6" height="18" fill="#1e293b" />
                            <ellipse cx="50" cy="84" rx="30" ry="7" fill="#0f2b5c" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Demographics Box (Exact to User Demo Image) */}
                <div className="border border-slate-300 rounded-sm bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 p-2.5 shadow-2xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0b1e3b] via-[#0284c7] to-[#1d4ed8]"></div>

                  <div className="grid grid-cols-12 gap-2.5 items-center pt-0.5">
                    {/* Left Column: Patient Personal Info (5 cols) */}
                    <div className="col-span-12 sm:col-span-5 space-y-1 text-xs border-b sm:border-b-0 sm:border-r border-slate-200 pb-1.5 sm:pb-0 pr-2">
                      <div className="flex items-start">
                        <span className="w-24 text-slate-500 font-bold uppercase text-[10px] shrink-0 pt-0.5">Patient Name</span>
                        <span className="font-black text-slate-900 mr-2">:</span>
                        <div className="flex-1">
                          <span className="font-black text-xs sm:text-sm uppercase text-slate-900 tracking-tight">
                            {report.patient_name || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <span className="w-24 text-slate-500 font-bold uppercase text-[10px] shrink-0">Age & Sex</span>
                        <span className="font-black text-slate-900 mr-2">:</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {report.patient_age ? `${report.patient_age} Yrs` : '-'} | {report.patient_gender || 'General'}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-24 text-slate-500 font-bold uppercase text-[10px] shrink-0">Address</span>
                        <span className="font-black text-slate-900 mr-2">:</span>
                        <span className="font-semibold text-slate-800 text-xs uppercase truncate">
                          {report.patient_address || report.address || 'भोरे (गोपालगंज)'}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-24 text-slate-500 font-bold uppercase text-[10px] shrink-0">Mobile No.</span>
                        <span className="font-black text-slate-900 mr-2">:</span>
                        <span className="font-medium text-slate-800 font-mono text-xs">
                          {report.patient_phone || '-'}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-24 text-slate-500 font-bold uppercase text-[10px] shrink-0">Referred By</span>
                        <span className="font-black text-slate-900 mr-2">:</span>
                        <span className="font-extrabold uppercase text-slate-900 text-xs">
                          {doctorName}
                        </span>
                      </div>
                    </div>

                    {/* Middle Column: Lab Sample & Tracking Metadata (4 cols) */}
                    <div className="col-span-8 sm:col-span-4 space-y-1 text-xs border-r border-slate-200 pr-2">
                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 font-bold uppercase text-[10px] shrink-0">Sl. No.</span>
                        <span className="font-black text-slate-900 mr-2">:</span>
                        <span className="font-mono font-black text-xs text-[#0b1e3b]">
                          {report.report_id || report.id || '1'}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 font-bold uppercase text-[10px] shrink-0">Collection Date</span>
                        <span className="font-black text-slate-900 mr-2">:</span>
                        <span className="font-bold text-slate-800 text-xs font-mono">{formattedDate}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 font-bold uppercase text-[10px] shrink-0">Reporting Date</span>
                        <span className="font-black text-slate-900 mr-2">:</span>
                        <span className="font-bold text-slate-800 text-xs font-mono">{formattedDate}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 font-bold uppercase text-[10px] shrink-0">Collection Centre</span>
                        <span className="font-black text-slate-900 mr-2">:</span>
                        <span className="font-medium text-slate-700 text-xs">-</span>
                      </div>
                    </div>

                    {/* Right Column: Security QR Code Card (3 cols) */}
                    <div className="col-span-4 sm:col-span-3 flex flex-col items-center justify-center text-center pl-1">
                      <div className="p-1 bg-white border border-slate-300 rounded-sm shadow-xs">
                        {qrDataUrl ? (
                          <img 
                            src={qrDataUrl} 
                            alt="Verification QR" 
                            className="w-14 h-14 sm:w-16 sm:h-16 object-contain" 
                          />
                        ) : (
                          <div className="w-14 h-14 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                            QR CODE
                          </div>
                        )}
                      </div>
                      <span className="text-[8px] font-extrabold uppercase text-slate-600 tracking-wider mt-1 inline-flex items-center gap-0.5">
                        <ShieldCheck size={9} className="text-emerald-600" /> Digital Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Investigation Table */}
                <div className="border border-slate-900 rounded-xs overflow-hidden">
                  <div className="grid grid-cols-12 bg-slate-100 border-b border-slate-900 py-1.5 px-3 text-[11px] font-black uppercase tracking-wider text-slate-900">
                    <div className="col-span-5 text-left">Test Name</div>
                    <div className="col-span-2 text-center">Results</div>
                    <div className="col-span-2 text-center">Units</div>
                    <div className="col-span-3 text-left pl-2">Reference Range</div>
                  </div>

                  <div className="divide-y divide-slate-300">
                    {Object.keys(groupedResults).map((categoryName) => (
                      <div key={categoryName}>
                        <div className="bg-slate-200/90 px-3 py-1 text-center font-black text-xs uppercase tracking-widest text-slate-900 border-b border-slate-300">
                          {categoryName}
                        </div>

                        <div className="divide-y divide-slate-200">
                          {groupedResults[categoryName].map((res, idx) => (
                            <div
                              key={res.id || idx}
                              className={`px-3 py-2 grid grid-cols-12 items-center text-xs ${
                                idx % 2 === 1 ? 'bg-slate-50/50 print:bg-transparent' : 'bg-white print:bg-transparent'
                              }`}
                            >
                              <div className="col-span-5 text-left pr-2">
                                <p className="font-extrabold text-slate-900 uppercase text-xs">
                                  {res.parameter_name}
                                </p>
                                {(res.test_name && res.test_name !== res.parameter_name) && (
                                  <p className="text-[9.5px] text-slate-500 italic">
                                    {res.test_name}
                                  </p>
                                )}
                              </div>

                              <div className="col-span-2 text-center flex items-center justify-center">
                                {renderObservedResult(res)}
                              </div>

                              <div className="col-span-2 text-center font-bold text-slate-700 text-xs font-mono">
                                {res.unit || '-'}
                              </div>

                              <div className="col-span-3 text-left pl-2 text-slate-800 text-xs font-medium font-mono">
                                {res.normal_range || 'Standard'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {(!report.results || report.results.length === 0) && (
                      <div className="p-6 text-center text-slate-400 italic text-xs">
                        No parameters recorded for this diagnostic order.
                      </div>
                    )}
                  </div>
                </div>

                {/* End of Report Line */}
                <div className="text-center py-1">
                  <span className="text-[11px] font-medium text-slate-600 tracking-wider">
                    --------- End of report ---------
                  </span>
                </div>
              </div>

              {/* ================= BOTTOM SECTION: EXACT AS DEMO ================= */}
              <div className="pt-8 pb-1 space-y-4 relative z-10">
                {/* Centered Vector Barcode */}
                <div className="flex flex-col items-center justify-center">
                  <svg ref={barcodeRef} className="max-w-[190px] h-8"></svg>
                </div>

                {/* Exact Signatures Row: Only 'Checked By' & 'Consultant Pathologist' */}
                <div className="flex justify-between items-center px-2">
                  <div className="text-left font-black text-slate-900 text-xs sm:text-sm uppercase tracking-tight">
                    Checked By
                  </div>
                  <div className="text-right font-black text-slate-900 text-xs sm:text-sm uppercase tracking-tight">
                    Consultant Pathologist
                  </div>
                </div>

                {/* Exact Demo Technical Disclaimer & Page Number */}
                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1 text-[8.5px] text-slate-600 leading-tight">
                  <div>
                    <p className="font-bold">
                      Note: Pathological Test have technical limitations. For any disparity repeated examination are required.
                    </p>
                    <p className="font-bold">
                      No legal liability is accepted. Clinical correlation is also requested.
                    </p>
                  </div>
                  <div className="text-center sm:text-right font-black text-slate-700 uppercase shrink-0 text-[9px]">
                    Page 1 of 1
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Sticky Bottom Action Bar (Screen Only, Hidden in Print) */}
          <div className="bg-slate-100 px-5 py-2.5 border-t border-slate-300 flex justify-between items-center shrink-0 print:hidden">
            <span className="text-[11px] text-slate-500">
              Press <kbd className="bg-slate-200 px-1 border border-slate-300 text-slate-700 text-[10px] font-mono">Esc</kbd> or click outside to close
            </span>
            <div className="flex gap-2">
              <button 
                onClick={onClose}
                className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-4 py-1.5 text-xs font-bold uppercase rounded-sm transition-colors cursor-pointer"
              >
                Cancel / Close
              </button>
              <button 
                onClick={handlePrint}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-1.5 text-xs font-bold uppercase rounded-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Printer size={14} /> Print Report
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
