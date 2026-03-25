import React from 'react';
import { Calendar, LayoutDashboard, Settings, LogOut, Bell, Check, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../store/AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, slaStatus } = useApp();
  
  const themeColors = {
    ON_TRACK: {
      primary: 'bg-emerald-600',
      active: 'bg-emerald-600',
      glow: 'shadow-emerald-600/20',
      hover: 'hover:text-emerald-600 hover:bg-emerald-50',
      sidebar: 'bg-emerald-50/10'
    },
    WARNING: {
      primary: 'bg-amber-500',
      active: 'bg-amber-500',
      glow: 'shadow-amber-500/20',
      hover: 'hover:text-amber-600 hover:bg-amber-50',
      sidebar: 'bg-amber-50/10'
    },
    RISK: {
      primary: 'bg-rose-500',
      active: 'bg-rose-500',
      glow: 'shadow-rose-500/20',
      hover: 'hover:text-rose-600 hover:bg-rose-50',
      sidebar: 'bg-rose-50/10'
    }
  }[slaStatus];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(user?.isAdmin ? [
      { id: 'calendar', label: 'My Calendar', icon: Calendar },
      { id: 'settings', label: 'Settings', icon: Settings },
    ] : []),
  ];

  return (
    <aside className={`w-64 glass-card m-4 p-6 flex flex-col h-[calc(100vh-2rem)] border-slate-200 transition-colors duration-500 ${themeColors.sidebar}`}>
      <div className="flex items-center gap-3 mb-12">
        <div className={`w-10 h-10 ${themeColors.primary} rounded-xl flex items-center justify-center shadow-lg ${themeColors.glow} transition-colors duration-500`}>
          <span className="text-xl font-bold text-white">H</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">Hertz 2026</h1>
          <p className="text-xs text-slate-300">Leave Tracker</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
              activeTab === item.id
                ? `${themeColors.active} text-white shadow-lg ${themeColors.glow}`
                : `text-slate-300 ${themeColors.hover}`
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-200 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export const Header: React.FC = () => {
  const [now, setNow] = React.useState(new Date());
  const [showNotifications, setShowNotifications] = React.useState(false);
  const { user, slaStatus, notifications, markAsRead, clearNotifications } = useApp();
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const themeColors = {
    ON_TRACK: { text: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50/50', gradient: 'from-emerald-500 to-emerald-700' },
    WARNING: { text: 'text-amber-500', border: 'border-amber-200', bg: 'bg-amber-50/50', gradient: 'from-amber-400 to-amber-600' },
    RISK: { text: 'text-rose-500', border: 'border-rose-200', bg: 'bg-rose-50/50', gradient: 'from-rose-500 to-rose-700' }
  }[slaStatus];

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/Denver'
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
    <header className="h-24 flex items-center justify-between px-8 bg-white/40 backdrop-blur-md border-b border-white/10 relative z-10 transition-colors duration-500">
      <div className="flex flex-col">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Intelligent Automation Team - Hertz
        </h2>
        <p className={`text-sm font-bold ${themeColors.text} flex items-center gap-2 transition-colors duration-500`}>
          <Calendar size={14} />
          {formatDate(now)}
        </p>
      </div>

      <div className="flex items-center gap-8">
        {/* Timezones */}
        <div className={`flex items-center gap-6 px-6 py-2 ${themeColors.bg} rounded-2xl border ${themeColors.border} transition-all duration-500 shadow-sm`}>
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
        <div className="flex items-center gap-6 relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 text-slate-400 hover:${themeColors.text} transition-all hover:bg-white/50 rounded-xl`}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 ${themeColors.text.replace('text', 'bg')} rounded-full border-2 border-white animate-pulse`}></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-14 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-black text-slate-900 text-sm">Updates & Sync</h3>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearNotifications}
                      className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button 
                    onClick={() => setShowNotifications(false)} 
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Close notifications"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors relative group ${!n.isRead ? 'bg-blue-50/20' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-0.5 ${
                          n.type === 'success' ? 'text-emerald-500' : 
                          n.type === 'warning' ? 'text-rose-500' : 'text-blue-500'
                        }`}>
                          {n.type === 'success' ? <CheckCircle size={16} /> : 
                           n.type === 'warning' ? <AlertTriangle size={16} /> : <Info size={16} />}
                        </div>
                        <div className="flex-1 pr-6">
                          <p className={`text-xs leading-relaxed ${n.isRead ? 'text-slate-500' : 'text-slate-900 font-bold'}`}>
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      {!n.isRead && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="absolute right-4 top-4 text-slate-300 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all"
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell size={20} className="text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium tracking-tight">Everything is up-to-date.</p>
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Sync Alerts</p>
                </div>
              )}
            </div>
          )}
        </div>
          
        <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
            <div className="text-right">
              <p className="text-sm font-black text-slate-900 leading-none mb-1">{user?.name || 'Ram'}</p>
              <p className={`text-[10px] font-bold ${themeColors.text} uppercase tracking-tighter opacity-80`}>{user?.role || 'Admin'}</p>
            </div>
            <div className="relative">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${themeColors.gradient} p-[2px] shadow-lg shadow-slate-200 transition-all duration-500`}>
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-white/50">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user?.name || 'Ram'}&background=${themeColors.gradient.split(' ')[0].split('-')[1] === 'emerald' ? '10b981' : themeColors.gradient.split(' ')[0].split('-')[1] === 'amber' ? 'f59e0b' : 'f43f5e'}&color=fff&bold=true`} 
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
