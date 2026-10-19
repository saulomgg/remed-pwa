import React from 'react';
import { Pill, Clock, ShoppingBag, Building2, Settings, BookOpen } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingDosesCount: number;
  criticalStockCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingDosesCount,
  criticalStockCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pb-safe transition-colors shadow-lg">
      <div className="grid grid-cols-6 items-center h-16 px-0.5">
        {/* Tab 1: Medicamentos */}
        <button
          onClick={() => onTabChange('meds')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors relative ${
            activeTab === 'meds' ? 'text-brand font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Pill className="h-4.5 w-4.5" />
          <span className="text-[9px] font-medium tracking-tight mt-1 truncate max-w-[52px]">Remédios</span>
          {activeTab === 'meds' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-brand" />
          )}
        </button>

        {/* Tab 2: Doses Hoje */}
        <button
          onClick={() => onTabChange('doses')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors relative ${
            activeTab === 'doses' ? 'text-brand font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Clock className="h-4.5 w-4.5" />
            {pendingDosesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-brand px-0.5 text-[8px] font-bold text-white shadow-xs">
                {pendingDosesCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-medium tracking-tight mt-1 truncate max-w-[52px]">Doses</span>
          {activeTab === 'doses' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-brand" />
          )}
        </button>

        {/* Tab 3: Caderno de Anotações */}
        <button
          onClick={() => onTabChange('notes')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors relative ${
            activeTab === 'notes' ? 'text-brand font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="h-4.5 w-4.5" />
          <span className="text-[9px] font-medium tracking-tight mt-1 truncate max-w-[52px]">Caderno</span>
          {activeTab === 'notes' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-brand" />
          )}
        </button>

        {/* Tab 4: Pedir WhatsApp */}
        <button
          onClick={() => onTabChange('order')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors relative ${
            activeTab === 'order' ? 'text-brand font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="h-4.5 w-4.5" />
            {criticalStockCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-rose-500 px-0.5 text-[8px] font-bold text-white shadow-xs">
                {criticalStockCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-medium tracking-tight mt-1 truncate max-w-[52px]">Pedir</span>
          {activeTab === 'order' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-brand" />
          )}
        </button>

        {/* Tab 5: Farmácias */}
        <button
          onClick={() => onTabChange('pharmacies')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors relative ${
            activeTab === 'pharmacies' ? 'text-brand font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="h-4.5 w-4.5" />
          <span className="text-[9px] font-medium tracking-tight mt-1 truncate max-w-[52px]">Farmácias</span>
          {activeTab === 'pharmacies' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-brand" />
          )}
        </button>

        {/* Tab 6: Ajustes & Agenda */}
        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors relative ${
            activeTab === 'settings' ? 'text-brand font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="h-4.5 w-4.5" />
          <span className="text-[9px] font-medium tracking-tight mt-1 truncate max-w-[52px]">Ajustes</span>
          {activeTab === 'settings' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-brand" />
          )}
        </button>
      </div>
    </nav>
  );
};
