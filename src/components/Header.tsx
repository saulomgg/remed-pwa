import React from 'react';
import { Pill, Calendar, Download, RefreshCw, Sun, Moon, Bell, BellRing, BookOpen, Heart, CheckCircle2, Siren } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppSettings, ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  settings: AppSettings;
  onToggleTheme: () => void;
  onQuickSyncCalendar: () => void;
  isSyncingCalendar: boolean;
  onOpenNewMedModal: () => void;
  onOpenInstallModal: () => void;
  onOpenDonation: () => void;
  onOpenEmergency: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  settings,
  onToggleTheme,
  onQuickSyncCalendar,
  isSyncingCalendar,
  onOpenNewMedModal,
  onOpenInstallModal,
  onOpenDonation,
  onOpenEmergency,
}) => {
  const { isInstalled } = usePWAInstall();
  const isDark = settings.theme === 'dark';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Zone 1: Brand wordmark */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onTabChange('meds')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand ring-1 ring-brand">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">ReMed</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand">2026</span>
            </div>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              100% Offline • 100% Privado
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop/Tablet) */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => onTabChange('meds')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'meds'
                ? 'bg-brand-light text-brand font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Medicamentos
          </button>
          <button
            onClick={() => onTabChange('doses')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'doses'
                ? 'bg-brand-light text-brand font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Doses do Dia
          </button>
          <button
            onClick={() => onTabChange('notes')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'bg-brand-light text-brand font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Caderno</span>
          </button>
          <button
            onClick={() => onTabChange('order')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'order'
                ? 'bg-brand-light text-brand font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pedir no WhatsApp
          </button>
          <button
            onClick={() => onTabChange('pharmacies')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'pharmacies'
                ? 'bg-brand-light text-brand font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Farmácias
          </button>
          <button
            onClick={() => onTabChange('settings')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'bg-brand-light text-brand font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Ajustes
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Botão de Emergência SOS Discreto */}
          <button
            onClick={onOpenEmergency}
            title="Abrir Modo de Emergência (SOS)"
            className="flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-2.5 sm:px-3 py-1.5 text-xs font-bold shadow-2xs transition active:scale-95"
          >
            <Siren className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span className="hidden sm:inline">Emergência</span>
            <span className="sm:hidden">SOS</span>
          </button>

          {/* Apoie o Projeto PIX */}
          <button
            onClick={onOpenDonation}
            title="Apoie o projeto ReMed via PIX"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition active:scale-95"
          >
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span className="hidden xl:inline">Apoiar (PIX)</span>
          </button>

          {/* Status Notificações */}
          <button
            onClick={() => onTabChange('settings')}
            title={settings.notificationEnabled ? 'Notificações ativas no navegador' : 'Configurar notificações no navegador'}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
              settings.notificationEnabled
                ? 'border-brand bg-brand-light text-brand'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {settings.notificationEnabled ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          </button>

          {/* Alternador de Tema Claro / Escuro Rápido */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* Botão Baixar / Instalar App PWA */}
          {!isInstalled ? (
            <button
              onClick={onOpenInstallModal}
              title="Baixar e colocar na tela inicial do celular"
              className="flex items-center gap-1.5 rounded-xl border-2 border-brand bg-brand-light/90 px-3 py-1.5 text-xs font-black text-brand hover:bg-brand hover:text-white transition active:scale-95 shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Baixar App</span>
              <span className="sm:hidden">Baixar</span>
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Instalado</span>
            </span>
          )}

          {/* Botão Novo Medicamento */}
          <button
            onClick={onOpenNewMedModal}
            className="flex items-center gap-1.5 rounded-xl bg-brand hover:bg-brand-hover px-3.5 sm:px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <span>+</span>
            <span className="hidden sm:inline">Novo Remédio</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
