
import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  LayoutGrid, 
  Pencil, 
  X, 
  Save, 
  Plus, 
  Send, 
  CheckCircle2, 
  Clock, 
  Trash2,
  AlertTriangle,
  History,
  TrendingUp,
  Check
} from 'lucide-react';
import { LeaveType, LeaveRecord, LanguageType, ThemeType } from '../types';

// Helper component for the green dashed circle with white tick
const VerifiedBadge = () => (
  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 bg-emerald-600 rounded-full border border-dashed border-emerald-300 shadow-sm transition-transform hover:scale-110">
    <Check size={10} strokeWidth={4} className="text-white" />
  </div>
);

interface LeaveInfoViewProps {
  language?: LanguageType;
  theme?: ThemeType;
  leaveQuotas?: LeaveType[];
  setLeaveQuotas?: React.Dispatch<React.SetStateAction<LeaveType[]>>;
  leaveHistory?: LeaveRecord[];
  setLeaveHistory?: React.Dispatch<React.SetStateAction<LeaveRecord[]>>;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const LeaveInfoView: React.FC<LeaveInfoViewProps> = ({ 
  leaveQuotas = [], 
  setLeaveQuotas = () => {}, 
  leaveHistory = [], 
  setLeaveHistory = () => {},
  showToast = () => {}
}) => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const [isEditRecordModalOpen, setIsEditRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LeaveRecord | null>(null);

  const formatUI = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const parts = dateStr.split('-');
    if (parts[0].length === 4) { 
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    years.add(selectedYear);
    years.add(new Date().getFullYear().toString());
    leaveHistory.forEach(r => {
      const year = r.startDate.split('-')[0];
      if (year) years.add(year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [leaveHistory, selectedYear]);

  const yearUsageMap = useMemo(() => {
    const map: Record<string, number> = { casual: 0, medical: 0, annual: 0 };
    leaveHistory.forEach(record => {
      if (record.startDate.startsWith(selectedYear) && record.status === 'Approved') {
        map[record.typeId] = (map[record.typeId] || 0) + record.totalDays;
      }
    });
    return map;
  }, [leaveHistory, selectedYear]);

  const annualSummary = useMemo(() => {
    const summary: Record<string, { casual: number, medical: number, annual: number, total: number }> = {};
    leaveHistory.forEach(record => {
      if (record.status === 'Approved') {
        const year = record.startDate.split('-')[0];
        if (!summary[year]) {
          summary[year] = { casual: 0, medical: 0, annual: 0, total: 0 };
        }
        if (record.typeId === 'casual') summary[year].casual += record.totalDays;
        if (record.typeId === 'medical') summary[year].medical += record.totalDays;
        if (record.typeId === 'annual') summary[year].annual += record.totalDays;
        summary[year].total += record.totalDays;
      }
    });
    return Object.entries(summary).sort((a, b) => b[0].localeCompare(a[0]));
  }, [leaveHistory]);

  const [editFormData, setEditFormData] = useState({ annual: 20, medical: 14, casual: 10 });

  const [applyFormData, setApplyFormData] = useState({
    typeId: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'Pending' as 'Approved' | 'Pending' | 'Rejected'
  });

  const handleOpenEditQuotas = () => {
    setEditFormData({
      annual: leaveQuotas.find(l => l.id === 'annual')?.total || 20,
      medical: leaveQuotas.find(l => l.id === 'medical')?.total || 14,
      casual: leaveQuotas.find(l => l.id === 'casual')?.total || 10,
    });
    setIsQuotaModalOpen(true);
  };

  const handleSaveQuotas = () => {
    setLeaveQuotas(prev => prev.map(leave => {
      if (leave.id === 'annual') return { ...leave, total: editFormData.annual };
      if (leave.id === 'medical') return { ...leave, total: editFormData.medical };
      if (leave.id === 'casual') return { ...leave, total: editFormData.casual };
      return leave;
    }));
    setIsQuotaModalOpen(false);
    showToast?.('Leave quotas updated!', 'success');
  };

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleApplyLeave = () => {
    if (!applyFormData.startDate || !applyFormData.endDate) {
      showToast?.('Please select both start and end dates', 'error');
      return;
    }
    
    const diffDays = calculateDays(applyFormData.startDate, applyFormData.endDate);
    if (diffDays <= 0) {
      showToast?.('End date must be after or same as start date', 'error');
      return;
    }

    const selectedType = leaveQuotas.find(l => l.id === applyFormData.typeId);
    const typeName = selectedType ? selectedType.type : (
      applyFormData.typeId === 'casual' ? 'Casual Leave' :
      applyFormData.typeId === 'medical' ? 'Medical Leave' :
      applyFormData.typeId === 'annual' ? 'Annual Leave' : 'Leave'
    );

    const newRecord: LeaveRecord = {
      id: Math.random().toString(36).substr(2, 9),
      typeId: applyFormData.typeId,
      typeName: typeName,
      startDate: applyFormData.startDate,
      endDate: applyFormData.endDate,
      totalDays: diffDays,
      reason: applyFormData.reason || 'Not Specified',
      status: applyFormData.status,
      appliedOn: new Date().toISOString().split('T')[0]
    };

    setLeaveHistory(prev => [newRecord, ...prev]);
    setIsApplyModalOpen(false);
    
    const recordYear = applyFormData.startDate.split('-')[0];
    if (recordYear) setSelectedYear(recordYear);
    
    setApplyFormData({ typeId: 'casual', startDate: '', endDate: '', reason: '', status: 'Pending' });
    showToast?.('Leave application submitted successfully!', 'success');
  };

  const confirmDelete = () => {
    if (!recordToDelete) return;
    setLeaveHistory(prev => prev.filter(r => r.id !== recordToDelete));
    setIsDeleteConfirmOpen(false);
    setRecordToDelete(null);
    showToast?.('Leave record deleted!', 'success');
  };

  const openEditHistory = (record: LeaveRecord) => {
    setEditingRecord(record);
    setApplyFormData({
      typeId: record.typeId,
      startDate: record.startDate,
      endDate: record.endDate,
      reason: record.reason,
      status: record.status
    });
    setIsEditRecordModalOpen(true);
  };

  const handleUpdateHistoryRecord = () => {
    if (!editingRecord || !applyFormData.startDate || !applyFormData.endDate) return;
    const newDays = calculateDays(applyFormData.startDate, applyFormData.endDate);
    const selectedType = leaveQuotas.find(l => l.id === applyFormData.typeId);
    if (!selectedType) return;

    setLeaveHistory(prev => prev.map(r => r.id === editingRecord.id ? {
      ...r,
      typeId: applyFormData.typeId,
      typeName: selectedType.type,
      startDate: applyFormData.startDate,
      endDate: applyFormData.endDate,
      totalDays: newDays,
      reason: applyFormData.reason,
      status: applyFormData.status
    } : r));

    setIsEditRecordModalOpen(false);
    setEditingRecord(null);
    setApplyFormData({ typeId: 'casual', startDate: '', endDate: '', reason: '', status: 'Pending' });
    showToast?.('Leave record updated!', 'success');
  };

  const filteredHistory = useMemo(() => {
    return leaveHistory.filter(r => r.startDate.startsWith(selectedYear));
  }, [leaveHistory, selectedYear]);

  const approvedLeaves = filteredHistory.filter(r => r.status === 'Approved');
  const pendingLeaves = filteredHistory.filter(r => r.status === 'Pending' || r.status === 'Rejected');

  const renderHistoryTable = (data: LeaveRecord[], title: string, colorClass: string) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className={`p-4 border-b border-slate-100 dark:border-${colorClass}-800/30 bg-slate-50/30 dark:bg-${colorClass}-900/10 flex items-center justify-between transition-colors`}>
        <h3 className={`text-[11px] font-black text-${colorClass}-700 dark:text-${colorClass}-300 uppercase tracking-tight flex items-center gap-2`}>
          <div className={`w-1.5 h-1.5 rounded-full bg-${colorClass}-600`} /> 
          {title}
        </h3>
        {title.includes('Approved') ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Clock size={14} className="text-amber-400" />}
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Type / Applied</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Duration</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {data.length > 0 ? data.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight">{record.typeName}</span>
                    <span className="text-[9px] font-bold text-slate-400 mt-0.5 whitespace-nowrap">On: {formatUI(record.appliedOn)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatUI(record.startDate)} <span className="text-slate-400">→</span> {formatUI(record.endDate)}
                    </span>
                    <span className="text-[10px] font-black text-slate-900 dark:text-white mt-0.5">{record.totalDays} Days</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => openEditHistory(record)} className="p-1.5 text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 rounded-xl transition-all hover:bg-purple-600 hover:text-white border border-purple-100 dark:border-purple-800/50"><Pencil size={12} /></button>
                    <button onClick={() => { setRecordToDelete(record.id); setIsDeleteConfirmOpen(true); }} className="p-1.5 text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl transition-all hover:bg-rose-600 hover:text-white border border-rose-100 dark:border-rose-800/50"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center">
                  <div className="opacity-20 font-black text-[10px] uppercase tracking-widest">No entries for {selectedYear}</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500 relative min-h-[calc(100vh-120px)]">
      <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-800">
            <LayoutGrid size={14} className="text-purple-600" />
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">Data Period</span>
          </div>
          <div className="flex items-center gap-2">
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-white dark:bg-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-white outline-none border border-slate-200 dark:border-slate-700 hover:border-purple-300 transition-colors min-w-[80px]">
              {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
            <button 
              onClick={() => setIsSummaryModalOpen(true)}
              className="p-1.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 dark:border-indigo-800/50 shadow-sm active:scale-95"
              title="Annual Summary"
            >
              <TrendingUp size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <button onClick={handleOpenEditQuotas} className="flex items-center gap-2 px-4 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all active:scale-95 shadow-sm">
            <Pencil size={12} /> Edit Quotas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {leaveQuotas.map((leave, i) => {
          const usedForThisYear = yearUsageMap[leave.id] || 0;
          const available = leave.total - usedForThisYear;
          const usagePercent = Math.min(Math.round((usedForThisYear / leave.total) * 100), 100);
          
          const borderClass = 
            leave.id === 'casual' ? 'border-amber-200 dark:border-amber-800/60' :
            leave.id === 'medical' ? 'border-rose-200 dark:border-rose-800/60' :
            'border-blue-200 dark:border-blue-800/60';

          return (
            <div key={i} className={`bg-white dark:bg-slate-900 border-2 ${borderClass} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-tight group-hover:text-purple-600 transition-colors">{leave.type}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{selectedYear} Balance</p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${leave.color.replace('bg-', 'bg-')}/10 ${leave.color.replace('bg-', 'text-')}`}>
                  <CalendarDays size={16} />
                </div>
              </div>
              <div className="relative pt-1">
                <div className="flex mb-3 items-center justify-between">
                  <span className="text-[10px] font-black inline-block py-1 px-3 uppercase rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30">
                    {available} Days Available
                  </span>
                </div>
                <div className="overflow-hidden h-2.5 mb-6 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-50 dark:border-slate-800">
                  <div style={{ width: `${usagePercent}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${leave.color}`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Limit</p>
                  <p className="text-[15px] font-black text-slate-800 dark:text-white leading-none">{leave.total} Days</p>
                </div>
                <div className="bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Used ({selectedYear})</p>
                  <p className={`text-[15px] font-black leading-none ${usedForThisYear > 0 ? 'text-rose-500' : 'text-slate-400'}`}>{usedForThisYear} Days</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 items-start">
        {renderHistoryTable(approvedLeaves, `Approved (${selectedYear})`, "emerald")}
        {renderHistoryTable(pendingLeaves, `Pending/Rejected (${selectedYear})`, "amber")}
      </div>

      <button onClick={() => setIsApplyModalOpen(true)} className="fixed bottom-8 right-8 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-xl flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95 group shadow-purple-600/20">
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[500px] rounded-[32px] overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <History size={20} />
                </div>
                <div>
                  <h2 className="text-[17px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Annual Leave Summary</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Historical usage breakdown</p>
                </div>
              </div>
              <button onClick={() => setIsSummaryModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {annualSummary.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {annualSummary.map(([year, stats]) => (
                      <div key={year} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                           <TrendingUp size={64} className="text-indigo-600" />
                        </div>
                        <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                          <span className="text-[16px] font-black text-slate-900 dark:text-white tracking-tighter">Year: {year}</span>
                          <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-md shadow-indigo-600/20">Total: {stats.total} Days</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/30 p-2.5 rounded-xl text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Casual</p>
                            <p className="text-[14px] font-black text-amber-600">{stats.casual}</p>
                          </div>
                          <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30 p-2.5 rounded-xl text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Medical</p>
                            <p className="text-[14px] font-black text-rose-600">{stats.medical}</p>
                          </div>
                          <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/30 p-2.5 rounded-xl text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Annual</p>
                            <p className="text-[14px] font-black text-blue-600">{stats.annual}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center opacity-30 italic flex flex-col items-center gap-3">
                    <CalendarDays size={48} className="text-slate-400" />
                    <p className="text-[12px] font-black uppercase tracking-widest">No historical data found</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
               <button onClick={() => setIsSummaryModalOpen(false)} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all">Close History</button>
            </div>
          </div>
        </div>
      )}

      {isQuotaModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[320px] rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <Pencil size={18} className="text-blue-600" />
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight uppercase">Edit Quotas</h2>
              </div>
              <button onClick={() => setIsQuotaModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              {['casual', 'medical', 'annual'].map((type) => (
                <div key={type} className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{type} Leave Limit</label>
                  <input 
                    type="number" 
                    value={editFormData[type as keyof typeof editFormData]} 
                    onChange={(e) => setEditFormData({...editFormData, [type]: parseInt(e.target.value) || 0})} 
                    className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" 
                  />
                </div>
              ))}
              <button onClick={handleSaveQuotas} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[14px] uppercase shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2">
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {(isApplyModalOpen || isEditRecordModalOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[420px] rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                {isEditRecordModalOpen ? <Pencil size={18} className="text-blue-600" /> : <Plus size={18} className="text-emerald-600" />}
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight uppercase">{isEditRecordModalOpen ? 'Update Record' : 'Apply for Leave'}</h2>
              </div>
              <button onClick={() => { setIsApplyModalOpen(false); setIsEditRecordModalOpen(false); setEditingRecord(null); }} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Leave Type</label>
                  <select 
                    value={applyFormData.typeId} 
                    onChange={(e) => setApplyFormData({...applyFormData, typeId: e.target.value})} 
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[12px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="casual">Casual Leave</option>
                    <option value="medical">Medical Leave</option>
                    <option value="annual">Annual Leave</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select 
                    value={applyFormData.status} 
                    onChange={(e) => setApplyFormData({...applyFormData, status: e.target.value as 'Approved' | 'Pending' | 'Rejected'})} 
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[12px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input 
                    type="date" 
                    value={applyFormData.startDate} 
                    onChange={(e) => setApplyFormData({...applyFormData, startDate: e.target.value})} 
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[11px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                  <input 
                    type="date" 
                    value={applyFormData.endDate} 
                    onChange={(e) => setApplyFormData({...applyFormData, endDate: e.target.value})} 
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[11px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Detailed Reason</label>
                <textarea 
                  value={applyFormData.reason} 
                  onChange={(e) => setApplyFormData({...applyFormData, reason: e.target.value})} 
                  rows={2} 
                  placeholder="Briefly explain the purpose..." 
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[12px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm resize-none" 
                />
              </div>

              {applyFormData.startDate && applyFormData.endDate && (
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <CalendarDays size={14} />
                    <span className="text-[10px] font-black uppercase tracking-tight">Total Duration: {calculateDays(applyFormData.startDate, applyFormData.endDate)} Days</span>
                  </div>
                  <VerifiedBadge />
                </div>
              )}

              <button 
                onClick={isEditRecordModalOpen ? handleUpdateHistoryRecord : handleApplyLeave} 
                disabled={!applyFormData.startDate || !applyFormData.endDate} 
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-black text-[13px] uppercase shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-1"
              >
                {isEditRecordModalOpen ? <Save size={16} /> : <Send size={16} />}
                {isEditRecordModalOpen ? 'Update Record' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[300px] rounded-[24px] p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-[16px] font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Confirm Removal?</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-8 font-bold tracking-tight">This entry will be permanently deleted and your leave balance will be restored.</p>
            <div className="flex gap-4">
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl text-[12px] font-black uppercase shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95"
              >
                Delete
              </button>
              <button 
                onClick={() => { setIsDeleteConfirmOpen(false); setRecordToDelete(null); }} 
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

export default LeaveInfoView;
