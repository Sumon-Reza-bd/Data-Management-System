
import React, { useState } from 'react';
import { Menu, Search, Sun, Moon, ChevronDown, X, Maximize2 } from 'lucide-react';
import { AppTab, ThemeType } from './types';

interface HeaderProps {
  activeTab: AppTab;
  onOpenMenu: () => void;
  language?: 'English' | 'বাংলা';
  profile: {
    name: string;
    role: string;
    imageUrl: string;
  };
  isSyncing?: boolean;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  onOpenMenu, 
  language = 'English', 
  profile, 
  isSyncing,
  theme,
  setTheme
}) => {
  const isDarkMode = theme === 'dark';
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

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
      search: 'Search resources...',
      plan: 'Premium Plan',
      close: 'Close Preview'
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
      search: 'অনুসন্ধান করুন...',
      plan: 'প্রিমিয়াম প্ল্যান',
      close: 'বন্ধ করুন'
    }
  };

  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 h-14 w-full flex items-center justify-between px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm shrink-0 transition-colors">
      <div className="flex items-center gap-3 overflow-hidden">
        <button 
          onClick={onOpenMenu}
          className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg lg:hidden shrink-0 transition-colors border border-indigo-100 dark:border-indigo-800/50"
          aria-label="Open Menu"
        >
          <Menu size={20} />
        </button>
        
        <div className="border-l-[3px] border-indigo-600 pl-4 py-1 ml-1 flex items-center gap-3">
          <h1 className="text-sm md:text-base font-black text-gray-900 dark:text-gray-100 truncate uppercase tracking-tight">
            {t[activeTab]}
          </h1>
          {isSyncing && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full border border-indigo-100 dark:border-indigo-800/20">
               <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
               <span className="text-[9px] font-black uppercase text-indigo-600 tracking-tighter hidden xs:inline">Syncing</span>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 mx-2 hidden xs:block"></div>
        
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder={t.search} 
            className="pl-10 pr-4 py-1.5 w-48 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <button 
          onClick={toggleDarkMode}
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all"
        >
          {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-600" />}
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-slate-800 cursor-pointer group">
          <div className="text-right hidden sm:block leading-tight">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{profile.name}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{t.plan}</p>
          </div>
          <div className="relative" onClick={() => setIsPreviewOpen(true)}>
            <img 
              src={profile.imageUrl} 
              alt="Profile" 
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-gray-100 dark:ring-slate-800 group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
              <Maximize2 size={12} className="text-white" />
            </div>
          </div>
          <ChevronDown size={14} className="text-gray-400 hidden xs:block" />
        </div>
      </div>

      {/* Image Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative max-w-lg w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full border border-white/20 backdrop-blur-md"
            >
              <X size={24} />
            </button>
            <div className="bg-white dark:bg-slate-800 p-2 rounded-[32px] shadow-2xl ring-4 ring-white/10 overflow-hidden">
              <img 
                src={profile.imageUrl} 
                alt="Profile Large" 
                className="w-full h-auto max-h-[70vh] rounded-[24px] object-cover shadow-inner"
              />
            </div>
            <div className="mt-6 text-center">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{profile.name}</h2>
              <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mt-1">{profile.role}</p>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setIsPreviewOpen(false)} />
        </div>
      )}
    </header>
  );
};

export default Header;
