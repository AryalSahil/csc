import React, { useState } from 'react';
import { Search, Shield, ArrowRight, CheckCircle, FileText, Landmark, Clock, PhoneCall, HelpCircle, MessageSquare } from 'lucide-react';
import { CscService, Application } from '../types';
import { INITIAL_SERVICES } from '../data/services';

interface HomeViewProps {
  onOpenLogin: () => void;
  setActiveTab: (tab: string) => void;
  setSelectedServiceForApply: (service: CscService | null) => void;
  globalApplications: Application[];
}

export default function HomeView({
  onOpenLogin,
  setActiveTab,
  setSelectedServiceForApply,
  globalApplications
}: HomeViewProps) {
  const [trackingId, setTrackingId] = useState('');
  const [trackedApp, setTrackedApp] = useState<Application | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchCategory, setSearchCategory] = useState<string>('All');

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const found = globalApplications.find(
      (app) => app.trackingNumber.toLowerCase() === trackingId.trim().toLowerCase()
    );
    setTrackedApp(found || null);
  };

  const categories = ['All', 'Identity & Certificates', 'Taxes & Revenue', 'Utility Bills', 'Welfare & Pensions', 'Travel & Passports'];

  const filteredServices = searchCategory === 'All'
    ? INITIAL_SERVICES
    : INITIAL_SERVICES.filter(s => s.category === searchCategory);

  const handleQuickApply = (service: CscService) => {
    setSelectedServiceForApply(service);
    // Switch to citizen portal which triggers login or application form
    setActiveTab('portal');
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/40 via-white to-white py-12 md:py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-100 text-indigo-800">
              <Landmark size={12} /> Digital India Affiliate Node Noida-62
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 tracking-tight leading-none">
              Your Gateway to <span className="text-indigo-600 block sm:inline">Citizen Digits</span> & Public Benefits.
            </h1>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Skip lines and complex state portals. Apply for national PAN IDs, Aadhaar demographic edits, local land revenue certificates, and passport approvals via Noida’s authorized digital CSC agency.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSearchCategory('All');
                  // scroll to catalog
                  document.getElementById('services-catalog')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-md border border-indigo-500/10 transition cursor-pointer flex items-center gap-1"
              >
                <span>Browse Services</span>
                <ArrowRight size={15} />
              </button>
              <button
                onClick={onOpenLogin}
                className="px-5 py-2.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-lg shadow-sm transition cursor-pointer"
              >
                Citizen Portal
              </button>
            </div>

            {/* Quick stats banner */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <span className="block text-xl font-bold text-slate-900">45k+</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Processed</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-slate-900 font-mono">100%</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Secure Vault</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-slate-900">30 Min</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Avg Response</span>
              </div>
            </div>
          </div>

          {/* Core Interactive Portal Tracker Desk */}
          <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xl space-y-6">
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-slate-800 text-sm">Direct Application Tracker</h3>
              <p className="text-xs text-slate-400 font-sans">Input your 12-character CSC tracking identifier immediately</p>
            </div>
            
            <form onSubmit={handleTrackSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g., CSC-59281829"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition shrink-0 cursor-pointer"
              >
                Track Status
              </button>
            </form>

            {/* Tracking Result Screen */}
            {hasSearched && (
              <div className="p-4 rounded-xl border transition-all animate-fade-in bg-slate-50/50">
                {trackedApp ? (
                  <div className="space-y-4 font-sans">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">TRACKING NUMBER</span>
                        <span className="text-xs font-bold font-mono text-indigo-600">{trackedApp.trackingNumber}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        trackedApp.status === 'Completed' || trackedApp.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        trackedApp.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {trackedApp.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Citizen</span>
                        <span className="font-semibold text-slate-800">{trackedApp.customerName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Service Program</span>
                        <span className="font-semibold text-slate-800">{trackedApp.serviceName}</span>
                      </div>
                    </div>

                    {/* Timeline visualization */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 block mb-2 font-bold uppercase">Workflow Steps</span>
                      <div className="relative pl-4 border-l-2 border-indigo-500 space-y-4 text-xs">
                        <div className="relative">
                          <span className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white" />
                          <p className="font-bold text-slate-800">Application Submitted</p>
                          <p className="text-[10px] text-slate-400">{new Date(trackedApp.createdAt).toLocaleDateString()}</p>
                        </div>
                        {trackedApp.status !== 'Pending' && (
                          <div className="relative">
                            <span className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white" />
                            <p className="font-bold text-slate-800">{trackedApp.status}</p>
                            <p className="text-[10px] text-slate-400">Processed by CSC Sector-62 Desk</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {trackedApp.operatorNotes && (
                      <div className="p-2 bg-yellow-55 border border-yellow-100 rounded text-[11px] text-yellow-800 leading-normal">
                        <span className="font-bold">Desk Note:</span> {trackedApp.operatorNotes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-1">
                    <p className="text-xs font-semibold text-gray-700">Tracking Code Not Found</p>
                    <p className="text-[10px] text-gray-400">Verify character spelling or submit a fresh case on Citizen panel.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Public Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="services-catalog">
        <div className="text-center space-y-2">
          <h2 className="font-display font-bold text-3xl text-gray-900">National Service Directory</h2>
          <p className="text-gray-500 text-xs max-w-lg mx-auto">
            Review processing timeframes, mandatory forms checklists, and official governmental service fees.
          </p>
        </div>

        {/* Filter categories tabs */}
        <div className="flex justify-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSearchCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition ${
                searchCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs border border-indigo-500/10'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredServices.map((service) => {
            const serviceApps = globalApplications.filter(a => a.serviceId === service.id && a.rating !== undefined);
            const totalRatingCount = serviceApps.length;
            const avgRating = totalRatingCount > 0 
              ? (serviceApps.reduce((sum, a) => sum + a.rating!, 0) / totalRatingCount).toFixed(1) 
              : "4.9"; // standard verified baseline rank
            const simulatedCount = totalRatingCount || (service.id === 'pan-card' ? 42 : service.id === 'aadhaar-correction' ? 29 : 14);

            return (
              <div
                key={service.id}
                className="bg-white border border-slate-100/80 hover:border-indigo-500 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100/50">
                      {service.category}
                    </span>
                    <div className="flex items-center gap-0.5 text-[10px] text-amber-600 font-bold bg-amber-55/60 border border-amber-100/40 px-1.5 py-0.5 rounded-md font-sans">
                      <span>★ {avgRating}</span>
                      <span className="text-slate-400 font-normal text-[9px]">({simulatedCount})</span>
                    </div>
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 text-sm leading-tight hover:text-indigo-600">
                    {service.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-3 leading-normal">
                    {service.description}
                  </p>
                </div>

              {/* Fee & actions */}
              <div className="pt-3 border-t border-slate-50 space-y-3 font-sans">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase">Settle Fee</span>
                    <span className="font-bold text-indigo-600 font-mono text-sm">₹{service.fee}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase text-right">Timeframe</span>
                    <span className="font-medium text-slate-600 font-mono text-[10px]">{service.processingTime}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase">Required Documents Checklist:</span>
                  <div className="flex flex-wrap gap-1">
                    {service.requiredDocuments.map((doc, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-50 text-slate-600 border border-slate-100 px-1.5 py-0.5 rounded font-medium">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleQuickApply(service)}
                  className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-medium text-xs rounded-lg transition-all cursor-pointer block text-center"
                >
                  Apply Online
                </button>
              </div>
            </div>
          );
        })}
        </div>
      </section>

      {/* 3. National CSC Pricing Tariffs & Transparencies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-900 rounded-3xl p-8 md:p-12 text-white grid grid-cols-1 md:grid-cols-2 gap-8 items-center" id="pricing">
        <div className="space-y-5">
          <span className="text-xs font-mono tracking-widest text-indigo-400 uppercase">Tariff Integrity</span>
          <h2 className="font-display font-bold text-3xl tracking-tight leading-none">
            Zero Hidden Portal Surcharges. Certified Rates.
          </h2>
          <p className="text-xs text-gray-300 leading-relaxed">
            All prices are fully standardized in accordance with State Department guidelines and service charge guidelines. GST-compliant invoice bills generated instantly on secure payouts.
          </p>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="flex gap-2.5 items-start">
              <CheckCircle size={15} className="text-indigo-400 shrink-0 mt-0.5" />
              <span>Government portal authentication fees are directly transferred.</span>
            </div>
            <div className="flex gap-2.5 items-start">
              <CheckCircle size={15} className="text-indigo-400 shrink-0 mt-0.5" />
              <span>Standard ₹30/hour center utility fee for manual paper printing.</span>
            </div>
            <div className="flex gap-2.5 items-start">
              <CheckCircle size={15} className="text-indigo-400 shrink-0 mt-0.5" />
              <span>Free transactional grievance tracking forever.</span>
            </div>
          </div>
        </div>

        {/* Tariff Highlight Table layout */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-display font-semibold text-sm">Regulatory Pricing Summary</h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-gray-400">Identity/Aadhaar Edits</span>
              <span className="font-mono">₹100</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-gray-400">PAN Cards New/Correction</span>
              <span className="font-mono">₹150</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-gray-400">Income & Caste Declarations</span>
              <span className="font-mono">₹60</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-gray-400">Digital Passport Application</span>
              <span className="font-mono">₹1500</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Standard Utility Swaps</span>
              <span className="font-mono">₹30</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Frequently Asked Questions (FAQ) Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="faq">
        <div className="text-center space-y-2">
          <h2 className="font-display font-bold text-2xl text-slate-900 font-sans">FAQ & Process Guides</h2>
          <p className="text-slate-500 text-xs">Understanding how centralized service centers submit your files securely.</p>
        </div>

        <div className="space-y-4 text-xs font-sans">
          <div className="p-4 bg-white border border-slate-100 rounded-xl space-y-1.5 shadow-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle size={15} className="text-indigo-600 shrink-0" />
              <span>What is application tracking status and how do I search?</span>
            </h4>
            <p className="text-slate-500 leading-relaxed pl-5">
              When you submit documents for identity updates (like PAN or Aadhaar), our authorized operator assigns a standard tracking tag (e.g. `CSC-XXXXXXXX`). You can input this tag on our Homepage tracker at any time or sign in to your dashboard to inspect full version feedback history.
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-100 rounded-xl space-y-1.5 shadow-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle size={15} className="text-indigo-600 shrink-0" />
              <span>How secure is the Customer 'Document Vault'?</span>
            </h4>
            <p className="text-slate-500 leading-relaxed pl-5">
              The customer locker provides permanent secure storage. Once initialized, only the corresponding customer or verified high-clearance administrators can extract these files or download final certificates.
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-100 rounded-xl space-y-1.5 shadow-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle size={15} className="text-indigo-600 shrink-0" />
              <span>What happens if an application status is 'Documents Required'?</span>
            </h4>
            <p className="text-slate-500 leading-relaxed pl-5">
              If an official government registrar rejects an image due to resolution or mismatches, our Operator changes the status to 'Documents Required'. You will receive in-app alerts (with simulated SMS & WhatsApp triggers) so you can directly upload a revised document into your tracking sheet!
            </p>
          </div>
        </div>
      </section>

      {/* 5. Contact & Support Escalability Block */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center" id="contact">
        <div className="space-y-6">
          <h2 className="font-display font-bold text-2xl text-slate-900 font-sans">Need Immediate Assistance?</h2>
          <p className="text-slate-500 text-xs leading-relaxed">
            Connect directly with verified on-field branch operators to resolve passport appointment changes, payment discrepancies, or document retrieval issues.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 bg-white space-y-1 shadow-xs">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">Noida HQ Desk</span>
              <span className="block font-bold text-slate-900 text-sm">₹0 Toll-Free Call</span>
              <span className="block font-mono text-[11px] text-indigo-600 font-semibold">1800-3000-2433</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-101 bg-white space-y-1 shadow-xs">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">Secure E-Mail</span>
              <span className="block font-bold text-slate-900 text-sm">Grievance Desk</span>
              <span className="block font-mono text-[11px] text-indigo-600 font-semibold font-sans">support@csc.gov.in</span>
            </div>
          </div>
        </div>

        {/* Contact Input simulation */}
        <form onSubmit={(e) => { e.preventDefault(); alert("Grievance ticket logged! Please log in as Customer to check response times."); }} className="bg-white border border-slate-150 rounded-2xl p-6 shadow-md space-y-4">
          <h3 className="font-display font-semibold text-sm text-slate-800 font-sans">Quick Inquiry Submission</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-1">Your Name</label>
              <input
                type="text"
                placeholder="Name"
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="Phone"
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-semibold mb-1">Inquiry / Question Topic</label>
            <textarea
              placeholder="How can Noida central CSC assist you?"
              rows={3}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Submit Inquiry
          </button>
        </form>
      </section>

    </div>
  );
}
