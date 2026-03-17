import React from 'react';
import { Calendar, LayoutDashboard, Settings, LogOut, Bell } from 'lucide-react';
import { useApp } from '../store/AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useApp();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(user?.isAdmin ? [
      { id: 'calendar', label: 'My Calendar', icon: Calendar },
      { id: 'settings', label: 'Settings', icon: Settings },
    ] : []),
  ];

  return (
    <aside className="w-64 glass-card m-4 p-6 flex flex-col h-[calc(100vh-2rem)] border-slate-200">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-[#C41E3A] rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
          <span className="text-xl font-bold text-white">H</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Hertz 2026</h1>
          <p className="text-xs text-slate-500">Leave Tracker</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === item.id
                ? 'bg-[#C41E3A] text-white shadow-lg shadow-red-600/20'
                : 'text-slate-600 hover:text-[#C41E3A] hover:bg-[#C41E3A]/5'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export const Header: React.FC = () => {
  const { user } = useApp();
  
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm border-b border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900">
        Intelligent Automation Team - Hertz
      </h2>
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-[#C41E3A] transition-colors">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#C41E3A] rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">{user?.name || 'Ram'}</p>
            <p className="text-xs text-slate-500">{user?.role || 'Admin'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Ram'}&background=C41E3A&color=fff`} alt="Avatar" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
