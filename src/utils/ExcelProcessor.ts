import * as XLSX from 'xlsx';
import type { Employee, LeaveRequest, LeaveType } from '../types';

export class ExcelProcessor {
  static async processWorkbook(data: Uint8Array): Promise<{
    employees: Employee[];
    requests: LeaveRequest[];
  }> {
    const workbook = XLSX.read(data, { type: 'array' });
    
    const employees: Employee[] = [];
    const requests: LeaveRequest[] = [];
    const employeeMap: Record<string, boolean> = {};

    workbook.SheetNames.forEach((sheetName: string) => {
      if (!sheetName.includes('-2026')) return;

      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      const [monthStr] = sheetName.split('-');
      const monthMap: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      const month = monthMap[monthStr];
      if (month === undefined) return;

      let dayRowIndex = -1;
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (r && Array.isArray(r)) {
          const hasSequence = r.some((cell, idx) => 
            (cell === 1 || cell === '1') && 
            (r[idx + 1] === 2 || r[idx + 1] === '2')
          );
          if (hasSequence) {
            dayRowIndex = i;
            break;
          }
        }
      }

      if (dayRowIndex === -1) return;

      for (let i = dayRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        const name = row ? row[0] : null;
        if (!name || typeof name !== 'string') continue;
        
        const allowedEmployees = ['Ramanjneyulu P', 'Reshma G', 'Akash', 'Siddharth'];
        const normalizedName = name.trim();
        if (!allowedEmployees.includes(normalizedName)) continue;

        const empId = `emp-${name.replace(/\s+/g, '-').toLowerCase()}`;
        if (!employeeMap[empId]) {
          employees.push({
            id: empId,
            name: name,
            role: 'Team Member',
            team: 'General',
          });
          employeeMap[empId] = true;
        }

        for (let d = 1; d <= 31; d++) {
          const status = row[d];
          if (!status) continue;

          let type: LeaveType | null = null;
          const normalizedStatus = String(status).trim().toUpperCase();
          
          if (normalizedStatus === 'P') type = 'P';
          else if (normalizedStatus === 'S') type = 'S';
          else if (normalizedStatus === 'H') type = 'H';

          if (type) {
            const date = new Date(2026, month, d);
            const dateStr = date.toISOString().split('T')[0];
            
            requests.push({
              id: `req-${empId}-${dateStr}`,
              employeeId: empId,
              startDate: dateStr,
              endDate: dateStr,
              status: 'Approved',
              type: type,
              remarks: `Imported from ${sheetName}`
            });
          }
        }
      }
    });
    
    return { employees, requests };
  }

  static async processTracker(file: File): Promise<{
    employees: Employee[];
    requests: LeaveRequest[];
  }> {
    const buffer = await file.arrayBuffer();
    return this.processWorkbook(new Uint8Array(buffer));
  }

  static async fetchAndProcess(): Promise<{
    employees: Employee[];
    requests: LeaveRequest[];
  }> {
    const response = await fetch('/Hertz 2026 tracker.xlsx');
    if (!response.ok) throw new Error('Default tracker not found');
    const buffer = await response.arrayBuffer();
    return this.processWorkbook(new Uint8Array(buffer));
  }

  static exportToExcel(data: any[], fileName: string) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }
}
