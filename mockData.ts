
import { PayStub, SavingsGoal, Bill, Bet, Reminder, Transaction } from './types';

// Helper to generate DPS schedule - Updated to return empty as requested to clear all historical data
const generateDPSSchedule = (): Transaction[] => {
  return [];
};

export const MOCK_METRICS = [
  { label: 'Net Worth', value: 0, change: 0, trend: 'up' },
  { label: 'Monthly ROI', value: 0, change: 0, trend: 'up' },
  { label: 'Credit Score', value: 742, change: 0, trend: 'up' },
  { label: 'Debt/Income', value: 0, change: 0, trend: 'down' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_PAYROLL: PayStub[] = [];

export const MOCK_SAVINGS: SavingsGoal[] = [];

export const MOCK_BILLS: Bill[] = [];

export const MOCK_BETS: Bet[] = [];

export const MOCK_REMINDERS: Reminder[] = [];
