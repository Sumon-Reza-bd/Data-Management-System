
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ViewType, Transaction, SavingsGoal, SavingsRecord, Reminder, LanguageType, ThemeType, UserProfile, AppTab, LeaveType, LeaveRecord, PayrollProfile, SalaryHistoryItem, BillRecord, BettingRecord } from './types';
import { ICONS } from './constants';
import { 
  MOCK_SAVINGS, 
  MOCK_TRANSACTIONS, MOCK_REMINDERS
} from './mockData';
import Sidebar from './Sidebar';
import Header from './Header';
import { FinancialInfoView } from './FinancialInfoView';
import SavingsView from './SavingsInfoView';
import PayrollView from './PayrollInfoView';
import { DashboardView } from './DashboardView';
import BillsView from './BillInfoView';
import BettingView from './BettingInfoView';
import RemindersView from './RemindersView';
import { SettingsView } from './SettingsView';
import AttendanceView from './AttendanceView';
import LeaveInfoView from './LeaveInfoView';
import { t } from './translations';
import { supabase } from './supabaseClient';
import { Lock, ChevronRight, Layers, Eye, EyeOff, CheckCircle2, AlertCircle, X as CloseIcon } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const INITIAL_LEAVE_QUOTAS: LeaveType[] = [
  { id: 'casual', type: 'Casual Leave', total: 10, color: 'bg-amber-500' },
  { id: 'medical', type: 'Medical Leave', total: 14, color: 'bg-rose-500' },
  { id: 'annual', type: 'Annual Leave', total: 20, color: 'bg-blue-600' },
];

const CACHE_KEY = 'finance_hub_data_cache';

const User = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const LoginView: React.FC<{ onLogin: (user: any) => void, language: LanguageType }> = ({ onLogin, language }) => {
  const [formData, setFormData] = useState({ name: '', email: 'admin@example.com', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuthSubmit = async () => {
    setErrorMessage(null);
    if (!formData.password.trim()) {
      setErrorMessage(t('fillAllFields', language));
      return;
    }

    setLoading(true);
    try {
      // Hardcoded bypass for the user as requested
      if (formData.password === '123456') {
        onLogin({ email: formData.email, id: 'admin-id', user_metadata: { full_name: 'Admin User' } });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      if (error) throw error;
      if (data.user) onLogin(data.user);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans bg-white selection:bg-blue-100">
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
          -webkit-text-fill-color: #334155 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#0088ff] to-[#0077ee] flex-col items-center justify-center p-12 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="max-w-xl space-y-2 relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[28px] flex items-center justify-center mb-1 border border-white/30 shadow-2xl animate-float">
            <Layers size={42} className="text-white drop-shadow-md" strokeWidth={2.5} />
          </div>
          
          <h1 className="text-6xl font-black tracking-tight leading-none drop-shadow-sm mb-4">Welcome Back!</h1>
          <p className="text-[14px] font-medium text-blue-50/90 leading-relaxed mx-auto whitespace-nowrap">
            Keep your data organized using our AI-powered<br />management dashboard and tracking system.
          </p>
          
          <div className="pt-6 flex items-center justify-center gap-2">
            <div className="w-12 h-1 bg-blue-300/40 rounded-full" />
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <div className="w-12 h-1 bg-blue-300/40 rounded-full" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white animate-in fade-in duration-500">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-3">
              <h2 className="text-[32px] font-black text-[#0088ff] uppercase tracking-tight leading-none">
                User Login
              </h2>
            </div>
            <div className="w-16 h-1.5 bg-[#0088ff] mx-auto rounded-full" />
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-xs rounded-2xl font-bold border border-rose-100 animate-in shake duration-300">
              {errorMessage}
            </div>
          )}

          <div className="space-y-6">
            <div className="relative">
              <label className="absolute -top-2.5 left-6 px-2 bg-white text-[#0088ff] text-[10px] font-black uppercase tracking-widest z-10">
                Password
              </label>
              <div className="flex items-center bg-white border border-blue-200 rounded-full px-6 py-3.5 focus-within:border-[#0088ff] focus-within:ring-4 focus-within:ring-blue-50 transition-all group">
                <Lock className="text-blue-300 mr-3 shrink-0 group-focus-within:text-[#0088ff] transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••••••••••" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  className="w-full bg-white text-slate-700 font-bold outline-none text-sm placeholder:text-slate-300" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-blue-400 hover:text-[#0088ff] transition-colors ml-2 focus:outline-none p-1 rounded-md hover:bg-blue-50 dark:hover:bg-slate-800"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={handleAuthSubmit} 
                disabled={loading} 
                className="w-full bg-[#0099ff] hover:bg-[#0088ff] text-white font-black py-4 rounded-full shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-sm uppercase tracking-widest">
                      {t('continue', language)}
                    </span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [language, setLanguage] = useState<LanguageType>('en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<AppTab>(() => {
    const saved = localStorage.getItem('financeHubActiveTab');
    return (saved as AppTab) || AppTab.DASHBOARD;
  });

  useEffect(() => {
    localStorage.setItem('financeHubActiveTab', activeView);
  }, [activeView]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [theme, setTheme] = useState<ThemeType>('light');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  const mainContentRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'User', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sumon' });
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(MOCK_SAVINGS);
  const [savingsRecords, setSavingsRecords] = useState<SavingsRecord[]>([]);
  const [billRecords, setBillRecords] = useState<BillRecord[]>([]);
  const [bettingRecords, setBettingRecords] = useState<BettingRecord[]>([]);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [leaveQuotas, setLeaveQuotas] = useState<LeaveType[]>(INITIAL_LEAVE_QUOTAS);
  const [leaveHistory, setLeaveHistory] = useState<LeaveRecord[]>([]);
  const [payrollProfile, setPayrollProfile] = useState<PayrollProfile>({
    name: 'Finance User',
    role: 'Product Designer',
    department: 'UI/UX Team',
    employeeId: 'D-8842',
    grossSalary: 31083,
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
    baseDeduction: 2450,
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sumon'
  });
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistoryItem[]>([
    { id: '1', year: 2024, inc: 7, amt: 886, total: 15386 },
    { id: '2', year: 2023, inc: 0, amt: 0, total: 14500 }
  ]);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeView]);

  const loadDataFromCache = useCallback(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const c = JSON.parse(cached);
        if (c.userProfile) setUserProfile(c.userProfile);
        if (c.transactions) setTransactions(c.transactions);
        if (c.reminders) setReminders(c.reminders);
        if (c.savingsGoals) setSavingsGoals(c.savingsGoals);
        if (c.savingsRecords) setSavingsRecords(c.savingsRecords);
        if (c.billRecords) setBillRecords(c.billRecords);
        if (c.bettingRecords) setBettingRecords(c.bettingRecords);
        if (c.attendanceList) setAttendanceList(c.attendanceList);
        if (c.leaveQuotas) setLeaveQuotas(c.leaveQuotas);
        if (c.leaveHistory) setLeaveHistory(c.leaveHistory);
        if (c.payrollProfile) setPayrollProfile(c.payrollProfile);
        if (c.salaryHistory) setSalaryHistory(c.salaryHistory);
        if (c.theme) setTheme(c.theme);
        if (c.language) setLanguage(c.language);
      } catch (e) {
        console.error("Cache parsing error", e);
      }
    }
  }, []);

  const syncToSupabase = useCallback(async (data: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    setIsSyncing(true);
    const { error } = await supabase
      .from('user_data')
      .upsert({ 
        id: session.user.id, 
        content: data,
        updated_at: new Date().toISOString()
      });
    
    if (error) console.error("Database Sync Fail:", error.message);
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    loadDataFromCache();

    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setIsSyncing(true);
        const { data } = await supabase
          .from('user_data')
          .select('content')
          .eq('id', session.user.id)
          .single();

        let loadedUserProfile = null;

        if (data && data.content) {
          const c = data.content;
          if (c.userProfile) loadedUserProfile = c.userProfile;
          setTransactions(c.transactions || []);
          setReminders(c.reminders || []);
          setSavingsGoals(c.savingsGoals || []);
          setSavingsRecords(c.savingsRecords || []);
          setBillRecords(c.billRecords || []);
          setBettingRecords(c.bettingRecords || []);
          setAttendanceList(c.attendanceList || []);
          setLeaveQuotas(c.leaveQuotas || INITIAL_LEAVE_QUOTAS);
          setLeaveHistory(c.leaveHistory || []);
          setPayrollProfile(c.payrollProfile || payrollProfile);
          setSalaryHistory(c.salaryHistory || []);
          if (c.theme) setTheme(c.theme);
          if (c.language) setLanguage(c.language);
          
          localStorage.setItem(CACHE_KEY, JSON.stringify(c));
        }
        
        if (loadedUserProfile) {
          setUserProfile(loadedUserProfile);
        } else {
          const name = session.user.user_metadata?.full_name || 'Finance User';
          setUserProfile({ 
            name, 
            email: session.user.email || '', 
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}` 
          });
        }

        setIsSyncing(false);
        setIsInitialLoadComplete(true);
      }
    };

    initData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setIsInitialLoadComplete(false);
        localStorage.removeItem(CACHE_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadDataFromCache]);

  useEffect(() => {
    if (!isAuthenticated || !isInitialLoadComplete) return;
    
    const timeout = setTimeout(() => {
      syncToSupabase({
        userProfile, 
        transactions, reminders, savingsGoals, savingsRecords, billRecords, bettingRecords,
        attendanceList, leaveQuotas, leaveHistory, payrollProfile, salaryHistory, theme, language
      });
    }, 1000); 

    return () => clearTimeout(timeout);
  }, [
    userProfile, 
    transactions, reminders, savingsGoals, savingsRecords, billRecords, bettingRecords,
    attendanceList, leaveQuotas, leaveHistory, payrollProfile, salaryHistory, theme, language, 
    isAuthenticated, isInitialLoadComplete, syncToSupabase
  ]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  }, [theme]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsInitialLoadComplete(false);
    setActiveView(AppTab.DASHBOARD);
    localStorage.removeItem('financeHubActiveTab');
    localStorage.removeItem(CACHE_KEY);
  };

  const handleAddTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    setTransactions(prev => [{ id: newId, ...tx }, ...prev]);
    showToast(language === 'bn' ? 'সফলভাবে যোগ করা হয়েছে!' : 'Added successfully!', 'success');
    return newId;
  };

  const handleEditTransaction = (tx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t));
    showToast(language === 'bn' ? 'সফলভাবে আপডেট করা হয়েছে!' : 'Updated successfully!', 'success');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast(language === 'bn' ? 'সফলভাবে ডিলিট করা হয়েছে!' : 'Deleted successfully!', 'success');
  };

  if (!isAuthenticated) return <LoginView onLogin={() => {
    setIsAuthenticated(true);
    setActiveView(AppTab.DASHBOARD);
  }} language={language} />;

  const renderView = () => {
    const commonProps = { 
      language: language === 'bn' ? ('বাংলা' as const) : ('English' as const),
      showToast
    };
    
    switch (activeView) {
      case AppTab.DASHBOARD: 
        return <DashboardView {...commonProps} profile={userProfile} transactions={transactions} savingsGoals={savingsGoals} attendanceList={attendanceList} reminders={reminders} />;
      case AppTab.FINANCIAL: 
        return <FinancialInfoView transactions={transactions} onAdd={handleAddTransaction} onEdit={handleEditTransaction} onDelete={handleDeleteTransaction} />;
      case AppTab.SAVINGS: 
        return (
          <SavingsView 
            goals={savingsGoals} 
            records={savingsRecords} 
            setGoals={setSavingsGoals} 
            setRecords={setSavingsRecords} 
            onAddTransaction={handleAddTransaction} 
            onEditTransaction={handleEditTransaction} 
            onDeleteTransaction={handleDeleteTransaction} 
            showToast={showToast}
            language={language}
          />
        );
      case AppTab.SALARY_INFO: 
        return <PayrollView payrollProfile={payrollProfile} setPayrollProfile={setPayrollProfile} salaryHistory={salaryHistory} setSalaryHistory={setSalaryHistory} showToast={showToast} />;
      case AppTab.ATTENDANCE:
        return <AttendanceView activitiesList={attendanceList} setActivitiesList={setAttendanceList} showToast={showToast} />;
      case AppTab.LEAVE_INFO:
        return <LeaveInfoView leaveQuotas={leaveQuotas} setLeaveQuotas={setLeaveQuotas} leaveHistory={leaveHistory} setLeaveHistory={setLeaveHistory} showToast={showToast} />;
      case AppTab.BILL: 
        return <BillsView bills={billRecords} setBills={setBillRecords} onAddTransaction={handleAddTransaction} onEditTransaction={handleEditTransaction} onDeleteTransaction={handleDeleteTransaction} showToast={showToast} />;
      case AppTab.BETTING: 
        return <BettingView records={bettingRecords} setRecords={setBettingRecords} onAddTransaction={handleAddTransaction} onEditTransaction={handleEditTransaction} onDeleteTransaction={handleDeleteTransaction} showToast={showToast} />;
      case AppTab.REMINDERS: 
        return <RemindersView {...commonProps} reminders={reminders} setReminders={setReminders} />;
      case AppTab.SETTINGS: 
        return <SettingsView language={language} setLanguage={setLanguage} profile={{name: userProfile.name, email: userProfile.email, role: payrollProfile.role, imageUrl: userProfile.avatar}} setProfile={setUserProfile} onLogout={handleLogout} theme={theme} setTheme={setTheme} showToast={showToast} />;
      default: 
        return <DashboardView {...commonProps} profile={userProfile} transactions={transactions} savingsGoals={savingsGoals} attendanceList={attendanceList} reminders={reminders} />;
    }
  };

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      <aside className="hidden lg:flex w-56 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <Sidebar activeTab={activeView} onSelectTab={(tab) => setActiveView(tab)} language={language === 'bn' ? 'বাংলা' : 'English'} onLogout={handleLogout} />
      </aside>
      
      {/* Mobile Sidebar with improved overlay and transition */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-500 transition-transform">
            <Sidebar activeTab={activeView} onSelectTab={(tab) => { setActiveView(tab); setIsSidebarOpen(false); }} isMobile={true} language={language === 'bn' ? 'বাংলা' : 'English'} onLogout={handleLogout} />
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 -right-12 w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 shadow-lg border border-slate-100 dark:border-slate-700"
            >
              <ChevronRight size={24} className="rotate-180" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          activeTab={activeView} 
          onOpenMenu={() => setIsSidebarOpen(true)} 
          language={language === 'bn' ? 'বাংলা' : 'English'} 
          profile={{ name: userProfile.name, role: payrollProfile.role, imageUrl: userProfile.avatar }} 
          isSyncing={isSyncing} 
          theme={theme}
          setTheme={setTheme}
        />
        <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>

      {/* Toast Notifications Container */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right-full duration-300
              ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 
                toast.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400' : 
                'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'}
            `}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
            {toast.type === 'error' && <AlertCircle size={18} className="text-rose-500" />}
            {toast.type === 'info' && <AlertCircle size={18} className="text-blue-500" />}
            <span className="text-[12px] font-black uppercase tracking-tight">{toast.message}</span>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() { return <AppContent />; }
