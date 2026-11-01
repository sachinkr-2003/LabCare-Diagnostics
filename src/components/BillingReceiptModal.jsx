import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, CheckCircle2, Receipt, ArrowRight, ShieldCheck, Phone, Stethoscope, User, Calendar } from 'lucide-react';
import JsBarcode from 'jsbarcode';

export default function BillingReceiptModal({ order, lab, onClose, onEnterResults }) {
  const barcodeRef = useRef(null);

  // Isolate print mode on body to prevent dashboard background from printing
  useEffect(() => {
    document.body.classList.add('receipt-print-mode');
    return () => {
      document.body.classList.remove('receipt-print-mode');
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Render Barcode
  useEffect(() => {
    if (barcodeRef.current && order?.id) {
      try {
        JsBarcode(barcodeRef.current, order.id, {
          format: 'CODE128',
          width: 1.4,
          height: 32,
          displayValue: false,
          margin: 0,
          lineColor: '#0b1e3b'
        });
      } catch (err) {
        console.error('Barcode error:', err);
      }
    }
  }, [order]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const labName = lab?.lab_name || 'APEX DIAGNOSTIC CENTRE';
  const labAddressHindi = 'मीरगंज रोड भोरे, पंजाब नेशनल बैंक के बगल में (भोरे)';
  const labAddressEnglish = 'MIRGANJ ROAD BHORE, NEAR PUNJAB NATIONAL BANK (BHORE)';
  const labPhone = '8102002499, 8084602700';
  const labTagline = 'होम कलेक्शन की सुविधा • ई० सी० जी० की सुविधा • 24 घण्टे सेवा उपलब्ध';

  const modalContent = (
    <div id="receipt-print-portal">
      <div 
        onClick={onClose}
        className="print-modal-backdrop fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-3 sm:p-5 overflow-hidden"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="print-modal-card bg-white border-2 border-slate-900 max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl relative rounded-none overflow-hidden my-auto"
        >
          {/* Sticky Top Header (Hidden when printing) */}
          <div className="bg-gradient-to-r from-[#0b1e3b] via-[#10376d] to-[#0ea5e9] text-white px-5 py-3 flex justify-between items-center shrink-0 border-b border-blue-900/60 print:hidden shadow-md">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-full border border-white/20">
                <Receipt size={16} className="text-cyan-300" />
              </div>
              <div>
                <span className="text-xs uppercase font-black tracking-wider text-white">
                  Official Payment Receipt
                </span>
                <p className="text-[10px] font-mono text-cyan-200">
                  INVOICE: <span className="font-bold text-white">{order.id}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrint}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-1.5 text-xs font-bold uppercase rounded-none flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-emerald-400/30"
              >
                <Printer size={14} /> Print Receipt Slip
              </button>
              <button 
                onClick={onClose}
                className="bg-white/10 hover:bg-red-600 text-white px-3 py-1.5 text-xs font-bold uppercase rounded-none flex items-center gap-1 transition-all cursor-pointer border border-white/20"
              >
                <X size={15} /> Close
              </button>
            </div>
          </div>

          {/* Scrollable Receipt Body with Center Watermark */}
          <div 
            id="printable-billing-receipt"
            className="overflow-y-auto flex-1 p-5 font-sans text-slate-800 relative overflow-hidden bg-white"
          >
            {/* Center Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
              <div className="flex flex-col items-center justify-center opacity-[0.14] print:opacity-[0.16] text-center w-full px-4 mix-blend-multiply">
                <img 
                  src="/apex-logo.jpg" 
                  alt="Watermark" 
                  className="w-56 h-56 object-contain rounded-full" 
                />
              </div>
            </div>

            {/* Receipt Content Header */}
            <div className="text-center border-b-2 border-slate-900 pb-3 relative z-10">
              <div className="flex items-center justify-center gap-2 mb-1">
                <img 
                  src="/apex-logo.jpg" 
                  alt="Apex Logo" 
                  className="w-12 h-12 object-contain rounded-full border border-slate-900 bg-white"
                />
                <h1 
                  className="text-2xl font-black italic uppercase tracking-tight text-[#0b1e3b]"
                  style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
                >
                  {labName}
                </h1>
              </div>

              {/* Hindi & English Address */}
              <p className="text-[12px] font-black text-[#b91c1c] tracking-wide mt-0.5">
                📍 {labAddressHindi}
              </p>
              <p className="text-[10px] font-extrabold text-[#1d4ed8] uppercase tracking-wide">
                {labAddressEnglish}
              </p>
              <p className="text-[10.5px] font-bold text-slate-800 mt-0.5">
                📞 HELPLINE: <span className="font-mono text-[#0b1e3b] font-black">{labPhone}</span> • REG: {lab?.reg_number || 'UP-DEO-2024-5412'}
              </p>

              <div className="mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-[#0b1e3b] to-[#10376d] text-white text-[9.5px] font-black uppercase px-3 py-1 tracking-wider rounded-xs shadow-xs">
                <Receipt size={12} className="text-cyan-300" /> PATIENT MONEY RECEIPT / ACKNOWLEDGEMENT SLIP
              </div>
            </div>

            {/* Receipt Info Grid */}
            <div className="border border-slate-300 rounded-sm p-2.5 bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 print:bg-transparent grid grid-cols-2 gap-y-1 text-xs shadow-2xs mt-3 relative z-10">
              <div className="flex">
                <span className="w-24 font-bold text-slate-500 uppercase text-[10px]">Receipt No</span>
                <span className="font-bold text-slate-900 mr-1">:</span>
                <span className="font-mono font-black text-slate-900 text-xs">{order.id}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-bold text-slate-500 uppercase text-[10px]">Bill Date</span>
                <span className="font-bold text-slate-900 mr-1">:</span>
                <span className="font-bold text-slate-900 text-xs font-mono">{formatDate(order.created_at)}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-bold text-slate-500 uppercase text-[10px]">Patient Name</span>
                <span className="font-bold text-slate-900 mr-1">:</span>
                <span className="font-black text-slate-900 uppercase text-xs">
                  {order.patient_name || order.patientDetails?.name}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 font-bold text-slate-500 uppercase text-[10px]">Patient ID</span>
                <span className="font-bold text-slate-900 mr-1">:</span>
                <span className="font-bold text-slate-900 font-mono text-xs">{order.patient_id}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-bold text-slate-500 uppercase text-[10px]">Age / Sex</span>
                <span className="font-bold text-slate-900 mr-1">:</span>
                <span className="font-bold text-slate-800">
                  {order.patient_age || order.patientDetails?.age} Y / {order.patient_gender || order.patientDetails?.gender}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 font-bold text-slate-500 uppercase text-[10px]">Contact No</span>
                <span className="font-bold text-slate-900 mr-1">:</span>
                <span className="font-medium text-slate-800 font-mono">
                  {order.patient_phone || order.patientDetails?.phone || '-'}
                </span>
              </div>
              <div className="col-span-2 flex pt-0.5 border-t border-slate-200 mt-0.5">
                <span className="w-24 font-bold text-slate-500 uppercase text-[10px]">Referred By</span>
                <span className="font-bold text-slate-900 mr-1">:</span>
                <span className="font-extrabold uppercase text-slate-900">
                  {(order.doctor_name && order.doctor_name.trim()) ? order.doctor_name.trim() : 'Self'}
                </span>
              </div>
            </div>

            {/* Booked Tests Table */}
            <div className="border border-slate-300 rounded-sm overflow-hidden shadow-2xs mt-3 relative z-10">
              <table className="w-full text-xs text-left border-collapse bg-white/90 print:bg-transparent">
                <thead className="bg-gradient-to-r from-[#0b1e3b] to-[#10376d] text-white font-bold uppercase text-[10px] tracking-wider border-b border-slate-900">
                  <tr>
                    <th className="p-2 border-r border-blue-900/50 w-10 text-center">#</th>
                    <th className="p-2 border-r border-blue-900/50">Prescribed Investigation</th>
                    <th className="p-2 text-right w-28">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/30">
                        <td className="p-2 border-r border-slate-200 text-center text-slate-500 font-bold">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-200 font-black text-slate-900">{item.test_name || item.name}</td>
                        <td className="p-2 text-right font-mono font-black text-slate-900">
                          ₹{Number(item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2 border-r border-slate-200 text-center text-slate-500 font-bold">1</td>
                      <td className="p-2 border-r border-slate-200 font-black text-slate-900">
                        {order.test_names || order.test_name || 'Standard Lab Panel'}
                      </td>
                      <td className="p-2 text-right font-mono font-black text-slate-900">
                        ₹{Number(order.total_amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Payment Summary */}
            <div className="border border-slate-300 rounded-sm p-2.5 bg-gradient-to-r from-slate-50 via-emerald-50/20 to-slate-50 print:bg-transparent flex justify-between items-center text-xs shadow-2xs mt-3 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xs">
                  <CheckCircle2 size={13} className="text-emerald-200" /> STATUS: {order.payment_status || 'PAID'}
                </div>
                <p className="text-[10px] text-slate-600 font-bold">Payment Method: Cash / UPI / Digital POS</p>
              </div>
              <div className="w-52 space-y-1 text-right">
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Gross Subtotal:</span>
                  <span className="font-bold text-slate-800">₹{Number(order.total_amount || 0).toFixed(2)}</span>
                </div>
                {Number(order.discount || 0) > 0 && (
                  <div className="flex justify-between text-[11px] text-rose-600 font-bold">
                    <span>Special Discount:</span>
                    <span>- ₹{Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-black text-slate-900 pt-0.5 border-t border-slate-300">
                  <span>NET TOTAL PAID:</span>
                  <span className="text-emerald-700 font-mono text-base font-black">
                    ₹{Number(order.net_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Barcode & Signatures */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 mt-3 relative z-10">
              <div className="flex flex-col">
                <svg ref={barcodeRef} className="h-7 max-w-[150px]"></svg>
                <span className="text-[8.5px] font-mono text-slate-600 font-bold mt-0.5">{order.id}</span>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-black text-slate-700">Authorized Billing Desk</p>
                <p className="text-[8px] font-mono text-slate-400">APEX DIAGNOSTICS</p>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="bg-slate-100 px-5 py-2.5 border-t border-slate-300 flex justify-between items-center shrink-0 print:hidden">
            <button 
              onClick={onClose}
              className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-4 py-1.5 text-xs font-bold uppercase rounded-none transition-colors cursor-pointer"
            >
              Cancel / Close
            </button>
            <div className="flex gap-2">
              {onEnterResults && (
                <button 
                  onClick={onEnterResults}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 text-xs font-bold uppercase rounded-none flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  Enter Results <ArrowRight size={14} />
                </button>
              )}
              <button 
                onClick={handlePrint}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-1.5 text-xs font-bold uppercase rounded-none flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Printer size={14} /> Print Receipt Slip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
