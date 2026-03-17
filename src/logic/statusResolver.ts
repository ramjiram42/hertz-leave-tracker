import { isWeekend } from 'date-fns';
import { PUBLIC_HOLIDAYS } from '../constants/holidays';
import type { PublicHoliday } from '../constants/holidays';
import type { LeaveRequest, LeaveStatus } from '../types';

export const resolveStatus = (
  date: Date,
  requests: LeaveRequest[]
): LeaveStatus => {
  const dateStr = date.toISOString().split('T')[0];

  if (PUBLIC_HOLIDAYS.some((h: PublicHoliday) => h.date === dateStr)) return 'Holiday';
  if (isWeekend(date)) return 'Week Off';

  const activeRequests = requests.filter(r => {
    const start = r.startDate;
    const end = r.endDate;
    return dateStr >= start && dateStr <= end;
  });

  if (activeRequests.length === 0) return 'Approved';
  if (activeRequests.some(r => r.type === 'S')) return 'Sick';
  if (activeRequests.some(r => r.type === 'P')) return 'Planned';

  return 'Approved';
};
