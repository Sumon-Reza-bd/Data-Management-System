
import React from 'react';
import { 
  BarChart3, 
  CreditCard, 
  PiggyBank, 
  Receipt, 
  Dices, 
  Bell, 
  Settings,
  LogOut,
  Utensils,
  Home,
  Car,
  ShoppingBag,
  Stethoscope,
  CircleDollarSign,
  HelpCircle,
  Bot,
  LayoutDashboard,
  Wallet,
  Clock,
  CalendarDays
} from 'lucide-react';
import { NavItem } from './types';

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'financial', label: 'Financial Info', icon: <BarChart3 size={20} /> },
  { id: 'payroll', label: 'Payroll Info', icon: <CreditCard size={20} /> },
  { id: 'savings', label: 'Savings Info', icon: <PiggyBank size={20} /> },
  { id: 'bills', label: 'Bill Info', icon: <Receipt size={20} /> },
  { id: 'betting', label: 'Betting Info', icon: <Dices size={20} /> },
  { id: 'reminders', label: 'Reminders', icon: <Bell size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

export const ICONS = {
  Food: Utensils,
  Home: Home,
  Bills: Receipt,
  Savings: PiggyBank,
  Transport: Car,
  Shopping: ShoppingBag,
  Medical: Stethoscope,
  Financial: CircleDollarSign,
  Other: HelpCircle,
  Bot: Bot,
  Dashboard: LayoutDashboard,
  Wallet: Wallet,
  Clock: Clock,
  Calendar: CalendarDays,
  Logout: LogOut
};
