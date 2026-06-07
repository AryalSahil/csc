import React, { useState } from 'react';
import {
  Users, FileText, CheckCircle, Clock, Search, Eye, Edit2, AlertCircle, Trash,
  Upload, CheckCheck, RefreshCw, Send, HelpCircle, FileCheck, Bookmark, Download, X,
  Briefcase, Percent, Bell, Settings, FileSpreadsheet, ShieldAlert, Ban, Info, ShieldCheck, Mail, MessageSquare, Landmark, CreditCard, HelpCircle as HelpIcon,
  Plus, ChevronRight
} from 'lucide-react';
import { UserProfile, Application, SupportTicket, CscService, ApplicationStatus } from '../types';
import { INITIAL_SERVICES } from '../data/services';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import { motion, AnimatePresence } from 'motion/react';

// Recharts for nice analytics
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface AdminPortalProps {
  currentUser: UserProfile;
  applications: Application[];
  onUpdateAppStatus: (appId: string, status: ApplicationStatus, notes: string, completedCertUrl?: string) => void;
  tickets: SupportTicket[];
  onPostTicketReply: (ticketId: string, message: string, markResolved?: boolean) => void;
  onOpenInvoice: (app: Application) => void;
  onClearApps: () => void;
}

export default function AdminPortal({
  currentUser,
  applications,
  onUpdateAppStatus,
  tickets,
  onPostTicketReply,
  onOpenInvoice,
  onClearApps
}: AdminPortalProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'applications' | 'customers' | 'services' | 'payments' | 'notifications' | 'tickets' | 'reports' | 'settings'>('overview');
  
  // Local state for interactive Document Preview Modal popup
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string; category?: string } | null>(null);
  
  // Search and general state
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('All');

  // Selected Application for Operations
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('Under Review');
  const [operatorNotes, setOperatorNotes] = useState('');
  const [completedCertName, setCompletedCertName] = useState('Official Registry PDF');
  const [simulatedCertUrl, setSimulatedCertUrl] = useState('');

  // Settle manually selected application assignment status
  const [assignedOperator, setAssignedOperator] = useState<string>('Arjun Devgan');

  // Ticket processing
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // 1. Customer Registry State Management
  const [customers, setCustomers] = useState([
    { uid: 'uid_customer_demo', name: 'Ramesh Kumar (Citizen)', phone: '9876543210', email: 'sahil265064@gmail.com', address: 'Plot 4A, Sector-62, Noida, UP', kyc: 'Tier-3 Fully Verified', isBlocked: false },
    { uid: 'cust_2', name: 'Sunita Sharma', phone: '9810293811', email: 'sunita.sharma@gmail.com', address: 'G-34 Chanakyapuri, New Delhi', kyc: 'Tier-2 Verified', isBlocked: false },
    { uid: 'cust_3', name: 'Amanpreet Singh', phone: '9910011223', email: 'aman.preet@gmail.com', address: 'Southend West, New Delhi', kyc: 'Tier-1 Basic Self', isBlocked: true },
    { uid: 'cust_4', name: 'Rajesh Gokhale', phone: '9818293102', email: 'gokhale.rajesh@outlook.com', address: 'Chhatrapati Shivaji Marg, Mumbai', kyc: 'Tier-3 Fully Verified', isBlocked: false }
  ]);
  const [custSearch, setCustSearch] = useState('');
  const [editingCustId, setEditingCustId] = useState<string | null>(null);
  const [editingCustName, setEditingCustName] = useState('');
  const [editingCustPhone, setEditingCustPhone] = useState('');
  const [editingCustEmail, setEditingCustEmail] = useState('');

  // 2. Service Catalog Management State (Allow editing prices, adding services)
  const [servicesList, setServicesList] = useState<CscService[]>(INITIAL_SERVICES);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newSName, setNewSName] = useState('');
  const [newSCat, setNewSCat] = useState<'Identity & Certificates' | 'Taxes & Revenue' | 'Utility Bills' | 'Welfare & Pensions' | 'Travel & Passports'>('Identity & Certificates');
  const [newSFee, setNewSFee] = useState(100);
  const [newSDesc, setNewSDesc] = useState('');
  const [newSDocs, setNewSDocs] = useState('Aadhaar Card, Passport size photo, Address Proof');
  const [newSTime, setNewSTime] = useState('5-7 Working Days');

  // Editing existing service
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingServiceFee, setEditingServiceFee] = useState<number>(100);

  // 3. Simulated Notification Sender states
  const [channelType, setChannelType] = useState<'sms' | 'whatsapp' | 'email'>('sms');
  const [targetPhone, setTargetPhone] = useState('9876543210');
  const [notifBody, setNotifBody] = useState('Namaste from Noida-62 CSC Center. Your demographic verification is under processing stage.');
  const [broadcastNotif, setBroadcastNotif] = useState('');
  const [alertSuccess, setAlertSuccess] = useState('');

  // 4. Center & Website Settings states
  const [centerName, setCenterName] = useState('Noida Franchise Desk - Delhi/CR');
  const [centerRegCode, setCenterRegCode] = useState('REG-UP-CSC-62');
  const [gatewayEnabledUpi, setGatewayEnabledUpi] = useState(true);
  const [gatewayEnabledRazor, setGatewayEnabledRazor] = useState(true);
  const [feesSurcharge, setFeesSurcharge] = useState(10);
  const [alertNotifSuccess, setAlertNotifSuccess] = useState('');

  // Metrics calculators
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === 'Pending').length;
  const underReviewApps = applications.filter(a => a.status === 'Under Review' || a.status === 'Processing').length;
  const completedApps = applications.filter(a => a.status === 'Completed').length;
  const totalFeesCollected = applications
    .filter(a => a.paymentStatus === 'Paid')
    .reduce((sum, a) => sum + a.feesPaid, 0);

  const openTickets = tickets.filter(t => t.status !== 'Resolved').length;

  // Analytics calculators
  const totalTicketsCount = tickets.length;
  const resolvedTicketsCount = tickets.filter(t => t.status === 'Resolved').length;
  const ticketResolutionRate = totalTicketsCount > 0 ? Math.round((resolvedTicketsCount / totalTicketsCount) * 100) : 100;

  // Average processing calculation
  const getAvgProcessingTime = () => {
    const completed = applications.filter(a => a.status === 'Completed');
    if (completed.length === 0) return "1.4 Days";
    let totalTimeMs = 0;
    completed.forEach(a => {
      const created = new Date(a.createdAt).getTime();
      const completedAt = new Date(a.updatedAt).getTime();
      totalTimeMs += Math.max(completedAt - created, 30 * 60 * 1000); // 30 mins lower threshold
    });
    const avgHrs = (totalTimeMs / completed.length) / (1000 * 60 * 60);
    if (avgHrs < 24) return `${avgHrs.toFixed(1)} Hours`;
    return `${(avgHrs / 24).toFixed(1)} Days`;
  };

  // Recharts Memorized calculations
  const popularServicesData = React.useMemo(() => {
    const counts: Record<string, { count: number; revenue: number }> = {};
    applications.forEach(a => {
      const name = a.serviceName;
      if (!counts[name]) {
        counts[name] = { count: 0, revenue: 0 };
      }
      counts[name].count += 1;
      if (a.paymentStatus === 'Paid') {
        counts[name].revenue += a.feesPaid;
      }
    });

    return Object.keys(counts).map(name => {
      const c = counts[name];
      return {
        name: name.length > 15 ? name.substring(0, 12) + '...' : name,
        "Applications": c.count,
        "Revenue (₹)": c.revenue
      };
    }).sort((a, b) => b["Applications"] - a["Applications"]);
  }, [applications]);

  const dailyGrowthData = React.useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return days.map(dayStr => {
      const appsOnDay = applications.filter(a => a.createdAt.startsWith(dayStr));
      const uniqueCusts = new Set(appsOnDay.map(a => a.customerId)).size;
      return {
        date: new Date(dayStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        "New Customers": uniqueCusts || 0,
        "Inbound Orders": appsOnDay.length || 0
      };
    });
  }, [applications]);

  // Customer Management Handlers
  const handleToggleBlockCustomer = (uid: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.uid === uid) {
        const nextState = !c.isBlocked;
        triggerTransientSuccessAlert(`Successfully ${nextState ? 'Blocked' : 'Unblocked'} customer account record.`);
        return { ...c, isBlocked: nextState };
      }
      return c;
    }));
  };

  const handleEditCustomerSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustId) return;
    setCustomers(prev => prev.map(c => {
      if (c.uid === editingCustId) {
        return { ...c, name: editingCustName, phone: editingCustPhone, email: editingCustEmail };
      }
      return c;
    }));
    setEditingCustId(null);
    triggerTransientSuccessAlert("Customer details modified inside temporary state successfully.");
  };

  // Service catalog add / edit / delete handlers
  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSName.trim() || !newSDesc.trim()) return;
    const item: CscService = {
      id: 'srv_' + Math.floor(Math.random() * 1000000),
      name: newSName,
      category: newSCat,
      fee: Number(newSFee),
      processingTime: newSTime,
      requiredDocuments: newSDocs.split(',').map(d => d.trim()),
      description: newSDesc,
      isActive: true
    };
    setServicesList(prev => [...prev, item]);
    setIsAddingService(false);
    setNewSName('');
    setNewSDesc('');
    triggerTransientSuccessAlert('Added new public service registry config.');
  };

  const handleToggleServiceActive = (id: string) => {
    setServicesList(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, isActive: !s.isActive };
      }
      return s;
    }));
    triggerTransientSuccessAlert('Toggled service registry visibility status.');
  };

  const handleDeleteService = (id: string) => {
    setServicesList(prev => prev.filter(s => s.id !== id));
    triggerTransientSuccessAlert('Deleted public service registry configuration slot.');
  };

  const handleUpdateServicePriceSave = (id: string) => {
    setServicesList(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, fee: editingServiceFee };
      }
      return s;
    }));
    setEditingServiceId(null);
    triggerTransientSuccessAlert('Service pricing tier modified successfully.');
  };

  // Notification actions handler
  const handleSendCustomNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifBody.trim()) return;
    triggerTransientSuccessAlert(`Successfully simulated push ${channelType.toUpperCase()} alert to ${targetPhone}!`);
    setNotifBody('');
  };

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastNotif.trim()) return;
    triggerTransientSuccessAlert(`Broadcast prompt dispatched instantly to all ${customers.length} authenticated citizens.`);
    setBroadcastNotif('');
  };

  const handleSavesSettings = (e: React.FormEvent) => {
    e.preventDefault();
    triggerTransientSuccessAlert('Franchise configuration coordinates locked securely to memory.');
  };

  // Helper alert notifier
  const triggerTransientSuccessAlert = (msg: string) => {
    setAlertSuccess(msg);
    setTimeout(() => {
      setAlertSuccess('');
    }, 4000);
  };

  // Settle operations
  const handleUpdateOperationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) return;

    let certUrl = simulatedCertUrl;
    if (newStatus === 'Completed' && !certUrl) {
      certUrl = 'https://buoyant-sol-mmvz5.firebaseapp.com/mock_certificate_csc_' + Math.floor(Math.random() * 1000000) + '.pdf';
    }

    onUpdateAppStatus(selectedAppId, newStatus, `${operatorNotes} [Assigned Desk Officer: ${assignedOperator}]`, certUrl);
    setSelectedAppId(null);
    setOperatorNotes('');
    setSimulatedCertUrl('');
    triggerTransientSuccessAlert('Dispatched tracking progress coordinates to citizen portal feed.');
  };

  const handleTicketReplySubmit = (e: React.FormEvent, ticketId: string, resolved: boolean) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onPostTicketReply(ticketId, replyText, resolved);
    setReplyText('');
    setActiveTicketId(null);
    triggerTransientSuccessAlert('Resolution coordinate logged to citizen help file.');
  };

  // Filtering applications
  const filteredApps = applications.filter(app => {
    const matchesSearch = app.customerName.toLowerCase().includes(appSearch.toLowerCase()) ||
                          app.trackingNumber.toLowerCase().includes(appSearch.toLowerCase()) ||
                          app.serviceName.toLowerCase().includes(appSearch.toLowerCase());
    const matchesStatus = appStatusFilter === 'All' ? true : app.status === appStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedAppObj = applications.find(a => a.id === selectedAppId);

  return (
    <div className="space-y-8 pb-12 font-sans relative">
      
      {/* Dynamic Success Toast Alerts */}
      {alertSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-850 text-white text-xs font-bold py-2.5 px-5 rounded-full shadow-2xl flex items-center gap-2 animate-fade-in font-sans">
          <CheckCircle className="text-emerald-400" size={14} />
          <span>{alertSuccess}</span>
        </div>
      )}

      {/* 1. Header Admin Rail */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl">Operator Workstation Node</h1>
          <p className="text-xs text-slate-400 mt-1">Noida Sector-62 Franchise Desk • Assigned Coordinator: {currentUser.name}</p>
        </div>
        <div className="flex gap-2">
          {applications.length > 0 && (
            <button
              onClick={onClearApps}
              className="px-3.5 py-1.5 bg-red-600/30 hover:bg-red-600 text-red-100 text-xs font-semibold rounded-lg border border-red-500/20 transition cursor-pointer"
            >
              Clear Live Mock DB
            </button>
          )}
          <span className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" /> Connection SECURE
          </span>
        </div>
      </div>

      {/* 2. Admin Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-sans">
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
          <span className="block text-slate-400 text-[9px] uppercase font-bold">Total Customers</span>
          <span className="block text-lg font-bold font-mono text-slate-900 mt-0.5">{customers.length} Accounts</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Biometric Synchronized</span>
        </div>
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
          <span className="block text-slate-400 text-[9px] uppercase font-bold text-yellow-600">Pending Review</span>
          <span className="block text-lg font-bold font-mono text-yellow-600 mt-0.5">{pendingApps + applications.filter(a => a.status === 'Documents Required').length} Cases</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Actionable Desk Files</span>
        </div>
        <div className="p-4 bg-white border border-slate-10a rounded-xl shadow-xs">
          <span className="block text-slate-400 text-[9px] uppercase font-bold text-indigo-650 text-indigo-600">Under Review</span>
          <span className="block text-lg font-bold font-mono text-indigo-650 text-indigo-600 mt-0.5">{underReviewApps} Cases</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">External processing</span>
        </div>
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
          <span className="block text-slate-400 text-[9px] uppercase font-bold text-emerald-600">Completed Payout</span>
          <span className="block text-lg font-bold font-mono text-emerald-600 mt-0.5">{completedApps} Files</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Registry verified</span>
        </div>
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
          <span className="block text-slate-404 text-[9px] uppercase font-bold text-indigo-700">Gross Revenue</span>
          <span className="block text-lg font-bold font-mono text-indigo-700 mt-0.5">₹{totalFeesCollected}</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Taxes Billed</span>
        </div>
      </div>

      {/* 3. Sub Tabs selectors via Vertical Line Menu - Explicit Sidebar-and-Content Layout */}
      <div className="flex flex-col md:flex-row gap-8 border-t border-slate-100 pt-6 h-[720px] md:h-[750px] overflow-hidden">
        {/* Left Vertical Line Menu Sidebar (Fixed Left) */}
        <div className="w-full md:w-64 shrink-0 overflow-y-auto md:h-full border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left w-full outline-none cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-3'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 pl-4'
            }`}
          >
            <span className="text-sm">📊</span>
            <span>Dashboard Analytics</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('applications')}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left w-full outline-none cursor-pointer ${
              activeSubTab === 'applications'
                ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-3'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 pl-4'
            }`}
          >
            <span className="text-sm">📂</span>
            <span>Applications ({filteredApps.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('customers')}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left w-full outline-none cursor-pointer ${
              activeSubTab === 'customers'
                ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-3'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 pl-4'
            }`}
          >
            <span className="text-sm">👥</span>
            <span>Citizen Directory</span>
          </button>

          <button
            onClick={() => setActiveSubTab('services')}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left w-full outline-none cursor-pointer ${
              activeSubTab === 'services'
                ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-3'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 pl-4'
            }`}
          >
            <span className="text-sm">🛠️</span>
            <span>Service Directory</span>
          </button>

          <button
            onClick={() => setActiveSubTab('payments')}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left w-full outline-none cursor-pointer ${
              activeSubTab === 'payments'
                ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-3'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 pl-4'
            }`}
          >
            <span className="text-sm">💳</span>
            <span>Payments & Receipts</span>
          </button>

          <button
            onClick={() => setActiveSubTab('notifications')}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left w-full outline-none cursor-pointer ${
              activeSubTab === 'notifications'
                ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-3'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 pl-4'
            }`}
          >
            <span className="text-sm">📣</span>
            <span>Broadcasting Space</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tickets')}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left w-full outline-none cursor-pointer ${
              activeSubTab === 'tickets'
                ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-3'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 pl-4'
            }`}
          >
            <span className="text-sm">🎟️</span>
            <span>Grievances ({openTickets})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left w-full outline-none cursor-pointer ${
              activeSubTab === 'settings'
                ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-3'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 pl-4'
            }`}
          >
            <span className="text-sm">⚙️</span>
            <span>Franchise Settings</span>
          </button>
        </div>

        {/* Right Tab Content Body Panel */}
        <div className="md:col-span-3 transition-all duration-300">
        
        {/* TAB 1: OVERVIEW METRICS DETAILED */}
        {activeSubTab === 'overview' && (
          <div className="space-y-8 animate-fade-in font-sans">
            
            {/* Extended Analytical Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Ticket Resolution Rates</span>
                  <span className="block text-xl font-bold font-mono text-emerald-600 mt-1">{ticketResolutionRate}%</span>
                  <span className="text-[10px] text-slate-550 text-slate-500 block mt-0.5">Completed citizen disputes</span>
                </div>
                <div className="relative w-11 h-11 flex items-center justify-center rounded-full bg-emerald-50">
                  <CheckCheck className="text-emerald-600" size={18} />
                </div>
              </div>

              <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Avg Processing Velocity</span>
                  <span className="block text-xl font-bold font-mono text-indigo-755 text-indigo-700 mt-1">{getAvgProcessingTime()}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Created to Certificate Upload</span>
                </div>
                <div className="relative w-11 h-11 flex items-center justify-center rounded-full bg-indigo-50">
                  <Clock className="text-indigo-600" size={18} />
                </div>
              </div>

              <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Today's Dynamic Cases</span>
                  <span className="block text-xl font-bold font-mono text-amber-600 mt-1">+{applications.filter(a => a.status === 'Pending').length || 1} cases</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">Assigned Noida Operators: 3</span>
                </div>
                <div className="relative w-11 h-11 flex items-center justify-center rounded-full bg-amber-50">
                  <Users className="text-amber-600" size={18} />
                </div>
              </div>
            </div>

            {/* Visual Charts Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphic A: Growth Trend */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-4 shadow-xs">
                <div className="space-y-1">
                  <h3 className="font-display font-semibold text-slate-800 text-sm">Customer Acquisitions & Inbound Cases</h3>
                  <p className="text-[11px] text-slate-400">Past 7 days citizen registry timeline</p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
                      <Line type="monotone" dataKey="New Customers" stroke="#d97706" activeDot={{ r: 6 }} strokeWidth={2} />
                      <Line type="monotone" dataKey="Inbound Orders" stroke="#4f46e5" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graphic B: Popularity Metrics Stacked */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-4 shadow-xs">
                <div className="space-y-1">
                  <h3 className="font-display font-semibold text-slate-804 text-slate-800 text-sm">Popular Services Overview</h3>
                  <p className="text-[11px] text-slate-400">Aggregated case volume & direct gross funding yield</p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={popularServicesData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 8 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#4f46e5" allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
                      <Bar dataKey="Applications" fill="#4f46e5" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Revenue (₹)" fill="#059669" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recents Activity Stream Grid logs */}
            <div className="bg-white border border-slate-100 p-5 rounded-xl space-y-3 shadow-xs">
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Bookmark size={13} className="text-indigo-650 text-indigo-600" /> Recent Noida-62 Action Stream Logs
              </span>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto font-mono text-[11px]">
                {applications.map((app, index) => (
                  <div key={index} className="p-3 bg-slate-50 border border-slate-100 rounded flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <p className="text-slate-805"><span className="text-indigo-605 text-indigo-600 font-bold">[ACTION]</span> {app.customerName} submitted <span className="font-bold">"{app.serviceName}"</span> file.</p>
                      <p className="text-slate-400 text-[10px]">Reference tracking id: {app.trackingNumber} • Payment verified successfully.</p>
                    </div>
                    <span className="text-slate-400 text-[10px] shrink-0">{new Date(app.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPLICATION PROCESSING - WORKFLOW ENGINE */}
        {activeSubTab === 'applications' && (
          <div className="space-y-6">
            
            {/* Search Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between font-sans">
              <div className="relative w-full sm:max-w-xs">
                <Search size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Citizen name, phone, or tracking..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  className="text-xs p-2 border border-gray-200 rounded-lg focus:outline-none bg-white w-full sm:w-auto text-slate-800 font-medium"
                >
                  <option value="All">All statuses in workspace</option>
                  <option value="Pending">Pending Assignment</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Processing">Processing Operations</option>
                  <option value="Submitted to Government Portal">Submitted to Gov</option>
                  <option value="Approved">Approved / Ready</option>
                  <option value="Rejected">Rejected Slots</option>
                  <option value="Documents Required">Documents Correction Required</option>
                  <option value="Completed">Completed Payouts</option>
                </select>
              </div>
            </div>

            {/* Applications List Grid */}
            {filteredApps.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl space-y-2 font-sans shadow-xs">
                <FileText size={32} className="text-gray-300 mx-auto" />
                <p className="text-xs font-semibold text-gray-700">No student or citizen case files matching queries in local memory</p>
                <p className="text-[10px] text-slate-400">Select another status modifier or query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 font-sans">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 bg-white border border-gray-100 hover:border-gray-200 rounded-2xl shadow-xs transition flex flex-col lg:flex-row justify-between lg:items-center gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold font-mono text-indigo-650 text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded">
                          {app.trackingNumber}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          app.status === 'Completed' ? 'bg-emerald-100 text-emerald-805 text-emerald-800' :
                          app.status === 'Pending' ? 'bg-yellow-101 text-yellow-800 font-semibold' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {app.status}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">
                          {app.paymentStatus}: ₹{app.feesPaid}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-slate-900 text-sm">{app.serviceName}</h4>
                        <p className="text-xs text-slate-600">Citizen: <span className="font-bold">{app.customerName}</span> ({app.customerPhone})</p>
                        <p className="text-[9.5px] text-slate-400 font-mono">Enrolled: {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>

                      {/* Supporting credential verification files viewer */}
                      <div className="pt-2">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Attached Demography Proof Documents:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {app.documents && app.documents.map((doc, dIdx) => (
                            <button
                              key={dIdx}
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="px-2 py-1 bg-slate-50 border border-slate-150 rounded text-[10px] font-bold text-indigo-650 text-indigo-600 hover:bg-slate-100/50 flex items-center gap-1 shrink-0 cursor-pointer text-left"
                            >
                              <FileCheck size={11} />
                              <span>{doc.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Operational Triggers */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => onOpenInvoice(app)}
                        className="px-3 py-1.5 border border-slate-200 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 text-[10px] font-semibold rounded-lg transition"
                      >
                        Receipt Bills
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAppId(app.id);
                          setNewStatus(app.status);
                          setOperatorNotes(app.operatorNotes || '');
                          setSimulatedCertUrl(app.finalCertificateUrl || '');
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1 border border-indigo-505 cursor-pointer shadow-sm"
                      >
                        <Edit2 size={11} />
                        <span>Process Workflow Status</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Workflow status editing drawer modal */}
            {selectedAppId && selectedAppObj && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSelectedAppId(null)} />
                <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-100 shadow-2xl space-y-4 font-sans max-h-[90vh] overflow-y-auto">
                  
                  <div className="flex justify-between items-start border-b border-slate-50 pb-2">
                    <div>
                      <h3 className="font-display font-semibold text-slate-800 text-sm">Processing Workflow dispatch</h3>
                      <p className="text-[11px] text-slate-400">Application: {selectedAppObj.serviceName} ({selectedAppObj.customerName})</p>
                    </div>
                    <button onClick={() => setSelectedAppId(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                      <X size={16} />
                    </button>
                  </div>

                  {/* Document Review Status verification widget */}
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                    <span className="block text-[10px] text-slate-450 uppercase font-bold text-slate-400">Verify Supporting Public Credentials:</span>
                    <div className="space-y-1.5">
                      {selectedAppObj.documents.map((doc, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 border border-slate-150 rounded text-xs">
                          <span className="font-mono truncate max-w-[200px]">{doc.name}</span>
                          <div className="flex gap-2">
                            <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded shadow-0 flex items-center gap-0.5">
                              ✓ Approved Demography Proof
                            </span>
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="text-indigo-650 text-indigo-600 hover:underline cursor-pointer font-semibold"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleUpdateOperationsSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">State Registry status workflow</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none font-bold"
                        >
                          <option value="Under Review">Mark Under Review</option>
                          <option value="Processing">Mark Processing</option>
                          <option value="Submitted to Government Portal">Mark Submitted Portals</option>
                          <option value="Approved">Mark Approved</option>
                          <option value="Rejected">Mark Rejected File</option>
                          <option value="Documents Required">Request Additional Documents</option>
                          <option value="Completed">Mark Completed & Settle Certificate</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Assign Desk Personnel</label>
                        <select
                          value={assignedOperator}
                          onChange={(e) => setAssignedOperator(e.target.value)}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-205 rounded font-medium bg-white"
                        >
                          <option value="Arjun Devgan">Arjun Devgan (Operator Noida-62)</option>
                          <option value="Karan Johal">Karan Johal (Registry Clerk)</option>
                          <option value="Devika Sen">Devika Sen (Supervising Officer)</option>
                        </select>
                      </div>
                    </div>

                    {/* Cert upload fields if completed status */}
                    {(newStatus === 'Completed' || newStatus === 'Approved') && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100/60 rounded-xl space-y-3">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Final Document Upload & Certification Settle URL</span>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Enter simulated PDF file secure URL copy"
                            value={simulatedCertUrl}
                            onChange={(e) => setSimulatedCertUrl(e.target.value)}
                            className="w-full text-xs p-2 border border-emerald-200 bg-white rounded focus:ring-1 focus:ring-emerald-400"
                          />
                          <p className="text-[10px] text-emerald-700 italic">
                            * Overwriting this URL lets the citizen download their active certificate instantly. If left empty, a mock PDF is generated automatically.
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Operator notes / Correction feedback details</label>
                      <textarea
                        rows={3}
                        value={operatorNotes}
                        onChange={(e) => setOperatorNotes(e.target.value)}
                        placeholder="Write down the reason for rejection, demographic update details, or instructions for the citizen..."
                        className="w-full text-xs p-2 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-400 resize-none font-sans"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAppId(null)}
                        className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs rounded transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded transition shadow"
                      >
                        Commit Workflow Transition
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUSTOMER MANAGEMENT */}
        {activeSubTab === 'customers' && (
          <div className="space-y-6 font-sans">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-semibold text-slate-800 text-sm">Citizen Demographics Directory</h3>
                <p className="text-xs text-slate-400">View real-time, search, update details, or toggle administrative block status logs</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-4 shadow-xs">
              <div className="max-w-xs relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer registry by name, phone..."
                  value={custSearch}
                  onChange={(e) => setCustSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                      <th className="py-2.5 px-3">UID No</th>
                      <th className="py-2.5 px-3">Full Citizen Name</th>
                      <th className="py-2.5 px-3">Phone Coordinates</th>
                      <th className="py-2.5 px-3">Registered Email</th>
                      <th className="py-2.5 px-3">KYC Verification Tier</th>
                      <th className="py-2.5 px-3">Registry Block State</th>
                      <th className="py-2.5 px-3 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.phone.includes(custSearch)).map((cust) => (
                      <tr key={cust.uid} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-500">{cust.uid}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800 flex items-center gap-1">
                          {cust.name} {cust.isBlocked && <span className="text-red-650 bg-red-100 text-[8.5px] font-bold px-1 rounded">BLOCKED</span>}
                        </td>
                        <td className="py-3 px-3 font-mono">{cust.phone}</td>
                        <td className="py-3 px-3 text-slate-500">{cust.email}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${cust.kyc.includes('Tier-3') ? 'bg-emerald-55 text-emerald-800 bg-emerald-50' : 'bg-yellow-50 text-yellow-805'}`}>
                            {cust.kyc}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-bold font-sans text-[10px] ${cust.isBlocked ? 'text-red-600' : 'text-emerald-600'}`}>
                            {cust.isBlocked ? '● Suspended Node' : '● Active Settle Client'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right flex justify-end gap-1.5 pt-4">
                          <button
                            onClick={() => {
                              setEditingCustId(cust.uid);
                              setEditingCustName(cust.name);
                              setEditingCustPhone(cust.phone);
                              setEditingCustEmail(cust.email);
                            }}
                            className="text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded px-2 py-0.5 text-[10px] font-bold transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleBlockCustomer(cust.uid)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${cust.isBlocked ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
                          >
                            {cust.isBlocked ? 'Activate' : 'Block Client'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Editing customer modal */}
            {editingCustId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
                <div className="bg-white border border-slate-105 rounded-xl p-5 shadow-2xl w-full max-w-sm space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Modify Customer registry card</h4>
                  <form onSubmit={handleEditCustomerSave} className="space-y-3">
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Citizen Full Name</label>
                      <input
                        type="text"
                        value={editingCustName}
                        onChange={(e) => setEditingCustName(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 bg-slate-50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Phone Coordinate</label>
                      <input
                        type="tel"
                        value={editingCustPhone}
                        onChange={(e) => setEditingCustPhone(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 bg-slate-50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Email</label>
                      <input
                        type="email"
                        value={editingCustEmail}
                        onChange={(e) => setEditingCustEmail(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 bg-slate-50 focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setEditingCustId(null)} className="px-3 py-1.5 border border-slate-200 text-xs rounded text-slate-600">Cancel</button>
                      <button type="submit" className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded transition shadow-xs">Settle profile updates</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SERVICE MANAGEMENT */}
        {activeSubTab === 'services' && (
          <div className="space-y-6 font-sans">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-display font-semibold text-slate-800 text-sm">Administrative Services Directory Configuration</h3>
                <p className="text-xs text-slate-400">Add, alter pricing, set up required documents, or remove citizen services slots</p>
              </div>
              <button
                onClick={() => setIsAddingService(true)}
                className="px-3.5 py-1.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add Service Settle Registry</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesList.map((service) => (
                <div key={service.id} className="p-4 bg-white border border-slate-100 hover:border-indigo-400 transition rounded-xl flex flex-col justify-between shadow-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[8px] font-bold uppercase bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">
                        {service.category}
                      </span>
                      <span className={`text-[9px] font-bold uppercase ${service.isActive ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-100'} px-1.5 py-0.2 rounded`}>
                        {service.isActive ? 'Active Registry' : 'Offline'}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-xs">{service.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">{service.description}</p>
                    
                    <div className="pt-1.5 space-y-1">
                      <p className="text-[9.5px] uppercase font-bold text-slate-400">Target Prerequisite Documents:</p>
                      <div className="flex flex-wrap gap-1">
                        {service.requiredDocuments.map((doc, idx) => (
                          <span key={idx} className="bg-slate-50 border border-slate-150 px-1.5 py-0.2 rounded text-[8.5px] text-slate-600 font-mono">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-3 mt-3 flex justify-between items-center flex-wrap gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-mono block">Required Surcharge Fee:</span>
                      {editingServiceId === service.id ? (
                        <div className="flex gap-1">
                          <input
                            type="number"
                            value={editingServiceFee}
                            onChange={(e) => setEditingServiceFee(Number(e.target.value))}
                            className="w-16 p-1 border rounded text-xs text-slate-900 font-mono"
                          />
                          <button onClick={() => handleUpdateServicePriceSave(service.id)} className="text-emerald-600 font-bold hover:underline text-[10px]">Save</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-bold font-mono text-sm text-indigo-700">₹{service.fee}</span>
                          <button
                            onClick={() => {
                              setEditingServiceId(service.id);
                              setEditingServiceFee(service.fee);
                            }}
                            className="p-1 hover:bg-slate-50 text-slate-400 rounded hover:text-slate-650"
                          >
                            <Edit2 size={10} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 pt-1.5">
                      <button
                        onClick={() => handleToggleServiceActive(service.id)}
                        className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[9.5px] font-bold"
                      >
                        {service.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-1 hover:bg-red-50 text-red-600 rounded"
                        title="Delete this service"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Adding service modal drawer */}
            {isAddingService && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40" onClick={() => setIsAddingService(false)} />
                <div className="relative w-full max-w-md bg-white rounded-xl p-5 shadow-2 w-full space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs">Add new public registry service</h4>
                  <form onSubmit={handleAddServiceSubmit} className="space-y-4 font-sans">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Service name</label>
                      <input
                        type="text"
                        placeholder="e.g., Cast Issuance"
                        value={newSName}
                        onChange={(e) => setNewSName(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Category</label>
                        <select
                          value={newSCat}
                          onChange={(e: any) => setNewSCat(e.target.value)}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none bg-white font-medium"
                        >
                          <option value="Identity & Certificates">Identity & Certificates</option>
                          <option value="Taxes & Revenue">Taxes & Revenue</option>
                          <option value="Utility Bills">Utility Bills</option>
                          <option value="Welfare & Pensions">Welfare & Pensions</option>
                          <option value="Travel & Passports">Travel & Passports</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1 font-sans">Surcharge Fee (₹)</label>
                        <input
                          type="number"
                          value={newSFee}
                          onChange={(e) => setNewSFee(Number(e.target.value))}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Prerequisite documents checklist (commas split)</label>
                      <input
                        type="text"
                        placeholder="Aadhaar Card, Passport size photo, Address Proof"
                        value={newSDocs}
                        onChange={(e) => setNewSDocs(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1 font-sans">Elaborated definition description</label>
                      <textarea
                        rows={3}
                        value={newSDesc}
                        onChange={(e) => setNewSDesc(e.target.value)}
                        placeholder="Service details..."
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none resize-none"
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <button type="button" onClick={() => setIsAddingService(false)} className="px-3 py-1.5 border border-slate-200 text-xs rounded text-slate-650">Cancel</button>
                      <button type="submit" className="flex-1 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded border border-indigo-505 shadow hover:bg-indigo-700">Add service slot</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PAYMENT MODULES MANUAL TRANS ACTIONS */}
        {activeSubTab === 'payments' && (
          <div className="space-y-6 font-sans">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-sm">Integrated Payments Ledger</h3>
              <p className="text-xs text-slate-400">Track clearance, initiate instant refunds, and review bill invoice histories</p>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-4 shadow-xs">
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Live Transaction coordinates cabinet</span>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                      <th className="py-2.5 px-3">Transaction ID</th>
                      <th className="py-2.5 px-3">Citizen Parent Name</th>
                      <th className="py-2.5 px-3">Subscribed Service</th>
                      <th className="py-2.5 px-3">Settle Gross Amt</th>
                      <th className="py-2.5 px-3">Receipt status</th>
                      <th className="py-2.5 px-3 text-right">Actions / Surcharge Refund</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-indigo-600">{app.transactionId || 'TXN_482910'}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{app.customerName}</td>
                        <td className="py-3 px-3">{app.serviceName}</td>
                        <td className="py-3 px-3 font-bold text-slate-900 font-mono">₹{app.feesPaid}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            app.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-800' :
                            app.paymentStatus === 'Refunded' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
                          }`}>
                            {app.paymentStatus || 'Paid'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right flex justify-end gap-1.5">
                          <button
                            onClick={() => onOpenInvoice(app)}
                            className="bg-slate-50 hover:bg-slate-105 border border-slate-200 rounded px-2.5 py-1 text-[10px] font-semibold text-slate-700"
                          >
                            Get invoice receipt
                          </button>
                          {app.paymentStatus === 'Paid' && (
                            <button
                              onClick={() => {
                                app.paymentStatus = 'Refunded';
                                triggerTransientSuccessAlert("Successfully initiated administrative refund for payment id TXN-" + app.transactionId);
                              }}
                              className="bg-red-50 hover:bg-red-100 rounded px-2.5 py-1 text-[10px] font-semibold text-red-600 transition"
                            >
                              Settle Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 italic font-mono">No transaction logs registered. Try submitting a service request down in customer panel.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: NOTIFICATION CENTER INTEGRATION */}
        {activeSubTab === 'notifications' && (
          <div className="space-y-6 font-sans">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-sm">SMS / WHATSAPP / EMAIL NOTIFICATION CENTER</h3>
              <p className="text-xs text-slate-400">Trigger manual update notifications to specific telephones or broadcast announcements</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Direct message sender form */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-4 shadow-xs">
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Trigger Manual Citizen Alert</span>
                <form onSubmit={handleSendCustomNotification} className="space-y-4 font-sans">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Select Dispatch Channel</label>
                      <select
                        value={channelType}
                        onChange={(e: any) => setChannelType(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded bg-white text-slate-800 font-bold"
                      >
                        <option value="sms">SMS Text Alert Tracker</option>
                        <option value="whatsapp">WhatsApp Official Push</option>
                        <option value="email">Encrypted Email Coordinates</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1 font-sans">Target Phone Number</label>
                      <input
                        type="tell"
                        placeholder="e.g., 9876543210"
                        value={targetPhone}
                        onChange={(e) => setTargetPhone(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Alert message details (160 characters limit)</label>
                    <textarea
                      rows={4}
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      placeholder="Write message copy here..."
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded border border-indigo-505 transition shadow-sm"
                  >
                    Dispatch Client Update
                  </button>
                </form>
              </div>

              {/* Broadcast announcements center */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-3 font-sans">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Broadcast News announcement to all citizens</span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Dispatches a popup administrative card warning or system update notification to every client logged on the Noida-62 node. Useful for holiday notices or state server downtime.
                  </p>
                  <div>
                    <label className="block text-[10px] text-slate-405 text-slate-500 font-bold uppercase mb-1 font-sans">Corporate Bulletin announcement text</label>
                    <textarea
                      rows={3}
                      value={broadcastNotif}
                      onChange={(e) => setBroadcastNotif(e.target.value)}
                      placeholder="e.g., Server maintenance alert: demographic UIDAI update speeds down on Tuesday, June 9th."
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded resize-none font-sans"
                    />
                  </div>
                </div>

                <button
                  onClick={handleBroadcastAnnouncement}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded transition border border-slate-800 shrink-0 mt-4"
                >
                  Broadcast Bulletin Settle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: GRIEVANCE RESOLUTION AND TICKETS CHAT TRACK */}
        {activeSubTab === 'tickets' && (
          <div className="space-y-6">
            
            <div className="flex justify-between items-center font-sans">
              <div>
                <h3 className="font-display font-semibold text-slate-800 text-sm">Administrative Grievance resolution room</h3>
                <p className="text-xs text-slate-400">Review consumer file disputes, submit coordinate replies, or mark case resolved</p>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-805 text-red-800 border border-red-150 rounded-full font-mono text-xs font-bold animate-pulse">
                {openTickets} Open Discrepancies
              </span>
            </div>

            {tickets.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-101 rounded-2xl space-y-2 font-sans shadow-xs">
                <HelpCircle size={32} className="text-slate-300 mx-auto animate-bounce" />
                <p className="text-xs font-semibold text-slate-705">Clean sheet! Complaint files resolved</p>
                <p className="text-[10px] text-slate-400">All citizens satisfied with prompt processing timelines.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 font-sans">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className={`p-5 bg-white border rounded-xl transition ${
                      activeTicketId === t.id ? 'border-indigo-650 bg-indigo-50/10' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start cursor-pointer" onClick={() => setActiveTicketId(activeTicketId === t.id ? null : t.id)}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block text-[8px] font-bold uppercase px-2 py-0.5 rounded ${
                            t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-101 bg-red-100 text-red-800'
                          }`}>
                            {t.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Reference Topic ID: TKT-{t.id.slice(-4).toUpperCase()}</span>
                        </div>
                        <h4 className="font-display font-bold text-slate-900 text-xs">{t.subject}</h4>
                        <p className="text-[11px] text-slate-650 font-sans">From citizen: <span className="font-semibold text-slate-800">{t.customerName}</span> ({t.category})</p>
                      </div>
                      <ChevronRight size={15} className={`text-slate-400 transition-all ${activeTicketId === t.id ? 'rotate-90' : ''}`} />
                    </div>

                    {activeTicketId === t.id && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                        <div className="p-3 bg-slate-50 border border-slate-150 rounded text-xs leading-normal font-mono text-slate-700">
                          <span className="font-bold text-slate-900 block mb-1">Citizen Complaint Statement:</span>
                          "{t.description}"
                        </div>

                        {/* Existing messages */}
                        {t.replies.length > 0 && (
                          <div className="space-y-2.5">
                            <span className="block text-[9.5px] uppercase font-bold text-slate-400 font-sans">Response trail</span>
                            {t.replies.map(rep => (
                              <div
                                key={rep.id}
                                className={`p-2.5 rounded text-xs leading-normal max-w-[85%] font-sans border ${
                                  rep.senderRole === 'customer'
                                    ? 'bg-amber-50 border-amber-100'
                                    : 'bg-indigo-50 border-indigo-120 ml-auto'
                                }`}
                              >
                                <span className="font-bold text-[9px] block text-slate-500">
                                  {rep.senderName} ({rep.senderRole.toUpperCase()})
                                </span>
                                <p className="text-slate-805 mt-0.5">"{rep.message}"</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {t.status !== 'Resolved' && (
                          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-150 space-y-3 font-sans">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Action: Send resolution response coordinates</span>
                            <textarea
                              rows={2}
                              placeholder="Write reply notes or confirm file corrections..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="w-full text-xs p-2 bg-white border border-slate-200 rounded resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => handleTicketReplySubmit(e, t.id, false)}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-[10.5px] cursor-pointer"
                              >
                                Send Reply
                              </button>
                              <button
                                onClick={(e) => handleTicketReplySubmit(e, t.id, true)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10.5px] cursor-pointer"
                              >
                                Reply & Settle Dispute Resolved
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: STATISTICAL REPORTS DISPATCH */}
        {activeSubTab === 'reports' && (
          <div className="space-y-6 font-sans">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-sm">Statistical Reports Bureau Dispatch</h3>
              <p className="text-xs text-slate-400 font-sans">Download or query official registers, daily monthly revenue logs, or demographic audit sheets</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
              <div className="bg-white border border-slate-100 p-5 rounded-xl space-y-3 h-fit shadow-xs">
                <FileSpreadsheet className="text-indigo-600" size={24} />
                <h4 className="font-semibold text-slate-905 text-xs font-display">Daily Revenue Ledgers</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Aggregates all GST transaction payouts processed within Noida franchise node past 24 hours. Ideal for daily accountants reporting.
                </p>
                <button
                  onClick={() => triggerTransientSuccessAlert("Generating Noida Area Desk Daily ledger! Secure XLSX format spreadsheet downloaded in background.")}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 rounded text-[10px] font-bold cursor-pointer transition w-full"
                >
                  Download Daily Registry XLS
                </button>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-xl space-y-3 h-fit shadow-xs">
                <FileSpreadsheet className="text-emerald-605 text-emerald-600" size={24} />
                <h4 className="font-semibold text-slate-905 text-xs font-display">Monthly Revenue Ledger</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Total revenue collected (₹{totalFeesCollected}) structured over categories: community caste certs, PAN files, passport registrations.
                </p>
                <button
                  onClick={() => triggerTransientSuccessAlert("Monthly summary PDF prepared with Delhi headquarters stamp. Download completed.")}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 text-emerald-700 rounded text-[10px] font-bold cursor-pointer transition w-full"
                >
                  Get Monthly PDF Summary
                </button>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-xl space-y-3 h-fit shadow-xs">
                <FileSpreadsheet className="text-amber-600" size={24} />
                <h4 className="font-semibold text-slate-905 text-xs font-display">Service Registry Performance</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Reports showing average RTO/UIDAI processing speed ({getAvgProcessingTime()}), officer delay analysis, and feedback surveys critique.
                </p>
                <button
                  onClick={() => triggerTransientSuccessAlert("Preparing performance breakdown graphs file. Dispatch ready.")}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-150 text-amber-700 rounded text-[10px] font-bold cursor-pointer transition w-full"
                >
                  Prepare Performance Breakdown
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS PANEL DESK */}
        {activeSubTab === 'settings' && (
          <form onSubmit={handleSavesSettings} className="bg-white border border-slate-100 p-6 rounded-2xl space-y-6 font-sans shadow-xs">
            
            <div className="border-b border-slate-50 pb-2">
              <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <Settings size={14} className="text-indigo-600" /> Administrative Node Center Configuration
              </h3>
              <p className="text-xs text-slate-400">Modify legal franchisee names, portal constants parameters, or adjust client gateway switches</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Corporate Franchise Desk Center Name</label>
                <input
                  type="text"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Assigned Registry Code Reference</label>
                <input
                  type="text"
                  value={centerRegCode}
                  onChange={(e) => setCenterRegCode(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Client Surcharge commission fee (₹)</label>
                <input
                  type="number"
                  value={feesSurcharge}
                  onChange={(e) => setFeesSurcharge(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              {/* Payment gateway checklist switches */}
              <div className="space-y-4 pt-1">
                <span className="block text-[10px] text-slate-500 font-bold uppercase">Supported settlement tunnels</span>
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-1.5 font-bold text-slate-705">
                    <input
                      type="checkbox"
                      checked={gatewayEnabledUpi}
                      onChange={(e) => setGatewayEnabledUpi(e.target.checked)}
                      className="rounded border-slate-250 cursor-pointer text-indigo-600"
                    />
                    <span>Unified UPI Terminal</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold text-slate-705">
                    <input
                      type="checkbox"
                      checked={gatewayEnabledRazor}
                      onChange={(e) => setGatewayEnabledRazor(e.target.checked)}
                      className="rounded border-slate-250 cursor-pointer text-indigo-600"
                    />
                    <span>Razorpay API checkout</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-605 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded transition shadow-sm border border-indigo-505"
              >
                Authenticate & Settle Node Settings
              </button>
            </div>
          </form>
        )}

        </div>

      </div>

      <DocumentPreviewModal
        isOpen={previewDoc !== null}
        onClose={() => setPreviewDoc(null)}
        doc={previewDoc}
      />

    </div>
  );
}
