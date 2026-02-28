
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
  // Added icons for ICONS object used in utils.ts
  Utensils,
  Home,
  Car,
  ShoppingBag,
  Stethoscope,
  CircleDollarSign,
  HelpCircle
} from 'lucide-react';
import { NavItem } from './types';

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: 'financial', label: 'Financial Info', icon: 'BarChart3' },
  { id: 'payroll', label: 'Payroll Info', icon: 'CreditCard' },
  { id: 'savings', label: 'Savings Info', icon: 'PiggyBank' },
  { id: 'bills', label: 'Bill Info', icon: 'Receipt' },
  { id: 'betting', label: 'Betting Info', icon: 'Dices' },
  { id: 'reminders', label: 'Reminders', icon: 'Bell' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

export const ICON_MAP: Record<string, React.ReactNode> = {
  BarChart3: <BarChart3 size={20} />,
  CreditCard: <CreditCard size={20} />,
  PiggyBank: <PiggyBank size={20} />,
  Receipt: <Receipt size={20} />,
  Dices: <Dices size={20} />,
  Bell: <Bell size={20} />,
  Settings: <Settings size={20} />,
  LogOut: <LogOut size={20} />,
};

// Added ICONS export to satisfy utils.ts dependency
export const ICONS = {
  Food: Utensils,
  Home: Home,
  Bills: Receipt,
  Savings: PiggyBank,
  Transport: Car,
  Shopping: ShoppingBag,
  Medical: Stethoscope,
  Financial: CircleDollarSign,
  Other: HelpCircle
};
