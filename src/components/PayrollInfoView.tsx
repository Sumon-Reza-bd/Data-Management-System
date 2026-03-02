
import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2,
  Gift,
  Coins,
  Pencil,
  X,
  Camera,
  Save,
  TrendingUp,
  History,
  Plus,
  Trash2,
  AlertTriangle,
  Check
} from 'lucide-react';
import { PayrollProfile, SalaryHistoryItem, LanguageType, ThemeType } from '../types';

// Helper component for the green dashed circle with white tick
const VerifiedBadge = () => (
  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 bg-emerald-600 rounded-full border border-dashed border-emerald-300 shadow-sm transition-transform hover:scale-110">
    <Check size={10} strokeWidth={4} className="text-white" />
  </div>
);

interface PayrollInfoViewProps {
  language?: LanguageType;
  theme?: ThemeType;
  payrollProfile: PayrollProfile;
  setPayrollProfile: React.Dispatch<React.SetStateAction<PayrollProfile>>;
  salaryHistory: SalaryHistoryItem[];
  setSalaryHistory: React.Dispatch<React.SetStateAction<SalaryHistoryItem[]>>;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const PayrollInfoView: React.FC<PayrollInfoViewProps> = ({ 
  payrollProfile, 
  setPayrollProfile, 
  salaryHistory, 
  setSalaryHistory,
  showToast = () => {}
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PaySlipSection profileData={payrollProfile} setProfileData={setPayrollProfile} showToast={showToast} />
      <SalarySection profileBaseDeduction={payrollProfile.baseDeduction} history={salaryHistory} setHistory={setSalaryHistory} />
    </div>
  );
};

interface PaySlipProps {
  profileData: PayrollProfile;
  setProfileData: React.Dispatch<React.SetStateAction<PayrollProfile>>;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const PaySlipSection: React.FC<PaySlipProps> = ({ profileData, setProfileData, showToast }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempData, setTempData] = useState<PayrollProfile>(profileData);

  const handleNumericChange = (field: keyof PayrollProfile, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    
    if (field === 'grossSalary' || field === 'baseDeduction') {
      const gross = field === 'grossSalary' ? numValue : Number(tempData.grossSalary);
      const baseDed = field === 'baseDeduction' ? numValue : Number(tempData.baseDeduction);
      
      const basic = Math.round((gross - baseDed) / 1.5);
      const rent = Math.round(basic / 2);
      const yearly = Math.round(gross / 1.5);
      const eid = Math.round((gross - baseDed) / 1.5);
      
      setTempData((prev: PayrollProfile) => ({
        ...prev,
        [field]: numValue,
        basicSalary: basic,
        houseRent: rent,
        yearlyBonus: yearly,
        eidBonus: eid
      }));
    } else {
      setTempData((prev: PayrollProfile) => ({
        ...prev,
        [field]: numValue
      }));
    }
  };

  const modalRealTimeTotal = useMemo(() => {
    return (
      Number(tempData.basicSalary || 0) + 
      Number(tempData.houseRent || 0) + 
      Number(tempData.medical || 0) + 
      Number(tempData.conveyance || 0) + 
      Number(tempData.food || 0) + 
      Number(tempData.attendanceBonus || 0) +
      (Number(tempData.tiffinBillDays || 0) * Number(tempData.tiffinRate || 0))
    );
  }, [
    tempData.basicSalary, 
    tempData.houseRent, 
    tempData.medical, 
    tempData.conveyance, 
    tempData.food, 
    tempData.attendanceBonus,
    tempData.tiffinBillDays, 
    tempData.tiffinRate
  ]);

  const handleSave = () => {
    const finalizedData = { ...tempData };
    const numericFields: (keyof PayrollProfile)[] = ['grossSalary', 'baseDeduction', 'medical', 'conveyance', 'food', 'attendanceBonus', 'tiffinBillDays', 'tiffinRate', 'basicSalary', 'houseRent', 'yearlyBonus', 'eidBonus'];
    numericFields.forEach(field => {
      // @ts-expect-error: finalizedData[field] might be string during conversion
      finalizedData[field] = finalizedData[field] === '' ? 0 : Number(finalizedData[field]);
    });
    
    setProfileData(finalizedData);
    setIsEditModalOpen(false);
    showToast?.('Payroll profile updated!', 'success');
  };

  const totalBonus = profileData.yearlyBonus + (profileData.eidBonus * 2);
  const totalTiffin = profileData.tiffinBillDays * profileData.tiffinRate;
  
  const calculatedTotalEarnings = profileData.basicSalary + 
                                 profileData.houseRent + 
                                 profileData.medical + 
                                 profileData.conveyance + 
                                 profileData.food + 
                                 profileData.attendanceBonus + 
                                 totalTiffin;


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempData({ ...tempData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center group relative transition-all hover:border-blue-400/50">
          <button 
            onClick={() => { setTempData(profileData); setIsEditModalOpen(true); }}
            className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-all border border-slate-200 dark:border-slate-700"
          >
            <Pencil size={14} />
          </button>
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-blue-500 shadow-xl overflow-hidden">
              <img src={profileData.imageUrl} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-white">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none mb-2">{profileData.name}</h3>
          <p className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest mb-4">{profileData.role}</p>
          <div className="w-full space-y-2 mt-2">
            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-[10px] font-black text-slate-400 uppercase">Department</span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase">{profileData.department}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-[10px] font-black text-slate-400 uppercase">Employee ID</span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{profileData.employeeId}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">Gross Salary</span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">৳ {profileData.grossSalary.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Earnings & Allowances Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="text-[11px] font-black text-blue-600 dark:text-blue-400 -mx-5 -mt-5 mb-5 px-5 py-3 bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/50 rounded-t-xl flex items-center gap-2 uppercase tracking-tight">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Earnings & Allowances
          </h3>
          <div className="space-y-3 flex-1">
            {[
              { label: 'Basic Salary', value: `৳ ${profileData.basicSalary.toLocaleString()}` },
              { label: 'House Rent Allowance', value: `৳ ${profileData.houseRent.toLocaleString()}` },
              { label: 'Medical Allowance', value: `৳ ${profileData.medical.toLocaleString()}` },
              { label: 'Conveyance Allowance', value: `৳ ${profileData.conveyance.toLocaleString()}` },
              { label: 'Food Allowance', value: `৳ ${profileData.food.toLocaleString()}` },
              { label: 'Attendance Bonus', value: `৳ ${profileData.attendanceBonus.toLocaleString()}` },
              { label: `Tiffin ${profileData.tiffinBillDays} Days`, value: `৳ ${totalTiffin.toLocaleString()}` },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{item.label}</span>
                <span className="text-[12px] font-black text-slate-800 dark:text-white">{item.value}</span>
              </div>
            ))}
            <div className="mt-auto pt-4">
              <div className="p-3.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Total Earnings</span>
                <span className="text-base font-black tracking-tight leading-none">৳ {calculatedTotalEarnings.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bonus Breakdown Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 -mx-5 -mt-5 mb-5 px-5 py-3 bg-emerald-50/50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/50 rounded-t-xl flex items-center gap-2 uppercase tracking-tight">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Bonus Breakdown
          </h3>
          <div className="space-y-3 flex-1">
            {[
              { label: 'Yearly Bonus', value: profileData.yearlyBonus, icon: <Gift size={14} /> },
              { label: 'Eid-ul-Fitr Bonus', value: profileData.eidBonus, icon: <Coins size={14} /> },
              { label: 'Eid-ul-Adha Bonus', value: profileData.eidBonus, icon: <Coins size={14} /> },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0 group">
                <div className="flex items-center gap-2">
                  <div className="text-emerald-500 dark:text-emerald-400 transition-transform group-hover:scale-110">{item.icon}</div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{item.label}</span>
                </div>
                <span className="text-[12px] font-black text-slate-800 dark:text-white">৳ {item.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="mt-auto pt-4">
              <div className="p-3.5 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Total Bonus</span>
                <span className="text-base font-black tracking-tight leading-none">৳ {totalBonus.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[480px] rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <Pencil size={18} className="text-blue-600" />
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight uppercase">Edit Profile & Payroll</h2>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Personal Details</h4>
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <img src={tempData.imageUrl} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20" alt="Preview" />
                    <label className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera size={16} className="text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input type="text" value={tempData.name} onChange={(e) => setTempData({...tempData, name: e.target.value})} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                      <input type="text" value={tempData.role} onChange={(e) => setTempData({...tempData, role: e.target.value})} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <input type="text" value={tempData.department} onChange={(e) => setTempData({...tempData, department: e.target.value})} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
                    <input type="text" value={tempData.employeeId} onChange={(e) => setTempData({...tempData, employeeId: e.target.value})} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Salary Components</h4>
                   <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight">Real-time Total: ৳ {modalRealTimeTotal.toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Gross Salary (৳)</label>
                    <input type="number" value={tempData.grossSalary} onChange={(e) => handleNumericChange('grossSalary', e.target.value)} className="w-full h-10 px-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-400 dark:border-blue-600 rounded-xl text-[13px] font-semibold text-blue-800 dark:text-blue-400 outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Base Deduction (৳)</label>
                    <input type="number" value={tempData.baseDeduction} onChange={(e) => handleNumericChange('baseDeduction', e.target.value)} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Basic Salary (Auto)</label>
                    <div className="relative">
                      <input type="number" value={tempData.basicSalary} readOnly className="w-full h-10 px-4 pr-10 bg-slate-200 dark:bg-black/40 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none cursor-default shadow-sm" />
                      <VerifiedBadge />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">House Rent (Auto)</label>
                    <div className="relative">
                      <input type="number" value={tempData.basicSalary ? Math.round(tempData.basicSalary / 2) : 0} readOnly className="w-full h-10 px-4 pr-10 bg-slate-200 dark:bg-black/40 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none cursor-default shadow-sm" />
                      <VerifiedBadge />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Medical (৳)</label>
                    <input type="number" value={tempData.medical} onChange={(e) => handleNumericChange('medical', e.target.value)} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Conveyance (৳)</label>
                    <input type="number" value={tempData.conveyance} onChange={(e) => handleNumericChange('conveyance', e.target.value)} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Food (৳)</label>
                    <input type="number" value={tempData.food} onChange={(e) => handleNumericChange('food', e.target.value)} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Attendance Bonus (৳)</label>
                    <input type="number" value={tempData.attendanceBonus} onChange={(e) => handleNumericChange('attendanceBonus', e.target.value)} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Tiffin Management</label>
                      <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">৳ {((Number(tempData.tiffinBillDays) || 0) * (Number(tempData.tiffinRate) || 0)).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Days</label>
                        <input type="number" value={tempData.tiffinBillDays} placeholder="Days" onChange={(e) => handleNumericChange('tiffinBillDays', e.target.value)} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Rate (৳)</label>
                        <input type="number" value={tempData.tiffinRate} placeholder="Rate (৳)" onChange={(e) => handleNumericChange('tiffinRate', e.target.value)} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Bonus Components (Auto)</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Yearly Bonus</label>
                    <div className="relative">
                      <input type="number" value={tempData.yearlyBonus} readOnly className="w-full h-10 px-4 pr-10 bg-slate-200 dark:bg-black/40 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none cursor-default shadow-sm" />
                      <VerifiedBadge />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Eid Bonus</label>
                    <div className="relative">
                      <input type="number" value={tempData.eidBonus} readOnly className="w-full h-10 px-4 pr-10 bg-slate-200 dark:bg-black/40 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none cursor-default shadow-sm" />
                      <VerifiedBadge />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3 border-t border-slate-100 dark:border-slate-700/50">
              <button onClick={handleSave} className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[14px] uppercase shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"><Save size={16} />Save Changes</button>
              <button onClick={() => setIsEditModalOpen(false)} className="px-6 h-12 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-xl font-black text-[14px] uppercase hover:bg-slate-100 dark:hover:bg-slate-600 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface SalaryProps {
  profileBaseDeduction: number;
  history: SalaryHistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<SalaryHistoryItem[]>>;
}

const SalarySection: React.FC<SalaryProps> = ({ profileBaseDeduction, history, setHistory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ year: number | string; inc: number | string }>({
    year: new Date().getFullYear(),
    inc: ''
  });

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return Number(b.id) - Number(a.id);
    });
  }, [history]);

  const joinSalary = useMemo(() => {
    if (history.length === 0) return 0;
    return [...history].sort((a, b) => a.year - b.year || Number(b.id) - Number(a.id))[0].total;
  }, [history]);

  const currentSalary = sortedHistory.length > 0 ? sortedHistory[0].total : 0;

  const calculations = useMemo(() => {
    const listForCalc = [...history].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return Number(b.id) - Number(a.id);
    });
    
    let previousTotal = 0;
    const yearVal = Number(formData.year) || 0;
    const baseDedVal = profileBaseDeduction;
    const incVal = Number(formData.inc) || 0;

    if (editingId) {
      const currentIndex = listForCalc.findIndex(h => h.id === editingId);
      if (currentIndex > 0) previousTotal = listForCalc[currentIndex - 1].total;
    } else {
      const candidates = listForCalc.filter(h => h.year < yearVal);
      if (candidates.length > 0) previousTotal = candidates[candidates.length - 1].total;
      else if (listForCalc.length > 0) {
        const sameYearCandidates = listForCalc.filter(h => h.year === yearVal);
        if (sameYearCandidates.length > 0) previousTotal = sameYearCandidates[sameYearCandidates.length - 1].total;
      }
    }

    const amt = Math.round((previousTotal - baseDedVal) * (incVal / 100));
    const total = previousTotal + amt;
    
    return { previousTotal, amt, total };
  }, [formData.year, formData.inc, profileBaseDeduction, history, editingId]);

  const handleSave = () => {
    const finalYear = Number(formData.year) || new Date().getFullYear();
    const finalInc = Number(formData.inc) || 0;

    if (editingId) {
      setHistory(prev => prev.map(h => h.id === editingId ? { 
        ...h, 
        year: finalYear, 
        inc: finalInc,
        amt: calculations.amt,
        total: calculations.total
      } : h));
    } else {
      setHistory(prev => [
        { 
          id: Date.now().toString(), 
          year: finalYear, 
          inc: finalInc, 
          amt: calculations.amt, 
          total: calculations.total 
        },
        ...prev
      ]);
    }
    setIsModalOpen(false);
    setEditingId(null);
  };

  const openEdit = (item: SalaryHistoryItem) => {
    setEditingId(item.id);
    setFormData({ year: item.year, inc: item.inc });
    setIsModalOpen(true);
  };

  const triggerDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setHistory(prev => prev.filter(h => h.id !== itemToDelete));
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Join Salary - Vibrant Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-5 rounded-2xl flex items-center justify-between group transition-all hover:scale-[1.02] shadow-lg shadow-indigo-600/20 text-white">
          <div>
            <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">Join Salary</p>
            <h3 className="text-lg font-black tracking-tight leading-none">৳{joinSalary.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-400/30 text-white flex items-center justify-center group-hover:scale-110 transition-transform"><History size={24} /></div>
        </div>
        
        {/* Current Salary - Vibrant Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 rounded-2xl flex items-center justify-between group transition-all hover:scale-[1.02] shadow-lg shadow-emerald-600/20 text-white">
          <div>
            <p className="text-[10px] font-black text-emerald-50 text-white uppercase tracking-widest mb-1">Current Salary</p>
            <h3 className="text-lg font-black tracking-tight leading-none">৳{currentSalary.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-400/30 text-white flex items-center justify-center group-hover:rotate-12 transition-transform"><TrendingUp size={24} /></div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-tight flex items-center gap-2"><div className="w-1 h-4 bg-blue-600 rounded-full" />Salary History & Growth Analysis</h3>
          <button onClick={() => { setEditingId(null); setFormData({ year: new Date().getFullYear(), inc: '' }); setIsModalOpen(true); }} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Plus size={16} />Add Increment</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-orange-50 dark:bg-orange-900/20">
                <th className="px-6 py-2 text-[10px] font-black text-orange-800 dark:text-orange-400 uppercase tracking-wider">Year</th>
                <th className="px-6 py-2 text-[10px] font-black text-orange-800 dark:text-orange-400 uppercase tracking-wider">% Increase</th>
                <th className="px-6 py-2 text-[10px] font-black text-orange-800 dark:text-orange-400 uppercase tracking-wider">Amount +</th>
                <th className="px-6 py-2 text-[10px] font-black text-orange-800 dark:text-orange-400 uppercase tracking-wider">G.Total</th>
                <th className="px-6 py-2 text-[10px] font-black text-orange-800 dark:text-orange-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedHistory.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group">
                  <td className="px-6 py-1.5 text-[12px] font-black text-slate-700 dark:text-slate-200">{row.year}</td>
                  <td className="px-6 py-1.5">
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${row.inc > 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{row.inc.toFixed(1)}%</span>
                  </td>
                  <td className={`px-6 py-1.5 text-[12px] font-bold ${row.amt > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>{row.amt > 0 ? `+৳${row.amt.toLocaleString()}` : '৳0'}</td>
                  <td className="px-6 py-1.5 text-[13px] font-black text-slate-900 dark:text-white tracking-tight">৳{row.total.toLocaleString()}</td>
                  <td className="px-6 py-1.5 text-right flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => triggerDelete(row.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[420px] rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-blue-600" />
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight uppercase">{editingId ? 'Edit Increment' : 'Add Increment'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Previous Total (Auto)</label>
                <div className="relative">
                  <div className="w-full h-10 px-4 pr-10 bg-slate-200 dark:bg-black/30 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white flex items-center cursor-default shadow-sm">
                    ৳ {calculations.previousTotal.toLocaleString()}
                  </div>
                  <VerifiedBadge />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Effective Year</label>
                  <input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                </div>
                <div className="space-y-1 group relative">
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Base Deduction (Auto)</label>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={profileBaseDeduction} 
                      readOnly 
                      className="w-full h-10 px-4 pr-10 bg-slate-200 dark:bg-black/40 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-slate-900 dark:text-white outline-none cursor-default shadow-sm" 
                    />
                    <VerifiedBadge />
                    <div className="absolute inset-0 bg-transparent" title="Value synced from Profile Settings" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">% Increase</label>
                  <input type="number" step="0.1" value={formData.inc} onChange={(e) => setFormData({...formData, inc: e.target.value})} className="w-full h-10 px-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-400 dark:border-emerald-600 rounded-xl text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 outline-none focus:border-emerald-500 transition-all shadow-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Amount + (Auto)</label>
                  <div className="relative">
                    <div className="w-full h-10 px-4 pr-10 bg-slate-200 dark:bg-black/40 border border-slate-400 dark:border-slate-600 rounded-xl text-[13px] font-semibold text-emerald-600 flex items-center cursor-default shadow-sm">
                      ৳ {calculations.amt.toLocaleString()}
                    </div>
                    <VerifiedBadge />
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Gross Total (Auto)</label>
                <div className="relative">
                  <div className="w-full h-12 px-4 pr-12 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600 rounded-xl text-[18px] font-black text-blue-600 dark:text-blue-400 flex items-center shadow-sm">
                    ৳ {calculations.total.toLocaleString()}
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-emerald-600 rounded-full border-2 border-dashed border-white/50 shadow-sm">
                    <Check size={14} strokeWidth={4} className="text-white" />
                  </div>
                </div>
              </div>

              <button onClick={handleSave} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[14px] uppercase shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all mt-4"><Save size={16} />SAVE INCREMENT</button>
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
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-8 font-bold tracking-tight">Are you sure you want to delete this increment record from the history?</p>
            <div className="flex gap-4">
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl text-[12px] font-black uppercase shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors active:scale-95"
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

export default PayrollInfoView;
