import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { resolveStatus } from '../logic/statusResolver';

export const CalendarView: React.FC = () => {
  const { requests, user } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Start of 2026

  const renderMonth = (monthDate: Date) => {
    const days = eachDayOfInterval({
      start: startOfMonth(monthDate),
      end: endOfMonth(monthDate),
    });

    const monthName = format(monthDate, 'MMMM');
    const userRequests = requests.filter(r => r.employeeId === user?.id);

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{monthName}</h4>
        <div className="grid grid-cols-7 gap-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-[10px] text-center font-bold text-slate-500 py-1">{d}</div>
          ))}
          {Array(startOfMonth(monthDate).getDay()).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          {days.map((day: any) => {
            const status = resolveStatus(day, userRequests);
            const statusColors: Record<string, string> = {
              'Holiday': 'bg-red-50 text-[#C41E3A] border-red-100 font-bold',
              'Week Off': 'text-slate-400',
              'Planned': 'bg-orange-50 text-orange-600 border-orange-100',
              'Sick': 'bg-pink-50 text-pink-600 border-pink-100',
              'Approved': 'hover:bg-slate-50 text-slate-900 border-slate-100',
            };

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square flex items-center justify-center text-xs rounded-lg border transition-all cursor-pointer ${statusColors[status] || 'text-slate-400'}`}
                title={`${format(day, 'MMM d')}: ${status}`}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">2026 Attendance Tracker</h2>
          <p className="text-slate-500 mt-1">Plan and manage your leaves</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="premium-button flex items-center gap-2">
            <Plus size={18} />
            New Request
          </button>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 3))} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600">
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 font-medium text-sm text-slate-700">Quarterly View</span>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 3))} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[0, 1, 2].map(offset => (
          <div key={offset} className="glass-card p-6">
            {renderMonth(addMonths(currentDate, offset))}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mt-8">
        {[
          { label: 'Holiday', color: 'bg-[#C41E3A]' },
          { label: 'Planned Leave', color: 'bg-orange-500' },
          { label: 'Sick Leave', color: 'bg-pink-500' },
          { label: 'Work Day', color: 'bg-slate-200' },
        ].map(legend => (
          <div key={legend.label} className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className={`w-3 h-3 rounded-full ${legend.color}`}></div>
            <span className="text-xs font-medium text-slate-700">{legend.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
