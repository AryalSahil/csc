import React from 'react';
import { X, Download, ShieldCheck, Printer, Calendar, Landmark, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: {
    name: string;
    url: string;
    category?: string;
  } | null;
}

export default function DocumentPreviewModal({ isOpen, onClose, doc }: DocumentPreviewModalProps) {
  if (!isOpen || !doc) return null;

  const docNameLower = doc.name.toLowerCase();
  const categoryLower = (doc.category || '').toLowerCase();

  // Determine what style of certificate to render mock image for
  let docType: 'aadhaar' | 'pan' | 'marksheet' | 'bill' | 'certificate' = 'certificate';

  if (docNameLower.includes('aadhaar') || categoryLower.includes('aadhaar') || categoryLower.includes('identity')) {
    docType = 'aadhaar';
  } else if (docNameLower.includes('pan') || categoryLower.includes('pan') || docNameLower.includes('income tax')) {
    docType = 'pan';
  } else if (docNameLower.includes('mark') || docNameLower.includes('school') || categoryLower.includes('school')) {
    docType = 'marksheet';
  } else if (docNameLower.includes('bill') || docNameLower.includes('electricity') || categoryLower.includes('address')) {
    docType = 'bill';
  }

  // Handle mock printing/download
  const triggerPrintAndDownload = () => {
    // Attempt download
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Main Content Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-105 shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        
        {/* Header bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50/50">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded">
              {doc.category || 'Digital Credential State Cabinet'}
            </span>
            <h3 className="text-xs font-bold text-slate-905 text-slate-900 truncate max-w-[320px] md:max-w-md">
              {doc.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={triggerPrintAndDownload}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              title="Download Original Credential"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Interactive Preview Frame */}
        <div className="p-6 overflow-y-auto bg-slate-100/50 flex-1 flex justify-center items-center min-h-[350px]">
          
          {/* Mock Aadhaar Card Frame */}
          {docType === 'aadhaar' && (
            <div className="w-full max-w-md bg-white border border-rose-100 rounded-xl shadow-md overflow-hidden relative font-sans text-[11px] leading-tight select-none">
              <div className="bg-gradient-to-r from-orange-400 via-white to-emerald-600 h-2" />
              
              {/* Card Banner Header */}
              <div className="flex justify-between items-center px-4 py-2 bg-neutral-50/50 border-b border-light font-bold text-slate-700 text-[10px]">
                <span className="text-orange-600">भारत सरकार</span>
                <span className="text-slate-500">GOVERNMENT OF INDIA</span>
              </div>
              
              {/* Card Content Grid */}
              <div className="p-4 grid grid-cols-12 gap-3">
                <div className="col-span-4 flex flex-col items-center justify-center bg-slate-50 border p-2 rounded relative">
                  <div className="w-16 h-20 bg-slate-200 rounded flex items-center justify-center text-slate-400 font-bold border border-slate-300">
                    ID PHOTO
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono mt-1 font-bold">Masked Biometric</span>
                </div>
                
                <div className="col-span-8 space-y-2">
                  <div className="space-y-0.5">
                    <p className="text-[11.5px] font-bold text-slate-900">Ramesh Kumar</p>
                    <p className="text-slate-400 italic">DoB: 12/10/1995</p>
                    <p className="text-slate-500 font-medium">Male / पुरुष</p>
                  </div>
                  
                  <div className="space-y-1 py-1 border-t border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Demographic Location</p>
                    <p className="text-slate-600 text-[10px]">Sector-62, C-Block, Plot 4A, Noida, Gautam Buddha Nagar, Uttar Pradesh - 201301</p>
                  </div>
                </div>
              </div>

              {/* Masked UIDAI number bar */}
              <div className="bg-amber-50/60 border-t border-amber-100 p-3 text-center">
                <p className="text-xs font-bold font-mono tracking-widest text-slate-800">XXXX XXXX 1094</p>
                <div className="flex items-center justify-center gap-1 text-[8.5px] text-emerald-600 font-bold mt-1">
                  <ShieldCheck size={11} />
                  <span>UIDAI Secure Offline XML Handshake Signature Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* Mock PAN Card Frame */}
          {docType === 'pan' && (
            <div className="w-full max-w-md bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-xl shadow-md p-4 space-y-4 select-none relative overflow-hidden font-mono text-[10px]">
              {/* Hologram decoration */}
              <div className="absolute top-1/2 left-2/3 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex justify-between items-start border-b border-indigo-800 pb-2">
                <div>
                  <h4 className="font-bold text-[10.5px] tracking-tight uppercase">Income Tax Department</h4>
                  <p className="text-[8px] text-indigo-300">GOVT. OF INDIA / आयकर विभाग - भारत सरकार</p>
                </div>
                <div className="bg-indigo-800/80 px-2 py-0.5 rounded text-[8px] font-bold text-amber-400">
                  PERMANENT ACCOUNT NUMBER CARD
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-8 space-y-2">
                  <div>
                    <span className="block text-[8px] text-indigo-400 uppercase font-sans">Name</span>
                    <span className="font-bold text-[10.5px] tracking-wider text-white">RAMESH KUMAR</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-indigo-400 uppercase font-sans">Father's Name</span>
                    <span className="font-bold tracking-wider text-slate-200">RAJESH KUMAR</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-indigo-400 uppercase font-sans">Date of Birth</span>
                    <span className="font-bold text-slate-200">12/10/1995</span>
                  </div>
                </div>

                <div className="col-span-4 flex flex-col justify-between items-end">
                  <div className="w-14 h-16 bg-white/20 rounded border border-white/10 flex items-center justify-center font-sans font-bold text-white/40 text-[9px]">
                    PHOTO
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold font-sans text-[8px] px-1 py-0.5 rounded mt-3">
                    ✔ Taxpayer Authorized
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-indigo-900 flex justify-between items-center">
                <div>
                  <span className="block text-[8px] text-indigo-400 font-sans">PAN NUMBER / स्थायी खाता संख्या</span>
                  <span className="text-xs font-bold text-amber-300 tracking-widest font-mono">BPMK4851K</span>
                </div>
                <div className="w-12 h-6 bg-slate-300 rounded border border-white/20 select-none opacity-40" />
              </div>
            </div>
          )}

          {/* Mock Marksheet Copy */}
          {docType === 'marksheet' && (
            <div className="w-full max-w-sm bg-amber-50/20 border border-amber-100 bg-white p-5 rounded-xl shadow-md space-y-4 font-sans text-[10.5px] text-slate-700 select-none">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-200">
                <BookOpen size={20} className="mx-auto text-amber-600" />
                <h4 className="font-bold uppercase tracking-tight text-slate-900 font-serif">Board of High School & Intermediate Education</h4>
                <p className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Uttar Pradesh Prayagraj Node</p>
                <p className="font-bold text-amber-700 text-[10px]">HIGHSCHOOL EXAMINATION RATING CERTIFICATE</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pb-2">
                <p><strong>Candidate Name:</strong> RAMESH KUMAR</p>
                <p><strong>Roll Code:</strong> 2948102</p>
                <p><strong>Father's Name:</strong> RAJESH KUMAR</p>
                <p><strong>Passing Session:</strong> 2011</p>
              </div>

              <table className="w-full border-collapse border border-slate-200 text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-[9px]">
                    <th className="p-1 px-2 border-r border-slate-200">Subject</th>
                    <th className="p-1 px-2 border-r border-slate-200">Max</th>
                    <th className="p-1 px-2 border-r border-slate-200">Min</th>
                    <th className="p-1 px-2">Obtained Sc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600">
                  <tr>
                    <td className="p-1 px-2 border-r">Hindi Core</td>
                    <td className="p-1 px-2 border-r">100</td>
                    <td className="p-1 px-2 border-r">33</td>
                    <td className="p-1 px-2 font-mono font-bold text-slate-900">82</td>
                  </tr>
                  <tr>
                    <td className="p-1 px-2 border-r">English Literature</td>
                    <td className="p-1 px-2 border-r">100</td>
                    <td className="p-1 px-2 border-r">33</td>
                    <td className="p-1 px-2 font-mono font-bold text-slate-900">78</td>
                  </tr>
                  <tr>
                    <td className="p-1 px-2 border-r">Mathematics (Secondary)</td>
                    <td className="p-1 px-2 border-r">100</td>
                    <td className="p-1 px-2 border-r">33</td>
                    <td className="p-1 px-2 font-mono font-bold text-slate-900">91</td>
                  </tr>
                  <tr>
                    <td className="p-1 px-2 border-r">Science & Tech Labs</td>
                    <td className="p-1 px-2 border-r">100</td>
                    <td className="p-1 px-2 border-r">33</td>
                    <td className="p-1 px-2 font-mono font-bold text-slate-900">88</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between items-center pt-2 border-t border-dashed text-[9.5px]">
                <p className="font-bold text-emerald-700">AGGREGATE VERBAL RESULT: PASSED (FIRST DIV)</p>
                <p className="italic text-slate-400 font-semibold font-mono">Roll:UP-4920401</p>
              </div>
            </div>
          )}

          {/* Mock Electricity Utility Bill */}
          {docType === 'bill' && (
            <div className="w-full max-w-sm bg-white border border-slate-200 p-5 rounded-2xl shadow-md space-y-4 select-none font-sans text-xs text-slate-700">
              <div className="flex justify-between items-start border-b pb-3 mb-2">
                <div>
                  <h4 className="font-bold uppercase text-slate-800 text-[11.5px]">Noida Power Company Limited</h4>
                  <p className="text-[10px] text-slate-500 font-mono font-medium">NPCL Central Utility Hub</p>
                </div>
                <Landmark className="text-indigo-600" size={24} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10.5px] border-b pb-3 max-w-full">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Consumer Code No</span>
                  <span className="font-bold font-mono text-slate-900">NPCL-62-9481230</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Billing Period</span>
                  <span className="font-mono font-bold text-slate-900">May - June 2026</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Billing Address</span>
                  <span className="text-slate-600 block line-clamp-2">C-Block, Plot 4A, Sec 62 Noida</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Due Date</span>
                  <span className="font-mono font-bold text-red-600">18/06/2026</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Gross Bill Amount Payable</span>
                  <span className="text-xs text-slate-400 font-mono">Power consumed • 234 units</span>
                </div>
                <span className="text-base font-extrabold text-indigo-700 font-mono">₹1,472.00</span>
              </div>

              <div className="text-[9px] text-center text-emerald-600 font-bold py-1 bg-emerald-50 rounded border border-emerald-100 flex items-center justify-center gap-1">
                <ShieldCheck size={11} />
                <span>Authorized Digital Billing Signature Received</span>
              </div>
            </div>
          )}

          {/* Standard Completion CSC Public Certificate */}
          {docType === 'certificate' && (
            <div className="w-full max-w-md bg-stone-50 border-4 border-double border-yellow-700 p-6 rounded-xl shadow-lg relative font-serif text-center select-none text-[10.5px] text-stone-800">
              
              {/* Outer decorative borders */}
              <div className="absolute inset-1 border border-yellow-700/30 opacity-70 pointer-events-none" />

              <div className="space-y-1.5 pt-4 pb-4 border-b border-stone-200">
                <Landmark size={28} className="text-yellow-800 mx-auto" />
                <h4 className="font-bold text-[13px] tracking-tight text-stone-900 uppercase">Government Digital Common Service Center</h4>
                <p className="text-[9px] tracking-wider uppercase font-sans font-bold text-slate-500">Department of Governance & Public Trust</p>
                <p className="text-stone-500 italic">Central Verification Node Noida-UP-62</p>
              </div>

              {/* Certificate wording */}
              <div className="space-y-4 py-6 font-serif">
                <span className="uppercase text-[11px] font-bold text-stone-900 tracking-wider font-sans block">Certificate of Verification Completion</span>
                <p className="italic leading-relaxed text-stone-600">
                  This public declaration is presented to verify the authentic demographic submission of
                </p>
                <p className="font-bold text-[14px] text-yellow-905 text-yellow-900 uppercase italic tracking-wide">
                  RAMESH KUMAR
                </p>
                <div className="w-24 h-0.5 bg-yellow-700 mx-auto" />
                <p className="leading-relaxed text-stone-600 max-w-[280px] mx-auto">
                  for service enrollment in <span className="font-bold text-stone-800">"{doc.name.replace(/\.[^/.]+$/, "")}"</span> registered under Indian Digital CSC Sandbox Node reference UP-NOD-CSC-62.
                </p>
              </div>

              {/* Footer seals */}
              <div className="flex justify-between items-center pt-4 border-t border-stone-200 font-sans text-[8px] text-stone-400">
                <div className="text-left space-y-0.5">
                  <p className="font-bold uppercase font-mono text-stone-700">Ref: TAX-84920-A</p>
                  <p>Issue Date: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <div className="w-12 h-12 border border-stone-300 rounded-full flex items-center justify-center font-bold text-stone-300 opacity-60 text-[6.5px] rotate-12 mx-auto">
                    OFFICIAL SEAL
                  </div>
                  <span className="block text-[8px] font-bold uppercase text-slate-500">Seal of Noida HQ</span>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="font-bold text-emerald-600">✓ SECURE DIGITAL DECREE</p>
                  <p>Verified via e-Sign UID</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 px-6 font-mono">
          <span>🔒 Sandbox Isolation Node SEC-62</span>
          <span className="flex items-center gap-1 text-emerald-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Verified Credential
          </span>
        </div>

      </div>
    </div>
  );
}
