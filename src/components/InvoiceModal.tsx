import React from 'react';
import { X, Printer, CheckCircle2, Download } from 'lucide-react';
import { Application } from '../types';

interface InvoiceModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceModal({ application, isOpen, onClose }: InvoiceModalProps) {
  if (!isOpen) return null;

  const baseFee = Math.max(20, application.feesPaid - 45); // Deduct generic admin charge & portal fee
  const portalFee = 25;
  const sgst = parseFloat((baseFee * 0.09).toFixed(2));
  const cgst = parseFloat((baseFee * 0.09).toFixed(2));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-xs" onClick={onClose} />

      {/* Invoice Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Action Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-semibold text-gray-800">Govt Service Invoice</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
              <CheckCircle2 size={10} /> Paid
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-600 font-medium text-white hover:bg-indigo-700 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer size={13} />
              <span>Print/Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 overflow-y-auto print:p-0 font-sans" id="printable-invoice">
          {/* CSC Headings */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-6">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-8 h-8 rounded bg-indigo-600 text-white flex items-center justify-center font-display font-bold text-lg">
                  C
                </div>
                <span className="font-display font-bold text-lg text-gray-900">CSC Digital Service Platform</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">Digital India Initiative / Center Code: CSC-Noida-62</p>
              <p className="text-[10px] text-gray-400 mt-1">Sector 62, Noida, Uttar Pradesh - 201301</p>
            </div>
            <div className="text-right">
              <h1 className="font-display font-bold text-2xl uppercase text-gray-800 tracking-wide">Receipt/Tax Invoice</h1>
              <p className="text-xs text-gray-500 font-mono mt-1">INV-CSC-{application.trackingNumber.slice(-6)}</p>
              <p className="text-xs text-gray-500 mt-1">Date: {new Date(application.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Citizen & Provider Info */}
          <div className="grid grid-cols-2 gap-4 py-6 border-b border-gray-100 text-xs text-gray-600">
            <div>
              <p className="font-bold text-gray-800 uppercase tracking-wider text-[10px] mb-1.5 text-gray-400">Billed To (Citizen)</p>
              <p className="font-semibold text-gray-900 text-sm mb-1">{application.customerName}</p>
              <p>Phone: {application.customerPhone}</p>
              <p>UPI Handle: {application.customerPhone}@paytm</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800 uppercase tracking-wider text-[10px] mb-1.5 text-gray-400">Merchant / Center Info</p>
              <p className="font-semibold text-gray-900">CSC Noida Franchise Unit</p>
              <p>Operator UID: {application.operatorId || 'CSC-OP-4492'}</p>
              <p>Transaction: {application.transactionId}</p>
            </div>
          </div>

          {/* Tracking Details */}
          <div className="my-5 p-4 bg-slate-50 border border-slate-100 rounded-xl grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="block text-slate-400 text-[10px] uppercase font-bold">Service Requested</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{application.serviceName}</span>
            </div>
            <div className="border-x border-slate-200">
              <span className="block text-slate-400 text-[10px] uppercase font-bold">Tracking Number</span>
              <span className="font-mono font-bold text-indigo-650 text-indigo-600 mt-0.5 block">{application.trackingNumber}</span>
            </div>
            <div>
              <span className="block text-gray-400 text-[10px] uppercase font-bold">Estimated Settle</span>
              <span className="font-semibold text-gray-800 mt-0.5 block">5-7 Working Days</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <table className="w-full text-left text-xs text-gray-600 mt-6 mb-8">
            <thead>
              <tr className="border-b border-gray-300 text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-2">Item Description</th>
                <th className="py-2 text-center">HSN/SAC</th>
                <th className="py-2 text-right">Fee Rate (INR)</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3">
                  <span className="font-semibold text-gray-800 block">{application.serviceName}</span>
                  <span className="text-[10px] text-gray-400">Government Portal processing fee and document collection</span>
                </td>
                <td className="py-3 text-center font-mono">998311</td>
                <td className="py-3 text-right font-mono">₹{baseFee.toFixed(2)}</td>
                <td className="py-3 text-right">1</td>
                <td className="py-3 text-right font-mono font-medium">₹{baseFee.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3">
                  <span className="font-semibold text-gray-800 block">CSC Portal Surcharge</span>
                  <span className="text-[10px] text-gray-400">Permanent data cabinet, digital tracking, SMS/WhatsApp triggers</span>
                </td>
                <td className="py-3 text-center font-mono">998312</td>
                <td className="py-3 text-right font-mono">₹{portalFee.toFixed(2)}</td>
                <td className="py-3 text-right">1</td>
                <td className="py-3 text-right font-mono font-medium">₹{portalFee.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Math calculation totals */}
          <div className="flex justify-end mt-4">
            <div className="w-64 text-xs text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal (Exclusive of GST):</span>
                <span className="font-mono">₹{(baseFee + portalFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 italic">
                <span>CGST (9% on service):</span>
                <span className="font-mono">₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 italic">
                <span>SGST (9% on service):</span>
                <span className="font-mono">₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900 text-sm">
                <span>Grand Total (INR):</span>
                <span className="font-mono text-indigo-600">₹{application.feesPaid.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="mt-12 pt-6 border-t border-gray-100 text-[10px] text-gray-400 text-center">
            <p className="font-bold">Computer generated official CSC digital receipt. Signature not required.</p>
            <p className="mt-1">For application claims or refunds, please quote the tracking ID inside Noida-62 Branch desks.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
