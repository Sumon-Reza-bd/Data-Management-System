import React, { useMemo, useState } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Transaction, SavingsGoal, Reminder, LanguageType, AttendanceRecord, PayrollProfile } from '../types';
import { ICONS } from '../constants';
import { getBengaliMonthDetails, toBnDigits } from '../utils';

interface DashboardViewProps {
  language: LanguageType;
  profile?: PayrollProfile;
  transactions?: Transaction[];
  savingsGoals?: SavingsGoal[];
  attendanceList?: AttendanceRecord[];
  reminders?: Reminder[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  language, 
  profile = { name: 'User' } as PayrollProfile, 
  transactions = [], 
  savingsGoals = [], 
  attendanceList = [], 
  reminders = []
}) => {
  // Calendar States
  const [enCalendarDate, setEnCalendarDate] = useState(new Date());
  const [bnCalendarDate, setBnCalendarDate] = useState(new Date());
  const [selectedDateInfo, setSelectedDateInfo] = useState<{ en: string; bn: string } | null>(null);

  const translations = {
    en: {
      welcome: 'Welcome back,',
      overview: 'System Overview',
      monthlySpending: 'Monthly Spending',
      monthlyIncome: 'Monthly Income',
      savings: 'Active Savings',
      attendance: 'Attendance Rate',
      latestActivity: 'Latest Activity',
      activeReminders: 'Reminders',
      today: 'TODAY',
      noActivity: 'No Activity',
      noAlerts: 'No Alerts',
      overdue: 'OVERDUE',
      upcoming: 'UPCOMING',
      day: 'DAY',
      days: 'DAYS'
    },
    bn: {
      welcome: 'স্বাগতম,',
      overview: 'সিস্টেম ওভারভিউ',
      monthlySpending: 'মাসিক ব্যয়',
      monthlyIncome: 'মাসিক আয়',
      savings: 'সক্রিয় সঞ্চয়',
      attendance: 'উপস্থিতির হার',
      latestActivity: 'সাম্প্রতিক কার্যকলাপ',
      activeReminders: 'রিমাইন্ডার',
      today: 'আজ',
      noActivity: 'কোনো কার্যকলাপ নেই',
      noAlerts: 'কোনো সতর্কবার্তা নেই',
      overdue: 'অতিক্রান্ত',
      upcoming: 'আসন্ন',
      day: 'দিন',
      days: 'দিন'
    }
  };

  const t = translations[language];

  const formatCurrency = (val: number) => {
    const formatted = Math.abs(val).toLocaleString();
    const sign = val < 0 ? '-' : '';
    return language === 'en' ? `${sign}৳${formatted}` : `${sign}৳${toBnDigits(formatted)}`;
  };

  const getDayDiff = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const stats = useMemo(() => {
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const monthTxs = transactions.filter(tx => tx.date.startsWith(currentMonthStr));
    
    const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalSavings = (savingsGoals || []).reduce((s, g) => s + g.currentAmount, 0);
    
    // Calculate dynamic Attendance Rate for current month
    const currentMonthAttendance = (attendanceList || []).filter(a => a.date.startsWith(currentMonthStr));
    
    const relevantAttendance = currentMonthAttendance.filter(a => 
      ['On Time', 'Late', 'Absent', 'Out Missing'].includes(a.status)
    );
    const presentDays = currentMonthAttendance.filter(a => ['On Time', 'Late'].includes(a.status)).length;
    const attendanceRate = relevantAttendance.length > 0 
      ? Math.round((presentDays / relevantAttendance.length) * 100) 
      : 0;

    // Calculate overall savings progress
    const totalTarget = (savingsGoals || []).reduce((s, g) => s + g.targetAmount, 0);
    const savingsProgress = totalTarget > 0 
      ? Math.round((totalSavings / totalTarget) * 100) 
      : 0;

    return { 
      income, 
      expense, 
      totalSavings, 
      attendanceRate,
      savingsProgress 
    };
  }, [transactions, savingsGoals, attendanceList]);

  // Unified activity feed
  const activities = useMemo(() => {
    const txActivities = transactions.map(tx => ({
      id: `tx-${tx.id}`,
      type: 'transaction',
      category: tx.category,
      amount: tx.amount,
      date: tx.date,
      txType: tx.type as string,
      title: tx.description || tx.category
    }));

    return [...txActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  // English Calendar logic
  const englishDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const generateEnCalendarGrid = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const grid = [];
    for (let i = 0; i < firstDay; i++) grid.push(null);
    for (let i = 1; i <= lastDate; i++) grid.push(i);
    return grid;
  };

  // Bengali Calendar logic
  const bengaliDays = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র'];
  const generateBnCalendarGrid = (viewDate: Date) => {
    const details = getBengaliMonthDetails(viewDate);
    const firstOfBnMonth = new Date(viewDate);
    firstOfBnMonth.setDate(firstOfBnMonth.getDate() - (details.day - 1));
    firstOfBnMonth.setHours(0, 0, 0, 0);
    const firstDayOfWeek = firstOfBnMonth.getDay();
    const bnDayOffset = (firstDayOfWeek + 1) % 7; 
    const grid = [];
    for (let i = 0; i < bnDayOffset; i++) grid.push(null);
    for (let i = 1; i <= details.daysInMonth; i++) grid.push(i);
    return grid;
  };

  const navigateEnMonth = (offset: number) => {
    setEnCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const navigateBnMonth = (offset: number) => {
    setBnCalendarDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + (offset * 30));
      return next;
    });
  };

  const handleDateClick = (enDate: string, bnDate: string) => {
    setSelectedDateInfo({ en: enDate, bn: bnDate });
  };

  const enGrid = generateEnCalendarGrid(enCalendarDate);
  const bnGrid = generateBnCalendarGrid(bnCalendarDate);
  const bnInfo = getBengaliMonthDetails(bnCalendarDate);
  const today = new Date();
  const todayDetails = getBengaliMonthDetails(today);

  // Helper for progress bar classes to avoid JIT issues with dynamic strings
  const getProgressColor = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500';
      case 'rose': return 'bg-rose-500';
      case 'indigo': return 'bg-indigo-600';
      case 'blue': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  // Helper for dynamic card styling - Enhanced with border-2 and clearer colors
  const getCardThemedClasses = (color: string) => {
    switch (color) {
      case 'emerald': 
        return 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800 hover:border-emerald-500/50 shadow-emerald-600/5';
      case 'rose': 
        return 'bg-rose-50/50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800 hover:border-rose-500/50 shadow-rose-600/5';
      case 'indigo': 
        return 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800 hover:border-indigo-500/50 shadow-indigo-600/5';
      case 'blue': 
        return 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800 hover:border-blue-500/50 shadow-blue-600/5';
      default: 
        return 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50';
    }
  };

  const mainStats = [
    { 
      label: t.monthlyIncome, 
      value: stats.income, 
      icon: <ArrowUpRight size={18} />, 
      color: 'emerald',
      progress: stats.income > 0 ? 100 : 0
    },
    { 
      label: t.monthlySpending, 
      value: stats.expense, 
      icon: <ArrowDownRight size={18} />, 
      color: 'rose',
      progress: stats.income > 0 ? Math.round(Math.min((stats.expense / stats.income) * 100, 100)) : (stats.expense > 0 ? 100 : 0) 
    },
    { 
      label: t.savings, 
      value: stats.totalSavings, 
      icon: <DollarSign size={18} />, 
      color: 'indigo',
      progress: stats.savingsProgress 
    },
    { 
      label: t.attendance, 
      value: `${stats.attendanceRate}%`, 
      icon: (
        <div className="relative">
          <ICONS.Clock size={18} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse border border-white dark:border-slate-900" />
        </div>
      ), 
      color: 'blue',
      progress: stats.attendanceRate 
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Updated Header Layout: Welcome on Left, Overview on Right */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {t.welcome} <span className="text-indigo-600">{profile.name}</span>
        </h2>
        <p className="text-[10px] md:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] sm:mb-1">
          {t.overview}
        </p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Stats */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          {mainStats.map((stat, i) => (
            <div 
              key={i} 
              className={`p-3.5 rounded-2xl border-2 shadow-sm flex flex-col justify-between group transition-all duration-300 min-h-[125px] ${getCardThemedClasses(stat.color)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col min-w-0">
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 text-${stat.color}-600 dark:text-${stat.color}-400 truncate`}>
                    {stat.label}
                  </p>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight truncate">
                    {typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value}
                  </h3>
                </div>
                <div className={`w-8 h-8 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                  {stat.icon}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  <span>Status</span>
                  <span className={`text-${stat.color}-600`}>{stat.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                  <div 
                    className={`h-full ${getProgressColor(stat.color)} transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Calendars */}
        <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* English Calendar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-right duration-700">
            <div className="bg-indigo-600 py-2.5 px-4 flex items-center justify-between text-white">
              <button onClick={() => navigateEnMonth(-1)} className="hover:bg-white/10 p-1 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                {enCalendarDate.toLocaleString('default', { month: 'long' })} {enCalendarDate.getFullYear()}
              </h3>
              <button onClick={() => navigateEnMonth(1)} className="hover:bg-white/10 p-1 rounded-lg transition-colors"><ChevronRight size={16} /></button>
            </div>
            <div className="p-3 pt-4 pb-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {englishDays.map(day => (
                  <span key={day} className="text-[8px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 py-1 rounded-md text-center">{day}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
                {enGrid.map((day, i) => {
                  const isToday = day === today.getDate() && enCalendarDate.getMonth() === today.getMonth() && enCalendarDate.getFullYear() === today.getFullYear();
                  
                  let bnEquivalent = "";
                  if (day) {
                    const dateObj = new Date(enCalendarDate.getFullYear(), enCalendarDate.getMonth(), day);
                    const det = getBengaliMonthDetails(dateObj);
                    bnEquivalent = `${toBnDigits(det.day)} ${det.monthName} ${toBnDigits(det.year)}`;
                  }

                  return (
                    <div 
                      key={i} 
                      className="relative flex items-center justify-center h-7 w-full group/day cursor-pointer"
                      onClick={() => day && handleDateClick(
                        new Date(enCalendarDate.getFullYear(), enCalendarDate.getMonth(), day).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
                        bnEquivalent
                      )}
                    >
                      {day && (
                        <>
                          <div className={`absolute inset-0 m-auto w-7 h-7 rounded-lg transition-colors group-hover/day:bg-slate-100 dark:group-hover/day:bg-slate-800 ${isToday ? 'bg-indigo-600 shadow-md shadow-indigo-600/40' : ''}`} />
                          <span className={`text-[11px] font-black z-10 transition-colors ${isToday ? 'text-white' : 'text-slate-600 dark:text-slate-400 group-hover/day:text-indigo-600'}`}>
                            {day}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bengali Calendar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-right duration-700">
            <div className="bg-emerald-600 py-2.5 px-4 flex items-center justify-between text-white">
              <button onClick={() => navigateBnMonth(-1)} className="hover:bg-white/10 p-1 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
              <h3 className="text-[10px] font-black uppercase tracking-widest">{bnInfo.monthName} {toBnDigits(bnInfo.year)}</h3>
              <button onClick={() => navigateBnMonth(1)} className="hover:bg-white/10 p-1 rounded-lg transition-colors"><ChevronRight size={16} /></button>
            </div>
            <div className="p-3 pt-4 pb-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {bengaliDays.map(day => (
                  <span key={day} className="text-[8px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 py-1 rounded-md text-center">{day}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
                {bnGrid.map((day, i) => {
                  const isToday = day === todayDetails.day && bnInfo.month === todayDetails.month && bnInfo.year === todayDetails.year;
                  
                  let enEquivalent = "";
                  if (day) {
                    const firstOfBnMonth = new Date(bnCalendarDate);
                    const currentDetails = getBengaliMonthDetails(bnCalendarDate);
                    firstOfBnMonth.setDate(firstOfBnMonth.getDate() - (currentDetails.day - 1));
                    const dateObj = new Date(firstOfBnMonth);
                    dateObj.setDate(firstOfBnMonth.getDate() + (day - 1));
                    enEquivalent = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                  }

                  return (
                    <div 
                      key={i} 
                      className="relative flex items-center justify-center h-7 w-full group/day cursor-pointer"
                      onClick={() => day && handleDateClick(
                        enEquivalent,
                        `${toBnDigits(day)} ${bnInfo.monthName} ${toBnDigits(bnInfo.year)}`
                      )}
                    >
                      {day && (
                        <>
                          <div className={`absolute inset-0 m-auto w-7 h-7 rounded-lg transition-colors group-hover/day:bg-slate-100 dark:group-hover/day:bg-slate-800 ${isToday ? 'bg-emerald-600 shadow-md shadow-emerald-600/40' : ''}`} />
                          <span className={`text-[12px] font-black z-10 transition-colors ${isToday ? 'text-white' : 'text-slate-600 dark:text-slate-400 group-hover/day:text-emerald-600'}`}>
                            {toBnDigits(day)}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-6 shadow-sm overflow-hidden min-h-[300px] flex flex-col transition-all hover:border-indigo-200 dark:hover:border-indigo-800/50">
            <h3 className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 -mx-6 -mt-6 mb-6 px-6 py-3 bg-indigo-50/50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between uppercase tracking-tight">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> {t.latestActivity}
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full border border-emerald-100 dark:border-emerald-800">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
              </div>
            </h3>
            <div className="space-y-3 flex-1">
              {activities.length > 0 ? (
                activities.slice(0, 8).map(act => (
                  <div key={act.id} className={`p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/50 dark:border-slate-800 flex justify-between items-center border-l-4 ${
                    act.type === 'transaction' 
                      ? (act.txType === 'income' ? 'border-l-emerald-500' : 'border-l-rose-500') 
                      : (act.type === 'attendance' ? 'border-l-indigo-500' : 'border-l-amber-500')
                  } hover:translate-x-1 transition-transform`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        act.type === 'transaction' 
                          ? (act.txType === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600') 
                          : (act.type === 'attendance' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600')
                      }`}>
                        {act.type === 'transaction' ? (act.txType === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />) : <ICONS.Clock size={14} />}
                      </div>
                      <div>
                        <p className="text-[12px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{act.title}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{act.date} • {act.category}</p>
                      </div>
                    </div>
                    {act.amount !== null && (
                      <span className={`text-[13px] font-black ${act.txType === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {act.txType === 'income' ? '+' : '-'}{formatCurrency(act.amount)}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-10 opacity-50">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4">
                    <ArrowDownRight size={24} className="text-slate-400" />
                  </div>
                  <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">{t.noActivity}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6 shadow-sm overflow-hidden min-h-[300px] flex flex-col transition-all hover:border-emerald-200 dark:hover:border-emerald-800/50">
             <h3 className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 -mx-6 -mt-6 mb-6 px-6 py-3 bg-emerald-50/50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/50 flex items-center gap-2 uppercase tracking-tight">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> {t.activeReminders}
             </h3>
             <div className="space-y-4 flex-1">
               {reminders.filter(r => !r.completed).length > 0 ? (
                 reminders.filter(r => !r.completed).slice(0, 6).map(r => {
                   const dayDiff = getDayDiff(r.date);
                   const isOverdue = dayDiff < 0;
                   const absDiff = Math.abs(dayDiff);
                   
                   return (
                     <div key={r.id} className="flex items-start gap-4 group">
                       <div className={`w-1.5 h-10 rounded-full shrink-0 ${isOverdue ? 'bg-rose-500 animate-pulse' : (r.priority === 'high' ? 'bg-rose-500' : r.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500')}`} />
                       <div className="flex-1 min-w-0">
                         <p className="text-[12px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors">{r.title}</p>
                         <div className="flex items-center gap-2 mt-1">
                           <p className="text-[10px] font-bold text-slate-400">{r.date}</p>
                           {dayDiff === 0 ? (
                             <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase rounded border border-blue-100 dark:border-blue-800/50 flex items-center gap-0.5">
                               {t.today}
                             </span>
                           ) : (
                             <span className={`px-1.5 py-0.5 ${isOverdue ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50'} text-[8px] font-black uppercase rounded border flex items-center gap-0.5`}>
                               {isOverdue && <AlertCircle size={8} />}
                               {language === 'en' ? absDiff : toBnDigits(absDiff)} {absDiff === 1 ? t.day : t.days} {isOverdue ? t.overdue : t.upcoming}
                             </span>
                           )}
                         </div>
                       </div>
                     </div>
                   );
                 })
               ) : (
                 <div className="h-full flex flex-col items-center justify-center py-10 opacity-50">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4">
                      <ICONS.Clock size={20} className="text-slate-400" />
                    </div>
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">{t.noAlerts}</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>

      {selectedDateInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[320px] rounded-[32px] p-6 text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-[16px] font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">
              {language === 'en' ? 'Date Details' : 'তারিখের বিস্তারিত'}
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">English Date</p>
                <p className="text-[13px] font-black text-slate-800 dark:text-white">{selectedDateInfo.en}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">বাংলা তারিখ</p>
                <p className="text-[15px] font-black text-slate-800 dark:text-white">{selectedDateInfo.bn}</p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedDateInfo(null)}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all active:scale-95"
            >
              {language === 'en' ? 'Close' : 'বন্ধ করুন'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
