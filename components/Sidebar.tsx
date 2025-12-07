import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, FileText, Search, Mic, UploadCloud, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  hasData: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, hasData }) => {
  const menuItems = [
    { id: ViewState.UPLOAD, label: 'Upload Data', icon: UploadCloud, disabled: false },
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, disabled: !hasData },
    { id: ViewState.ANALYSIS, label: 'AI Analysis', icon: Mic, disabled: !hasData },
    { id: ViewState.FINDINGS, label: 'Audit Findings', icon: Search, disabled: !hasData },
    { id: ViewState.REPORT, label: 'Report', icon: FileText, disabled: !hasData },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-50">
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">AuditGuard AR</h1>
          <p className="text-xs text-slate-400">AI Audit System</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && setView(item.id)}
            disabled={item.disabled}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${currentView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              ${item.disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'}
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase font-bold mb-2">Model Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-green-400">Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
