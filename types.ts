
import React from 'react';

export type ViewType = 'dashboard' | 'financial' | 'payroll' | 'savings' | 'bills' | 'betting' | 'reminders' | 'settings' | 'history' | 'salary_info' | 'attendance' | 'leave_info';

// Added AppTab enum to fix imports in Sidebar and Header
export enum AppTab {
  DASHBOARD = 'dashboard',
  FINANCIAL = 'financial',
  SALARY_INFO = 'salary_info',
  ATTENDANCE = 'attendance',
  LEAVE_INFO = 'leave_info',
  SAVINGS = 'savings',
  BILL = 'bills',
  BETTING = 'betting',
  REMINDERS = 'reminders',
  SETTINGS = 'settings'
}

export const CATEGORIES = {
  income: ['Salary', 'Business', 'Freelance', 'Investment', 'Gift', 'Others'],
  expense: ['Rent', 'Food', 'Transport', 'Shopping', 'Medical', 'Education', 'Entertainment', 'DPS', 'Bill', 'Others']
};

// Added MenuItem interface for Sidebar
export interface MenuItem {
  id: AppTab;
  label: string;
  icon: React.ReactNode;
}

// New types to fix import errors
export type LanguageType = 'en' | 'bn';
export type ThemeType = 'light' | 'dark';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  backupEmail?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface Bill {
  id: string;
  name: string;
  category: 'Electric' | 'Wifi';
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

// Unified SavingsGoal interface to satisfy both Dashboard and Savings views
export interface SavingsGoal {
  id: string;
  name: string; // Used in SavingsInfoView
  title?: string; // Legacy/Compat
  bank?: string; // Legacy/Compat
  plan: string;
  targetAmount: number; // Used in SavingsInfoView
  currentAmount: number; // Used in SavingsInfoView and Dashboard
  maturityValue: number; // Used in SavingsInfoView
  color: string;
  monthlyDeposit: number;
  years: number;
  profitPercent: number;
  startDate?: string;
  maturityDate?: string;
}

// Added SavingsRecord interface for SavingsInfoView
export interface SavingsRecord {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  note: string;
  transactionId?: string;
}

export interface SummaryData {
  title: string;
  value: number;
  change: number;
  type: 'income' | 'expense' | 'balance';
}

export interface Bet {
  id: string;
  event: string;
  amount: number;
  odds?: number;
  potentialReturn?: number;
  status: 'won' | 'lost' | 'pending';
  date: string;
}

// Updated Reminder to include note and time, and matched priority usage
export interface Reminder {
  id: string;
  title: string;
  date: string;
  time?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  note?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  daysRemaining?: number;
}

export interface PayStub {
  id: string;
  gross: number;
  tax: number;
  deductions?: number;
  net: number;
  date: string;
}

// Added PayrollProfile for PayrollView
export interface PayrollProfile {
  name: string;
  role: string;
  department: string;
  employeeId: string;
  grossSalary: number;
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
  baseDeduction: number;
  imageUrl: string;
}

// Added SalaryHistoryItem for PayrollView
export interface SalaryHistoryItem {
  id: string;
  year: number;
  inc: number;
  amt: number;
  total: number;
}

// Added LeaveType for LeaveInfoView
export interface LeaveType {
  id: string;
  type: string;
  total: number;
  color: string;
}

// Added LeaveRecord for LeaveInfoView
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

// Added BillRecord for BillInfoView
export interface BillRecord {
  id: string;
  type: 'Electric' | 'Wifi';
  amount: number;
  date: string;
  note: string;
  transactionId?: string;
}

// Added BettingRecord for BettingInfoView
export interface BettingRecord {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
  note: string;
  transactionId?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}
