
export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  FINANCIAL = 'FINANCIAL',
  SALARY_INFO = 'SALARY_INFO',
  ATTENDANCE = 'ATTENDANCE',
  LEAVE_INFO = 'LEAVE_INFO',
  SAVINGS = 'SAVINGS',
  BILL = 'BILL',
  BETTING = 'BETTING',
  REMINDERS = 'REMINDERS',
  SETTINGS = 'SETTINGS'
}

export type ThemeType = 'light' | 'dark';
export type LanguageType = 'en' | 'bn';

export interface MenuItem {
  id: AppTab;
  label: string;
  icon: React.ReactNode;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  plan: string;
  targetAmount: number;
  currentAmount: number;
  maturityValue: number;
  color: string;
  monthlyDeposit: number;
  years: number;
  profitPercent: number;
  startDate: string;
  maturityDate: string;
}

export interface SavingsRecord {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  note: string;
  transactionId?: string;
  stepProfit?: number;
  runningBalance?: number;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  note: string;
  completed: boolean;
}

export interface LeaveType {
  id: string;
  type: string;
  total: number;
  color: string;
}

export interface LeaveRecord {
  id: string;
  typeId: string;
  typeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedOn: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  day: string;
  status: 'On Time' | 'Late' | 'Absent' | 'Out Missing' | 'Holiday' | 'Leave' | 'Weekly Off';
  checkIn?: string;
  checkOut?: string;
  note?: string;
}

export interface PayrollProfile {
  name: string;
  email: string;
  role: string;
  department: string;
  employeeId: string;
  grossSalary: number;
  baseDeduction: number;
  basicSalary: number;
  houseRent: number;
  medical: number;
  conveyance: number;
  food: number;
  attendanceBonus: number;
  tiffinBillDays: number;
  tiffinRate: number;
  yearlyBonus: number;
  eidBonus: number;
  imageUrl: string;
}

export interface SalaryHistoryItem {
  id: string;
  year: number;
  inc: number;
  amt: number;
  total: number;
}

export interface BillRecord {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  type: 'Electric' | 'Wifi' | 'income' | 'expense';
  transactionId?: string;
  note?: string;
}

export interface BettingRecord {
  id: string;
  title: string;
  amount: number;
  date: string;
  odds: number;
  status: 'Won' | 'Lost' | 'Pending';
  type: 'deposit' | 'withdraw' | 'income' | 'expense';
  transactionId?: string;
  note?: string;
}

export const CATEGORIES = {
  income: ['Salary', 'Bonus', 'Freelance', 'Other'],
  expense: ['Food', 'Rent', 'Utilities', 'Transport', 'Entertainment', 'DPS', 'Other']
};
