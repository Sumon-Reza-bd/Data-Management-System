
import React from 'react';
import { 
  BarChart3, 
  Wallet, 
  PiggyBank, 
  FileText, 
  Trophy, 
  Bell, 
  Settings, 
  LogOut,
  Database,
  Clock,
  CalendarDays,
  LayoutDashboard
} from 'lucide-react';
import { AppTab, MenuItem } from './types';

interface SidebarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  isMobile?: boolean;
  language?: 'English' | 'বাংলা';
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, isMobile, language = 'English', onLogout }) => {
  const translations = {
    English: {
      [AppTab.DASHBOARD]: 'Dashboard',
      [AppTab.FINANCIAL]: 'Financial Info',
      [AppTab.SALARY_INFO]: 'Salary Info',
      [AppTab.ATTENDANCE]: 'Attendance',
      [AppTab.LEAVE_INFO]: 'Leave Info',
      [AppTab.SAVINGS]: 'Savings Info',
      [AppTab.BILL]: 'Bill Info',
      [AppTab.BETTING]: 'Betting Info',
      [AppTab.REMINDERS]: 'Reminders',
      [AppTab.SETTINGS]: 'Settings',
      logout: 'Logout'
    },
    'বাংলা': {
      [AppTab.DASHBOARD]: 'ড্যাশবোর্ড',
      [AppTab.FINANCIAL]: 'আর্থিক তথ্য',
      [AppTab.SALARY_INFO]: 'বেতন তথ্য',
      [AppTab.ATTENDANCE]: 'উপস্থিতি',
      [AppTab.LEAVE_INFO]: 'ছুটির তথ্য',
      [AppTab.SAVINGS]: 'সঞ্চয় তথ্য',
      [AppTab.BILL]: 'বিল তথ্য',
      [AppTab.BETTING]: 'বেটিং তথ্য',
      [AppTab.REMINDERS]: 'অনুস্মারক',
      [AppTab.SETTINGS]: 'সেটিংস',
      logout: 'লগ আউট'
    }
  };

  const t = translations[language];

  const menuItems: MenuItem[] = [
    { id: AppTab.DASHBOARD, label: t[AppTab.DASHBOARD], icon: <LayoutDashboard size={18} /> },
    { id: AppTab.FINANCIAL, label: t[AppTab.FINANCIAL], icon: <BarChart3 size={18} /> },
    { id: AppTab.SAVINGS, label: t[AppTab.SAVINGS], icon: <PiggyBank size={18} /> },
    { id: AppTab.SALARY_INFO, label: t[AppTab.SALARY_INFO], icon: <Wallet size={18} /> },
    { id: AppTab.ATTENDANCE, label: t[AppTab.ATTENDANCE], icon: <Clock size={18} /> },
    { id: AppTab.LEAVE_INFO, label: t[AppTab.LEAVE_INFO], icon: <CalendarDays size={18} /> },
    { id: AppTab.BILL, label: t[AppTab.BILL], icon: <FileText size={18} /> },
    { id: AppTab.BETTING, label: t[AppTab.BETTING], icon: <Trophy size={18} /> },
    { id: AppTab.REMINDERS, label: t[AppTab.REMINDERS], icon: <Bell size={18} /> },
    { id: AppTab.SETTINGS, label: t[AppTab.SETTINGS], icon: <Settings size={18} /> },
  ];

  return (
    <div className={`
      h-full flex flex-col border-r bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 transition-all duration-300
      ${isMobile ? 'w-full' : 'w-56'}
    `}>
      {!isMobile && (
        <div className="h-14 flex items-center px-5 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-600 rounded flex items-center justify-center text-white shadow-sm">
              <Database size={16} />
            </div>
            <span className="font-black text-[11px] leading-tight tracking-tight text-gray-900 dark:text-gray-100 uppercase">Data Management Software</span>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1.5 custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`
              group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 border
              ${activeTab === item.id 
                ? 'bg-purple-600 text-white border-purple-700 shadow-md translate-x-1' 
                : 'text-gray-600 dark:text-gray-400 border-purple-100 dark:border-purple-900/30 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 hover:translate-x-1'}
            `}
          >
            <span className={`${activeTab === item.id ? 'text-white' : 'text-purple-600 group-hover:text-purple-600'}`}>
              {item.icon}
            </span>
            <span className="truncate uppercase tracking-tight">
              {item.label}
            </span>
            {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100 dark:border-slate-800 shrink-0">
        <button 
          onClick={onLogout}
          className="group w-full flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-50 dark:border-rose-900/20 hover:bg-rose-600 hover:text-white rounded-lg transition-all duration-200 uppercase tracking-tight"
        >
          <LogOut size={16} />
          <span>{t.logout}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;