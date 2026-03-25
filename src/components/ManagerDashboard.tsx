import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../store/AppContext';
import { format, isWithinInterval, parseISO, startOfToday, addMonths, addDays, isSameMonth, isAfter } from 'date-fns';
import { Calendar, MapPin } from 'lucide-react';
import type { Employee, LeaveRequest } from '../types';
import { PUBLIC_HOLIDAYS } from '../constants/holidays';

export const ManagerDashboard: React.FC = () => {
  const { requests, employees, slaStatus } = useApp();
  const today = startOfToday();
  
  const [selectedMonth, setSelectedMonth] = useState<string | null>(format(today, 'MMM'));

  // Filter labels for current and next 2 months (Total 3)
  const visibleMonthLabels = useMemo(() => [
    format(today, 'MMM'),
    format(addMonths(today, 1), 'MMM'),
    format(addMonths(today, 2), 'MMM')
  ], [today]);

  // Calculate KPI Values (Global defaults)
  const stats = useMemo(() => {
    const todayStr = format(today, 'yyyy-MM-dd');
    const onLeaveToday = requests.filter((req: LeaveRequest) => {
      return req.startDate <= todayStr && req.endDate >= todayStr;
    }).length;

    const pending = requests.filter((req: LeaveRequest) => req.status === 'Pending').length;
    const totalTeam = employees.length || 10;
    const availablePercent = Math.round(((totalTeam - onLeaveToday) / totalTeam) * 100);

    const slaLabel = {
      'ON_TRACK': 'On Track',
      'WARNING': 'Attention',
      'RISK': 'At Risk'
    }[slaStatus];

    return {
      available: `${availablePercent}%`,
      onLeave: onLeaveToday.toString(),
      pending: pending.toString(),
      sla: slaLabel
    };
  }, [requests, employees, today, slaStatus]);

  const upcomingLeaves = useMemo(() => {
    const endRange = addDays(today, 30);
    
    // 1. Get all Planned and Sick leaves from requests
    const individualLeaves = requests
      .filter((req: LeaveRequest) => {
        if (!req.startDate || req.type === 'H') return false; // Filter out Holidays from individual list
        try {
          const start = parseISO(req.startDate);
          return isWithinInterval(start, { start: today, end: endRange });
        } catch {
          return false;
        }
      })
      .map((req: LeaveRequest) => {
        const emp = employees.find((e: Employee) => e.id === req.employeeId);
        return {
          id: req.id,
          name: emp?.name || 'Unknown',
          type: req.type,
          displayDate: format(parseISO(req.startDate), 'MMM d'),
          sortDate: parseISO(req.startDate)
        };
      });

    // 2. Get Public Holidays in the same range
    const holidayEntries = PUBLIC_HOLIDAYS
      .filter(h => {
        const date = parseISO(h.date);
        return isWithinInterval(date, { start: today, end: endRange });
      })
      .map(h => ({
        id: `holiday-${h.date}`,
        name: h.name,
        type: 'H' as const,
        displayDate: format(parseISO(h.date), 'MMM d'),
        sortDate: parseISO(h.date)
      }));

    // Combine and sort
    return [...individualLeaves, ...holidayEntries]
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());
  }, [requests, employees, today]);

  // Calculate Chart Data (Current and Next Month Only)
  const chartData = useMemo(() => {
    return visibleMonthLabels.map(month => {
      const leaves = requests.filter((req: LeaveRequest) => {
        try {
          return format(parseISO(req.startDate), 'MMM') === month;
        } catch {
          return false;
        }
      }).length;
      return { name: month, leaves };
    });
  }, [requests, visibleMonthLabels]);

  // Details for Selected Month
  const { selectedHolidays, plannedLeaves } = useMemo(() => {
    if (!selectedMonth) return { selectedHolidays: [], plannedLeaves: [], sickLeaves: [] };
    
    const monthIndex = visibleMonthLabels.indexOf(selectedMonth);
    const targetDate = addMonths(today, monthIndex);

    const monthRequests = requests.filter((req: LeaveRequest) => {
      try {
        const reqStart = parseISO(req.startDate);
        return isSameMonth(reqStart, targetDate);
      } catch {
        return false;
      }
    });

    const holidaysInMonth = PUBLIC_HOLIDAYS.filter(h => isSameMonth(parseISO(h.date), targetDate));
    
    const plannedDetails = monthRequests
      .filter(r => r.type === 'P')
      .map((req: LeaveRequest) => {
        const emp = employees.find((e: Employee) => e.id === req.employeeId);
        return {
          id: req.id,
          name: emp?.name || 'Unknown Employee',
          date: format(parseISO(req.startDate), 'MMM d'),
          type: 'P' as const
        };
      });

    return {
      selectedHolidays: holidaysInMonth,
      plannedLeaves: plannedDetails
    };
  }, [selectedMonth, requests, employees, today, visibleMonthLabels]);

  // Member Summary Table Data (Current Month: Planned vs Sick)
  const memberSummary = useMemo(() => {
    return employees.map(emp => {
      const monthRequests = requests.filter(req => {
        try {
          const reqStart = parseISO(req.startDate);
          return req.employeeId === emp.id && isSameMonth(reqStart, today);
        } catch {
          return false;
        }
      });
      
      return {
        id: emp.id,
        name: emp.name,
        planned: monthRequests.filter(r => r.type === 'P').length
      };
    });
  }, [employees, requests, today]);

  // Upcoming Public Holidays (Today onwards)
  const upcomingHolidaysList = useMemo(() => {
    return PUBLIC_HOLIDAYS
      .filter(h => isAfter(parseISO(h.date), today) || h.date === format(today, 'yyyy-MM-dd'))
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [today]);

  return (
    <div className="space-y-8 pt-4">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Team Available', value: stats.available, color: 'from-blue-500 to-blue-600' },
          { label: 'On Leave Today', value: stats.onLeave, color: 'from-purple-500 to-purple-600' },
          { label: 'Pending Requests', value: stats.pending, color: 'from-orange-500 to-orange-600' },
          { 
            label: 'SLA Status', 
            value: stats.sla, 
            color: slaStatus === 'ON_TRACK' ? 'from-emerald-500 to-emerald-600' : 
                   slaStatus === 'WARNING' ? 'from-amber-400 to-amber-600' : 
                   'from-rose-500 to-rose-600' 
          },
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-6 overflow-hidden relative group border-slate-200 transition-all duration-500">
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${kpi.color} transition-all duration-500`}></div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-tighter">{kpi.label}</p>
            <h3 className="text-3xl font-black mt-2 text-slate-900 group-hover:translate-x-1 transition-transform duration-300">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* NEW: Horizontal Upcoming Leaves (Next 30 Days) */}
      <div className="glass-card p-6 border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#C41E3A]" />
            Upcoming Leaves (Next 30 Days)
          </h3>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 uppercase">
            {upcomingLeaves.length} Active Plans
          </span>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {upcomingLeaves.length > 0 ? (
            upcomingLeaves.map((leave) => (
              <div key={leave.id} className="min-w-[240px] flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#C41E3A]/30 transition-all group shadow-sm">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${
                  leave.type === 'H' ? 'bg-emerald-500' :
                  leave.type === 'P' ? 'bg-[#C41E3A]' :
                  'bg-orange-600'
                }`}>
                  {leave.type === 'H' ? <MapPin className="w-5 h-5" /> : leave.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">{leave.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase ${
                      leave.type === 'H' ? 'text-emerald-600' :
                      leave.type === 'P' ? 'text-red-600' :
                      'text-orange-600'
                    }`}>
                      {leave.type === 'H' ? 'Holiday' : leave.type === 'P' ? 'Planned' : 'Sick'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <p className="text-[10px] text-slate-500 font-medium">{leave.displayDate}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-500">No team leaves scheduled soon.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Section: Chart & Detailed List */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-8 border-slate-200">
            <h3 className="text-lg font-bold mb-8 text-slate-900 flex items-center gap-2">
              Upcoming Leave Distribution
              <span className="text-xs font-normal text-slate-500 px-2 py-1 bg-slate-100 rounded-full border border-slate-200">Interactive View</span>
            </h3>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={40} onClick={(data: { activeLabel?: string }) => {
                  if (data && data.activeLabel) setSelectedMonth(data.activeLabel);
                }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b' }}
                  />
                  <Bar dataKey="leaves" radius={[6, 6, 0, 0]} className="cursor-pointer" minPointSize={5}>
                    {chartData.map((entry, index) => {
                      const colors = ['#C41E3A', '#3B82F6', '#10B981']; // Red, Blue, Emerald
                      const baseColor = colors[index % colors.length];
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === selectedMonth ? baseColor : `${baseColor}40`} // Full color for selected, 25% opacity for others
                          stroke={baseColor}
                          strokeWidth={2}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-slate-500 mt-4">Click a bar to see member details below</p>
          </div>

          {/* Member Summary Table */}
          <div className="glass-card p-8 border-slate-200 bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[#C41E3A] rounded-full"></div>
              Leave Summary ( {format(today, 'MMMM')} )
            </h3>
            
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-tighter text-[10px]">Team Member</th>
                    <th className="px-6 py-4 font-bold text-[#C41E3A] uppercase tracking-tighter text-[10px] text-right">Planned Leaves</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {memberSummary.length > 0 ? memberSummary.map((item, index) => {
                    const avatarColors = [
                      'bg-red-500', 'bg-blue-500', 'bg-emerald-500', 
                      'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'
                    ];
                    const avatarColor = avatarColors[index % avatarColors.length];
                    
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl ${avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-110 transition-transform`}>
                              {item.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-700">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center justify-center min-w-[32px] h-[32px] px-3 rounded-lg font-bold text-sm ${item.planned > 0 ? 'bg-red-50 text-[#C41E3A] border border-red-100' : 'bg-slate-50 text-slate-300'}`}>
                            {item.planned}d
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                        No team members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Month Detailed List */}
          {selectedMonth && (
            <div className="glass-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C41E3A]" />
                  Monthly Details: {selectedMonth}
                </h3>
                <div className="flex flex-wrap gap-4">
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase">
                    {selectedHolidays.length} Holidays
                  </span>
                  <span className="text-[10px] text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100 uppercase">
                    {plannedLeaves.length} Planned Leaves
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Global Holidays Column */}
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Company Holidays
                  </h4>
                  {selectedHolidays.length > 0 ? (
                    <div className="space-y-3">
                      {selectedHolidays.map((h, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex flex-col items-center justify-center font-bold">
                              <span className="text-[10px] uppercase leading-none">{format(parseISO(h.date), 'MMM')}</span>
                              <span className="text-sm leading-none mt-0.5">{format(parseISO(h.date), 'dd')}</span>
                            </div>
                            <p className="text-slate-900 font-bold text-sm tracking-tight">{h.name}</p>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">All Members</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No holidays this month</p>
                  )}
                </div>

                {/* Team Planned Leaves Column */}
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C41E3A]"></div>
                    Planned Leaves
                  </h4>
                  {plannedLeaves.length > 0 ? (
                    <div className="space-y-3">
                      {plannedLeaves.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#C41E3A] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                              {item.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-slate-900 font-bold text-sm group-hover:text-[#C41E3A] transition-colors">{item.name}</p>
                              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{item.date}</p>
                            </div>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-[#C41E3A]/20"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No leaves planned for this month</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          {/* Public Holiday Schedule Section (Now in Sidebar) */}
          <div className="glass-card p-8 border-slate-200 bg-white h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#C41E3A]" />
                Holidays
              </h3>
              <div className="text-[10px] font-bold text-[#C41E3A] bg-red-50 px-3 py-1 rounded-full border border-red-100 uppercase">
                2026
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {upcomingHolidaysList.map((holiday, idx) => {
                const hDate = parseISO(holiday.date);
                const isUpcoming = isWithinInterval(hDate, { start: today, end: addMonths(today, 1) });
                return (
                  <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border transition-all group shadow-sm ${
                    isUpcoming ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center ${
                        isUpcoming ? 'bg-white border-red-200' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-[9px] font-bold text-[#C41E3A] uppercase leading-none">{format(hDate, 'MMM')}</span>
                        <span className="text-base font-bold text-slate-900 leading-none mt-1">{format(hDate, 'dd')}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-[#C41E3A] transition-colors truncate w-24 md:w-32 uppercase tracking-tight">{holiday.name}</p>
                        <p className="text-[9px] text-slate-500">{format(hDate, 'eeee')}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
