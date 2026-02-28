
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { Transaction, CATEGORIES } from './types';
import { 
  LayoutGrid, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, Wallet, Plus, 
  X, Database, AlertTriangle, ArrowUp, ArrowDown, Save
} from 'lucide-react';

interface FinancialInfoViewProps {
  transactions: Transaction[];
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

const MONTH_OPTIONS = [
  { label: 'January', value: '01' }, 
  { label: 'February', value: '02' }, 
  { label: 'March', value: '03' },
  { label: 'April', value: '04' }, 
  { label: 'May', value: '05' }, 
  { label: 'June', value: '06' },
  { label: 'July', value: '07' }, 
  { label: 'August', value: '08' }, 
  { label: 'September', value: '09' },
  { label: 'October', value: '10' }, 
  { label: 'November', value: '11' }, 
  { label: 'December', value: '12' }
];

const IMAGE_THEME_COLORS = ['#1e3a8a', '#0891b2', '#10b981', '#4f46e5', '#7c3aed', '#db2777'];

export const FinancialInfoView: React.FC<FinancialInfoViewProps> = ({ transactions, onAdd, onEdit, onDelete }) => {
  const currentMonthValue = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYearValue = new Date().getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthValue);
  const [selectedYear, setSelectedYear] = useState<string>(currentYearValue);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: CATEGORIES.expense[0],
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const availableYears = useMemo(() => {
    const years = transactions.map(t => t.date.split('-')[0]);
    const currentYear = new Date().getFullYear().toString();
    return Array.from(new Set([...years, currentYear])).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const [year, month] = t.date.split('-');
      return year === selectedYear && (selectedMonth === 'all' || month === selectedMonth);
    });
  }, [selectedMonth, selectedYear, transactions]);

  const stats = useMemo(() => {
    const income = filteredData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredData]);

  const breakdownData = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredData.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).map(([name, value]) => ({ 
      name, 
      value, 
      percentage: stats.expense > 0 ? (value / stats.expense) * 100 : 0 
    })).sort((a, b) => b.value - a.value);
  }, [filteredData, stats.expense]);

  const monthlyComparisonData = useMemo(() => {
    const monthlyMap: Record<string, { month: string, income: number, expense: number }> = {};
    MONTH_OPTIONS.forEach(m => { 
      monthlyMap[m.value] = { month: m.label.substring(0, 3), income: 0, expense: 0 }; 
    });
    transactions.filter(t => t.date.startsWith(selectedYear)).forEach(t => {
      const m = t.date.split('-')[1];
      if (monthlyMap[m]) {
        if (t.type === 'income') monthlyMap[m].income += t.amount;
        else monthlyMap[m].expense += t.amount;
      }
    });
    return Object.values(monthlyMap);
  }, [selectedYear, transactions]);

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
    const RADIAN = Math.PI / 180;
    
    const midRadius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + midRadius * Math.cos(-midAngle * RADIAN);
    const y = cy + midRadius * Math.sin(-midAngle * RADIAN);
    
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 2) * cos;
    const sy = cy + (outerRadius + 2) * sin;
    const mx = cx + (outerRadius + 18) * cos;
    const my = cy + (outerRadius + 18) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 12;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor="middle" 
          dominantBaseline="central" 
          className="text-[11px] font-black pointer-events-none"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        
        <path 
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} 
          stroke="#94a3b8" 
          strokeWidth={1.5} 
          fill="none" 
        />
        
        <text 
          x={ex + (cos >= 0 ? 1 : -1) * 4} 
          y={ey} 
          textAnchor={textAnchor} 
          fill="#64748b" 
          dominantBaseline="central" 
          className="text-[10px] font-black tracking-widest uppercase"
        >
          {name}
        </text>
      </g>
    );
  };

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setFormData({ type: 'expense', category: CATEGORIES.expense[0], amount: '', date: new Date().toISOString().split('T')[0], description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setFormData({ type: t.type, category: t.category, amount: t.amount.toString(), date: t.date, description: t.description });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const amountVal = parseFloat(formData.amount);
    if (!amountVal || amountVal <= 0) return;
    if (editingTransaction) onEdit({ ...editingTransaction, ...formData, amount: amountVal });
    else onAdd({ ...formData, amount: amountVal });
    setIsModalOpen(false);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      const [y, m, d] = dateStr.split('-');
      return `${d}-${m}-${y}`;
    }
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="space-y-4 pb-16 animate-in fade-in duration-300 relative">
      <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-100 dark:border-slate-800">
          <LayoutGrid size={14} className="text-purple-600" />
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">Data Period</span>
        </div>
        
        <div className="flex items-center gap-2">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-white outline-none border border-slate-200 dark:border-slate-700 hover:border-purple-300 transition-colors min-w-[100px]">
            <option value="all">All Months</option>
            {MONTH_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-white outline-none border border-slate-200 dark:border-slate-700 hover:border-purple-300 transition-colors">
            {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Total Income', value: stats.income, gradient: 'from-emerald-500 to-teal-600', icon: <ArrowUpCircle size={18} /> },
          { label: 'Total Expense', value: stats.expense, gradient: 'from-rose-500 to-pink-600', icon: <ArrowDownCircle size={18} /> },
          { label: 'Net Balance', value: stats.balance, gradient: 'from-purple-600 to-indigo-700', icon: <Wallet size={18} /> }
        ].map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.gradient} p-4 rounded-xl text-white shadow relative overflow-hidden group hover:scale-[1.02] transition-all`}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70 group-hover:opacity-100 transition-opacity">{card.label}</p>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black tracking-tight">৳{card.value.toLocaleString()}</h3>
              <div className="opacity-20 group-hover:opacity-40 transition-opacity">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col h-[320px]">
          <h3 className="text-[11px] font-black text-purple-600 dark:text-purple-400 -mx-4 -mt-4 mb-4 px-4 py-2.5 bg-purple-50/50 dark:bg-purple-900/10 border-b border-purple-100 dark:border-purple-800/50 rounded-t-xl flex items-center gap-2 uppercase tracking-tight">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-600" /> Performance Insight
          </h3>
          <div className="flex-1 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              {selectedMonth === 'all' ? (
                <BarChart data={monthlyComparisonData} margin={{top: 5, right: 5, left: -20, bottom: 0}}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px', padding: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="income" fill="#10b981" radius={[2, 2, 0, 0]} barSize={12} />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[2, 2, 0, 0]} barSize={12} />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie 
                    data={breakdownData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={50} 
                    outerRadius={75} 
                    paddingAngle={4} 
                    dataKey="value" 
                    stroke="none" 
                    labelLine={false} 
                    label={renderCustomizedLabel}
                  >
                    {breakdownData.map((_, index) => (
                      <Cell key={index} fill={IMAGE_THEME_COLORS[index % IMAGE_THEME_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col h-[320px]">
          <h3 className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 -mx-4 -mt-4 mb-4 px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-800/50 rounded-t-xl flex items-center gap-2 uppercase tracking-tight">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> Detailed Breakdown
          </h3>
          <div className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1">
            {breakdownData.length > 0 ? breakdownData.map((item, idx) => (
              <div key={item.name} className="border-b border-slate-50 dark:border-slate-800/50 pb-2.5 last:border-0">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: IMAGE_THEME_COLORS[idx % IMAGE_THEME_COLORS.length]}} />
                    <span className="text-[12px] font-black text-slate-700 dark:text-slate-200 uppercase truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px] font-black text-slate-900 dark:text-white tracking-tight">৳{item.value.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.percentage}%`, backgroundColor: IMAGE_THEME_COLORS[idx % IMAGE_THEME_COLORS.length] }} />
                </div>
              </div>
            )) : <div className="text-center py-16 text-[12px] opacity-20 font-black tracking-widest uppercase">No Data Found</div>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col h-[320px]">
          <h3 className="text-[11px] font-black text-orange-600 dark:text-orange-400 -mx-4 -mt-4 mb-4 px-4 py-2.5 bg-orange-50/80 dark:bg-orange-900/10 border-b border-orange-100 dark:border-orange-800/50 rounded-t-xl flex items-center gap-2 uppercase tracking-tight">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Transaction History
          </h3>
          <div className="space-y-2.5 overflow-y-auto pr-1 custom-scrollbar flex-1">
            {filteredData.length > 0 ? filteredData.sort((a,b) => b.date.localeCompare(a.date)).map(tx => (
              <div key={tx.id} className="p-2.5 rounded-xl border border-slate-50 dark:border-slate-800/50 bg-slate-50/40 dark:bg-slate-800/20 flex items-center justify-between group hover:bg-white dark:hover:bg-slate-800 transition-all border-l-4" style={{borderLeftColor: tx.type === 'income' ? '#10b981' : '#f43f5e'}}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${tx.type === 'income' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
                      {tx.type === 'income' ? <ArrowUp size={15} strokeWidth={3} /> : <ArrowDown size={15} strokeWidth={3} />}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight leading-none">{tx.category}</p>
                    <p className="text-[10px] font-bold text-slate-400 leading-none mt-1.5">{formatDateDisplay(tx.date)}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className={`text-[12px] font-black tracking-tight ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleOpenEdit(tx)} className="p-1.5 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => { setDeleteId(tx.id); setIsDeleteModalOpen(true); }} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )) : <div className="text-center py-16 text-[12px] opacity-20 font-black tracking-widest uppercase">Logs Empty</div>}
          </div>
        </div>
      </div>

      <button onClick={handleOpenAdd} className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-xl flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95 group">
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[420px] rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-blue-600" />
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight uppercase">{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950/50 p-1 rounded-full flex border border-slate-200 dark:border-slate-800 shadow-sm">
                <button 
                  onClick={() => setFormData({...formData, type: 'expense', category: CATEGORIES.expense[0]})} 
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 ${formData.type === 'expense' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Expense
                </button>
                <button 
                  onClick={() => setFormData({...formData, type: 'income', category: CATEGORIES.income[0]})} 
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 ${formData.type === 'income' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Income
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Category Selection</label>
                <div className="relative">
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})} 
                    className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    {CATEGORIES[formData.type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ArrowDown size={14} /></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Amount (৳)</label>
                  <input 
                    type="number" 
                    value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                    placeholder="0.00" 
                    className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-700" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Transaction Date</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})} 
                    className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Short Description</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="e.g. Weekly Grocery" 
                  className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-700" 
                />
              </div>

              <button 
                onClick={handleSave} 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[14px] uppercase shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2"
              >
                <Save size={18} />
                {editingTransaction ? 'Save Changes' : 'Record Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[300px] rounded-[24px] p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-[16px] font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Confirm Removal?</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-8 font-bold tracking-tight">This action cannot be undone.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => { if (deleteId) onDelete(deleteId); setIsDeleteModalOpen(false); }} 
                className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl text-[12px] font-black uppercase shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95"
              >
                Delete
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[12px] font-black uppercase hover:bg-slate-200 transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
