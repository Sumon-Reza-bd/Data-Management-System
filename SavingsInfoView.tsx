
import React, { useState, useMemo, useEffect } from 'react';
import { 
  PiggyBank, 
  Plus, 
  X, 
  Pencil, 
  Trash2, 
  Save,
  History,
  Percent,
  AlertTriangle,
  TrendingUp,
  Calculator,
  Wallet,
  Filter,
  Check,
  FileSpreadsheet,
  Upload,
  AlertCircle,
  CalendarDays,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { SavingsGoal, SavingsRecord, Transaction, LanguageType } from './types';
import { t } from './translations';

interface SavingsInfoViewProps {
  goals: SavingsGoal[];
  records: SavingsRecord[];
  setGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>;
  setRecords: React.Dispatch<React.SetStateAction<SavingsRecord[]>>;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => string;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  language: LanguageType;
}

const SavingsInfoView: React.FC<SavingsInfoViewProps> = ({ 
  goals, 
  records, 
  setGoals, 
  setRecords,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  showToast,
  language
}) => {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isBulkRecordModalOpen, setIsBulkRecordModalOpen] = useState(false);
  
  const [isDeleteGoalConfirmOpen, setIsDeleteGoalConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [isDeleteRecordConfirmOpen, setIsDeleteRecordConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<SavingsRecord | null>(null);

  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [editingRecord, setEditingRecord] = useState<SavingsRecord | null>(null);

  const [historyGoalFilter, setHistoryGoalFilter] = useState<string>('all');

  const [goalForm, setGoalForm] = useState({
    name: '',
    monthlyDeposit: '', 
    years: '',
    profitPercent: '', 
    targetAmount: '', 
    maturityValue: '', 
    color: '#6366f1',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [recordForm, setRecordForm] = useState({
    goalId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const [bulkInput, setBulkInput] = useState('');
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [bulkGoalId, setBulkGoalId] = useState('');

  useEffect(() => {
    if (!bulkInput.trim()) {
      setBulkPreview([]);
      return;
    }
    const lines = bulkInput.trim().split('\n');
    const parsed: any[] = [];

    lines.slice(0, 50).forEach(line => {
      let parts = line.split('\t');
      if (parts.length < 2) parts = line.split('  ').filter(p => p.trim().length > 0);
      
      if (parts.length >= 2) {
        let datePart = parts[0].trim();
        let amountPart = parts[1].trim().replace(/,/g, '');
        let notePart = parts[2] ? parts[2].trim() : '';

        const isValidDate = !isNaN(new Date(datePart).getTime());
        const amount = parseFloat(amountPart);

        if (isValidDate && !isNaN(amount)) {
          parsed.push({
            amount,
            date: new Date(datePart).toISOString().split('T')[0],
            note: notePart || 'Bulk Deposit'
          });
        }
      }
    });
    setBulkPreview(parsed);
  }, [bulkInput]);

  useEffect(() => {
    const P = parseFloat(goalForm.monthlyDeposit);
    const annualRate = parseFloat(goalForm.profitPercent);
    const yrs = parseFloat(goalForm.years);
    
    if (!isNaN(P) && !isNaN(annualRate) && !isNaN(yrs) && P > 0 && yrs > 0) {
      const totalMonths = yrs * 12;
      const monthlyRate = (annualRate / 100) / 12;
      
      let runningBalance = 0;
      let totalInvested = 0;

      for (let month = 1; month <= totalMonths; month++) {
        runningBalance += P;
        totalInvested += P;
        const monthlyInterest = runningBalance * monthlyRate;
        runningBalance += monthlyInterest;
      }
      
      setGoalForm(prev => ({ 
        ...prev, 
        targetAmount: Math.round(totalInvested).toString(),
        maturityValue: Math.round(runningBalance).toString() 
      }));
    } else {
      setGoalForm(prev => ({ 
        ...prev, 
        targetAmount: '',
        maturityValue: '' 
      }));
    }
  }, [goalForm.monthlyDeposit, goalForm.profitPercent, goalForm.years]);

  const processedHistory = useMemo(() => {
    const sortedOldestFirst = [...records].sort((a, b) => a.date.localeCompare(b.date));
    
    const goalTrackers: Record<string, { balance: number }> = {};
    goals.forEach(g => { goalTrackers[g.id] = { balance: 0 }; });

    const results = sortedOldestFirst.map(record => {
      const goal = goals.find(g => g.id === record.goalId);
      if (!goal) return { ...record, stepProfit: 0, runningBalance: record.amount };

      if (!goalTrackers[goal.id]) goalTrackers[goal.id] = { balance: 0 };
      
      const prevBalance = goalTrackers[goal.id].balance;
      const monthlyRate = (goal.profitPercent / 100) / 12;
      
      const balanceAfterDeposit = prevBalance + record.amount;
      const profitThisStep = balanceAfterDeposit * monthlyRate;
      const endBalance = balanceAfterDeposit + profitThisStep;

      goalTrackers[goal.id].balance = endBalance;

      return {
        ...record,
        stepProfit: Math.round(profitThisStep),
        runningBalance: Math.round(endBalance)
      };
    });

    return results.sort((a, b) => b.date.localeCompare(a.date));
  }, [records, goals]);

  const filteredProcessedHistory = useMemo(() => {
    if (historyGoalFilter === 'all') return processedHistory;
    return processedHistory.filter(r => r.goalId === historyGoalFilter);
  }, [processedHistory, historyGoalFilter]);

  const analytics = useMemo(() => {
    let totalDeposit = 0;
    let totalAccruedProfit = 0;
    let totalMaturityValue = 0;

    records.forEach(r => totalDeposit += r.amount);
    
    processedHistory.forEach(h => {
        totalAccruedProfit += (h as any).stepProfit;
    });

    const wealthPortfolio = totalDeposit + totalAccruedProfit;

    goals.forEach(goal => {
      totalMaturityValue += goal.maturityValue;
    });

    return {
      deposit: totalDeposit,
      profit: totalAccruedProfit,
      total: wealthPortfolio,
      projected: totalMaturityValue
    };
  }, [processedHistory, goals, records]);

  const handleSaveGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount || !goalForm.monthlyDeposit) return;

    const targetVal = parseFloat(goalForm.targetAmount);
    const maturityVal = parseFloat(goalForm.maturityValue);
    const monthlyDepositVal = parseFloat(goalForm.monthlyDeposit);
    const yearsVal = parseFloat(goalForm.years);
    const profitVal = parseFloat(goalForm.profitPercent);

    const calculateMaturityDate = (years: number, fromDate: string) => {
      const date = new Date(fromDate);
      date.setFullYear(date.getFullYear() + Math.floor(years));
      const months = Math.round((years % 1) * 12);
      if (months > 0) date.setMonth(date.getMonth() + months);
      return date.toISOString().split('T')[0];
    };

    if (editingGoal) {
      const sDate = goalForm.startDate || editingGoal.startDate || new Date().toISOString().split('T')[0];
      const mDate = calculateMaturityDate(yearsVal, sDate);
      
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? {
        ...g,
        name: goalForm.name,
        plan: `৳${goalForm.monthlyDeposit}/Mo`,
        targetAmount: targetVal,
        maturityValue: maturityVal,
        color: goalForm.color,
        monthlyDeposit: monthlyDepositVal,
        years: yearsVal,
        profitPercent: profitVal,
        maturityDate: mDate,
        startDate: sDate
      } : g));
      showToast?.('Account updated successfully!', 'success');
    } else {
      const sDate = goalForm.startDate || new Date().toISOString().split('T')[0];
      const mDate = calculateMaturityDate(yearsVal, sDate);
      
      const newGoal: SavingsGoal = {
        id: Math.random().toString(36).substr(2, 9),
        name: goalForm.name,
        plan: `৳${goalForm.monthlyDeposit}/Mo`,
        targetAmount: targetVal,
        currentAmount: 0,
        maturityValue: maturityVal,
        color: goalForm.color,
        monthlyDeposit: monthlyDepositVal,
        years: yearsVal,
        profitPercent: profitVal,
        startDate: sDate,
        maturityDate: mDate
      };
      setGoals(prev => [...prev, newGoal]);
      showToast?.('New account initialized!', 'success');
    }
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const handleSaveRecord = () => {
    const amt = parseFloat(recordForm.amount);
    if (!recordForm.goalId || isNaN(amt)) return;

    const selectedGoal = goals.find(g => g.id === recordForm.goalId);
    const description = `Savings Deposit: ${selectedGoal?.name || 'Account'} (${recordForm.note || 'Monthly'})`;

    if (editingRecord) {
      if (editingRecord.transactionId) {
        onEditTransaction({
          id: editingRecord.transactionId,
          type: 'expense',
          category: 'DPS',
          amount: amt,
          date: recordForm.date,
          description: description
        });
      }

      const oldAmt = editingRecord.amount;
      const oldGoalId = editingRecord.goalId;
      const newGoalId = recordForm.goalId;

      setRecords(prev => prev.map(r => r.id === editingRecord.id ? {
        ...r,
        goalId: newGoalId,
        amount: amt,
        date: recordForm.date,
        note: recordForm.note
      } : r));
      
      setGoals(prev => prev.map(g => {
        if (g.id === newGoalId) {
          const diff = oldGoalId === newGoalId ? amt - oldAmt : amt;
          return { ...g, currentAmount: g.currentAmount + diff };
        }
        if (g.id === oldGoalId && newGoalId !== oldGoalId) {
          return { ...g, currentAmount: Math.max(0, g.currentAmount - oldAmt) };
        }
        return g;
      }));
      showToast?.('Deposit record updated!', 'success');
    } else {
      const transactionId = onAddTransaction({
        type: 'expense',
        category: 'DPS',
        amount: amt,
        date: recordForm.date,
        description: description
      });

      const newRecord: SavingsRecord = {
        id: Math.random().toString(36).substr(2, 9),
        goalId: recordForm.goalId,
        amount: amt,
        date: recordForm.date,
        note: recordForm.note,
        transactionId
      };
      setRecords(prev => [newRecord, ...prev]);
      setGoals(prev => prev.map(g => g.id === recordForm.goalId ? { ...g, currentAmount: g.currentAmount + amt } : g));
      showToast?.('Deposit recorded successfully!', 'success');
    }
    setIsRecordModalOpen(false);
    setEditingRecord(null);
    setRecordForm({ goalId: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' });
  };

  const handleBulkImportRecords = () => {
    if (bulkPreview.length === 0 || !bulkGoalId) return;

    const selectedGoal = goals.find(g => g.id === bulkGoalId);
    if (!selectedGoal) return;

    const newRecords: SavingsRecord[] = [];
    let totalAddedAmount = 0;

    bulkPreview.forEach(item => {
      const description = `Savings Deposit: ${selectedGoal.name} (${item.note})`;
      const transactionId = onAddTransaction({
        type: 'expense',
        category: 'DPS',
        amount: item.amount,
        date: item.date,
        description: description
      });

      const newRecord: SavingsRecord = {
        id: Math.random().toString(36).substr(2, 9),
        goalId: bulkGoalId,
        amount: item.amount,
        date: item.date,
        note: item.note,
        transactionId
      };
      newRecords.push(newRecord);
      totalAddedAmount += item.amount;
    });

    setRecords(prev => [...newRecords, ...prev]);
    setGoals(prev => prev.map(g => g.id === bulkGoalId ? { ...g, currentAmount: g.currentAmount + totalAddedAmount } : g));
    
    setBulkInput('');
    setBulkPreview([]);
    setIsBulkRecordModalOpen(false);
    showToast?.(`${newRecords.length} deposits added successfully!`, 'success');
  };

  const confirmDeleteRecord = () => {
    if (recordToDelete) {
      if (recordToDelete.transactionId) {
        onDeleteTransaction(recordToDelete.transactionId);
      }
      setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
      setGoals(prev => prev.map(g => g.id === recordToDelete.goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - recordToDelete.amount) } : g));
      setIsDeleteRecordConfirmOpen(false);
      setRecordToDelete(null);
      showToast?.('Deposit record deleted!', 'success');
    }
  };

  const confirmDeleteGoal = () => {
    if (goalToDelete) {
      const linkedRecords = records.filter(r => r.goalId === goalToDelete);
      linkedRecords.forEach(r => {
        if (r.transactionId) onDeleteTransaction(r.transactionId);
      });

      setGoals(prev => prev.filter(g => g.id !== goalToDelete));
      setRecords(prev => prev.filter(r => r.goalId !== goalToDelete));
      setIsDeleteGoalConfirmOpen(false);
      setIsGoalModalOpen(false);
      setGoalToDelete(null);
      setEditingGoal(null);
      showToast?.('Account and all linked records deleted!', 'success');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTimePeriod = (totalMonths: number) => {
    const years = Math.floor(totalMonths / 12);
    const months = Math.round(totalMonths % 12);
    let result = '';
    if (years > 0) result += `${years}Y `;
    if (months > 0 || years === 0) result += `${months}M`;
    return result.trim();
  };

  // Helper component for the green dashed circle with white tick
  const VerifiedBadge = () => (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 bg-emerald-600 rounded-full border border-dashed border-emerald-300 shadow-sm transition-transform hover:scale-110">
      <Check size={10} strokeWidth={4} className="text-white" />
    </div>
  );

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Net Savings', value: analytics.deposit, icon: <Wallet size={20} />, color: 'from-blue-600 to-blue-800' },
          { label: 'Accrued Profit', value: Math.round(analytics.profit), icon: <TrendingUp size={20} />, color: 'from-emerald-500 to-emerald-700' },
          { label: 'Wealth Portfolio', value: Math.round(analytics.total), icon: <Calculator size={20} />, color: 'from-indigo-600 to-indigo-800' },
          { label: 'Projected Maturity', value: analytics.projected, icon: <TrendingUp size={20} />, color: 'from-violet-600 to-purple-800' }
        ].map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-[24px] bg-gradient-to-br ${stat.color} text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden group hover:scale-[1.02] transition-all`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              {stat.icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black tracking-tighter leading-none">৳{stat.value.toLocaleString()}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full" /> Portfolio Accounts
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => { 
                    setEditingGoal(null); 
                    setGoalForm({ name: '', monthlyDeposit: '', years: '', targetAmount: '', profitPercent: '', maturityValue: '', color: '#6366f1', startDate: new Date().toISOString().split('T')[0] }); 
                    setIsGoalModalOpen(true); 
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100 dark:border-indigo-800"
                >
                  <Plus size={14} /> Initialize Account
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
              {goals.length > 0 ? goals.map(goal => {
                const monthlyP = parseFloat(goal.plan.replace('৳', '').replace('/Mo', '')) || 1;
                const totalMonthsNeeded = Math.round(goal.targetAmount / monthlyP);
                const completedMonths = Math.min(Math.floor(goal.currentAmount / monthlyP), totalMonthsNeeded);
                const remainingMonths = Math.max(0, totalMonthsNeeded - completedMonths);
                const progressPercent = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);

                return (
                  <div 
                    key={goal.id} 
                    className="rounded-[32px] p-0 shadow-2xl relative overflow-hidden group transition-all hover:translate-y-[-6px] cursor-default border border-white/20 flex flex-col min-h-[280px]"
                    style={{ 
                      background: `linear-gradient(135deg, ${goal.color} 0%, #4c1d95 100%)`,
                      boxShadow: `0 20px 40px -10px ${goal.color}44`
                    }}
                  >
                    {/* Glass Overlay Effects & Wavy Patterns */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-[80px]" />
                      <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-500/20 rounded-full blur-[100px]" />
                      <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[60px]" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-black/10" />
                    </div>

                    <div className="p-5 flex-1 relative z-10 flex flex-col">
                      {/* Top Section */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-500">
                            <PiggyBank size={28} className="text-white" />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.25em] leading-none mb-1.5">Asset Portfolio</p>
                            <h4 className="text-[20px] font-black text-white tracking-tight truncate max-w-[200px] drop-shadow-md leading-tight">{goal.name}</h4>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { 
                              setEditingGoal(goal); 
                              setGoalForm({ 
                                name: goal.name, 
                                monthlyDeposit: goal.monthlyDeposit ? goal.monthlyDeposit.toString() : goal.plan.replace('৳', '').replace('/Mo', ''), 
                                years: goal.years ? goal.years.toString() : '', 
                                targetAmount: goal.targetAmount.toString(), 
                                profitPercent: goal.profitPercent ? goal.profitPercent.toString() : '', 
                                maturityValue: goal.maturityValue.toString(), 
                                color: goal.color,
                                startDate: goal.startDate || new Date().toISOString().split('T')[0]
                              }); 
                              setIsGoalModalOpen(true); 
                            }}
                            className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 backdrop-blur-md shadow-lg active:scale-90"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => { 
                              setGoalToDelete(goal.id); 
                              setIsDeleteGoalConfirmOpen(true); 
                            }}
                            className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 backdrop-blur-md shadow-lg active:scale-90"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Middle Section: Details Grid */}
                      <div className="grid grid-cols-2 gap-y-5 gap-x-6 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/10 rounded-xl"><Wallet size={16} className="text-white/70" /></div>
                          <div>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Available Balance</p>
                            <p className="text-[15px] font-black text-white leading-none">৳{goal.currentAmount.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/10 rounded-xl"><Target size={16} className="text-white/70" /></div>
                          <div>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Target Amount</p>
                            <p className="text-[15px] font-black text-white leading-none">৳{goal.targetAmount.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/10 rounded-xl"><CalendarDays size={16} className="text-white/70" /></div>
                          <div>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Investment Period</p>
                            <p className="text-[15px] font-black text-white leading-none">{goal.years} Years</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/10 rounded-xl"><TrendingUp size={16} className="text-white/70" /></div>
                          <div>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Interest Rate</p>
                            <p className="text-[15px] font-black text-white leading-none">{goal.profitPercent}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/10 rounded-xl"><ArrowUpRight size={16} className="text-white/70" /></div>
                          <div>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Estimated Return</p>
                            <p className="text-[15px] font-black text-white leading-none">৳{goal.maturityValue.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/10 rounded-xl"><History size={16} className="text-white/70" /></div>
                          <div>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">{t('maturityDate', language)}</p>
                            <p className="text-[13px] font-black text-white/80 leading-none">{goal.maturityDate ? formatDate(goal.maturityDate) : 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section: Progress Bar */}
                      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Savings Progress</span>
                          <span className="text-[10px] font-black text-white/80">{progressPercent}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden p-[1px] mb-2">
                          <div 
                            className="h-full rounded-r-full bg-gradient-to-r from-indigo-300 to-white transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
                            style={{ width: `${progressPercent}%` }} 
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-white/70 uppercase tracking-tight">Complete: {formatTimePeriod(completedMonths)}</span>
                          <span className="text-[10px] font-black text-white/70 uppercase tracking-tight">Remaining: {formatTimePeriod(remainingMonths)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                    <PiggyBank size={32} className="text-indigo-500 opacity-80" />
                  </div>
                  <div className="text-center px-4">
                    <span className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Portfolio is Empty</span>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 max-w-[240px]">Initialize your first account to start tracking wealth</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full" /> Transaction History
              </h3>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <Filter size={14} className="text-slate-400 ml-1" />
                <select 
                  value={historyGoalFilter} 
                  onChange={(e) => setHistoryGoalFilter(e.target.value)}
                  className="bg-transparent outline-none text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 cursor-pointer pr-1"
                >
                  <option value="all">All Accounts</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-emerald-50 dark:bg-emerald-900/20">
                      <th className="px-5 py-2.5 text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Date</th>
                      <th className="px-5 py-2.5 text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Asset Account</th>
                      <th className="px-5 py-2.5 text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Amount</th>
                      <th className="px-5 py-2.5 text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Profit (Est.)</th>
                      <th className="px-5 py-2.5 text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Total Money</th>
                      <th className="px-5 py-2.5 text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredProcessedHistory.length > 0 ? filteredProcessedHistory.map(record => {
                      const goal = goals.find(g => g.id === record.goalId);
                      return (
                        <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                          <td className="px-5 py-2.5">
                            <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase leading-none tracking-tight">{formatDate(record.date)}</span>
                          </td>
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: goal?.color || '#cbd5e1' }} />
                              <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase truncate max-w-[140px] tracking-tight">{goal?.name || 'Deleted Account'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-2.5">
                            <span className="text-[12px] font-black text-slate-900 dark:text-white tracking-tighter">৳{record.amount.toLocaleString()}</span>
                          </td>
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <TrendingUp size={12} className="text-emerald-500" />
                              <span className="text-[12px] font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">৳{(record as any).stepProfit.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-5 py-2.5">
                            <span className="text-[13px] font-black text-blue-600 dark:text-indigo-400 tracking-tighter">৳{(record as any).runningBalance.toLocaleString()}</span>
                          </td>
                          <td className="px-5 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => { setEditingRecord(record); setRecordForm({ goalId: record.goalId, amount: record.amount.toString(), date: record.date, note: record.note }); setIsRecordModalOpen(true); }} 
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                              >
                                <Pencil size={14} />
                              </button>
                              <button 
                                onClick={() => { setRecordToDelete(record); setIsDeleteRecordConfirmOpen(true); }} 
                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all border border-transparent hover:border-rose-100"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="opacity-60 text-slate-400 dark:text-slate-500 flex flex-col items-center">
                            <History size={40} className="mb-3" />
                            <p className="text-[11px] font-black uppercase tracking-widest">{historyGoalFilter === 'all' ? 'No Recent Activity' : 'No records for this account'}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[420px] rounded-[24px] overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-blue-600" />
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight uppercase">{editingGoal ? 'Configure Asset' : 'New Asset Account'}</h2>
              </div>
              <button onClick={() => setIsGoalModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-[1fr_80px] gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Account/Bank Name</label>
                  <input 
                    type="text" 
                    value={goalForm.name} 
                    onChange={(e) => setGoalForm({...goalForm, name: e.target.value})} 
                    placeholder="e.g. DBBL Savings" 
                    className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 text-center">Theme</label>
                  <div className="relative h-10">
                    <input type="color" value={goalForm.color} onChange={(e) => setGoalForm({...goalForm, color: e.target.value})} className="absolute inset-0 w-full h-full bg-transparent border-none outline-none cursor-pointer p-0 opacity-0 z-10" />
                    <div className="w-full h-full rounded-xl border border-slate-400 dark:border-slate-600 shadow-sm transition-transform active:scale-95" style={{ backgroundColor: goalForm.color }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Monthly Deposit</label>
                  <input 
                    type="number" 
                    value={goalForm.monthlyDeposit} 
                    onChange={(e) => setGoalForm({...goalForm, monthlyDeposit: e.target.value})} 
                    placeholder="0" 
                    className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 text-center">Period (Y)</label>
                  <input 
                    type="number" 
                    step="1" 
                    value={goalForm.years} 
                    onChange={(e) => setGoalForm({...goalForm, years: e.target.value})} 
                    placeholder="10" 
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 text-center">Profit %</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01" 
                      value={goalForm.profitPercent} 
                      onChange={(e) => setGoalForm({...goalForm, profitPercent: e.target.value})} 
                      placeholder="9.4" 
                      className="w-full h-10 pl-4 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" 
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Percent size={12} /></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input 
                    type="date" 
                    value={goalForm.startDate} 
                    onChange={(e) => setGoalForm({...goalForm, startDate: e.target.value})} 
                    className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Target Total (Auto)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={goalForm.targetAmount} 
                      readOnly
                      placeholder="-"
                      className="w-full h-10 px-4 bg-slate-200 dark:bg-black/40 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none cursor-default shadow-sm" 
                    />
                    <VerifiedBadge />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Maturity (Auto)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={goalForm.maturityValue} 
                      readOnly 
                      placeholder="-" 
                      className="w-full h-10 px-4 bg-slate-200 dark:bg-black/40 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none cursor-default shadow-sm" 
                    />
                    <VerifiedBadge />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSaveGoal} 
                className={`w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[14px] uppercase shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 ${(!goalForm.name || !goalForm.monthlyDeposit) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save size={18} /> {editingGoal ? 'Update Asset' : 'Initialize Asset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isRecordModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[420px] rounded-[24px] overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" />
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight uppercase">{editingRecord ? 'Update Record' : 'Record Deposit'}</h2>
              </div>
              <button onClick={() => { setIsRecordModalOpen(false); setEditingRecord(null); }} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Destination Asset Account</label>
                <select value={recordForm.goalId} onChange={(e) => setRecordForm({...recordForm, goalId: e.target.value})} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none cursor-pointer shadow-sm">
                  <option value="">Select Account</option>
                  {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Deposit Amount (৳)</label>
                  <input type="number" value={recordForm.amount} onChange={(e) => setRecordForm({...recordForm, amount: e.target.value})} placeholder="5,000" className="w-full h-10 px-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-400 dark:border-emerald-600 rounded-xl text-[13px] font-semibold text-emerald-800 dark:text-emerald-400 outline-none focus:border-emerald-500 transition-all shadow-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Payment Date</label>
                  <input type="date" value={recordForm.date} onChange={(e) => setRecordForm({...recordForm, date: e.target.value})} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[12px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Short Description/Note</label>
                <input type="text" value={recordForm.note} onChange={(e) => setRecordForm({...recordForm, note: e.target.value})} placeholder="e.g. Month: Feb 2026" className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
              </div>
              <button onClick={handleSaveRecord} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[14px] uppercase shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2">
                {editingRecord ? <Save size={18} /> : <Plus size={18} />} 
                {editingRecord ? 'Update Transaction' : 'Record Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteGoalConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[320px] rounded-[32px] p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-700/50 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={32} /></div>
            <h2 className="text-[16px] font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Destroy Account?</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-8 font-bold tracking-tight">Warning: This will permanently delete the bank account and all its historical records.</p>
            <div className="flex gap-3">
              <button onClick={confirmDeleteGoal} className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl text-[12px] font-black uppercase hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-600/20">Delete</button>
              <button onClick={() => { setIsDeleteGoalConfirmOpen(false); setGoalToDelete(null); }} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[12px] font-black uppercase hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteRecordConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[320px] rounded-[32px] p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-700/50 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={32} /></div>
            <h2 className="text-[16px] font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Remove Record?</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-8 font-bold tracking-tight">This installment will be removed from history and your current balance will be adjusted accordingly.</p>
            <div className="flex gap-3">
              <button onClick={confirmDeleteRecord} className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl text-[12px] font-black uppercase hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-600/20">Delete</button>
              <button onClick={() => { setIsDeleteRecordConfirmOpen(false); setRecordToDelete(null); }} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[12px] font-black uppercase hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isBulkRecordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[500px] rounded-[24px] overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-600" />
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Bulk Deposit Import</h2>
              </div>
              <button onClick={() => setIsBulkRecordModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Target Asset Account</label>
                <select 
                  value={bulkGoalId} 
                  onChange={(e) => setBulkGoalId(e.target.value)} 
                  className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none cursor-pointer shadow-sm"
                >
                  <option value="">Select Account</option>
                  {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl flex items-start gap-3">
                <AlertCircle size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-indigo-700 dark:text-indigo-300 leading-tight uppercase tracking-tight">
                    Format: Date [Tab] Amount [Tab] Note
                  </p>
                  <p className="text-[9px] font-bold text-indigo-400/80 uppercase tracking-widest">
                    Example: 2026-02-05    5000    Monthly Deposit
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Spreadsheet Data Input</label>
                <textarea 
                  value={bulkInput} 
                  onChange={(e) => setBulkInput(e.target.value)} 
                  placeholder="Paste your data here..." 
                  className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all shadow-sm resize-none" 
                />
              </div>
              <button 
                onClick={handleBulkImportRecords} 
                disabled={bulkPreview.length === 0 || !bulkGoalId} 
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-[14px] uppercase shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Upload size={18} /> Import All ({bulkPreview.length})
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-8 right-8 flex flex-col items-center gap-3 z-40 group">
        <button 
          onClick={() => { 
            setBulkGoalId(goals[0]?.id || '');
            setBulkInput('');
            setIsBulkRecordModalOpen(true); 
          }}
          className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl flex items-center justify-center transition-all scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-emerald-600/30"
          title="Bulk Add Deposits"
        >
          <FileSpreadsheet size={22} />
        </button>
        <button 
          onClick={() => { setEditingRecord(null); setRecordForm({ goalId: goals[0]?.id || '', amount: '', date: new Date().toISOString().split('T')[0], note: '' }); setIsRecordModalOpen(true); }}
          className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-indigo-600/30"
          title="Record Deposit"
        >
          <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

    </div>
  );
};

export default SavingsInfoView;
