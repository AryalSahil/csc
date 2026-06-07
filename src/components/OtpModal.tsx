import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldCheck, Mail, LogIn, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { UserRole, UserProfile } from '../types';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
}

export default function OtpModal({ isOpen, onClose, onLoginSuccess }: OtpModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1: Input Phone, 2: Input OTP
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let interval: any;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleGenerateOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (phoneNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      // Simulate generated OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(code);
      setStep(2);
      setTimer(30);
      setIsGenerating(false);
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (otpCode !== simulatedOtp && otpCode !== '123456') { // 123456 as master back-door
      setErrorMsg('Incorrect OTP entered. Use the displayed code or try again.');
      return;
    }

    // Determine role based on number pattern or create a standard citizen
    let name = 'Govind Verma';
    let email = 'govind.verma@example.com';
    let role: UserRole = 'customer';
    let branch = 'Delhi Block A';

    if (phoneNumber.includes('8876543210')) {
      name = 'Arjun Devgan (Operator)';
      email = 'arjun.csc@gmail.com';
      role = 'operator';
      branch = 'Noida Sector 62 Branch';
    } else if (phoneNumber.includes('7876543210')) {
      name = 'Sanjay Sen (Director)';
      email = 'sanjay.director@csc.gov.in';
      role = 'superadmin';
      branch = 'CSC National Headquarters';
    }

    const mockProfile: UserProfile = {
      uid: 'demo_user_' + role + '_' + Date.now(),
      name,
      email,
      phone: phoneNumber,
      role,
      branch,
      createdAt: new Date().toISOString()
    };

    onLoginSuccess(mockProfile);
    onClose();
  };

  // Quick One-Click Authentication Setup
  const handleQuickLogin = (role: UserRole) => {
    let name = '';
    let email = '';
    let phone = '';
    let branch = '';

    if (role === 'customer') {
      name = 'Ramesh Kumar (Citizen)';
      email = 'ramesh.kumar@gmail.com';
      phone = '9876543210';
      branch = 'Noida Sector 62 Branch';
    } else if (role === 'operator') {
      name = 'Arjun Devgan (Operator)';
      email = 'arjun.csc@gmail.com';
      phone = '88765 43210';
      branch = 'Noida Sector 62 Branch';
    } else if (role === 'superadmin') {
      name = 'Sanjay Sen (Director)';
      email = 'sanjay.director@csc.gov.in';
      phone = '78765 43210';
      branch = 'CSC National Headquarters';
    }

    onLoginSuccess({
      uid: 'uid_' + role + '_demo',
      name,
      email,
      phone,
      role,
      branch,
      createdAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      {/* Main card Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden font-sans" id="auth-modal">
        <div className="bg-indigo-600 text-white px-6 py-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
            <Smartphone size={24} />
          </div>
          <h2 className="font-display font-bold text-xl">CSC Digital Sign In</h2>
          <p className="text-xs text-indigo-100 mt-1">Multi-role OTP authentication for citizens & operators</p>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleGenerateOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Enter Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-slate-400 font-medium font-mono">+91</span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-medium tracking-wider"
                    required
                    id="phone-input"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                  We will send a 6-digit verification code to this mobile. Cellular rates may apply.
                </p>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium text-sm rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                id="get-otp-btn"
              >
                {isGenerating ? 'Sending Code...' : 'Get OTP Code'}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Fake SMS delivery popup inside the system for awesome sandbox testing */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs mb-3 text-yellow-850">
                <span className="font-semibold">📞 Simulated SMS delivery:</span> your confirmation code is{' '}
                <span className="font-mono font-bold text-sm text-indigo-700">{simulatedOtp}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Enter 6-Digit Code</label>
                <input
                  type="text"
                  placeholder="0 0 0 0 0 0"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] py-2.5 text-lg border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  required
                  id="otp-input"
                />
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Didn't receive verification code?</span>
                {timer > 0 ? (
                  <span className="text-slate-400">Resend in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const code = Math.floor(100000 + Math.random() * 900000).toString();
                      setSimulatedOtp(code);
                      setTimer(30);
                    }}
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                id="verify-otp-btn"
              >
                <ShieldCheck size={16} />
                <span>Verify & Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-1 text-xs text-slate-500 hover:text-slate-800 transition"
              >
                Change mobile number
              </button>
            </form>
          )}

          {/* Quick Sandbox Bypass */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="block text-center text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-3">
              Fast Sandbox Bypass (No OTP required)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickLogin('customer')}
                className="px-2 py-2 border border-indigo-100 hover:bg-indigo-50 rounded-lg text-left transition text-xs cursor-pointer"
              >
                <UserCheck size={14} className="text-indigo-600 mb-1" />
                <span className="block font-semibold text-slate-700 font-sans">Citizen</span>
                <span className="text-[9px] text-slate-400 block font-mono font-bold">9876543210</span>
              </button>

              <button
                onClick={() => handleQuickLogin('operator')}
                className="px-2 py-2 border border-emerald-100 hover:bg-emerald-50 rounded-lg text-left transition text-xs cursor-pointer"
              >
                <UserCheck size={14} className="text-emerald-600 mb-1" />
                <span className="block font-semibold text-slate-700 font-sans">Operator</span>
                <span className="text-[9px] text-slate-400 block font-mono font-bold font-semibold">8876543210</span>
              </button>

              <button
                onClick={() => handleQuickLogin('superadmin')}
                className="px-2 py-2 border border-purple-100 hover:bg-purple-50 rounded-lg text-left transition text-xs cursor-pointer"
              >
                <UserCheck size={14} className="text-purple-600 mb-1" />
                <span className="block font-semibold text-slate-700 font-sans">Admin</span>
                <span className="text-[9px] text-slate-400 block font-mono font-bold font-semibold">7876543210</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
