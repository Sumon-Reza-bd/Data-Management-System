
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, Layers, ArrowUp } from 'lucide-react';

import { 
  AppTab, ThemeType, LanguageType, PayrollProfile, Reminder, 
  Transaction, AttendanceRecord, BillRecord, BettingRecord, 
  LeaveRecord, SavingsGoal, SavingsRecord, SalaryHistoryItem,
  LeaveType
} from './types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import FinancialInfoView from './components/FinancialInfoView';
import PayrollInfoView from './components/PayrollInfoView';
import AttendanceView from './components/AttendanceView';
import LeaveInfoView from './components/LeaveInfoView';
import SavingsInfoView from './components/SavingsInfoView';
import BillInfoView from './components/BillInfoView';
import BettingInfoView from './components/BettingInfoView';
import RemindersView from './components/RemindersView';
import SettingsView from './components/SettingsView';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  // Global State
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [showWelcome, setShowWelcome] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [theme, setTheme] = useState<ThemeType>('light');
  const [language, setLanguage] = useState<LanguageType>('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);

  const [bills, setBills] = useState<BillRecord[]>([]);

  const [bettingRecords, setBettingRecords] = useState<BettingRecord[]>([]);

  const [leaveQuotas, setLeaveQuotas] = useState<LeaveType[]>([
    { id: 'casual', type: 'Casual Leave', total: 10, color: 'bg-indigo-600' },
    { id: 'medical', type: 'Medical Leave', total: 14, color: 'bg-rose-600' },
    { id: 'annual', type: 'Annual Leave', total: 15, color: 'bg-emerald-600' },
  ]);

  const [leaveHistory, setLeaveHistory] = useState<LeaveRecord[]>([]);

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([
    { id: '1', name: 'New Laptop', plan: 'Monthly Savings', targetAmount: 150000, currentAmount: 45000, maturityValue: 155000, color: 'indigo', monthlyDeposit: 5000, years: 2, profitPercent: 5, startDate: '2024-01-01', maturityDate: '2026-01-01' },
  ]);

  const [savingsRecords, setSavingsRecords] = useState<SavingsRecord[]>([]);

  const [salaryHistory, setSalaryHistory] = useState<SalaryHistoryItem[]>([
    { id: '1', year: 2023, inc: 0, amt: 0, total: 80000 },
    { id: '2', year: 2024, inc: 6.6, amt: 4950, total: 84950 },
  ]);

  // User Profile State
  const [profile, setProfile] = useState<PayrollProfile>({
    name: 'Sumon Sterling',
    email: 'sumon.sterlingbd@gmail.com',
    role: 'Senior Developer',
    department: 'Software Engineering',
    employeeId: 'EMP-2024-001',
    grossSalary: 31083,
    baseDeduction: 2450,
    basicSalary: 19089,
    houseRent: 9545,
    medical: 750,
    conveyance: 450,
    food: 1250,
    attendanceBonus: 925,
    tiffinBillDays: 25,
    tiffinRate: 50,
    yearlyBonus: 20722,
    eidBonus: 19089,
    imageUrl: 'https://picsum.photos/seed/user/200/200'
  });

  // Supabase Sync Logic
  const syncData = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return;
    setIsSyncing(true);
    try {
      const dataToSave = {
        transactions,
        reminders,
        attendanceList,
        bills,
        bettingRecords,
        leaveQuotas,
        leaveHistory,
        savingsGoals,
        savingsRecords,
        salaryHistory,
        profile
      };

      const { error } = await supabase
        .from('user_data')
        .upsert({ 
          id: user.id, 
          email: user.email || profile.email,
          data: dataToSave,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Sync Error:', message);
    } finally {
      setIsSyncing(false);
    }
  }, [user, transactions, reminders, attendanceList, bills, bettingRecords, leaveQuotas, leaveHistory, savingsGoals, savingsRecords, salaryHistory, profile]);

  const loadData = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data?.data) {
        const d = data.data;
        if (d.transactions) setTransactions(d.transactions);
        if (d.reminders) setReminders(d.reminders);
        if (d.attendanceList) setAttendanceList(d.attendanceList);
        if (d.bills) setBills(d.bills);
        if (d.bettingRecords) setBettingRecords(d.bettingRecords);
        if (d.leaveQuotas) setLeaveQuotas(d.leaveQuotas);
        if (d.leaveHistory) setLeaveHistory(d.leaveHistory);
        if (d.savingsGoals) setSavingsGoals(d.savingsGoals);
        if (d.savingsRecords) setSavingsRecords(d.savingsRecords);
        if (d.salaryHistory) setSalaryHistory(d.salaryHistory);
        if (d.profile) setProfile(d.profile);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Load Error:', message);
    }
  }, []);

  const handleContinue = async () => {
    if (!isSupabaseConfigured) {
      setShowWelcome(false);
      return;
    }

    setIsAuthLoading(true);
    try {
      // Try anonymous sign in
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        if (error.message.includes('Anonymous sign-ins are disabled')) {
          console.warn('Anonymous sign-ins are disabled in Supabase. Data will not be synced.');
          showToast(language === 'en' ? 'Sync disabled: Enable anonymous auth in Supabase' : 'সিঙ্ক নিষ্ক্রিয়: সুপাবেজে অ্যানোনিমাস অথ এনাবল করুন', 'info');
        } else {
          throw error;
        }
      } else if (data.user) {
        setUser(data.user);
        await loadData(data.user.id);
        showToast(language === 'en' ? 'Cloud Sync Active' : 'ক্লাউড সিঙ্ক সক্রিয়', 'success');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Auth Error:', message);
      
      if (message === 'Failed to fetch') {
        showToast(
          language === 'en' 
            ? 'Connection Error: Please check your internet or VPN. Supabase might be blocked.' 
            : 'সংযোগ ত্রুটি: আপনার ইন্টারনেট বা ভিপিএন চেক করুন। সুপাবেস ব্লক হতে পারে।', 
          'error'
        );
      } else {
        showToast(message, 'error');
      }
    } finally {
      setIsAuthLoading(false);
      setShowWelcome(false);
    }
  };

  // Auto-sync on data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) syncData();
    }, 2000); // Debounce sync
    return () => clearTimeout(timer);
  }, [syncData, user]);

  // Check current session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured) {
        setIsAuthLoading(false);
        return;
      }
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user) {
          setUser(session.user);
          await loadData(session.user.id);
          setShowWelcome(false);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Session Check Error:', message);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkSession();
  }, [loadData]);

  // Toast System
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Transaction Handlers
  const handleAddTransaction = (tx: Omit<Transaction, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newTx = { ...tx, id };
    setTransactions(prev => [newTx, ...prev]);
    showToast(language === 'en' ? 'Transaction added!' : 'লেনদেন যোগ করা হয়েছে!', 'success');
    return id;
  };

  const handleEditTransaction = (tx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t));
    showToast(language === 'en' ? 'Transaction updated!' : 'লেনদেন আপডেট করা হয়েছে!', 'success');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast(language === 'en' ? 'Transaction deleted!' : 'লেনদেন মুছে ফেলা হয়েছে!', 'success');
  };

  // Apply theme to body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const sidebarLanguage = language === 'en' ? 'English' : 'বাংলা';

  // Render Active View
  const renderView = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return (
          <DashboardView 
            language={language} 
            profile={profile}
            transactions={transactions}
            savingsGoals={savingsGoals}
            attendanceList={attendanceList}
            reminders={reminders}
          />
        );
      case AppTab.FINANCIAL:
        return (
          <FinancialInfoView 
            language={language} 
            theme={theme} 
            transactions={transactions} 
            onAdd={handleAddTransaction}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        );
      case AppTab.SALARY_INFO:
        return (
          <PayrollInfoView 
            payrollProfile={profile} 
            setPayrollProfile={setProfile} 
            salaryHistory={salaryHistory}
            setSalaryHistory={setSalaryHistory}
            showToast={showToast}
          />
        );
      case AppTab.ATTENDANCE:
        return (
          <AttendanceView 
            language={language} 
            theme={theme}
            activitiesList={attendanceList}
            setActivitiesList={setAttendanceList}
            showToast={showToast}
          />
        );
      case AppTab.LEAVE_INFO:
        return (
          <LeaveInfoView 
            language={language} 
            theme={theme}
            leaveQuotas={leaveQuotas}
            setLeaveQuotas={setLeaveQuotas}
            leaveHistory={leaveHistory}
            setLeaveHistory={setLeaveHistory}
            showToast={showToast}
          />
        );
      case AppTab.SAVINGS:
        return (
          <SavingsInfoView 
            language={language} 
            theme={theme} 
            goals={savingsGoals}
            records={savingsRecords}
            setGoals={setSavingsGoals}
            setRecords={setSavingsRecords}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            showToast={showToast}
          />
        );
      case AppTab.BILL:
        return (
          <BillInfoView 
            language={language} 
            theme={theme}
            bills={bills}
            setBills={setBills}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            showToast={showToast}
          />
        );
      case AppTab.BETTING:
        return (
          <BettingInfoView 
            language={language} 
            theme={theme}
            records={bettingRecords}
            setRecords={setBettingRecords}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            showToast={showToast}
          />
        );
      case AppTab.REMINDERS:
        return <RemindersView language={sidebarLanguage} reminders={reminders} setReminders={setReminders} showToast={showToast} />;
      case AppTab.SETTINGS:
        return (
          <SettingsView 
            language={language} 
            theme={theme} 
            setLanguage={setLanguage} 
            setTheme={setTheme}
            profile={profile}
            setProfile={setProfile}
            onLogout={() => {}}
            showToast={showToast}
          />
        );
      default:
        return <DashboardView language={language} />;
    }
  };

  const handleTabSelect = (tab: AppTab) => {
    setActiveTab(tab);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  };

  // Scroll to top when tab changes (Effect as backup)
  useEffect(() => {
    const resetScroll = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    };

    resetScroll();
    // Double check after animation frame to ensure DOM updated
    const rafId = requestAnimationFrame(resetScroll);
    return () => cancelAnimationFrame(rafId);
  }, [activeTab]);

  // Handle scroll to show/hide "Scroll to Top" button
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 300);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block sticky top-0 h-screen z-30">
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={handleTabSelect} 
          language={sidebarLanguage}
          onLogout={() => {}}
        />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed top-0 left-0 bottom-0 w-72 z-50 md:hidden flex flex-col"
            >
              <Sidebar 
                activeTab={activeTab} 
                onSelectTab={(tab) => {
                  handleTabSelect(tab);
                  setIsMobileMenuOpen(false);
                }} 
                isMobile
                language={sidebarLanguage}
                onLogout={() => setIsMobileMenuOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <Header 
          activeTab={activeTab} 
          language={language} 
          setLanguage={setLanguage} 
          theme={theme} 
          setTheme={setTheme} 
          profile={profile}
          isSyncing={isSyncing}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 bg-white dark:bg-slate-950 transition-colors duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
              className={`
                pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border min-w-[280px] max-w-md
                ${toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : ''}
                ${toast.type === 'error' ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300' : ''}
                ${toast.type === 'info' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300' : ''}
              `}
            >
              <div className="shrink-0">
                {toast.type === 'success' && <CheckCircle2 size={20} />}
                {toast.type === 'error' && <AlertCircle size={20} />}
                {toast.type === 'info' && <Info size={20} />}
              </div>
              <p className="text-[13px] font-bold flex-1">{toast.message}</p>
              <button 
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 z-[150] w-12 h-12 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-90 border border-white/20"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-indigo-600"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md text-center text-white space-y-8"
            >
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl">
                  <Layers size={40} className="text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter">Welcome Back!</h1>
                <p className="text-indigo-100 text-sm md:text-base font-medium max-w-xs mx-auto leading-relaxed">
                  Keep your data organized using our AI-powered management dashboard and tracking system.
                </p>
              </div>

              {/* Pagination indicators from image */}
              <div className="flex justify-center items-center gap-2">
                <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-8 h-1 bg-white/30 rounded-full"></div>
              </div>

              <button 
                onClick={handleContinue}
                disabled={isAuthLoading}
                className="w-full max-w-xs mx-auto py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isAuthLoading && <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />}
                {isAuthLoading ? (language === 'en' ? 'Connecting...' : 'সংযোগ হচ্ছে...') : 'Continue'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
