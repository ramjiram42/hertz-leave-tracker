import type { LeaveRequest } from '../types';

export interface Conflict {
  date: string;
  employeeIds: string[];
  type: 'Over-Allocation' | 'Self-Overlap';
}

export const detectConflicts = (
  requests: LeaveRequest[],
  _teamThreshold: number = 0.5
): Conflict[] => {
  const conflicts: Conflict[] = [];
  const dateMap: Record<string, string[]> = {};

  requests.forEach(req => {
    const current = new Date(req.startDate);
    const end = new Date(req.endDate);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      if (!dateMap[dateStr]) dateMap[dateStr] = [];
      
      if (dateMap[dateStr].includes(req.employeeId)) {
        conflicts.push({
          date: dateStr,
          employeeIds: [req.employeeId],
          type: 'Self-Overlap'
        });
      }

      dateMap[dateStr].push(req.employeeId);
      current.setDate(current.getDate() + 1);
    }
  });

  return conflicts;
};
