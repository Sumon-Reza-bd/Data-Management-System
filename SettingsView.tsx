
import React, { useState } from 'react';
import { 
  User, 
  Moon, 
  Sun, 
  LogOut, 
  Camera, 
  Globe, 
  Palette,
  Check,
  Save,
  Pencil,
  AlertTriangle,
  X,
  Lock,
  KeyRound,
  ShieldCheck,
  Cloud,
  Database
} from 'lucide-react';
import { LanguageType, ThemeType } from './types';
import { supabase } from './supabaseClient';

interface SettingsViewProps {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  profile: {
    name: string;
    email: string;
    role: string;
    imageUrl: string;
  };
  setProfile: React.Dispatch<React.SetStateAction<any>>;
  onLogout: () => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  language, 
  setLanguage, 
  profile, 
  setProfile, 
  onLogout, 
  theme, 
  setTheme,
  showToast
}) => {
  const isDarkMode = theme === 'dark';
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const [tempProfile, setTempProfile] = useState(profile);

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const translations = {
    en: {
      profileSettings: 'Profile Settings',
      fullName: 'Full Name',
      role: 'Role/Designation',
      saveChanges: 'Save Changes',
      editProfile: 'Edit Profile',
      appearance: 'Appearance',
      customizeView: 'Customize your view',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      languageLabel: 'Language',
      regionalLocalization: 'Regional localization',
      securitySettings: 'Security & Password',
      changePassword: 'Change Password',
      updateSecurity: 'Update your login credentials',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      updatePassword: 'Update Password',
      systemAccess: 'System Access',
      securityControls: 'Security controls',
      signOut: 'Sign Out from Account',
      signOutConfirm: 'Sign Out?',
      signOutMsg: 'Are you sure you want to end your current session and sign out?',
      confirm: 'Confirm Logout',
      cancel: 'Cancel',
      cloudStatus: 'Cloud Sync Active',
      backendUrl: 'Supabase Cloud Service'
    },
    bn: {
      profileSettings: 'প্রোফাইল সেটিংস',
      fullName: 'পুরো নাম',
      role: 'পদবী',
      saveChanges: 'পরিবর্তন সংরক্ষণ করুন',
      editProfile: 'ইডিট প্রোফাইল',
      appearance: 'চেহারা',
      customizeView: 'আপনার ভিউ কাস্টমাইজ করুন',
      lightMode: 'লাইট মোড',
      darkMode: 'ডার্ক মোড',
      languageLabel: 'ভাষা',
      regionalLocalization: 'আঞ্চলিক ভাষা',
      securitySettings: 'নিরাপত্তা ও পাসওয়ার্ড',
      changePassword: 'পাসওয়ার্ড পরিবর্তন',
      updateSecurity: 'আপনার লগইন তথ্য আপডেট করুন',
      newPassword: 'নতুন পাসওয়ার্ড',
      confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
      updatePassword: 'পাসওয়ার্ড আপডেট করুন',
      systemAccess: 'সিস্টেম অ্যাক্সেস',
      securityControls: 'নিরাপত্তা নিয়ন্ত্রণ',
      signOut: 'অ্যাকাউন্ট থেকে লগ আউট',
      signOutConfirm: 'লগ আউট করবেন?',
      signOutMsg: 'আপনি কি নিশ্চিত যে আপনি আপনার সেশন শেষ করে লগ আউট করতে চান?',
      confirm: 'লগ আউট নিশ্চিত করুন',
      cancel: 'বাতিল',
      cloudStatus: 'ক্লাউড সিঙ্ক সক্রিয়',
      backendUrl: 'সুপাবেস ক্লাউড সার্ভিস'
    }
  };

  const t = translations[language];

  const handleUpdatePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      alert(language === 'bn' ? "সবগুলো ঘর পূরণ করুন" : "Please fill all fields");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(language === 'bn' ? "পাসওয়ার্ড মিলেনি" : "Passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      if (error) throw error;
      showToast?.(language === 'bn' ? "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!" : "Password updated successfully!", 'success');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      showToast?.(err.message, 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile({ ...tempProfile, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileButtonClick = () => {
    if (isEditingProfile) {
      setProfile((prev: any) => ({
        ...prev,
        name: tempProfile.name,
        avatar: tempProfile.imageUrl
      }));
      setIsEditingProfile(false);
      showToast?.(language === 'bn' ? "প্রোফাইল আপডেট হয়েছে!" : "Profile updated!", 'success');
    } else {
      setTempProfile(profile);
      setIsEditingProfile(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Column 1: Profile */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 ml-4">
            <div className="w-1 h-4 bg-purple-600 rounded-full" />
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.profileSettings}</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-5 shadow-sm relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] rounded-full -mr-10 -mt-10" />
            
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="relative group/avatar">
                <div className="w-32 h-32 rounded-[32px] bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
                  <img src={isEditingProfile ? tempProfile.imageUrl : profile.imageUrl} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                </div>
                {isEditingProfile && (
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-purple-600 text-white rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-all border-4 border-white dark:border-slate-900">
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              
              <div className="mt-4 text-center mb-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{isEditingProfile ? tempProfile.name : profile.name}</h3>
                <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mt-2 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-full inline-block">{isEditingProfile ? tempProfile.role : profile.role}</p>
              </div>

              <div className="w-full space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.fullName}</label>
                  <input 
                    type="text" 
                    value={isEditingProfile ? tempProfile.name : profile.name} 
                    readOnly={!isEditingProfile}
                    onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                    className={`w-full h-8 px-4 border rounded-xl text-[12px] font-bold outline-none transition-all ${
                      isEditingProfile 
                        ? 'bg-white dark:bg-slate-950 border-purple-500 text-slate-900 dark:text-white' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.role}</label>
                  <input 
                    type="text" 
                    value={isEditingProfile ? tempProfile.role : profile.role} 
                    readOnly={!isEditingProfile}
                    onChange={(e) => setTempProfile({...tempProfile, role: e.target.value})}
                    className={`w-full h-8 px-4 border rounded-xl text-[12px] font-bold outline-none transition-all ${
                      isEditingProfile 
                        ? 'bg-white dark:bg-slate-950 border-purple-500 text-slate-900 dark:text-white' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 w-full mt-8">
                <button 
                  onClick={handleProfileButtonClick}
                  className={`flex-1 h-9 rounded-xl font-black text-[11px] uppercase transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    isEditingProfile 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20'
                  }`}
                >
                  {isEditingProfile ? <Save size={16} /> : <Pencil size={14} />}
                  {isEditingProfile ? t.saveChanges : t.editProfile}
                </button>
                {isEditingProfile && (
                  <button 
                    onClick={() => setIsEditingProfile(false)}
                    className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Column 2: Appearance & Language */}
        <section className="space-y-6">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <div className="w-1 h-4 bg-emerald-600 rounded-full" />
                <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.languageLabel}</h2>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-5 shadow-sm group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <Globe size={16} />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.languageLabel}</h3>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.regionalLocalization}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'en', name: 'English', flag: '🇺🇸' },
                    { id: 'bn', name: 'বাংলা', flag: '🇧🇩' }
                  ].map((lang) => (
                    <button key={lang.id} onClick={() => setLanguage(lang.id as LanguageType)} className={`p-2.5 rounded-2xl border-2 flex items-center justify-between px-4 transition-all ${language === lang.id ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-emerald-200'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{lang.flag}</span>
                        <span className={`text-[11px] font-black uppercase tracking-tight ${language === lang.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>{lang.name}</span>
                      </div>
                      {language === lang.id && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.appearance}</h2>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-5 shadow-sm group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <Palette size={16} />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.appearance}</h3>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.customizeView}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={() => setTheme('light')} className={`p-2.5 rounded-2xl border-2 transition-all flex items-center justify-between px-4 ${!isDarkMode ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <Sun size={16} className={!isDarkMode ? 'text-blue-600' : 'text-slate-400'} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${!isDarkMode ? 'text-blue-600' : 'text-slate-400'}`}>{t.lightMode}</span>
                    </div>
                    {!isDarkMode && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </button>
                  <button onClick={() => setTheme('dark')} className={`p-2.5 rounded-2xl border-2 transition-all flex items-center justify-between px-4 ${isDarkMode ? 'border-blue-500 bg-slate-800/50' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <Moon size={16} className={isDarkMode ? 'text-blue-400' : 'text-slate-400'} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-slate-400'}`}>{t.darkMode}</span>
                    </div>
                    {isDarkMode && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Column 3: Security */}
        <section className="space-y-6">
          <div className="flex flex-col gap-6">
            {/* Password Change Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <div className="w-1 h-4 bg-orange-600 rounded-full" />
                <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.securitySettings}</h2>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-5 shadow-sm group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl flex items-center justify-center shadow-inner">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.changePassword}</h3>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.updateSecurity}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.newPassword}</label>
                    <input 
                      type="password" 
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="••••••••"
                      className="w-full h-8 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-[12px] font-bold outline-none focus:border-orange-500 transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.confirmPassword}</label>
                    <input 
                      type="password" 
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="••••••••"
                      className="w-full h-8 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-[12px] font-bold outline-none focus:border-orange-500 transition-all dark:text-white"
                    />
                  </div>
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword}
                    className="w-full h-8 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-[11px] uppercase shadow-lg shadow-orange-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isUpdatingPassword ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ShieldCheck size={16} />}
                    {t.updatePassword}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <div className="w-1 h-4 bg-rose-600 rounded-full" />
                <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.systemAccess}</h2>
              </div>
              <div className="bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 rounded-[32px] p-5 shadow-sm group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-9 h-9 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <LogOut size={18} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-tight">{t.systemAccess}</h3>
                    <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">{t.securityControls}</p>
                  </div>
                </div>
                <button onClick={() => setIsLogoutModalOpen(true)} className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                  <LogOut size={16} /> {t.signOut}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[340px] rounded-[32px] p-10 text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={32} /></div>
            <h2 className="text-[18px] font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{t.signOutConfirm}</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-8 font-bold leading-relaxed">{t.signOutMsg}</p>
            <div className="space-y-3">
              <button onClick={onLogout} className="w-full py-3.5 bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95">{t.confirm}</button>
              <button onClick={() => setIsLogoutModalOpen(false)} className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[11px] font-black uppercase hover:bg-slate-200 transition-all active:scale-95">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
