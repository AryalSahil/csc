import React, { useState } from 'react';
import { Shield, User, Menu, X, Bell, LayoutDashboard, LogOut, FileText, Smartphone } from 'lucide-react';
import { UserRole, UserProfile } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  onSwitchRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notificationCount: number;
  onOpenNotifications: () => void;
}

export default function Navbar({
  currentUser,
  onLogout,
  onOpenLogin,
  onSwitchRole,
  activeTab,
  setActiveTab,
  notificationCount,
  onOpenNotifications
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      {/* Dynamic Demo Role Indicator Rail */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-1 text-xs text-amber-800 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <Smartphone size={13} />
          <span>CSC Sandbox Environment:</span>
          {currentUser ? (
            <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono">
              Active: {currentUser.role.toUpperCase()} ({currentUser.name})
            </span>
          ) : (
            <span className="text-amber-700 italic">Unauthenticated Visitor</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Quick Test Roles:</span>
          <button
            onClick={() => onSwitchRole('customer')}
            className={`px-2 py-0.5 rounded border text-[11px] font-medium transition cursor-pointer ${
              currentUser?.role === 'customer'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Citizen
          </button>
          <button
            onClick={() => onSwitchRole('operator')}
            className={`px-2 py-0.5 rounded border text-[11px] font-medium transition cursor-pointer ${
              currentUser?.role === 'operator'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Operator
          </button>
          <button
            onClick={() => onSwitchRole('superadmin')}
            className={`px-2 py-0.5 rounded border text-[11px] font-medium transition cursor-pointer ${
              currentUser?.role === 'superadmin'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Super Admin
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-display font-bold text-xl shadow-md border border-indigo-500/10">
              C
            </div>
            <div>
              <span className="font-display font-bold text-lg text-slate-950 block leading-tight">CSC Digital</span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Govt Service Platform</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'home' ? 'text-indigo-600 bg-indigo-50/70 font-semibold' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('services')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'services' ? 'text-indigo-600 bg-indigo-50/70 font-semibold' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => handleNavClick('pricing')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'pricing' ? 'text-indigo-600 bg-indigo-50/70 font-semibold' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'faq' ? 'text-indigo-600 bg-indigo-50/70 font-semibold' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              FAQs & Guides
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'about' ? 'text-indigo-600 bg-indigo-50/70 font-semibold' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'contact' ? 'text-indigo-600 bg-indigo-50/70 font-semibold' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Action Center */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <>
                {/* Notification Bell */}
                <button
                  onClick={onOpenNotifications}
                  className="p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-100 relative transition"
                  title="In-App Notifications"
                >
                  <Bell size={20} />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full animate-pulse">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {/* Dashboard Action */}
                <button
                  onClick={() =>
                    handleNavClick(
                      currentUser.role === 'customer'
                        ? 'portal'
                        : currentUser.role === 'operator'
                        ? 'operator-portal'
                        : 'super-portal'
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition"
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </button>

                {/* User Dropdown Profile Badge */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-100 font-sans">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-sm border border-indigo-200/50">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-semibold text-slate-800 leading-none">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono italic capitalize">{currentUser.role}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm border border-indigo-500/10 transition-all cursor-pointer"
              >
                <User size={16} />
                <span>Partner / Citizen Login</span>
              </button>
            )}
          </div>

          {/* Mobile responsive toggle */}
          <div className="md:hidden flex items-center gap-2">
            {currentUser && (
              <button
                onClick={onOpenNotifications}
                className="p-2 text-gray-500 rounded-full hover:bg-gray-100 relative transition"
              >
                <Bell size={18} />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-[9px] font-bold text-white flex items-center justify-center rounded-full">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-2 shadow-inner">
          <button
            onClick={() => handleNavClick('home')}
            className={`block w-full text-left px-3 py-2 rounded hover:bg-slate-50 text-sm font-medium ${
              activeTab === 'home' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
            }`}
          >
            Home / Main Portal
          </button>
          <button
            onClick={() => handleNavClick('services')}
            className={`block w-full text-left px-3 py-2 rounded hover:bg-slate-50 text-sm font-medium ${
              activeTab === 'services' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
            }`}
          >
            Services Catalog
          </button>
          <button
            onClick={() => handleNavClick('pricing')}
            className={`block w-full text-left px-3 py-2 rounded hover:bg-slate-50 text-sm font-medium ${
              activeTab === 'pricing' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
            }`}
          >
            Pricing Structures
          </button>
          <button
            onClick={() => handleNavClick('faq')}
            className={`block w-full text-left px-3 py-2 rounded hover:bg-slate-50 text-sm font-medium ${
              activeTab === 'faq' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
            }`}
          >
            FAQs
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`block w-full text-left px-3 py-2 rounded hover:bg-slate-50 text-sm font-medium ${
              activeTab === 'about' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
            }`}
          >
            About Us
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className={`block w-full text-left px-3 py-2 rounded hover:bg-slate-50 text-sm font-medium ${
              activeTab === 'contact' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
            }`}
          >
            Contact
          </button>

          {currentUser ? (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() =>
                  handleNavClick(
                    currentUser.role === 'customer'
                      ? 'portal'
                      : currentUser.role === 'operator'
                      ? 'operator-portal'
                      : 'super-portal'
                  )
                }
                className="w-full text-left px-3 py-2 bg-indigo-50 text-indigo-700 rounded text-sm font-semibold flex items-center gap-1.5"
              >
                <LayoutDashboard size={16} />
                <span>My Dashboard Portal</span>
              </button>
              <div className="flex items-center justify-between px-3 py-2.5 mt-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-xs font-semibold text-slate-800">{currentUser.name}</span>
                <button
                  onClick={onLogout}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLogin();
              }}
              className="w-full text-center py-2.5 bg-indigo-600 text-white rounded font-medium text-sm block"
            >
              Sign In / OTP Register
            </button>
          )}
        </div>
      )}
    </header>
  );
}
