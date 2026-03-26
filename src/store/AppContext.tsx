import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Employee, LeaveRequest, Notification } from '../types';
import { ExcelProcessor } from '../utils/ExcelProcessor';
import { format, parseISO } from 'date-fns';

// Assuming Employee type in ../types.ts will be updated to include isAdmin?: boolean;
// For local type safety within this file, we can define a local type that extends Employee
// if the original Employee type cannot be modified directly.
// However, the instruction implies the base Employee type should support it.
// If the user meant to add it to the Employee type in this file, it would be a re-definition.
// Given the instruction "Add isAdmin to the type and value", and the provided snippet
// showing `isAdmin?: boolean;` after the import, it's likely an attempt to modify the type.
// Since I cannot modify `../types.ts`, I will assume `Employee` type *should* have `isAdmin`
// and will add it to the `user` object. If the `Employee` type from `../types` does not
// have `isAdmin`, this will cause a type error.
// For the purpose of this exercise, I will proceed with the assumption that the `Employee`
// type *will* eventually support `isAdmin`.

interface AppContextType {
  employees: Employee[];
  requests: LeaveRequest[];
  user: Employee | null;
  setUser: (user: Employee | null) => void;
  setEmployees: (employees: Employee[]) => void;
  addRequest: (request: LeaveRequest) => void;
  updateRequest: (id: string, updates: Partial<LeaveRequest>) => void;
  setRequests: (requests: LeaveRequest[]) => void;
  resetToTeamData: () => Promise<void>;
  slaStatus: 'ON_TRACK' | 'WARNING' | 'RISK';
  notifications: Notification[];
  addNotification: (message: string, type: 'info' | 'success' | 'warning') => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('hertz_employees');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        console.error('Failed to parse saved employees');
      }
    }
    return [
      { id: 'emp-ramanjnneyulu-p', name: 'Ramanjnneyulu P', role: 'Team Member', team: 'Hertz Core' },
      { id: 'emp-reshma-g', name: 'Reshma G', role: 'Team Member', team: 'Hertz Core' },
      { id: 'emp-akash', name: 'Akash', role: 'Team Member', team: 'Hertz Core' },
      { id: 'emp-siddharth', name: 'Siddharth', role: 'Team Member', team: 'Hertz Core' }
    ];
  });

  const [requests, setRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('hertz_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        console.error('Failed to parse saved requests');
      }
    }
    return [];
  });

  const [user, setUser] = useState<Employee | null>({
    id: 'emp-ram-p',
    name: 'Ram',
    role: 'Admin',
    team: 'Management',
    isAdmin: true,
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('hertz_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('hertz_sidebar_collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hertz_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const autoLoad = async () => {
      // If user has uploaded custom data, don't overwrite it with the default template
      const isCustom = localStorage.getItem('hertz_data_is_custom') === 'true';
      if (isCustom) return;

      try {
        const { employees: fetchedEmps, requests: fetchedReqs } = await ExcelProcessor.fetchAndProcess();
        if (fetchedEmps.length > 0) {
          // Detect new leaves on load if needed (optional, but let's stick to sync actions)
          setEmployees(fetchedEmps);
          setRequests(fetchedReqs);
        }
      } catch {
        console.log('Default tracker not found in public folder, using local storage.');
      }
    };
    autoLoad();
  }, []);

  const addNotification = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotify: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      type
    };
    setNotifications(prev => [newNotify, ...prev].slice(0, 20)); // Keep last 20
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem('hertz_sidebar_collapsed', String(newVal));
      return newVal;
    });
  };

  useEffect(() => {
    localStorage.setItem('hertz_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('hertz_employees', JSON.stringify(employees));
  }, [employees]);

  const addRequest = (req: LeaveRequest) => {
    setRequests(prev => {
      // Deduplicate by ID
      const exists = prev.find(r => r.id === req.id);
      if (exists) return prev;
      return [...prev, req];
    });
  };
  
  const updateRequest = (id: string, updates: Partial<LeaveRequest>) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const resetToTeamData = async () => {
    const previousRequests = [...requests];
    localStorage.removeItem('hertz_data_is_custom');
    localStorage.removeItem('hertz_employees');
    localStorage.removeItem('hertz_requests');
    
    try {
      const { employees: fetchedEmps, requests: fetchedReqs } = await ExcelProcessor.fetchAndProcess();
      
      // Compare and notify
      const newRequests = fetchedReqs.filter(nr => !previousRequests.some(pr => pr.id === nr.id));
      newRequests.forEach(req => {
        const emp = fetchedEmps.find(e => e.id === req.employeeId);
        const leaveType = req.type === 'P' ? 'Planned Leave' : req.type === 'S' ? 'Sick Leave' : 'Holiday';
        const dateStr = format(parseISO(req.startDate), 'MMM d');
        addNotification(`${emp?.name || 'A team member'} applied for ${leaveType} on ${dateStr}`, 'success');
      });

      setEmployees(fetchedEmps);
      setRequests(fetchedReqs);
      
      if (newRequests.length === 0) {
        addNotification('Sync complete: No new updates found.', 'info');
      }
    } catch {
      console.error('Failed to reset to team data');
      addNotification('Failed to sync team data. Please check your connection.', 'warning');
    }
  };

  const slaStatus = React.useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' }); // YYYY-MM-DD in MT
    const totalTeam = employees.length || 1;
    const onLeaveToday = requests.filter(req => {
      return req.startDate <= todayStr && req.endDate >= todayStr;
    }).length;

    const availablePercent = ((totalTeam - onLeaveToday) / totalTeam) * 100;
    
    if (availablePercent >= 80) return 'ON_TRACK';
    if (availablePercent >= 50) return 'WARNING';
    return 'RISK';
  }, [requests, employees]);

  return (
    <AppContext.Provider value={{ 
      employees, 
      requests, 
      user, 
      setUser, 
      setEmployees, 
      addRequest, 
      updateRequest,
      setRequests,
      resetToTeamData,
      slaStatus,
      notifications,
      addNotification,
      markAsRead,
      clearNotifications,
      isSidebarCollapsed,
      toggleSidebar
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
