import React, { useState } from 'react';
import { ICONS } from './constants';
import { getFinancialAdvice } from './geminiService';
import { ViewType } from './types';

export const DeleteButton: React.FC<{ onClick: () => void, title?: string }> = ({ onClick, title = "Delete" }) => (
  <button 
    onClick={onClick} 
    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/40 active:scale-90 transition-all shadow-sm"
    title={title}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  </button>
);

export const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode 
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden border dark:border-slate-800">
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}>
    {title && (
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 flex justify-between items-center">
        <h3 className="text-base font-semibold text-slate-800 dark:text-white">{title}</h3>
      </div>
    )}
    <div className="p-3 sm:p-4">
      {children}
    </div>
  </div>
);

export const SidebarItem: React.FC<{ 
  id: ViewType | 'logout', 
  label: string, 
  icon: React.ReactNode, 
  active: boolean, 
  onClick: () => void 
}> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 group border shadow-sm ${
      active 
        ? 'bg-[#9333ea] text-white border-[#9333ea] shadow-[#9333ea]/30 scale-[1.02]' 
        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
    }`}
  >
    <div className="flex items-center space-x-3 overflow-hidden">
      <span className={`transition-transform duration-300 shrink-0 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span className={`font-medium text-[10px] sm:text-[11px] uppercase tracking-wider truncate transition-colors duration-300 ${active ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
        {label}
      </span>
    </div>
    
    {active && (
      <div className="w-1.5 h-1.5 bg-white rounded-full shrink-0 ml-2" />
    )}
  </button>
);

export const AIAdvisor: React.FC<{ data: any }> = ({ data }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const advice = await getFinancialAdvice(query, data);
    setResponse(advice);
    setLoading(false);
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-xl shadow-blue-100 dark:shadow-indigo-900/20">
      <div className="flex items-center space-x-3 mb-3">
        <ICONS.Bot className="w-5 h-5 animate-bounce" />
        <h3 className="text-base font-bold">Gemini AI Advisor</h3>
      </div>
      <p className="text-blue-100 text-xs mb-3">Ask me anything about your finances.</p>
      
      {response && (
        <div className="bg-white/10 rounded-lg p-2.5 mb-3 text-[13px] leading-relaxed backdrop-blur-md max-h-36 overflow-y-auto border border-white/20 custom-scrollbar">
          {response}
        </div>
      )}

      <div className="flex space-x-2">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask something..." 
          className="flex-1 bg-white/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs placeholder:text-blue-200 focus:ring-1 focus:ring-white outline-none transition-all"
        />
        <button 
          onClick={handleAsk}
          disabled={loading}
          className="bg-white text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 transition-all transform active:scale-95 disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? '...' : 'Ask'}
        </button>
      </div>
    </Card>
  );
};
