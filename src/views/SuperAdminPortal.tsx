import React, { useState } from 'react';
import {
  Building2, Users, ClipboardList, Database, Plus, Trash2, ArrowDownToLine,
  ArrowUpToLine, FileSpreadsheet, ShieldAlert, CheckCircle2, CloudLightning, Landmark
} from 'lucide-react';
import { UserProfile, Branch, AuditLog } from '../types';

interface SuperAdminPortalProps {
  currentUser: UserProfile;
  branches: Branch[];
  onAddBranch: (name: string, location: string, code: string) => void;
  auditLogs: AuditLog[];
  onTriggerBackup: () => void;
  onTriggerRestore: (backupDataJson: string) => void;
}

export default function SuperAdminPortal({
  currentUser,
  branches,
  onAddBranch,
  auditLogs,
  onTriggerBackup,
  onTriggerRestore
}: SuperAdminPortalProps) {
  
  const [panelTab, setPanelTab] = useState<'branches' | 'audit' | 'database'>('branches');

  // Branch creation
  const [bName, setBName] = useState('');
  const [bLocation, setBLocation] = useState('');
  const [bCode, setBCode] = useState('');

  // Database tools
  const [restorePayload, setRestorePayload] = useState('');

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim() || !bLocation.trim() || !bCode.trim()) return;
    onAddBranch(bName, bLocation, bCode);
    setBName('');
    setBLocation('');
    setBCode('');
  };

  const handleRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restorePayload.trim()) return;
    onTriggerRestore(restorePayload);
    setRestorePayload('');
    alert('Mock state database successfully synced and reloaded from backup payload!');
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Header Super Admin */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl">National Director Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">Global settings • Administrative Node: {currentUser.name}</p>
        </div>
        <span className="px-3.5 py-1 bg-purple-600 border border-purple-400 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1">
          <Landmark size={12} /> Root Superuser Privilege
        </span>
      </div>

      {/* 2. Primary Metrics Super Admin */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-4 bg-white border border-gray-100 rounded-xl">
          <span className="block text-gray-400 text-[10px] uppercase font-bold">Active Branches</span>
          <span className="block text-xl font-bold font-mono text-gray-900 mt-1">{branches.length} Franchise Hubs</span>
        </div>
        <div className="p-4 bg-white border border-gray-100 rounded-xl">
          <span className="block text-gray-400 text-[10px] uppercase font-bold">Assigned Operators</span>
          <span className="block text-xl font-bold font-mono text-emerald-600 mt-1">4 Field Agents</span>
        </div>
        <div className="p-4 bg-white border border-gray-100 rounded-xl">
          <span className="block text-gray-400 text-[10px] uppercase font-bold">Security Audits</span>
          <span className="block text-xl font-bold font-mono text-purple-600 mt-1">{auditLogs.length} Registered</span>
        </div>
        <div className="p-4 bg-white border border-slate-100 rounded-xl bg-gradient-to-br from-indigo-550 from-indigo-600 to-indigo-700 text-white border-0 shadow-sm">
          <span className="block text-indigo-100 text-[10px] uppercase font-bold font-sans">Platform State</span>
          <span className="block text-xl font-bold font-mono mt-1">ACTIVE / OK</span>
          <span className="text-[10px] text-indigo-100 block mt-0.5">DB: Live Firestore</span>
        </div>
      </div>

      {/* 3. Panel Menu Tabs */}
      <div className="border-b border-slate-200 flex gap-4 font-sans">
        <button
          onClick={() => setPanelTab('branches')}
          className={`pb-3 text-xs font-semibold relative transition ${
            panelTab === 'branches' ? 'text-indigo-600 font-bold font-sans' : 'text-slate-400 font-sans'
          }`}
        >
          Branch Franchise Configuration ({branches.length})
          {panelTab === 'branches' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t" />
          )}
        </button>

        <button
          onClick={() => setPanelTab('audit')}
          className={`pb-3 text-xs font-semibold relative transition ${
            panelTab === 'audit' ? 'text-indigo-600 font-bold font-sans' : 'text-slate-400 font-sans'
          }`}
        >
          System-Wide Audit Trails ({auditLogs.length})
          {panelTab === 'audit' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t" />
          )}
        </button>

        <button
          onClick={() => setPanelTab('database')}
          className={`pb-3 text-xs font-semibold relative transition ${
            panelTab === 'database' ? 'text-indigo-600 font-bold font-sans' : 'text-slate-400 font-sans'
          }`}
        >
          Backup & Disaster Recovery
          {panelTab === 'database' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t" />
          )}
        </button>
      </div>

      {/* 4. Panels Content */}
      <div className="transition-all duration-300">
        
        {/* PANEL: BRANCH MANAGEMENT */}
        {panelTab === 'branches' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs font-sans">
            {/* Form */}
            <div className="bg-white border border-gray-100 p-5 rounded-2xl h-fit space-y-4">
              <h4 className="font-display font-semibold text-gray-800 text-xs">Register New CSC Franchise</h4>
              <form onSubmit={handleBranchSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Branch/Unit Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Noida Sector 15 Branch"
                    value={bName}
                    onChange={(e) => setBName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">HQ Center Code</label>
                  <input
                    type="text"
                    placeholder="e.g., CSC-UP-NOIDA-15"
                    value={bCode}
                    onChange={(e) => setBCode(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border rounded-lg focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Physical Location Address</label>
                  <input
                    type="text"
                    placeholder="Sector 15, Block C plot, Noida"
                    value={bLocation}
                    onChange={(e) => setBLocation(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded transition cursor-pointer shadow-sm"
                >
                  Create Authorized Node
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-display font-semibold text-gray-800 text-xs">Live Geographic CSC Branches</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {branches.map(branch => (
                  <div
                    key={branch.id}
                    className="bg-white border border-slate-100 p-4 rounded-xl flex items-start gap-3 hover:border-indigo-500 transition shadow-xs"
                  >
                    <Building2 className="text-indigo-500 shrink-0 mt-0.5" size={18} />
                    <div className="space-y-1 font-sans">
                      <h4 className="font-semibold text-slate-950 text-xs">{branch.name}</h4>
                      <p className="font-mono text-[9px] text-slate-400 font-bold">Node Code: {branch.code}</p>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{branch.location}</p>
                      <p className="text-[10px] text-gray-400 italic">Established: {new Date(branch.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL: SYSTEM AUDIT LOGS */}
        {panelTab === 'audit' && (
          <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-display font-semibold text-gray-800 text-sm">Chronological Action Logs</h3>
              <span className="text-[10px] text-gray-400 italic">Immutable Audit Trail Logs</span>
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-center py-12 text-gray-400">No actions recorded on secure audit telemetry yet.</p>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex justify-between items-start gap-4 hover:bg-slate-50 p-2 rounded transition">
                    <div className="space-y-1 max-w-[70%]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-gray-900">{log.actorName}</span>
                        <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1 rounded capitalize">
                          {log.actorRole}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="bg-slate-100 font-bold px-1.5 py-0.5 rounded text-[10px] text-slate-700">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-gray-550 text-[11px] font-sans leading-relaxed">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono text-right shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PANEL: DATABASE BACKUP & RESTORE */}
        {panelTab === 'database' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans">
            {/* Backup module */}
            <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4">
              <h4 className="font-display font-semibold text-gray-800 text-xs">Generate System Backup</h4>
              <p className="text-gray-400 leading-normal">
                Completely compile all active CSC applications, support tickets, and document lockers into a portable unified JSON payload schema for emergency disaster recovery.
              </p>
              <button
                onClick={onTriggerBackup}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <ArrowDownToLine size={15} />
                <span>Export Local State (JSON Payload)</span>
              </button>
              <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-805 text-indigo-800 rounded-lg text-[10px]">
                * Exports citizen profile fields and current application tracking records to browser clipboard.
              </div>
            </div>

            {/* Restore module */}
            <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4">
              <h4 className="font-display font-semibold text-gray-800 text-xs">Disaster Recovery (Restore Payload)</h4>
              <form onSubmit={handleRestoreSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Paste Backup JSON Package</label>
                  <textarea
                    placeholder='{"applications": [...], "branches": [...] }'
                    rows={4}
                    value={restorePayload}
                    onChange={(e) => setRestorePayload(e.target.value)}
                    className="w-full text-[10px] p-2.5 bg-gray-50 border rounded-lg focus:outline-none font-mono resize-none leading-normal"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ArrowUpToLine size={15} />
                  <span>Restore Database Sync</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
