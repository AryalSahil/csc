import React, { useState, useEffect } from 'react';
import {
  FileText, Shield, Sparkles, FolderLock, Plus, HelpCircle, Eye, CheckCircle2,
  AlertCircle, ChevronRight, Upload, X, Wallet, MessageSquare, RefreshCw, Bookmark,
  User, MapPin, Key, CreditCard, Bell, Send, Download, Check, ExternalLink, Settings,
  Headphones, Lock, CheckCircle
} from 'lucide-react';
import { UserProfile, CscService, Application, SupportTicket, VaultDocument } from '../types';
import { INITIAL_SERVICES } from '../data/services';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerPortalProps {
  currentUser: UserProfile;
  selectedServiceForApply: CscService | null;
  setSelectedServiceForApply: (service: CscService | null) => void;
  applications: Application[];
  onSubmitApplication: (serviceId: string, docFiles: { name: string; size: number }[], paymentMethod: string) => void;
  tickets: SupportTicket[];
  onCreateTicket: (subject: string, desc: string, category: string) => void;
  onPostTicketReply: (ticketId: string, message: string) => void;
  vault: VaultDocument[];
  onUploadVaultDoc: (name: string, category: string, size: number) => void;
  onDeleteVaultDoc: (docId: string) => void;
  onOpenInvoice: (app: Application) => void;
  onRateApplication: (appId: string, rating: number, feedback: string) => void;
}

export default function CustomerPortal({
  currentUser,
  selectedServiceForApply,
  setSelectedServiceForApply,
  applications,
  onSubmitApplication,
  tickets,
  onCreateTicket,
  onPostTicketReply,
  vault,
  onUploadVaultDoc,
  onDeleteVaultDoc,
  onOpenInvoice,
  onRateApplication
}: CustomerPortalProps) {
  
  const [internalTab, setInternalTab] = useState<'dashboard' | 'apply' | 'vault' | 'profile' | 'tickets'>('dashboard');

  // Local state for feedback submissions inputs
  const [localRatingForm, setLocalRatingForm] = useState<Record<string, { rating: number; text: string }>>({});

  // Apply state
  const [targetApplyService, setTargetApplyService] = useState<string>(selectedServiceForApply?.id || INITIAL_SERVICES[0].id);
  const [uploadedFilesList, setUploadedFilesList] = useState<{ name: string; size: number }[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<'upi' | 'razorpay'>('upi');
  const [upiVpa, setUpiVpa] = useState(`${currentUser.phone || '9876543210'}@paytm`);
  const [paymentStep, setPaymentStep] = useState<1 | 2>(1); // 1: Select files, 2: Gateway checkout
  const [dragActive, setDragActive] = useState(false);

  // Profile Management State
  const [profileName, setProfileName] = useState(currentUser.name || 'Ramesh Kumar');
  const [profileEmail, setProfileEmail] = useState(currentUser.email || 'sahil265064@gmail.com');
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '9876543210');
  const [profileFather, setProfileFather] = useState('Late Rajesh Kumar');
  const [profileDob, setProfileDob] = useState('1995-10-12');
  const [profileStreet, setProfileStreet] = useState('Sector-62, C-Block, Plot 4A');
  const [profileCity, setProfileCity] = useState('Noida');
  const [profileState, setProfileState] = useState('Uttar Pradesh');
  const [profileZip, setProfileZip] = useState('201301');
  const [profileLandmark, setProfileLandmark] = useState('Opposite Fortis Hospital');
  const [aadhaarMasked, setAadhaarMasked] = useState('4821 9832 1094');
  const [hasBiometricConsent, setHasBiometricConsent] = useState(true);
  const [kycTier, setKycTier] = useState('Tier-3 Fully Verified');
  
  // Changing Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSuccessMsg, setPassSuccessMsg] = useState('');

  // Ticket State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketCat, setTicketCat] = useState('Payment Surcharge');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [ticketReplyMsg, setTicketReplyMsg] = useState('');

  // Vault State
  const [vaultDocName, setVaultDocName] = useState('');
  const [vaultDocCat, setVaultDocCat] = useState('Identity Proof');
  
  // Custom Replace File state
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  // Operator direct custom chat simulator states
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; text: string; time: string; isOperator: boolean }[]>([
    { id: '1', sender: 'Arjun Devgan (Operator Noida-62)', text: 'Namaste! Welcome back Ramesh. I checked your demographic application proofs. All look solid.', time: '18:15', isOperator: true },
    { id: '2', sender: 'Ramesh Kumar (Citizen)', text: 'Hello, great to hear. Do I need to carry my physical salary slip?', time: '18:17', isOperator: false },
    { id: '3', sender: 'Arjun Devgan (Operator Noida-62)', text: 'Not necessary! If physical documents are required, we will prompt you via this tracking timeline. Standard processing speed is maintained.', time: '18:19', isOperator: true }
  ]);
  const [newChatInput, setNewChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // File replacement tool
  const [isReplacing, setIsReplacing] = useState(false);

  // Missing File Correction upload state
  const [targetCorrectionApp, setTargetCorrectionApp] = useState<Application | null>(null);

  // Local notification banner inside the portal
  const [notifTriggerMessage, setNotifTriggerMessage] = useState<string | null>(null);

  // Local state for interactive Document Preview Modal popup
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string; category?: string } | null>(null);

  // Modal overlays for file upload document selection
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLockerUploadOpen, setIsLockerUploadOpen] = useState(false);

  const selectedServiceObj = INITIAL_SERVICES.find(s => s.id === (selectedServiceForApply?.id || targetApplyService)) || INITIAL_SERVICES[0];

  useEffect(() => {
    if (selectedServiceForApply) {
      setTargetApplyService(selectedServiceForApply.id);
      setInternalTab('apply');
    }
  }, [selectedServiceForApply]);

  // Calculate dynamic stats
  const totalAppsCount = applications.length;
  const pendingApps = applications.filter(a => a.status === 'Pending' || a.status === 'Documents Required').length;
  const inProgressApps = applications.filter(a => a.status === 'Under Review' || a.status === 'Processing' || a.status === 'Submitted to Government Portal').length;
  const completedApps = applications.filter(a => a.status === 'Completed' || a.status === 'Approved').length;

  const handleApplyClick = (serviceId: string) => {
    const s = INITIAL_SERVICES.find(srv => srv.id === serviceId);
    if (s) {
      setSelectedServiceForApply(s);
      setTargetApplyService(serviceId);
      setUploadedFilesList([]);
      setPaymentStep(1);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).map((f: any) => ({ name: f.name, size: f.size }));
      setUploadedFilesList(prev => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files).map((f: any) => ({ name: f.name, size: f.size }));
      setUploadedFilesList(prev => [...prev, ...files]);
    }
  };

  const handleInitiateApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedFilesList.length === 0) {
      alert('Please upload/attach at least 1 document configuration verification form before checkout!');
      return;
    }
    setPaymentStep(2); // Proceed to checkout
  };

  const handleFinalCheckout = () => {
    onSubmitApplication(selectedServiceObj.id, uploadedFilesList, selectedPayment === 'upi' ? `UPI/${upiVpa}` : 'Razorpay Gateway');
    setSelectedServiceForApply(null);
    setUploadedFilesList([]);
    setPaymentStep(1);
    setInternalTab('dashboard');
    showNotificationBanner('Successfully submitted service application! Settle code verified.');
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) return;
    onCreateTicket(ticketSubject, ticketDesc, ticketCat);
    setTicketSubject('');
    setTicketDesc('');
    showNotificationBanner('Central Grievance ticket created successfully! Noida desk assigned.');
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyMsg.trim() || !activeTicketId) return;
    onPostTicketReply(activeTicketId, ticketReplyMsg);
    setTicketReplyMsg('');
    showNotificationBanner('Ticket reply submitted successfully.');
  };

  const handleVaultFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultDocName.trim()) return;
    const sizeInBytes = Math.floor(100000 + Math.random() * 2000000); // 100KB to 2MB random size
    onUploadVaultDoc(vaultDocName, vaultDocCat, sizeInBytes);
    setVaultDocName('');
    showNotificationBanner('Document added safely to secure digital locker.');
  };

  const handleReplaceFileSubmit = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && replaceTargetId) {
      const f = e.target.files[0];
      // Simulate file replacement in local locker flow
      showNotificationBanner(`Successfully replaced file with "${f.name}" (${(f.size/1024).toFixed(1)} KB)!`);
      setReplaceTargetId(null);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showNotificationBanner('Profile and central address details updated successfully inside UI state.');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    setPassSuccessMsg('Success: Secure credential update completed.');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPassSuccessMsg(''), 5000);
  };

  const showNotificationBanner = (msg: string) => {
    setNotifTriggerMessage(msg);
    setTimeout(() => {
      setNotifTriggerMessage(null);
    }, 4000);
  };

  // Chat message simulator submission
  const handleChatMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatInput.trim()) return;

    const userMsg = {
      id: Math.random().toString(),
      sender: `${profileName} (Citizen)`,
      text: newChatInput,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      isOperator: false
    };

    setChatMessages(prev => [...prev, userMsg]);
    const originalInput = newChatInput;
    setNewChatInput('');

    // Trigger typing simulated reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "Understood. The government state registry processes these verified IDs in batch schedules. We have logged your request.";
      if (originalInput.toLowerCase().includes('help') || originalInput.toLowerCase().includes('delay')) {
        replyText = "I have flagged your submission #100201 for prioritised review by our desk leads. I will text you post certification.";
      } else if (originalInput.toLowerCase().includes('pan') || originalInput.toLowerCase().includes('aadhaar')) {
        replyText = "Demographic update uploads are syncronised every 6 hours with central UIDAI servers.";
      }
      setChatMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'Arjun Devgan (Operator Noida-62)',
        text: replyText,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isOperator: true
      }]);
    }, 1500);
  };

  // Define tracking status arrays to render beautifully
  const getProgressStepForStatus = (status: string) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Under Review': return 2;
      case 'Processing': return 3;
      case 'Submitted to Government Portal': return 4;
      case 'Approved': return 5;
      case 'Completed': return 6;
      case 'Rejected': return 0; // special flag
      case 'Documents Required': return 1; // back to stage 1 with correction
      default: return 1;
    }
  };

  const renderTrackingStepsLine = (status: string) => {
    const stepNum = getProgressStepForStatus(status);
    const stepsList = [
      { num: 1, label: 'Pending' },
      { num: 2, label: 'Under Review' },
      { num: 3, label: 'Processing' },
      { num: 4, label: 'Submitted' },
      { num: 5, label: 'Approved' },
      { num: 6, label: 'Completed' }
    ];

    if (status === 'Rejected') {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-800 text-xs mt-2 font-semibold">
          <AlertCircle size={15} />
          <span>Application Rejected. Operator Note: "Documents submitted are blurry or invalid. Raise ticket or replace proof."</span>
        </div>
      );
    }

    return (
      <div className="mt-3 bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3 font-sans">
        <div className="flex justify-between items-center text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Processing Pipeline Track</span>
          <span className="text-indigo-600 font-mono">Stage {stepNum || 1} of 6</span>
        </div>
        <div className="relative flex justify-between items-center w-full mt-2">
          {/* Progress Grey Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
          {/* Progress Filled Indigo Line */}
          <div 
            className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: `${((Math.max(1, stepNum) - 1) / 5) * 100}%` }}
          />

          {stepsList.map(step => {
            const isDone = step.num <= stepNum;
            const isCurrent = step.num === stepNum;
            return (
              <div key={step.num} className="relative z-10 flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isDone 
                    ? 'bg-indigo-605 bg-indigo-600 text-white shadow-xs' 
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                } ${isCurrent ? 'ring-4 ring-indigo-100 scale-110' : ''}`}>
                  {isDone && step.num < stepNum ? '✓' : step.num}
                </div>
                <span className={`text-[9px] mt-1 font-bold tracking-tight ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const activeTicketObj = tickets.find(t => t.id === activeTicketId);

  return (
    <div className="space-y-8 pb-12 font-sans relative">

      {/* Floating Status / Action Trigger Notification Feed message banner */}
      {notifTriggerMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-full shadow-2xl flex items-center gap-2 animate-fade-in font-sans">
          <CheckCircle className="text-emerald-500" size={14} />
          <span>{notifTriggerMessage}</span>
        </div>
      )}
      
      {/* 1. Header Hero Greeting / Welcome Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md font-sans">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h1 className="font-display font-bold text-xl md:text-2xl">Namaste, {profileName}</h1>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold font-mono text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> KYC ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">Noida-62 CSC Central Node • ID Ticket Surcharge Lock: Validated</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setInternalTab('apply'); setSelectedServiceForApply(null); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-indigo-500/10 cursor-pointer shadow-sm transition"
          >
            <Plus size={14} />
            <span>Apply For New ID</span>
          </button>
        </div>
      </div>

      {/* 2. Mini Stats Cards / Quick Portal Counter Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
        <div onClick={() => setInternalTab('dashboard')} className="p-4 bg-white border border-slate-100 hover:border-indigo-500 rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            <FileText size={18} />
          </div>
          <div>
            <span className="block text-[9px] text-slate-400 font-semibold uppercase">Total Applications</span>
            <span className="block text-base font-bold text-slate-900">{totalAppsCount} Files</span>
          </div>
        </div>

        <div onClick={() => setInternalTab('dashboard')} className="p-4 bg-white border border-slate-100 hover:border-indigo-500 rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600">
            <AlertCircle size={18} />
          </div>
          <div>
            <span className="block text-[9px] text-slate-400 font-semibold uppercase">Requires Docs/Review</span>
            <span className="block text-base font-bold text-slate-900">{pendingApps + inProgressApps} Active</span>
          </div>
        </div>

        <div onClick={() => setInternalTab('vault')} className="p-4 bg-white border border-slate-100 hover:border-indigo-500 rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <FolderLock size={18} />
          </div>
          <div>
            <span className="block text-[9px] text-slate-400 font-semibold uppercase">Digital Locker (Vault)</span>
            <span className="block text-base font-bold text-slate-900">{vault.length} locked</span>
          </div>
        </div>

        <div onClick={() => setInternalTab('tickets')} className="p-4 bg-white border border-slate-100 hover:border-indigo-550 rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
            <MessageSquare size={18} />
          </div>
          <div>
            <span className="block text-[9px] text-slate-400 font-semibold uppercase">Support Disputes</span>
            <span className="block text-base font-bold text-slate-900">{tickets.length} Saved</span>
          </div>
        </div>
      </div>

      {/* 3. Central Tabs Navigation via Vertical Line Menu - Explicit Sidebar-and-Content Layout */}
      <div className="flex flex-col md:flex-row gap-8 border-t border-slate-100 pt-6 h-[720px] md:h-[750px] overflow-hidden">
        {/* Left Vertical Line Menu Sidebar (Fixed Left) */}
        <div className="w-full md:w-64 shrink-0 overflow-y-auto md:h-full border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setInternalTab('dashboard')}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left w-full outline-none cursor-pointer ${
              internalTab === 'dashboard'
                ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-3'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 pl-4'
            }`}
          >
            <span className="text-sm">📊</span>
            <span>My Dashboard</span>
          </button>
          
          <button
            onClick={() => { setInternalTab('apply'); setSelectedServiceForApply(null); }}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left w-full outline-none cursor-pointer ${
              internalTab === 'apply'
                ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-3'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 pl-4'
            }`}
          >
            <span className="text-sm">📝</span>
            <span>Service Applications</span>
          </button>

          <button
            onClick={() => setInternalTab('vault')}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left w-full outline-none cursor-pointer ${
              internalTab === 'vault'
                ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-3'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 pl-4'
            }`}
          >
            <span className="text-sm">🔐</span>
            <span>Digital Locker (Vault)</span>
          </button>

          <button
            onClick={() => setInternalTab('profile')}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left w-full outline-none cursor-pointer ${
              internalTab === 'profile'
                ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-3'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 pl-4'
            }`}
          >
            <span className="text-sm">👤</span>
            <span>Profile & KYC Desk</span>
          </button>

          <button
            onClick={() => setInternalTab('tickets')}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left w-full outline-none cursor-pointer ${
              internalTab === 'tickets'
                ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 pl-3'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 pl-4'
            }`}
          >
            <span className="text-sm">🎟️</span>
            <span>Support & Grievances</span>
          </button>
        </div>

        {/* Right Tab Content Body Panel (Singly independent scrolling panel) */}
        <div className="flex-1 overflow-y-auto h-full pr-1 pb-10 scrollbar-thin">
          <AnimatePresence mode="wait">
            {/* TAB 1: DASHBOARD OVERVIEW & APPLICATION LIST */}
            {internalTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >

            {/* Welcome panel and Alert Notification updates feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
              <div className="lg:col-span-2 bg-gradient-to-r from-indigo-500/10 to-indigo-600/5 border border-indigo-100 p-5 rounded-2xl space-y-2">
                <h3 className="font-display font-semibold text-slate-800 text-xs uppercase tracking-wider">Citizen Advisory Notice</h3>
                <p className="text-xs text-slate-600 leading-normal">
                  You have <span className="font-bold text-slate-900">{pendingApps} applications</span> requiring verification files or demographic correction uploads. 
                  Digital certifications are generated instantly upon RTO or UIDAI officer confirmation. Use the pre-integrated <strong>Locker (Vault)</strong> tool to synchronize identity documents instantly.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono italic">
                  <span>Last database snapshot handshake: {new Date().toLocaleTimeString('en-IN')}</span>
                </div>
              </div>

              {/* Recent Notifications Centre Widget */}
              <div className="bg-white border border-slate-100 p-4 rounded-xl space-y-3 shadow-xs font-sans">
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Bell size={12} className="text-indigo-600" /> Recent Security Logs
                </span>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded text-[11px] space-y-0.5 leading-tight">
                    <p className="font-semibold text-slate-800">✅ UPI transaction successful</p>
                    <p className="text-slate-500">₹150 settled to CSC Noida Sector-62 for PAN card update.</p>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded text-[11px] space-y-0.5 leading-tight">
                    <p className="font-semibold text-slate-800">⏳ Identity Proof Required</p>
                    <p className="text-slate-500">Demo Operator Arjun replaced address photo on demographic corrector.</p>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded text-[11px] space-y-0.5 leading-tight">
                    <p className="font-semibold text-slate-800">⚡ Locker Lock Sync</p>
                    <p className="text-slate-500">PAN_Ramesh verified and indexed into secure Firestore cabinet.</p>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-display font-bold text-slate-800 text-sm">Submitted Public Certifications & Status Timeline</h3>
            {applications.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-105 rounded-2xl space-y-3 font-sans">
                <FileText size={32} className="text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No active applications in demographic system</p>
                <p className="text-[10px] text-slate-400 max-w-[240px] mx-auto">
                  Submit a form from "Service Applications" with necessary supporting files to track progress.
                </p>
                <button
                  onClick={() => setInternalTab('apply')}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded transition shadow-sm hover:bg-indigo-700 cursor-pointer"
                >
                  Apply For Service
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 font-sans">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 bg-white border border-slate-100 hover:border-slate-200 rounded-2xl shadow-xs transition flex flex-col gap-4"
                  >
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-50 pb-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold font-mono tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {app.trackingNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            app.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            app.status === 'Pending' || app.status === 'Documents Required' ? 'bg-yellow-101 text-yellow-800 animate-pulse' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-display font-semibold text-slate-900 text-sm">{app.serviceName}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">Date Submitted: {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* View Invoice Receipt Modal Launcher */}
                        <button
                          onClick={() => onOpenInvoice(app)}
                          className="px-3 py-1.5 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 text-[10px] font-semibold rounded-lg transition cursor-pointer"
                        >
                          Invoice & Receipt
                        </button>

                        {/* Download Final Certificate if Completed */}
                        {app.status === 'Completed' && app.finalCertificateUrl ? (
                          <div className="flex gap-2">
                            <a
                              href={app.finalCertificateUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Bookmark size={11} />
                              <span>Download Certificate</span>
                            </a>
                            <button
                              onClick={() => setPreviewDoc({ name: `Approved - ${app.serviceName}`, url: app.finalCertificateUrl || '', category: 'Caste & Revenue Certs' })}
                              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-medium rounded-lg transition cursor-pointer"
                            >
                              Preview
                            </button>
                          </div>
                        ) : app.status === 'Documents Required' ? (
                          <button
                            onClick={() => setTargetCorrectionApp(app)}
                            className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1 animate-bounce cursor-pointer"
                          >
                            <Upload size={11} />
                            <span>Action Needed: Correction Files</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                            Operator processing details are underway...
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stepper tracking graphic representation */}
                    {renderTrackingStepsLine(app.status)}

                    {/* Attached list for citizen transparency */}
                    {app.documents && app.documents.length > 0 && (
                      <div className="pt-2 pb-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100/60">
                        <p className="text-[9px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1">📁 Attached Demography Proof Documents ({app.documents.length}):</p>
                        <div className="flex flex-wrap gap-1.5">
                          {app.documents.map((doc, dIdx) => (
                            <button
                              key={dIdx}
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="px-2 py-1 bg-white border border-slate-200 hover:border-indigo-400 rounded text-[9.5px] font-semibold text-indigo-600 hover:bg-indigo-50/10 flex items-center gap-1 transition shrink-0 cursor-pointer"
                            >
                              <span>{doc.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Operator comment segment if exists */}
                    {app.operatorNotes && (
                      <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs space-y-1">
                        <span className="block font-bold text-indigo-700 uppercase tracking-widest text-[8.5px]">Operator Dispatch Remark</span>
                        <p className="text-slate-600 font-mono">"{app.operatorNotes}"</p>
                      </div>
                    )}

                    {/* Rate & Feedback Critique Option */}
                    {app.status === 'Completed' && (
                      <div className="mt-2 pt-3 border-t border-slate-100 font-sans">
                        {app.rating ? (
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your Feedback Score:</span>
                            <div className="flex items-center text-amber-500 font-bold gap-0.5 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded text-[11px]">
                              <span>{"★".repeat(app.rating)}</span>
                              <span className="text-slate-500 text-[10px] ml-1">({app.rating}/5)</span>
                            </div>
                            {app.feedback && (
                              <span className="text-[11px] text-slate-600 italic bg-slate-50 border border-slate-100/60 px-2.5 py-1 rounded-lg">
                                "{app.feedback}"
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-xl">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-slate-705 text-slate-700">Service Experience Score:</span>
                                <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => {
                                        setLocalRatingForm(prev => ({
                                          ...prev,
                                          [app.id]: { rating: star, text: prev[app.id]?.text || '' }
                                        }));
                                      }}
                                      className={`text-sm cursor-pointer hover:scale-110 active:scale-95 transition-all ${
                                        (localRatingForm[app.id]?.rating || 0) >= star ? 'text-amber-500' : 'text-slate-200'
                                      }`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const rForm = localRatingForm[app.id];
                                  if (!rForm || !rForm.rating) {
                                    alert("Please select a star rating first!");
                                    return;
                                  }
                                  onRateApplication(app.id, rForm.rating, rForm.text);
                                  showNotificationBanner('Thank you for rating our CSC Operator desk!');
                                }}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10px] rounded-lg cursor-pointer transition shadow-xs"
                              >
                                Submit Review
                              </button>
                            </div>
                            <div>
                              <input
                                type="text"
                                placeholder="Any feedback on the response velocity of our Noida operators?"
                                value={localRatingForm[app.id]?.text || ''}
                                onChange={(e) => {
                                  setLocalRatingForm(prev => ({
                                    ...prev,
                                    [app.id]: { rating: prev[app.id]?.rating || 0, text: e.target.value }
                                  }));
                                }}
                                className="w-full text-xs p-1.5 px-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Payment history and invoicing audit block */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-4 font-sans">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <div>
                  <h3 className="font-display font-semibold text-slate-800 text-sm">Payment History & Settle Receipts</h3>
                  <p className="text-[11px] text-slate-400">Direct trace of all UPI and Razorpay transactions with downloadable metadata</p>
                </div>
              </div>
              
              <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2 px-3">Transaction ID</th>
                      <th className="py-2 px-3">Service Name</th>
                      <th className="py-2 px-3">Gateway</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Invoice Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 border-slate-100">
                        <td className="py-3 px-3 font-mono font-bold text-indigo-650 text-indigo-600">{app.transactionId || 'TXN_482910'}</td>
                        <td className="py-3 px-3 font-medium text-slate-800">{app.serviceName}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{app.paymentStatus === 'Paid' ? (app.transactionId?.startsWith('TXN') ? 'Razorpay API' : 'UPI Digital') : 'None'}</td>
                        <td className="py-3 px-3 font-bold text-slate-900 font-mono">₹{app.feesPaid}</td>
                        <td className="py-3 px-3 text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> {app.paymentStatus || 'Paid'}
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-right">{new Date(app.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-400 italic">No checkout history logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Overlap Missing File upload correction form */}
            {targetCorrectionApp && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/30" onClick={() => setTargetCorrectionApp(null)} />
                <div className="relative w-full max-w-md bg-white rounded-2xl p-6 border border-slate-100 shadow-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-semibold text-slate-800 text-sm">Correct Application Files</h3>
                      <p className="text-xs text-slate-400">Application: {targetCorrectionApp.serviceName}</p>
                    </div>
                    <button onClick={() => setTargetCorrectionApp(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="p-3 bg-red-50 text-red-800 text-[11px] rounded border border-red-100">
                    <span className="font-bold">Operator correction notes:</span> {targetCorrectionApp.operatorNotes || 'Ensure a high-resolution photocopy of your proof of address is attached.'}
                  </div>
                  <div className="border-2 border-dashed border-indigo-250 border-slate-200 rounded-xl p-6 text-center text-xs space-y-2 font-sans">
                    <Upload size={24} className="text-slate-400 mx-auto" />
                    <input type="file" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        showNotificationBanner(`Replacement file "${e.target.files[0].name}" uploaded to Delhi operator desks.`);
                        setTargetCorrectionApp(null);
                      }
                    }} className="hidden" id="correction-file-picker" />
                    <label htmlFor="correction-file-picker" className="bg-slate-100 px-3.5 py-1.5 rounded cursor-pointer font-bold inline-block hover:bg-slate-200 transition text-[11px]">
                      Attach Replacement Proof JPEG/PDF
                    </label>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: SERVICE APPLICATIONS - APPLY & CHEKOUT WIZARD */}
        {internalTab === 'apply' && (
          <motion.div
            key="apply"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Form Selection Section */}
            <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl space-y-6 shadow-xs font-sans">
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-gray-800 text-sm">Citizen Service Applicator</h3>
                <p className="text-xs text-gray-400">Initialize official administrative filings securely with centralized upload tracking</p>
              </div>

              {paymentStep === 1 ? (
                <form onSubmit={handleInitiateApply} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Select Service Category</label>
                    <select
                      value={targetApplyService}
                      onChange={(e) => handleApplyClick(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans bg-white text-slate-800"
                    >
                      {INITIAL_SERVICES.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} - ₹{s.fee} ({s.processingTime})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Summary card & Requirements */}
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2.5 text-xs text-indigo-900">
                    <p className="font-bold text-indigo-700 uppercase tracking-widest text-[9px]">prerequisite materials checklist</p>
                    <p className="font-semibold text-sm text-slate-900">{selectedServiceObj.name}</p>
                    <p className="text-xs text-slate-600 italic leading-relaxed">{selectedServiceObj.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedServiceObj.requiredDocuments.map((doc, i) => (
                        <span key={i} className="bg-indigo-100/90 text-indigo-900 border border-indigo-200/50 px-2.5 py-0.5 rounded text-[10px] font-bold">
                          ✓ {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Refactored Supporting Documents Hub to prevent layout breakage */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3 font-sans">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          📂 Attached Supporting Evidence ({uploadedFilesList.length})
                        </h4>
                        <p className="text-[10px] text-slate-500">Submit verified credentials for officer processing</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                      >
                        <Upload size={13} />
                        <span>Manage / Upload Files</span>
                      </button>
                    </div>

                    {uploadedFilesList.length === 0 ? (
                      <div className="text-center py-6 bg-white/50 border border-dashed border-slate-200 rounded-lg text-[11px] text-slate-400">
                        No supporting papers uploaded yet. Settle requires at least 1 document.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {uploadedFilesList.map((file, idx) => (
                          <div key={idx} className="p-2.5 border border-indigo-100 bg-white rounded-lg flex justify-between items-center text-xs shadow-2xs">
                            <span className="truncate font-mono font-semibold text-slate-805 text-slate-800 max-w-[140px]">{file.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                            <button
                              type="button"
                              onClick={() => setUploadedFilesList(prev => prev.filter((_, i) => i !== idx))}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition cursor-pointer ml-1"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow transition-all cursor-pointer"
                  >
                    Proceed To Pay & File Verification (₹{selectedServiceObj.fee})
                  </button>
                </form>
              ) : (
                /* CHECKOUT GATEWAY SCREEN */
                <div className="space-y-6 font-sans">
                  <div className="p-3 bg-amber-50 text-amber-900 border border-amber-100 rounded-lg text-xs leading-normal">
                    <span className="font-bold">🔒 Encrypted Banking Terminal:</span> Your UPI credentials are authenticated with multi-factor biometric checks.
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedPayment('upi')}
                      className={`p-4 border rounded-xl text-left transition cursor-pointer ${
                        selectedPayment === 'upi' ? 'border-indigo-600 bg-indigo-50/50 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="block font-bold text-slate-800 text-xs">Unified Payments (UPI)</span>
                      <span className="block text-[10px] text-slate-400 mt-1">Settle via Paytm, PhonePe, or GPay VPA address</span>
                    </button>
                    <button
                      onClick={() => setSelectedPayment('razorpay')}
                      className={`p-4 border rounded-xl text-left transition cursor-pointer ${
                        selectedPayment === 'razorpay' ? 'border-indigo-600 bg-indigo-50/50 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="block font-bold text-slate-800 text-xs">Razorpay Core Checkout</span>
                      <span className="block text-[10px] text-slate-400 mt-1">Accept debit or credit cards, Netbanking grids</span>
                    </button>
                  </div>

                  {selectedPayment === 'upi' ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Verified UPI VPA ID</label>
                        <input
                          type="text"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                          className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                      <div className="p-3 bg-white rounded-lg flex items-center justify-between border border-slate-150">
                        <div className="flex items-center gap-2">
                          <Wallet size={18} className="text-indigo-500" />
                          <span className="text-xs font-semibold text-slate-800">Gross Settle Amount</span>
                        </div>
                        <span className="text-sm font-bold font-mono text-indigo-750">₹{selectedServiceObj.fee}.00</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <p className="text-xs font-semibold text-slate-800">Simulating Razorpay UI checkout Integration</p>
                      <div className="p-3 bg-white rounded border border-slate-150 flex items-center justify-between text-xs font-mono font-bold">
                        <span>Card validation Status:</span>
                        <span className="text-emerald-600 font-bold">READY (XXXX XXXX XXXX 4492)</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        * Clicking verification completes simulation with live mock DB synchronization instantly.
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentStep(1)}
                      className="px-4 py-2 border border-slate-200 text-slate-605 text-slate-600 hover:bg-slate-100 text-xs rounded-lg transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleFinalCheckout}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow transition"
                    >
                      Settle & Verify UPI Payment ₹{selectedServiceObj.fee}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Summary Section */}
            <div className="space-y-6 font-sans">
              <div className="bg-white border border-gray-100 p-5 rounded-2xl space-y-3">
                <h4 className="font-display font-semibold text-gray-850 text-xs">Branch Coordinator Status</h4>
                <div className="text-xs space-y-2">
                  <p className="font-semibold text-gray-800">Delhi-NCR Headquarters</p>
                  <p className="text-slate-400 font-mono text-[9.5px]">Reference No: UP-NOD-CSC-62</p>
                  <p className="text-gray-500 leading-relaxed font-sans">
                    Noida Sector 62 Main Office coordinates directly with public registries. Processing fees are protected by national digital security mandates.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

            {/* TAB 3: DOCUMENT LOCKER & VAULT - WITH REPLACEMENT IMPLEMENTATION */}
            {internalTab === 'vault' && (
              <motion.div
                key="vault"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-semibold text-gray-800 text-sm">Permanent Document Locker (Vault)</h3>
                     <p className="text-xs text-gray-400 font-sans">Secure citizen documents drawer backed up inside Firestore with replacement capabilities</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Refactored Locker Upload Bento Trigger Card */}
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-750 text-white p-6 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between h-fit font-sans">
                    <div className="space-y-1.5">
                      <div className="p-2 bg-white/15 rounded-lg w-fit text-white">
                        <FolderLock size={20} />
                      </div>
                      <h4 className="font-display font-semibold text-white text-sm">Secure Locker Upload</h4>
                      <p className="text-[11px] text-indigo-100 leading-relaxed">
                        Settle identity documents directly into secure Firestore locker. Use pre-synchronized files during checkout.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLockerUploadOpen(true)}
                      className="w-full py-2 bg-white hover:bg-slate-50 text-indigo-750 hover:text-indigo-800 font-bold text-xs rounded-xl transition cursor-pointer shadow-md text-center"
                    >
                      ➕ Secure New Document
                    </button>
                  </div>

                  {/* Items display */}
              <div className="lg:col-span-2 space-y-4 font-sans">
                {vault.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl space-y-2 font-sans shadow-sm">
                    <FolderLock size={28} className="text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-705">Digital drawer is empty</p>
                    <p className="text-[10px] text-slate-400">Save and index certificates to automatically import them during checkout.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                    {vault.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white border border-slate-100 p-4 rounded-xl flex flex-col justify-between hover:border-indigo-500 transition shadow-xs"
                      >
                        <div className="space-y-1.5 overflow-hidden">
                          <span className="inline-block text-[8px] font-bold uppercase tracking-wide bg-slate-50 text-slate-500 border border-slate-100 px-1.5 py-0.5 rounded">
                            {doc.category}
                          </span>
                          <p className="font-semibold text-xs text-slate-900 truncate">{doc.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{(doc.bytes / 1024).toFixed(1)} KB • Indexed: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-2 gap-1.5">
                          <div className="flex gap-1.5">
                            <a
                              href={doc.url}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 px-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded transition shrink-0 flex items-center gap-1 font-semibold"
                              title="Download File from Cloud"
                            >
                              <Download size={12} />
                              <span className="text-[10px]">Get</span>
                            </a>
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="p-1 px-1.5 text-xs text-slate-500 hover:bg-slate-50 hover:text-indigo-650 hover:text-indigo-600 rounded transition shrink-0 flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <Eye size={12} />
                              <span className="text-[10px]">View</span>
                            </button>
                          </div>

                          <div className="flex gap-1.5 items-center">
                            {/* Replace document trigger modal */}
                            <button
                              onClick={() => setReplaceTargetId(doc.id)}
                              className="px-2 py-0.5 border border-amber-200 hover:bg-amber-50 text-amber-800 text-[10px] font-bold rounded"
                              title="Overwrite with updated photocopy"
                            >
                              Replace
                            </button>
                            <button
                              onClick={() => onDeleteVaultDoc(doc.id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition shrink-0 cursor-pointer"
                              title="Delete file"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hidden File replacement input modal trigger */}
            {replaceTargetId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30">
                <div className="relative bg-white border border-slate-100 rounded-xl p-5 shadow-2 w-full max-w-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold font-display text-slate-805">Replace Vault Credential Proof</h4>
                    <button onClick={() => setReplaceTargetId(null)} className="p-0.5 hover:bg-slate-50 text-slate-400">
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Select a high-resolution photocopy file to overwrite the selected credential copy inside cloud database storage.
                  </p>
                  <div className="p-4 border-2 border-dashed border-indigo-200 bg-indigo-50/20 text-center rounded-lg">
                    <input type="file" onChange={handleReplaceFileSubmit} className="hidden" id="replace-file-attacher" />
                    <label htmlFor="replace-file-attacher" className="px-3.5 py-1.5 bg-white text-indigo-600 rounded border border-indigo-250 cursor-pointer text-xs font-bold inline-block hover:bg-slate-50 transition shadow-xs">
                      Attach Replacement Proof
                    </label>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 4: PROFILE MANAGEMENT - COMPREHENSIVE FORMS */}
        {internalTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-display font-semibold text-gray-800 text-sm">Citizen Profile Management</h3>
              <p className="text-xs text-gray-400 font-sans">View verified Aadhaar information, edit contact info, and change secure passwords</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: KYC status summary card details */}
              <div className="space-y-6 h-fit font-sans">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-4 relative overflow-hidden shadow-xs">
                  <div className="absolute top-0 right-0 p-3 bg-emerald-50 text-emerald-600 rounded-bl-xl font-bold font-mono text-[9px]">
                    TIER-3 ACTIVE
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-slate-100 text-slate-800 font-bold rounded-full flex items-center justify-center text-sm font-sans">
                      RK
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{profileName}</h4>
                      <p className="text-[10px] text-slate-500">{profileEmail}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-50 pt-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">KYC Status:</span>
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Verified Standard</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Assigned Branch:</span>
                      <span className="text-slate-800 font-semibold">Noida Sector-62 Desk</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">UIDAI Demographics:</span>
                      <span className="text-slate-800 font-mono">Linked successfully</span>
                    </div>
                  </div>
                </div>

                {/* Aadhaar Info validation panel */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-3 shadow-xs">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Aadhaar Vault Authentication</span>
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block text-[11px] font-bold text-slate-800 font-mono">XXXX XXXX {aadhaarMasked.slice(-4)}</span>
                      <span className="text-[9px] text-slate-400">Encrypted biometric consent active</span>
                    </div>
                    <Shield className="text-indigo-600" size={18} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-sans pt-1">
                    <span className="text-slate-500">Enable Biometric Prompt:</span>
                    <input 
                      type="checkbox" 
                      checked={hasBiometricConsent} 
                      onChange={(e) => setHasBiometricConsent(e.target.checked)}
                      className="rounded border-slate-200 text-indigo-650 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Middle and Right: Forms Panel container */}
              <div className="lg:col-span-2 space-y-6 font-sans">
                
                {/* Personal & Address form */}
                <form onSubmit={handleProfileSubmit} className="bg-white border border-slate-100 p-6 rounded-2xl space-y-5 shadow-xs">
                  <h4 className="font-display font-semibold text-slate-850 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
                    <User size={13} className="text-indigo-600" /> A. Demographics & Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Citizen Full Name</label>
                      <input 
                        type="text" 
                        value={profileName} 
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1 font-sans">Relative / Father Name</label>
                      <input 
                        type="text" 
                        value={profileFather} 
                        onChange={(e) => setProfileFather(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Authenticated Phone</label>
                      <input 
                        type="tel" 
                        value={profilePhone} 
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Email Coordinates</label>
                      <input 
                        type="email" 
                        value={profileEmail} 
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400" 
                      />
                    </div>
                  </div>

                  <h4 className="font-display font-semibold text-slate-850 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pt-2 pb-2">
                    <MapPin size={13} className="text-indigo-600" /> B. Physical Address & Land Registry
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Street address line-1</label>
                      <input 
                        type="text" 
                        value={profileStreet} 
                        onChange={(e) => setProfileStreet(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Landmark/Locality</label>
                      <input 
                        type="text" 
                        value={profileLandmark} 
                        onChange={(e) => setProfileLandmark(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">City District</label>
                      <input 
                        type="text" 
                        value={profileCity} 
                        onChange={(e) => setProfileCity(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">State territory</label>
                      <input 
                        type="text" 
                        value={profileState} 
                        onChange={(e) => setProfileState(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Zipcode / PIN</label>
                      <input 
                        type="text" 
                        value={profileZip} 
                        onChange={(e) => setProfileZip(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none" 
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition"
                  >
                    Save Address & Demographics
                  </button>
                </form>

                {/* Change Password Panel Form */}
                <form onSubmit={handlePasswordChange} className="bg-white border border-slate-100 p-6 rounded-2xl space-y-4 shadow-xs">
                  <h4 className="font-display font-semibold text-slate-850 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
                    <Key size={13} className="text-indigo-600" /> C. Secure Password Changer
                  </h4>
                  {passSuccessMsg && (
                    <div className="p-2.5 bg-emerald-50 text-emerald-805 text-xs rounded font-bold border border-emerald-100">
                      {passSuccessMsg}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Current Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1 font-sans">Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400" 
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded-lg transition"
                  >
                    Authenticate and Update Password
                  </button>
                </form>

              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: SUPPORT TICKETS & GRIEVANCES - WITH LIVE CHAT SUPPORT PANEL */}
        {internalTab === 'tickets' && (
          <motion.div
            key="tickets"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans"
          >
            
            {/* Ticket Launcher form */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl h-fit space-y-4 shadow-sm">
              <h4 className="font-display font-semibold text-slate-800 text-xs uppercase tracking-wider">Raise Grievance Ticket</h4>
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Dispute Topic Subject</label>
                  <input
                    type="text"
                    placeholder="e.g., Payment debited but application status shows draft"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Reference Category</label>
                  <select
                    value={ticketCat}
                    onChange={(e) => setTicketCat(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none bg-white"
                  >
                    <option value="Payment Surcharge">Payment Surcharge</option>
                    <option value="Verification Error">Verification Error</option>
                    <option value="Operator Delay">Operator Delay</option>
                    <option value="Grievances / Feed">Grievances / Feedback</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Elaborate Grievance</label>
                  <textarea
                    placeholder="Describe transaction details, tracking numbers and discrepancies..."
                    rows={4}
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-605 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded transition border border-indigo-500/10 cursor-pointer"
                >
                  File Complaint Coordinates
                </button>
              </form>
            </div>

            {/* Middle and Right: Tickets listing, plus LIVE CHAT WITH COORDINATOR PANEL */}
            <div className="lg:col-span-2 space-y-6">

              {/* Direct Live Chat Support Module */}
              <div className="bg-white border border-slate-100 rounded-2xl flex flex-col h-[380px] shadow-sm overflow-hidden font-sans">
                <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold font-display">Live Delhi-62 Operator Support</h4>
                      <p className="text-[10px] text-slate-400">Assigned coordinator: Arjun Devgan</p>
                    </div>
                  </div>
                  <Headphones size={16} className="text-slate-330 text-indigo-400" />
                </div>

                {/* Message display zone */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 max-h-[250px]">
                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`max-w-[80%] p-2.5 rounded-xl text-xs leading-normal ${
                        msg.isOperator 
                          ? 'bg-amber-100/70 text-slate-800 border border-amber-200 mr-auto' 
                          : 'bg-indigo-600 text-white ml-auto'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[8.5px] font-bold uppercase opacity-80 mb-0.5">
                        <span>{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="font-medium font-mono">{msg.text}</p>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="bg-slate-200/50 p-2 text-slate-500 font-bold block rounded-md text-[10px] w-fit italic animate-pulse">
                      Arjun Operator is typing demography corrections reply...
                    </div>
                  )}
                </div>

                {/* Message send form */}
                <form onSubmit={handleChatMessageSubmit} className="p-3 border-t border-slate-100 bg-white flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask operator about delayed verification files or fees refunds..."
                    value={newChatInput}
                    onChange={(e) => setNewChatInput(e.target.value)}
                    className="flex-1 text-xs p-2 px-3 border border-slate-200 bg-white rounded-lg focus:outline-none"
                  />
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg cursor-pointer transition shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>

              {/* Classic grievances support ticket lists */}
              <div className="space-y-4">
                <h4 className="font-display font-semibold text-slate-805 text-xs uppercase tracking-wider">Lodged Grievance Cabinet</h4>
                {tickets.length === 0 ? (
                  <div className="text-center py-10 bg-white border border-slate-100 rounded-2xl space-y-2 font-sans">
                    <HelpCircle size={24} className="text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-705">Ticket list is empty</p>
                    <p className="text-[10px] text-slate-400">All direct inquiries resolved cleanly by operator Arjun.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {tickets.map((t) => (
                      <div
                        key={t.id}
                        className={`p-4 rounded-xl border transition ${
                          activeTicketId === t.id ? 'border-indigo-600 bg-indigo-50/10 shadow-xs' : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-start cursor-pointer font-sans" onClick={() => setActiveTicketId(activeTicketId === t.id ? null : t.id)}>
                          <div className="space-y-1">
                            <span className={`inline-block text-[8px] font-bold uppercase px-2 py-0.5 rounded ${
                              t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {t.status}
                            </span>
                            <h4 className="font-display font-semibold text-slate-900 text-xs">{t.subject}</h4>
                            <p className="text-[10px] text-slate-400">Reference No: TKT-{t.id.slice(-4).toUpperCase()} • Logged: {new Date(t.createdAt).toLocaleDateString()}</p>
                          </div>
                          <ChevronRight size={14} className={`text-slate-400 transition-all ${activeTicketId === t.id ? 'rotate-90' : ''}`} />
                        </div>

                        {activeTicketId === t.id && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 font-sans">
                            <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded font-mono leading-normal">
                              <span className="font-bold text-slate-900 block mb-1 uppercase text-[9px] tracking-wider">Citizen Detail description:</span> {t.description}
                            </p>

                            {/* Replies chain */}
                            {t.replies.length > 0 && (
                              <div className="space-y-3">
                                <span className="block text-[9.5px] uppercase font-bold tracking-wider text-slate-400">Discussion Logs</span>
                                {t.replies.map(reply => (
                                  <div
                                    key={reply.id}
                                    className={`p-2.5 rounded text-xs leading-normal max-w-[85%] font-sans ${
                                      reply.senderRole === 'customer'
                                        ? 'bg-indigo-50 border border-indigo-100 ml-auto'
                                        : 'bg-emerald-50 border border-emerald-100'
                                    }`}
                                  >
                                    <span className="font-bold block text-[9px] text-slate-600">
                                      {reply.senderName} ({reply.senderRole.toUpperCase()})
                                    </span>
                                    <p className="text-slate-800 font-mono mt-0.5">"{reply.message}"</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {t.status !== 'Resolved' && (
                              <form onSubmit={handleReplySubmit} className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Type coordinate replies or update notes here..."
                                  value={ticketReplyMsg}
                                  onChange={(e) => setTicketReplyMsg(e.target.value)}
                                  className="flex-1 text-xs p-2 border border-slate-200 bg-white rounded-lg focus:outline-none"
                                  required
                                />
                                <button
                                  type="submit"
                                  className="px-3.5 py-1.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  Submit Reply
                                </button>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <DocumentPreviewModal
        isOpen={previewDoc !== null}
        onClose={() => setPreviewDoc(null)}
        doc={previewDoc}
      />

      {/* 2. Refactored Locker Upload Modal Overlay */}
      {isLockerUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsLockerUploadOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 border border-slate-100 shadow-2xl space-y-4 font-sans animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">Lock File into Private Vault</h3>
                <p className="text-xs text-slate-400">Save a digital copy securely inside secure locker</p>
              </div>
              <button onClick={() => setIsLockerUploadOpen(false)} className="p-1 hover:bg-slate-100 rounded text-slate-400 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={(e) => {
              handleVaultFileSubmit(e);
              setIsLockerUploadOpen(false);
            }} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Document Private Title</label>
                <input
                  type="text"
                  placeholder="e.g., PAN Card Copy - Ramesh"
                  value={vaultDocName}
                  onChange={(e) => setVaultDocName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-505"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Standard Category</label>
                <select
                  value={vaultDocCat}
                  onChange={(e) => setVaultDocCat(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none bg-white font-sans"
                >
                  <option value="Identity Proof">Identity Proof</option>
                  <option value="Address Verification">Address Verification</option>
                  <option value="School Certificate">School Certificate</option>
                  <option value="Caste & Revenue Certs">Caste & Revenue Certs</option>
                </select>
              </div>

              <div className="p-5 border-2 border-dashed border-indigo-100 rounded-xl text-center text-xs text-slate-500 bg-slate-50">
                <input type="file" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setVaultDocName(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                  }
                }} className="hidden" id="raw-vault-modal-picker" />
                <Upload size={24} className="text-indigo-505 text-indigo-500 mx-auto mb-2" />
                <label htmlFor="raw-vault-modal-picker" className="font-bold text-indigo-600 hover:text-indigo-805 cursor-pointer hover:underline text-[11px] block">
                  Select credential proof file
                </label>
                <span className="text-[10px] text-slate-400 mt-1 block">Supports PDF, JPEG or PNG up to 10MB</span>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLockerUploadOpen(false)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  Secure document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Refactored Citizen Application - File Selection & Upload Modal Overlay */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsUploadModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-100 shadow-2xl space-y-4 font-sans animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-bold text-slate-850 text-sm">Verify and Upload Credential Materials</h3>
                <p className="text-xs text-slate-400">Application: {selectedServiceObj.name}</p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-1 hover:bg-slate-100 rounded text-slate-400 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Checklist of required items */}
            <div className="p-3 bg-indigo-50/60 border border-indigo-100/40 rounded-xl space-y-1.5 text-xs text-slate-700">
              <span className="block font-bold text-[9px] uppercase text-indigo-700 tracking-wider">Required Checklist Proofs</span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 font-medium pl-1 text-[11px]">
                {selectedServiceObj.requiredDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-slate-650">
                    <span className="text-emerald-500 text-xs">✓</span> {doc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Selection Options Tab: From Device or Synchronize From Vault */}
            <div className="space-y-3">
              <span className="block text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wide">Option A: Select From Device</span>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => {
                  handleDrop(e);
                  showNotificationBanner("Document added from drag & drop.");
                }}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition font-sans ${
                  dragActive ? 'border-indigo-650 bg-indigo-50/30' : 'border-slate-205 bg-slate-50 hover:bg-slate-100/50'
                }`}
              >
                <Upload size={28} className="text-slate-400 mx-auto mb-1" />
                <p className="text-[11px] text-slate-700 font-semibold">Drag files here or click to browse standard folders</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="document-modal-picker"
                />
                <label
                  htmlFor="document-modal-picker"
                  className="mt-2.5 inline-block px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg font-bold text-[10px] text-slate-650 cursor-pointer transition shadow-2xs"
                >
                  Browse Device Papers
                </label>
              </div>
            </div>

            {/* OPTION B: Sync from Vault Locker */}
            {vault.length > 0 && (
              <div className="space-y-2">
                <span className="block text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wide">Option B: Import Instantly From Secure Digital Locker</span>
                <div className="max-h-[140px] overflow-y-auto border border-slate-100 rounded-xl p-2.5 bg-slate-50/50 space-y-1.5 scrollbar-thin">
                  {vault.map((doc, idx) => {
                    const isAttached = uploadedFilesList.some(f => f.name === doc.name);
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-150 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🔑</span>
                          <div>
                            <span className="block font-semibold text-slate-800 leading-none">{doc.name}</span>
                            <span className="text-[9px] text-indigo-600 font-bold leading-normal">{doc.category}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (isAttached) {
                              setUploadedFilesList(prev => prev.filter(f => f.name !== doc.name));
                            } else {
                              setUploadedFilesList(prev => [...prev, { name: doc.name, size: doc.bytes }]);
                              showNotificationBanner(`Copied "${doc.name}" from digital vault instantly!`);
                            }
                          }}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition shrink-0 cursor-pointer ${
                            isAttached 
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                              : 'bg-indigo-50 text-indigo-750 hover:bg-indigo-100 text-indigo-600'
                          }`}
                        >
                          {isAttached ? 'De-attach' : 'Import File'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Draft List */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <span className="block text-[10px] uppercase font-bold text-slate-500 font-sans">Current Selection ({uploadedFilesList.length})</span>
              {uploadedFilesList.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">No files selected. Add at least 1 document material or import from Vault.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[100px] overflow-y-auto scrollbar-none">
                  {uploadedFilesList.map((file, idx) => (
                    <div key={idx} className="p-2 border border-slate-150 bg-indigo-50/10 rounded-lg flex justify-between items-center text-xs">
                      <span className="truncate font-mono font-medium text-slate-700 max-w-[130px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setUploadedFilesList(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 px-0.5 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md text-center"
              >
                Confirm Documents Checklist & Attach
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
