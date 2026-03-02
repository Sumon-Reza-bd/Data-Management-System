
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Clock,
  Calendar,
  Filter,
  LayoutGrid,
  Pencil,
  Trash2,
  Plus,
  X,
  AlertTriangle,
  Save,
  ChevronLeft,
  ChevronRight,
  UserMinus,
  UtensilsCrossed,
  Check
} from 'lucide-react';
import { LanguageType, ThemeType, AttendanceRecord } from '../types';

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

interface AttendanceViewProps {
  language?: LanguageType;
  theme?: ThemeType;
  activitiesList?: AttendanceRecord[];
  setActivitiesList?: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

// Helper component for the green dashed circle with white tick
const VerifiedBadge = () => (
  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 bg-emerald-600 rounded-full border border-dashed border-emerald-300 shadow-sm transition-transform hover:scale-110">
    <Check size={10} strokeWidth={4} className="text-white" />
  </div>
);

const AttendanceView: React.FC<AttendanceViewProps> = ({ 
  activitiesList = [], 
  setActivitiesList = () => {}, 
  showToast = () => {} 
}) => {
  const currentMonthValue = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYearValue = new Date().getFullYear().toString(); 

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthValue);
  const [selectedYear, setSelectedYear] = useState<string>(currentYearValue);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'STANDARD', 
    date: `${currentYearValue}-${currentMonthValue}-02`,
    multiDates: [] as string[],
    checkIn: '',
    checkOut: ''
  });

  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const availableYears = useMemo(() => {
    const years = activitiesList.map(a => a.date.split('-')[0]);
    return Array.from(new Set([currentYearValue, ...years])).sort();
  }, [activitiesList, currentYearValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const periodFilteredActivities = useMemo(() => {
    return activitiesList.filter(a => {
      const [year, month] = a.date.split('-');
      const yearMatch = year === selectedYear;
      const monthMatch = selectedMonth === 'all' || month === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [activitiesList, selectedMonth, selectedYear]);

  const isTiffinTime = (timeStr: string) => {
    if (!timeStr || timeStr === '-') return false;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return false;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= 19 * 60; 
  };

  const statsCount = useMemo(() => {
    return {
      present: periodFilteredActivities.filter(a => a.status === 'On Time' || a.status === 'Late').length,
      absent: periodFilteredActivities.filter(a => a.status === 'Absent').length,
      holiday: periodFilteredActivities.filter(a => a.status === 'Holiday').length,
      offday: periodFilteredActivities.filter(a => a.status === 'Weekly Off').length,
      late: periodFilteredActivities.filter(a => a.status === 'Late').length,
      tiffin: periodFilteredActivities.filter(a => isTiffinTime(a.checkOut || '')).length,
    };
  }, [periodFilteredActivities]);

  const activities = useMemo(() => {
    let filtered = periodFilteredActivities;
    if (statusFilter !== 'All') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    return filtered;
  }, [statusFilter, periodFilteredActivities]);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'On Time': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'Late': return <AlertCircle className="text-amber-500" size={16} />;
      case 'Out Missing': return <UserMinus className="text-rose-500" size={16} />;
      case 'Absent': return <XCircle className="text-rose-500" size={16} />;
      case 'Weekly Off': return <Clock className="text-slate-400" size={16} />;
      case 'Holiday': return <Calendar className="text-indigo-400" size={16} />;
      default: return <Clock className="text-slate-400" size={16} />;
    }
  };

  const getSelectedMonthName = () => {
    const option = MONTH_OPTIONS.find(m => m.value === selectedMonth);
    return option ? option.label : 'All Months';
  };

  const convert12to24 = (time12: string) => {
    if (!time12 || time12 === '-') return '';
    const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '';
    let hours = parseInt(match[1]);
    const mins = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${mins}`;
  };

  const convert24to12 = (time24: string) => {
    if (!time24) return '-';
    const [h, m] = time24.split(':');
    let hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      type: 'STANDARD',
      date: new Date().toISOString().split('T')[0],
      multiDates: [],
      checkIn: '',
      checkOut: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    let initialType = 'STANDARD';
    if (record.status === 'Weekly Off') initialType = 'OFF DAY';
    if (record.status === 'Holiday') initialType = 'HOLIDAY';

    setFormData({
      type: initialType,
      date: record.date,
      multiDates: [],
      checkIn: (record.checkIn === '-' || !record.checkIn) ? '' : record.checkIn,
      checkOut: (record.checkOut === '-' || !record.checkOut) ? '' : record.checkOut
    });
    setIsModalOpen(true);
  };

  const calculateStatus = (type: string, checkIn: string, checkOut: string): AttendanceRecord['status'] => {
    if (type === 'OFF DAY') return 'Weekly Off';
    if (type === 'HOLIDAY') return 'Holiday';
    
    const hasCheckIn = checkIn && checkIn !== '-' && checkIn.trim() !== '';
    const hasCheckOut = checkOut && checkOut !== '-' && checkOut.trim() !== '';

    if (!hasCheckIn) return 'Absent';
    if (hasCheckIn && !hasCheckOut) return 'Out Missing';
    
    const match = checkIn.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 'On Time';

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    if (hours > 8 || (hours === 8 && minutes > 0)) {
      return 'Late';
    }
    
    return 'On Time';
  };

  const handleSave = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (formData.type !== 'STANDARD' && formData.multiDates.length > 0 && !editingRecord) {
      const newRecords = formData.multiDates.map(dateStr => {
        const d = new Date(dateStr);
        const dayName = isNaN(d.getTime()) ? 'Monday' : dayNames[d.getDay()];
        const finalStatus = calculateStatus(formData.type, '-', '-') as AttendanceRecord['status'];
        
        return {
          id: String(Date.now() + Math.random()),
          date: dateStr,
          day: dayName,
          status: finalStatus,
          checkIn: '-',
          checkOut: '-'
        };
      });
      setActivitiesList(prev => [...newRecords, ...prev]);
    } else {
      const finalStatus = calculateStatus(formData.type, formData.checkIn, formData.checkOut) as AttendanceRecord['status'];
      const d = new Date(formData.date);
      const dayName = isNaN(d.getTime()) ? 'Monday' : dayNames[d.getDay()];

      const updatedData = {
        date: formData.date,
        day: dayName,
        status: finalStatus,
        checkIn: formData.type === 'STANDARD' && formData.checkIn ? formData.checkIn : '-',
        checkOut: formData.type === 'STANDARD' && formData.checkOut ? formData.checkOut : '-'
      };

      if (editingRecord) {
        setActivitiesList(prev => prev.map(a => a.id === editingRecord.id ? { ...a, ...updatedData } : a));
        showToast?.('Attendance updated successfully!', 'success');
      } else {
        const newRecord = {
          ...updatedData,
          id: String(Date.now() + Math.random()),
        };
        setActivitiesList(prev => [newRecord, ...prev]);
        showToast?.('Attendance saved successfully!', 'success');
      }
    }
    setIsModalOpen(false);
  };

  const toggleMultiDate = (dateStr: string) => {
    setFormData(prev => {
      const exists = prev.multiDates.includes(dateStr);
      if (exists) {
        return { ...prev, multiDates: prev.multiDates.filter(d => d !== dateStr) };
      } else {
        return { ...prev, multiDates: [...prev.multiDates, dateStr] };
      }
    });
  };

  const formatDateUI = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const handleDelete = () => {
    if (recordToDelete !== null) {
      setActivitiesList(prev => prev.filter(a => a.id !== recordToDelete));
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
      showToast?.('Attendance record deleted!', 'success');
    }
  };

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    const totalDays = daysInMonth(calMonth, calYear);
    const startOffset = firstDayOfMonth(calMonth, calYear);
    
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  }, [calMonth, calYear]);

  const handlePrevMonth = () => {
    setCalMonth(prev => {
      if (prev === 0) {
        setCalYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCalMonth(prev => {
      if (prev === 11) {
        setCalYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 relative">
      <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-800">
          <LayoutGrid size={14} className="text-indigo-600" />
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">Data Period</span>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            className="bg-white dark:bg-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-white outline-none border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-colors min-w-[100px]"
          >
            <option value="all">All Months</option>
            {MONTH_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)} 
            className="bg-white dark:bg-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-white outline-none border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-colors"
          >
            {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Present', value: statsCount.present, icon: <CheckCircle2 size={18} />, color: 'emerald' },
          { label: 'Absent', value: statsCount.absent, icon: <XCircle size={18} />, color: 'rose' },
          { label: 'Holiday', value: statsCount.holiday, icon: <Calendar size={18} />, color: 'indigo' },
          { label: 'Offday', value: statsCount.offday, icon: <Clock size={18} />, color: 'slate' },
          { label: 'Late', value: statsCount.late, icon: <AlertCircle size={18} />, color: 'amber' },
          { label: 'Tiffin', value: statsCount.tiffin, icon: <UtensilsCrossed size={18} />, color: 'orange' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 transition-all hover:shadow-md animate-in zoom-in-95 duration-200">
            <div className={`w-9 h-9 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 rounded-xl flex items-center justify-center shrink-0 border border-${stat.color}-100 dark:border-${stat.color}-800/30`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <h3 className="text-lg font-black text-slate-800 dark:text-white leading-none">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-indigo-950/20 flex flex-wrap items-center justify-between gap-4 shrink-0 min-h-[44px] relative">
          <div className="flex items-center gap-3">
            <h3 className="text-[11px] font-black text-slate-700 dark:text-indigo-300 uppercase tracking-tight flex items-center gap-2">
              <div className="w-1.5 h-3.5 bg-indigo-600 rounded-full" /> Detailed Attendance Log
            </h3>
            <div className="h-3.5 w-px bg-slate-200 dark:bg-indigo-800" />
            <span className="px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-indigo-400 text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm border border-slate-200 dark:border-indigo-900/30">
              {statusFilter === 'All' ? (selectedMonth === 'all' ? 'Year' : getSelectedMonthName()) : statusFilter} {selectedYear}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-1.5 rounded-xl transition-all shadow-sm border ${
                  statusFilter !== 'All' 
                  ? 'bg-indigo-600 text-white border-indigo-700' 
                  : 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900/30 text-indigo-500 hover:bg-indigo-600 hover:text-white'
                }`}
              >
                <Filter size={14} />
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2">
                  {['All', 'On Time', 'Late', 'Out Missing', 'Absent', 'Weekly Off', 'Holiday'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-[10px] font-black uppercase tracking-tight rounded-xl transition-colors ${
                        statusFilter === status 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={handleOpenAdd}
              className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-1.5 px-2.5"
            >
              <Plus size={14} />
              <span className="text-[9px] font-black uppercase">Add Log</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/30">
                <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Day / Date</th>
                <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activities.length > 0 ? activities.sort((a,b) => b.date.localeCompare(a.date)).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-1.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 font-black text-[9px] text-slate-500 uppercase leading-none">
                        {item.day.substring(0, 3)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{formatDateUI(item.date)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {item.checkIn !== '-' ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {item.checkIn}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {item.checkOut !== '-' ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          {item.checkOut}
                        </div>
                        {isTiffinTime(item.checkOut || '') && (
                          <div className="ml-1.5 flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase rounded-xl shadow-sm border border-amber-100 dark:border-amber-800/50 transition-transform group-hover:scale-105">
                            <UtensilsCrossed size={8} />
                            Tiffin
                          </div>
                        )}
                      </div>
                    ) : (
                      item.status === 'Out Missing' ? (
                        <div className="flex items-center gap-1.5 text-rose-600 animate-pulse">
                           <AlertTriangle size={12} />
                           <span className="text-[9px] font-black uppercase">Out Missing</span>
                        </div>
                      ) : '-'
                    )}
                  </td>
                  <td className="px-6 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        item.status === 'On Time' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 
                        item.status === 'Late' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 
                        item.status === 'Out Missing' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' :
                        item.status === 'Absent' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 
                        item.status === 'Holiday' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {item.status}
                      </span>
                      <div className="shrink-0 scale-75">
                        {getStatusIcon(item.status)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-1.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                      >
                        <Pencil size={12} />
                      </button>
                      <button 
                        onClick={() => { setRecordToDelete(item.id); setIsDeleteModalOpen(true); }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all border border-transparent hover:border-rose-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center opacity-30">
                    <div className="flex flex-col items-center">
                      <LayoutGrid size={24} className="mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No matching logs found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
          <span>Showing {activities.length} entries for {statusFilter === 'All' ? (selectedMonth === 'all' ? 'Year' : getSelectedMonthName()) : statusFilter}</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> On Time</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Out Missing</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Absent</span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[420px] rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-blue-600" />
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight uppercase">{editingRecord ? 'Edit Attendance' : 'Add Attendance'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950/50 p-1 rounded-full flex border border-slate-200 dark:border-slate-800 shadow-sm">
                {['STANDARD', 'HOLIDAY', 'OFF DAY'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFormData({...formData, type: cat})}
                    className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full transition-all duration-300 ${
                      formData.type === cat 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {formData.type === 'STANDARD' || editingRecord ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Log Date</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between ml-1 mb-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Select Multi-Dates</label>
                    <div className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                      <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{formData.multiDates.length} Days</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <span className="text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 tracking-tight">
                        {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(calYear, calMonth))}
                      </span>
                      <div className="flex gap-1.5">
                        <button onClick={handlePrevMonth} className="p-1 text-slate-500 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-md transition-colors border border-slate-200 dark:border-slate-700"><ChevronLeft size={14} /></button>
                        <button onClick={handleNextMonth} className="p-1 text-slate-500 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-md transition-colors border border-slate-200 dark:border-slate-700"><ChevronRight size={14} /></button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <span key={d} className="text-[9px] font-black text-slate-400 uppercase text-center mb-1">{d}</span>
                      ))}
                      {calendarDays.map((day, i) => {
                        if (!day) return <div key={`empty-${i}`} className="w-7 h-7" />;
                        const dateObj = new Date(calYear, calMonth, day);
                        const dateStr = dateObj.toISOString().split('T')[0];
                        const isSelected = formData.multiDates.includes(dateStr);
                        return (
                          <button
                            key={i}
                            onClick={() => toggleMultiDate(dateStr)}
                            className={`w-7 h-7 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center ${
                              isSelected 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {(formData.type === 'STANDARD' || editingRecord) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Check In Time</label>
                    <input 
                      type="time" 
                      value={convert12to24(formData.checkIn)} 
                      onChange={(e) => setFormData({...formData, checkIn: convert24to12(e.target.value)})}
                      disabled={formData.type !== 'STANDARD' && !editingRecord}
                      className={`w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all ${(formData.type !== 'STANDARD' && !editingRecord) ? 'opacity-50 cursor-not-allowed' : ''} [color-scheme:light] dark:[color-scheme:dark]`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Check Out Time</label>
                    <input 
                      type="time" 
                      value={convert12to24(formData.checkOut)} 
                      onChange={(e) => setFormData({...formData, checkOut: convert24to12(e.target.value)})}
                      disabled={formData.type !== 'STANDARD' && !editingRecord}
                      className={`w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all ${(formData.type !== 'STANDARD' && !editingRecord) ? 'opacity-50 cursor-not-allowed' : ''} [color-scheme:light] dark:[color-scheme:dark]`}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {formData.type === 'STANDARD' && formData.checkIn && (!formData.checkOut || formData.checkOut === '-') && (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 animate-in fade-in slide-in-from-top-1">
                    <AlertTriangle size={16} />
                    <span className="text-[11px] font-black uppercase tracking-tight">OUT MISSING DETECTED!</span>
                  </div>
                )}

                {formData.type === 'STANDARD' && isTiffinTime(formData.checkOut) && (
                  <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <UtensilsCrossed size={16} />
                      <span className="text-[11px] font-black uppercase tracking-tight">TIFFIN ELIGIBLE (7:00 PM+)</span>
                    </div>
                    <VerifiedBadge />
                  </div>
                )}
              </div>

              <button 
                onClick={handleSave}
                disabled={formData.type !== 'STANDARD' && formData.multiDates.length === 0 && !editingRecord}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-black text-[14px] uppercase shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Save size={18} /> {editingRecord ? 'Update Record' : 'Save Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[300px] rounded-[24px] p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-[16px] font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Confirm Removal?</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-8 font-bold tracking-tight">This entry will be permanently deleted from your attendance log.</p>
            <div className="flex gap-4">
              <button 
                onClick={handleDelete} 
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

export default AttendanceView;
