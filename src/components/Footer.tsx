import React from 'react';
import { Phone, Mail, MapPin, ShieldAlert, Award } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export default function Footer({ setActiveTab }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-display font-bold text-lg">
              C
            </div>
            <span className="font-display font-bold text-lg text-white">CSC Digital Service</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Leading digital enablement service portal bridging the gap between local citizens and vital government registries. Fast, authorized, secure, and hassle-free.
          </p>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
            <Award size={14} />
            <span>Digital India Authorized Affiliate</span>
          </div>
        </div>

        {/* Quick Service Links */}
        <div>
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white mb-4">Popular Services</h3>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><button onClick={() => setActiveTab('services')} className="hover:text-indigo-400 transition text-left">PAN Card Registrations</button></li>
            <li><button onClick={() => setActiveTab('services')} className="hover:text-indigo-400 transition text-left">Aadhaar Demographic Correction</button></li>
            <li><button onClick={() => setActiveTab('services')} className="hover:text-indigo-400 transition text-left">Community & Caste Certificate</button></li>
            <li><button onClick={() => setActiveTab('services')} className="hover:text-indigo-400 transition text-left">Revenue & Income Certificates</button></li>
            <li><button onClick={() => setActiveTab('services')} className="hover:text-indigo-400 transition text-left">Travel & Passport Application</button></li>
          </ul>
        </div>

        {/* Operational Links */}
        <div>
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white mb-4">Platform Pages</h3>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><button onClick={() => setActiveTab('about')} className="hover:text-indigo-400 transition text-left">About CSC Initiative</button></li>
            <li><button onClick={() => setActiveTab('pricing')} className="hover:text-indigo-400 transition text-left">Official Service Fee List</button></li>
            <li><button onClick={() => setActiveTab('faq')} className="hover:text-indigo-400 transition text-left">Citizen FAQ & Guides</button></li>
            <li><button onClick={() => setActiveTab('contact')} className="hover:text-indigo-400 transition text-left">Contact & Raise Grievance</button></li>
          </ul>
        </div>

        {/* CSC Contact Coordinates */}
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white mb-4">Local Helpdesk</h3>
          <div className="flex items-start gap-2.5 text-xs text-gray-400">
            <MapPin size={16} className="text-indigo-500 shrink-0 mt-0.5" />
            <span>HQ block, Plot 4A, Sector-6, Digital Enclave, Noida - 201301</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-400">
            <Phone size={14} className="text-indigo-500 shrink-0" />
            <span>Mon-Sat (9:00 AM - 6:00 PM)</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-indigo-500 font-semibold font-mono">
            <span>Toll-Free: 1800-3000-2433</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-400">
            <Mail size={14} className="text-indigo-500 shrink-0" />
            <span>support@csc-degital-management.gov.in</span>
          </div>
        </div>
      </div>

      {/* Copyright/Disclaimers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-gray-800 text-center flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[11px] text-gray-500 leading-normal">
          &copy; 2026 CSC Digital Service Management Platform. Built under national digital empowerment policies. All graphics, trademarks are property of their respective departments.
        </p>
        <div className="flex items-center gap-4 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><ShieldAlert size={11} /> Sensitive Data Vault Protected</span>
          <span className="hover:underline cursor-pointer">Terms of Service</span>
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
}
