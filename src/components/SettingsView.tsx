import React from 'react';
import { ExcelUpload } from './ExcelUpload';
import { Settings, Database, Shield, BellRing, Info } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const SettingsView: React.FC = () => {
  const { resetToTeamData } = useApp();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-premium-500/20 rounded-2xl">
          <Settings className="w-8 h-8 text-premium-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
          <p className="text-slate-400">Manage data ingestion and dashboard configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: General Settings Info */}
        <div className="md:col-span-1 space-y-6">
          <section className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-3 text-premium-400">
              <Database size={20} />
              <h3 className="font-bold">Data Management</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Manually sync your local Hertz 2026 Excel tracker to update all team charts and availability stats.
            </p>
            <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Shield size={14} className="text-emerald-500" />
                Local Processing Only
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Info size={14} className="text-blue-500" />
                v1.2.0 (Active)
              </div>
            </div>
          </section>

          <section className="glass-card p-6 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3 text-slate-400">
              <BellRing size={20} />
              <h3 className="font-bold">Notifications</h3>
            </div>
            <p className="text-xs text-slate-500 mt-2 lowercase">
              Conflict alerts are currently enabled by default for all managers.
            </p>
          </section>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="glass-card p-8 bg-premium-500/5 border-premium-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-premium-400" />
                Local Override: Your View
              </h2>
              <button 
                onClick={async () => {
                  await resetToTeamData();
                  window.location.reload();
                }}
                className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 border border-white/10"
              >
                Reset to Team Data
              </button>
            </div>
            
            <p className="text-sm text-slate-400 mb-6">
              Uploading a file here will update the dashboard for <strong>your computer only</strong>. 
              Useful for individual planning or "what-if" scenarios.
            </p>

            <ExcelUpload />
            
            <div className="mt-8 p-4 bg-[#C41E3A]/5 rounded-xl border border-[#C41E3A]/10">
              <p className="text-xs text-red-300 leading-relaxed">
                <strong>Team Sync Tip:</strong> To update the data for <strong>everyone</strong> in the team, 
                you must replace the master Excel file in the project folder and push to GitHub.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
