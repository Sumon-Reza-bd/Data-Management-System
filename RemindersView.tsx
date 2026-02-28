
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Pencil, 
  X,
  Save,
  BellRing,
  AlertCircle,
  FileSpreadsheet,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { Reminder } from './types';

interface RemindersViewProps {
  language: 'English' | 'বাংলা';
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const RemindersView: React.FC<RemindersViewProps> = ({ language, reminders, setReminders, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkPreview, setBulkPreview] = useState<Omit<Reminder, 'id' | 'completed'>[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    priority: 'medium' as 'high' | 'medium' | 'low',
    note: ''
  });

  const translations = {
    English: {
      reminders: 'Reminders',
      addReminder: 'Set Reminder',
      bulkAdd: 'Bulk Add (Excel)',
      title: 'Reminder Title',
      date: 'Due Date',
      time: 'Alert Time',
      priority: 'Priority',
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority',
      note: 'Additional Note',
      save: 'Save Reminder',
      completed: 'Completed',
      pending: 'Pending',
      noReminders: 'No reminders in this category',
      overdue: 'OVERDUE',
      upcoming: 'UPCOMING',
      day: 'DAY',
      days: 'DAYS',
      confirmDelete: 'Delete Reminder?',
      deleteMsg: 'Are you sure you want to remove this reminder? This action cannot be undone.',
      delete: 'Delete',
      cancel: 'Cancel',
      bulkTitle: 'Import from Excel',
      bulkPlaceholder: 'Paste here (Format: Date [Tab] Title [Tab] Priority)\ne.g. 2026-02-05    Project Deadline    High',
      import: 'Import All',
      importSuccess: 'Reminders added successfully!',
      preview: 'Import Preview',
      validPriority: 'Priority must be: High, Medium, or Low'
    },
    'বাংলা': {
      reminders: 'রিমাইন্ডার',
      addReminder: 'নতুন রিমাইন্ডার',
      bulkAdd: 'এক্সেলে এড করুন',
      title: 'রিমাইন্ডার শিরোনাম',
      date: 'শেষ তারিখ',
      time: 'অ্যালার্ট সময়',
      priority: 'গুরুত্ব',
      high: 'উচ্চ গুরুত্ব',
      medium: 'মাঝারি গুরুত্ব',
      low: 'নিম্ন গুরুত্ব',
      note: 'অতিরিক্ত নোট',
      save: 'রিমাইন্ডার সংরক্ষণ করুন',
      completed: 'সম্পন্ন',
      pending: 'বাকি আছে',
      noReminders: 'এই ক্যাটাগরিতে কোনো রিমাইন্ডার নেই',
      overdue: 'অতিক্রান্ত',
      upcoming: 'আসন্ন',
      day: 'দিন',
      days: 'দিন',
      confirmDelete: 'রিমাইন্ডার ডিলিট করবেন?',
      deleteMsg: 'আপনি কি নিশ্চিত যে এই রিমাইন্ডারটি মুছে ফেলতে চান? এটি আর ফিরে পাওয়া যাবে না।',
      delete: 'ডিলিট',
      cancel: 'বাতিল',
      bulkTitle: 'এক্সেল থেকে ইমপোর্ট',
      bulkPlaceholder: 'পেস্ট করুন (ডেট [ট্যাব] টাইটেল [ট্যাব] প্রায়োরিটি)\nযেমন: 2026-02-05    প্রজেক্ট ডেডলাইন    High',
      import: 'সব এড করুন',
      importSuccess: 'রিমাইন্ডারগুলো সফলভাবে যুক্ত হয়েছে!',
      preview: 'ইমপোর্ট প্রিভিউ',
      validPriority: 'প্রায়োরিটি হতে হবে: High, Medium, অথবা Low'
    }
  };

  const t = translations[language];

  const toBengaliDigits = (num: string | number) => {
    const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d)]);
  };

  const parsePriority = (val: string): 'high' | 'medium' | 'low' => {
    const v = val.trim().toLowerCase();
    if (v === 'high' || v === 'উচ্চ') return 'high';
    if (v === 'low' || v === 'নিম্ন') return 'low';
    return 'medium';
  };

  useEffect(() => {
    if (!bulkInput.trim()) {
      setBulkPreview([]);
      return;
    }
    const lines = bulkInput.trim().split('\n');
    const parsed: Omit<Reminder, 'id' | 'completed'>[] = [];

    lines.slice(0, 20).forEach(line => {
      let parts = line.split('\t');
      if (parts.length < 2) parts = line.split('  ').filter(p => p.trim().length > 0);
      
      if (parts.length >= 2) {
        let datePart = parts[0].trim();
        let titlePart = parts[1].trim();
        let priorityPart = parts[2] ? parts[2].trim() : 'medium';

        const isValidDate = !isNaN(new Date(datePart).getTime());
        if (isValidDate && titlePart) {
          parsed.push({
            title: titlePart,
            date: new Date(datePart).toISOString().split('T')[0],
            time: '12:00',
            priority: parsePriority(priorityPart),
            note: 'Bulk imported'
          });
        }
      }
    });
    setBulkPreview(parsed);
  }, [bulkInput]);

  const groupedReminders = useMemo(() => {
    const sortReminders = (list: Reminder[]) => 
      [...list].sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

    return {
      high: sortReminders(reminders.filter(r => r.priority === 'high')),
      medium: sortReminders(reminders.filter(r => r.priority === 'medium')),
      low: sortReminders(reminders.filter(r => r.priority === 'low')),
    };
  }, [reminders]);

  const getDayDiff = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(dateStr);
    target.setHours(0,0,0,0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const toggleComplete = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const handleTriggerDelete = (id: string) => {
    setReminderToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (reminderToDelete) {
      setReminders(prev => prev.filter(r => r.id !== reminderToDelete));
      setIsDeleteModalOpen(false);
      setReminderToDelete(null);
      showToast?.(language === 'English' ? 'Reminder deleted!' : 'রিমাইন্ডার মুছে ফেলা হয়েছে!', 'success');
    }
  };

  const handleOpenAdd = () => {
    setEditingReminder(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      priority: 'medium',
      note: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title) return;

    if (editingReminder) {
      setReminders(prev => prev.map(r => r.id === editingReminder.id ? { ...r, ...formData } : r));
      showToast?.(language === 'English' ? 'Reminder updated!' : 'রিমাইন্ডার আপডেট করা হয়েছে!', 'success');
    } else {
      const newReminder: Reminder = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        completed: false
      };
      setReminders(prev => [newReminder, ...prev]);
      showToast?.(language === 'English' ? 'Reminder set!' : 'রিমাইন্ডার সেট করা হয়েছে!', 'success');
    }
    setIsModalOpen(false);
  };

  const handleBulkImport = () => {
    if (bulkPreview.length === 0) return;

    const newReminders: Reminder[] = bulkPreview.map(item => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      completed: false
    }));

    setReminders(prev => [...newReminders, ...prev]);
    setBulkInput('');
    setBulkPreview([]);
    setIsBulkModalOpen(false);
    showToast?.(t.importSuccess, 'success');
  };

  const ReminderCard: React.FC<{ reminder: Reminder }> = ({ reminder }) => {
    const dayDiff = getDayDiff(reminder.date);
    const isOverdue = dayDiff < 0;
    const absDiff = Math.abs(dayDiff);

    return (
      <div 
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all hover:shadow-md group ${reminder.completed ? 'opacity-60 bg-slate-50/50 dark:bg-slate-950/40' : ''}`}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => toggleComplete(reminder.id)}
            className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 ${
              reminder.completed 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-transparent'
            }`}
          >
            {reminder.completed && <CheckCircle2 size={18} strokeWidth={3} />}
            {!reminder.completed && <div className="w-4 h-4 rounded-md border-2 border-slate-100 dark:border-slate-800" />}
          </button>

          <div className="flex flex-col min-w-0">
            <h3 className={`text-[14px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight leading-none truncate max-w-[150px] sm:max-w-none ${reminder.completed ? 'line-through opacity-50' : ''}`}>
              {reminder.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-400">
                {new Date(reminder.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
              </span>
              {!reminder.completed && (
                <span className={`text-[9px] font-black uppercase tracking-widest ${isOverdue ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>
                  {language === 'বাংলা' ? toBengaliDigits(absDiff) : absDiff} {absDiff === 1 ? t.day : t.days} {isOverdue ? t.overdue : t.upcoming}
                </span>
              )}
              {reminder.completed && (
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">
                  {t.completed}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!reminder.completed && (
            <button 
              onClick={() => { setEditingReminder(reminder); setFormData({...formData, title: reminder.title, date: reminder.date, priority: reminder.priority as any, note: reminder.note || ''}); setIsModalOpen(true); }}
              className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 dark:border-indigo-800 shadow-sm active:scale-95"
            >
              <Pencil size={15} />
            </button>
          )}
          <button 
            onClick={() => handleTriggerDelete(reminder.id)}
            className="w-9 h-9 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all border border-rose-100 dark:border-rose-800 shadow-sm active:scale-95"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-[16px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{t.reminders}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1.5">Manage your alerts</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 active:scale-95"
          >
            <FileSpreadsheet size={16} /> {t.bulkAdd}
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
          >
            <Plus size={16} /> {t.addReminder}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-3">
            <div className="w-2 h-4 bg-rose-500 rounded-full" />
            <h3 className="text-[11px] font-black text-rose-600 uppercase tracking-widest">{t.high}</h3>
            <span className="ml-auto bg-rose-50 dark:bg-rose-900/20 text-rose-600 px-2 py-0.5 rounded-full text-[9px] font-black">{groupedReminders.high.length}</span>
          </div>
          <div className="flex flex-col gap-3">
            {groupedReminders.high.length > 0 ? groupedReminders.high.map(r => (
              <ReminderCard key={r.id} reminder={r} />
            )) : (
              <div className="py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center px-4">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t.noReminders}</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 px-3">
            <div className="w-2 h-4 bg-amber-500 rounded-full" />
            <h3 className="text-[11px] font-black text-amber-600 uppercase tracking-widest">{t.medium}</h3>
            <span className="ml-auto bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-2 py-0.5 rounded-full text-[9px] font-black">{groupedReminders.medium.length}</span>
          </div>
          <div className="flex flex-col gap-3">
            {groupedReminders.medium.length > 0 ? groupedReminders.medium.map(r => (
              <ReminderCard key={r.id} reminder={r} />
            )) : (
              <div className="py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center px-4">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t.noReminders}</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 px-3">
            <div className="w-2 h-4 bg-blue-500 rounded-full" />
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest">{t.low}</h3>
            <span className="ml-auto bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-black">{groupedReminders.low.length}</span>
          </div>
          <div className="flex flex-col gap-3">
            {groupedReminders.low.length > 0 ? groupedReminders.low.map(r => (
              <ReminderCard key={r.id} reminder={r} />
            )) : (
              <div className="py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center px-4">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t.noReminders}</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[420px] rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-blue-600" />
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight uppercase">{editingReminder ? t.save : t.addReminder}</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{t.title}</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-300"
                  placeholder="e.g. Salary Payment"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{t.date}</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[12px] font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{t.priority}</label>
                  <div className="relative">
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                      className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[12px] font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="high">{language === 'বাংলা' ? 'উচ্চ' : 'High'}</option>
                      <option value="medium">{language === 'বাংলা' ? 'মাঝারি' : 'Medium'}</option>
                      <option value="low">{language === 'বাংলা' ? 'নিম্ন' : 'Low'}</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Plus size={14} className="rotate-45" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{t.note}</label>
                <textarea 
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[12px] font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm resize-none"
                  placeholder="Optional details..."
                />
              </div>
              <button 
                onClick={handleSave}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[14px] uppercase shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
              >
                <Save size={18} /> {t.save}
              </button>
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
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.bulkTitle}</h2>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl flex items-start gap-3">
                <AlertCircle size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-indigo-700 dark:text-indigo-300 leading-tight uppercase tracking-tight">
                    {language === 'English' ? 'Format: Date [Tab] Title [Tab] Priority' : 'ফরম্যাট: ডেট [ট্যাব] টাইটেল [ট্যাব] প্রায়োরিটি'}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Spreadsheet Data Input</label>
                <textarea 
                  value={bulkInput} 
                  onChange={(e) => setBulkInput(e.target.value)} 
                  placeholder={t.bulkPlaceholder} 
                  className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all shadow-sm resize-none" 
                />
              </div>
              <button onClick={handleBulkImport} disabled={bulkPreview.length === 0} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-[14px] uppercase shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"><Upload size={18} /> {t.import} ({bulkPreview.length})</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[300px] rounded-[32px] p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={32} /></div>
            <h2 className="text-[18px] font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{t.confirmDelete}</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-8 font-bold leading-relaxed">{t.deleteMsg}</p>
            <div className="flex gap-4">
              <button onClick={confirmDelete} className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl text-[12px] font-black uppercase shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95">{t.delete}</button>
              <button onClick={() => { setIsDeleteModalOpen(false); setReminderToDelete(null); }} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[12px] font-black uppercase hover:bg-slate-200 transition-all active:scale-95">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RemindersView;
