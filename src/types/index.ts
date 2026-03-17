export type LeaveStatus = 'Planned' | 'Sick' | 'Holiday' | 'Week Off' | 'Pending' | 'Approved' | 'Rejected';

export interface Employee {
  id: string;
  name: string;
  role: string;
  managerId?: string;
  team: string;
  avatar?: string;
  isAdmin?: boolean;
}

export type LeaveType = 'P' | 'S' | 'H'; // P: Planned, S: Sick, H: Holiday

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: LeaveType;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
}

export interface Holiday {
  date: string;
  name: string;
  isMandatory: boolean;
}

export interface DayStatus {
  date: string;
  status: LeaveStatus;
  requestId?: string;
  isConflict?: boolean;
}

export interface TeamMemberAvailability extends Employee {
  schedule: DayStatus[];
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning';
}
