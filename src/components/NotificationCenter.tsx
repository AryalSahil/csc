import React from 'react';
import { X, Bell, MessageSquare, Smartphone, Mail, ShieldAlert, CheckCheck, Send } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export default function NotificationCenter({ notifications, isOpen, onClose, onClear }: NotificationCenterProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/35 backdrop-blur-xs" onClick={onClose} />

      {/* Main Slide Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-gray-100 flex flex-col z-10 animate-slide-in">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-55 font-sans">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bell size={18} />
            </div>
            <div>
              <span className="font-display font-semibold text-gray-800 text-sm">CSC Notification Hub</span>
              <span className="block text-[10px] text-slate-400">SMS / WhatsApp / Email Telemetry</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClear}
                className="text-[10px] text-red-650 text-red-600 hover:bg-red-50 font-bold px-2 py-1 rounded transition cursor-pointer"
              >
                Clear Logs
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Bell size={20} className="text-gray-300" />
              </div>
              <p className="text-xs font-semibold">No alert dispatches yet</p>
              <p className="text-[10px] text-gray-400 max-w-[200px] mx-auto">
                Trigger transactional alerts by submitting or updating service orders.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const typeIcons = {
                sms: <Smartphone size={14} className="text-indigo-600" />,
                whatsapp: <MessageSquare size={14} className="text-emerald-600" />,
                email: <Mail size={14} className="text-amber-600" />,
                'in-app': <Bell size={14} className="text-purple-600" />
              };

              const typeLabels = {
                sms: 'SMS Dispatch',
                whatsapp: 'WhatsApp Advisory',
                email: 'Official Email',
                'in-app': 'Dashboard Alert'
              };

              return (
                <div
                  key={notif.id}
                  className="p-3.5 border border-slate-100 bg-white hover:border-slate-200 rounded-xl shadow-xs transition space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        notif.type === 'sms' ? 'bg-indigo-50' :
                        notif.type === 'whatsapp' ? 'bg-emerald-50' :
                        notif.type === 'email' ? 'bg-amber-50' : 'bg-purple-50'
                      }`}>
                        {typeIcons[notif.type]}
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                        {typeLabels[notif.type]}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-400 font-mono">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-xs">
                    <p className="font-semibold text-gray-800 leading-tight mb-1">{notif.title}</p>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-mono whitespace-pre-line bg-slate-50 border border-slate-100 p-2 rounded-md">
                      {notif.message}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-gray-400 border-t border-gray-50 pt-1.5 mt-1">
                    <span className="font-semibold">Target Route ID: {notif.userId.slice(0, 12)}...</span>
                    <span className="bg-emerald-50 text-emerald-705 text-emerald-750 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-0.5 font-mono">
                      <CheckCheck size={10} /> {notif.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Telemetry Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-400 flex items-center gap-2">
          <ShieldAlert size={14} className="text-indigo-500 shrink-0" />
          <span>Real-time Twilio, WhatsApp business, and SendGrid mock pipelines are active.</span>
        </div>
      </div>
    </div>
  );
}
