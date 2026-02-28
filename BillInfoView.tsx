
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Zap, 
  Wifi, 
  Plus, 
  X, 
  Save, 
  Trash2, 
  Pencil,
  AlertTriangle,
  Check,
  FileSpreadsheet,
  Upload,
  AlertCircle,
  Info,
  BarChart3
} from 'lucide-react';
import { BillRecord, Transaction } from './types';

interface BillInfoViewProps {
  bills: BillRecord[];
  setBills: React.Dispatch<React.SetStateAction<BillRecord[]>>;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => string;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const BillInfoView: React.FC<BillInfoViewProps> = ({ 
  bills, 
  setBills, 
  onAddTransaction, 
  onEditTransaction, 
  onDeleteTransaction,
  showToast
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<BillRecord | null>(null);
  const [editingBill, setEditingBill] = useState<BillRecord | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: 'Electric' as 'Electric' | 'Wifi',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const [bulkInput, setBulkInput] = useState('');
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);

  useMemo(() => {
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
        let typePart = parts[2] ? parts[2].trim() : 'Electric';
        let notePart = parts[3] ? parts[3].trim() : '';

        const isValidDate = !isNaN(new Date(datePart).getTime());
        const amount = parseFloat(amountPart);
        
        let finalType: 'Electric' | 'Wifi' = 'Electric';
        if (typePart.toLowerCase().includes('wifi') || typePart.toLowerCase().includes('internet')) {
          finalType = 'Wifi';
        }

        if (isValidDate && !isNaN(amount)) {
          parsed.push({
            amount,
            date: new Date(datePart).toISOString().split('T')[0],
            type: finalType,
            note: notePart || 'Bulk Bill'
          });
        }
      }
    });
    setBulkPreview(parsed);
  }, [bulkInput]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    years.add('2026');
    years.add('2025');
    bills.forEach(b => {
      const year = b.date.split('-')[0];
      if (year) years.add(year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [bills]);

  const stats = useMemo(() => {
    const yearBills = bills.filter(b => b.date.startsWith(selectedYear));
    const electricBills = yearBills.filter(b => b.type === 'Electric');
    const wifiBills = yearBills.filter(b => b.type === 'Wifi');

    const totalElectric = electricBills.reduce((sum, b) => sum + b.amount, 0);
    const totalWifi = wifiBills.reduce((sum, b) => sum + b.amount, 0);

    const electricMonthsCount = new Set(electricBills.map(b => b.date.substring(0, 7))).size;
    const wifiMonthsCount = new Set(wifiBills.map(b => b.date.substring(0, 7))).size;

    const avgElectric = electricMonthsCount > 0 ? totalElectric / electricMonthsCount : 0;
    const avgWifi = wifiMonthsCount > 0 ? totalWifi / wifiMonthsCount : 0;

    return {
      electric: { total: totalElectric, avg: avgElectric, list: electricBills, months: electricMonthsCount },
      wifi: { total: totalWifi, avg: avgWifi, list: wifiBills, months: wifiMonthsCount }
    };
  }, [bills, selectedYear]);

  const summary = useMemo(() => {
    const yearBills = bills.filter(b => b.date.startsWith(selectedYear));
    const total = yearBills.reduce((sum, b) => sum + b.amount, 0);
    const uniqueMonths = new Set(yearBills.map(b => b.date.substring(0, 7))).size;
    const avg = uniqueMonths > 0 ? total / uniqueMonths : 0;
    return { total, avg, uniqueMonths };
  }, [bills, selectedYear]);

  const handleSaveBill = () => {
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) return;

    if (editingBill) {
      if (editingBill.transactionId) {
        onEditTransaction({
          id: editingBill.transactionId,
          type: 'expense',
          category: 'Bill',
          amount: amt,
          date: formData.date,
          description: `${formData.type} Bill Payment (${formData.note || 'Regular'})`
        });
      }

      setBills(prev => prev.map(b => b.id === editingBill.id ? {
        ...b,
        type: formData.type,
        amount: amt,
        date: formData.date,
        note: formData.note
      } : b));
      showToast?.('Bill record updated!', 'success');
    } else {
      const transactionId = onAddTransaction({
        type: 'expense',
        category: 'Bill',
        amount: amt,
        date: formData.date,
        description: `${formData.type} Bill Payment (${formData.note || 'Regular'})`
      });

      const newBill: BillRecord = {
        id: Math.random().toString(36).substr(2, 9),
        type: formData.type,
        amount: amt,
        date: formData.date,
        note: formData.note,
        transactionId
      };
      setBills(prev => [newBill, ...prev]);
      showToast?.('Bill payment recorded!', 'success');
    }

    setIsModalOpen(false);
    setEditingBill(null);
    setFormData({ type: 'Electric', amount: '', date: new Date().toISOString().split('T')[0], note: '' });
  };

  const handleBulkImportBills = () => {
    if (bulkPreview.length === 0) return;

    const newBills: BillRecord[] = [];
    
    bulkPreview.forEach(item => {
      const transactionId = onAddTransaction({
        type: 'expense',
        category: 'Bill',
        amount: item.amount,
        date: item.date,
        description: `${item.type} Bill Payment (${item.note})`
      });

      const newBill: BillRecord = {
        id: Math.random().toString(36).substr(2, 9),
        type: item.type,
        amount: item.amount,
        date: item.date,
        note: item.note,
        transactionId
      };
      newBills.push(newBill);
    });

    setBills(prev => [...newBills, ...prev]);
    setBulkInput('');
    setBulkPreview([]);
    setIsBulkModalOpen(false);
    showToast?.(`${newBills.length} bills added successfully!`, 'success');
  };

  const handleDelete = () => {
    if (recordToDelete) {
      if (recordToDelete.transactionId) {
        onDeleteTransaction(recordToDelete.transactionId);
      }
      setBills(prev => prev.filter(b => b.id !== recordToDelete.id));
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
      showToast?.('Bill record deleted!', 'success');
    }
  };

  const handleOpenEdit = (bill: BillRecord) => {
    setEditingBill(bill);
    setFormData({
      type: bill.type,
      amount: bill.amount.toString(),
      date: bill.date,
      note: bill.note || ''
    });
    setIsModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-slate-400" />
          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Filter Year:</span>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/30 rounded-xl px-3 py-1.5 text-[13px] font-black text-indigo-600 dark:text-indigo-400 outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <button 
            onClick={() => setIsSummaryModalOpen(true)}
            className="p-1.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            title="Yearly Summary"
          >
            <BarChart3 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700/50 rounded-2xl p-4 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-amber-600" />
            <h3 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest">ELECTRIC BILLS</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">TOTAL PAID</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">৳{stats.electric.total.toLocaleString()}</h2>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">AVG ({stats.electric.months} MO)</p>
              <h4 className="text-xl font-black text-amber-600 tracking-tighter">৳{Math.round(stats.electric.avg).toLocaleString()}</h4>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-700/50 rounded-2xl p-4 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600" />
          <div className="flex items-center gap-2 mb-2">
            <Wifi size={16} className="text-blue-600" />
            <h3 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest">WIFI BILLS</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">TOTAL PAID</p>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">৳{stats.wifi.total.toLocaleString()}</h2>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">AVG ({stats.wifi.months} MO)</p>
              <h4 className="text-xl font-black text-blue-600 tracking-tighter">৳{Math.round(stats.wifi.avg).toLocaleString()}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[350px]">
          <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 bg-amber-100/40 dark:bg-amber-900/20">
            <h3 className="text-[14px] font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Zap size={14} className="text-amber-500" /> Electric Bills History
            </h3>
          </div>
          <div className="p-4 space-y-2.5 overflow-y-auto flex-1 custom-scrollbar">
            {stats.electric.list.length > 0 ? (
              stats.electric.list.sort((a,b) => b.date.localeCompare(a.date)).map(bill => (
                <div key={bill.id} className="p-3 bg-amber-100/60 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/50 rounded-xl flex items-center justify-between group hover:bg-amber-200/80 dark:hover:bg-amber-900/40 transition-all shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">{formatDate(bill.date)}</span>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">{bill.note || 'Regular Bill'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-black text-amber-700 dark:text-amber-400 tracking-tight">৳{bill.amount.toLocaleString()}</span>
                    <div className="flex items-center gap-1.5 transition-all">
                      <button onClick={() => handleOpenEdit(bill)} className="p-1.5 text-indigo-600 bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 rounded-xl shadow-sm border border-indigo-100/50 dark:border-slate-700 transition-all active:scale-95"><Pencil size={12} /></button>
                      <button onClick={() => { setRecordToDelete(bill); setIsDeleteModalOpen(true); }} className="p-1.5 text-rose-600 bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 rounded-xl shadow-sm border border-rose-100/50 dark:border-slate-700 transition-all active:scale-95"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center p-12 text-center opacity-30 italic">No Electric records</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[350px]">
          <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 bg-blue-100/40 dark:bg-blue-900/20">
            <h3 className="text-[14px] font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Wifi size={14} className="text-blue-600" /> Wifi Bills History
            </h3>
          </div>
          <div className="p-4 space-y-2.5 overflow-y-auto flex-1 custom-scrollbar">
            {stats.wifi.list.length > 0 ? (
              stats.wifi.list.sort((a,b) => b.date.localeCompare(a.date)).map(bill => (
                <div key={bill.id} className="p-3 bg-blue-100/60 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/50 rounded-xl flex items-center justify-between group hover:bg-blue-200/80 dark:hover:bg-blue-900/40 transition-all shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">{formatDate(bill.date)}</span>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">{bill.note || 'Regular Bill'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-black text-blue-700 dark:text-blue-400 tracking-tight">৳{bill.amount.toLocaleString()}</span>
                    <div className="flex items-center gap-1.5 transition-all">
                      <button onClick={() => handleOpenEdit(bill)} className="p-1.5 text-indigo-600 bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 rounded-xl shadow-sm border border-indigo-100/50 dark:border-slate-700 transition-all active:scale-95"><Pencil size={12} /></button>
                      <button onClick={() => { setRecordToDelete(bill); setIsDeleteModalOpen(true); }} className="p-1.5 text-rose-600 bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 rounded-xl shadow-sm border border-rose-100/50 dark:border-slate-700 transition-all active:scale-95"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center p-12 text-center opacity-30 italic">No Wifi records</div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[400px] rounded-[24px] overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-blue-600" />
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight uppercase">{editingBill ? 'Edit Bill Payment' : 'Record Bill Payment'}</h2>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingBill(null); }} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Bill Category</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl shadow-inner border border-slate-200 dark:border-slate-800">
                  <button onClick={() => setFormData({...formData, type: 'Electric'})} className={`py-1.5 text-[10px] font-black uppercase rounded-xl transition-all ${formData.type === 'Electric' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'text-slate-500 hover:text-slate-700'}`}>Electric</button>
                  <button onClick={() => setFormData({...formData, type: 'Wifi'})} className={`py-1.5 text-[10px] font-black uppercase rounded-xl transition-all ${formData.type === 'Wifi' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-slate-700'}`}>Wifi</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Amount (৳)</label>
                  <input 
                    type="number" 
                    value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                    placeholder="0" 
                    className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Payment Date</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})} 
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[12px] font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Transaction Note</label>
                <input 
                  type="text" 
                  value={formData.note} 
                  onChange={(e) => setFormData({...formData, note: e.target.value})} 
                  placeholder="e.g. Month: March" 
                  className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm" 
                />
              </div>
              <button 
                onClick={handleSaveBill} 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[14px] uppercase shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
              >
                <Save size={18} /> {editingBill ? 'Update Record' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[300px] rounded-[32px] p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={32} /></div>
            <h2 className="text-[16px] font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Remove Record?</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-8 font-bold tracking-tight">The record and its associated expense entry will be removed.</p>
            <div className="flex gap-4">
              <button onClick={handleDelete} className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl text-[12px] font-black uppercase hover:bg-rose-700 transition-all">Delete</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[12px] font-black uppercase hover:bg-slate-200 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[500px] rounded-[24px] overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-600" />
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Bulk Bill Import</h2>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl flex items-start gap-3">
                <AlertCircle size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-indigo-700 dark:text-indigo-300 leading-tight uppercase tracking-tight">
                    Format: Date [Tab] Amount [Tab] Category [Tab] Note
                  </p>
                  <p className="text-[9px] font-bold text-indigo-400/80 uppercase tracking-widest">
                    Example: 2026-02-05    1200    Electric    Feb Bill
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
                onClick={handleBulkImportBills} 
                disabled={bulkPreview.length === 0} 
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-[14px] uppercase shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Upload size={18} /> Import All ({bulkPreview.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[340px] rounded-[32px] p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <BarChart3 size={32} />
            </div>
            <h2 className="text-[18px] font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
              Yearly Bill Summary
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Selected Year</p>
                <p className="text-[16px] font-black text-slate-800 dark:text-white">{selectedYear}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Bill</p>
                  <p className="text-[14px] font-black text-slate-800 dark:text-white">৳{summary.total.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                  <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Average Bill</p>
                  <p className="text-[14px] font-black text-slate-800 dark:text-white">৳{Math.round(summary.avg).toLocaleString()}</p>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Based on {summary.uniqueMonths} months of data
              </p>
            </div>

            <button 
              onClick={() => setIsSummaryModalOpen(false)}
              className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[11px] font-black uppercase hover:bg-slate-200 transition-all active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-8 right-8 flex flex-col items-center gap-3 z-40 group">
        <button 
          onClick={() => { 
            setBulkInput('');
            setIsBulkModalOpen(true); 
          }}
          className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl flex items-center justify-center transition-all scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-emerald-600/30"
          title="Bulk Add Bills"
        >
          <FileSpreadsheet size={22} />
        </button>
        <button 
          onClick={() => { setEditingBill(null); setFormData({ type: 'Electric', amount: '', date: new Date().toISOString().split('T')[0], note: '' }); setIsModalOpen(true); }}
          className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-indigo-600/30"
          title="Record Bill Payment"
        >
          <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

    </div>
  );
};

export default BillInfoView;
