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
  const [now, setNow] = React.useState(new Date());
  const { user } = useApp();

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date, timeZone: string) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone
    });
  };

  return (
    <header className="h-24 flex items-center justify-between px-8 bg-white/40 backdrop-blur-md border-b border-white/10 relative z-10">
      <div className="flex flex-col">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Intelligent Automation Team - Hertz
        </h2>
        <p className="text-sm font-medium text-[#C41E3A] flex items-center gap-2">
          <Calendar size={14} />
          {formatDate(now)}
        </p>
      </div>

      <div className="flex items-center gap-8">
        {/* Timezones */}
        <div className="flex items-center gap-6 px-6 py-2 bg-slate-900/5 rounded-2xl border border-white/20">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mountain (MST/MDT)</p>
            <p className="text-lg font-mono font-bold text-slate-800">{formatTime(now, 'America/Denver')}</p>
          </div>
          <div className="w-[1px] h-8 bg-slate-300"></div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">IST (India)</p>
            <p className="text-lg font-mono font-bold text-slate-800">{formatTime(now, 'Asia/Kolkata')}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2.5 text-slate-400 hover:text-[#C41E3A] transition-all hover:bg-white/50 rounded-xl">
            <Bell size={22} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#C41E3A] rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
            <div className="text-right">
              <p className="text-sm font-black text-slate-900 leading-none mb-1">{user?.name || 'Ram'}</p>
              <p className="text-[10px] font-bold text-[#C41E3A] uppercase tracking-tighter opacity-80">{user?.role || 'Admin'}</p>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C41E3A] to-[#ff4d6d] p-[2px] shadow-lg shadow-red-600/20">
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-white/50">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user?.name || 'Ram'}&background=C41E3A&color=fff&bold=true`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
