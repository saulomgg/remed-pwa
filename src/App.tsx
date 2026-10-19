/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Pill,
  Clock,
  AlertTriangle,
  Package,
  Search,
  WifiOff,
  Siren,
} from 'lucide-react';
import {
  Medication,
  DoseLog,
  Pharmacy,
  UserProfile,
  AppSettings,
  ActiveTab,
  MedicalNote,
} from './types';
import { storage, calculateStock } from './utils/storage';
import { syncWithGoogleAppsScript } from './utils/calendar';
import { sound } from './utils/sound';
import { applyTheme } from './utils/theme';
import { notificationService } from './utils/notifications';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MedicationCard } from './components/MedicationCard';
import { MedicationModal } from './components/MedicationModal';
import { StockRestockModal } from './components/StockRestockModal';
import { DosesTodayView } from './components/DosesTodayView';
import { OrderWhatsAppView } from './components/OrderWhatsAppView';
import { PharmaciesView } from './components/PharmaciesView';
import { SettingsView, SettingsSection } from './components/SettingsView';
import { NotesView } from './components/NotesView';
import { FooterWatermark } from './components/FooterWatermark';
import { PWAInstallModal } from './components/PWAInstallModal';
import { EmergencyModal } from './components/EmergencyModal';
import { EmergencyBar } from './components/EmergencyBar';
import { DemoModeBanner } from './components/DemoModeBanner';

export default function App() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [profile, setProfile] = useState<UserProfile>(storage.getProfile());
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  const [notes, setNotes] = useState<MedicalNote[]>([]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('meds');
  const [settingsInitialSection, setSettingsInitialSection] = useState<SettingsSection>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'crit' | 'warn' | 'ok'>('all');

  // Modais
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState<Medication | null>(null);

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockMedication, setRestockMedication] = useState<Medication | null>(null);

  const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);
  const [orderTargetMedId, setOrderTargetMedId] = useState<string | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Toast
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'ok' | 'err' | 'info' | 'warn';
  }>({
    show: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: 'ok' | 'err' | 'info' | 'warn' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  // Inicialização e aplicação de tema dinâmico
  useEffect(() => {
    storage.init();
    loadAllData();

    const initialSettings = storage.getSettings();
    applyTheme(initialSettings);

    const handleOnline = () => {
      setIsOnline(true);
      showToast('Conectado à internet.', 'ok');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Modo Offline — seus dados estão salvos no aparelho.', 'warn');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Aplica tema sempre que as configurações mudarem
  useEffect(() => {
    applyTheme(settings);
  }, [settings]);

  // Monitoramento contínuo para alertas de doses (Notification API em segundo plano)
  useEffect(() => {
    if (!settings.notificationEnabled) return;

    // Checagem imediata ao carregar ou mudar medicamentos
    notificationService.checkDueDoses(medications, doseLogs, (med, horario) => {
      if (settings.soundEnabled) {
        sound.playReminder();
      }
      showToast(`⏰ Hora do Remédio: ${med.nome} (${horario})`, 'warn');
    });

    // Loop periódico a cada 15 segundos
    const timer = setInterval(() => {
      notificationService.checkDueDoses(medications, doseLogs, (med, horario) => {
        if (settings.soundEnabled) {
          sound.playReminder();
        }
        showToast(`⏰ Hora do Remédio: ${med.nome} (${horario})`, 'warn');
      });
    }, 15000);

    // Checa imediatamente ao voltar para a aba ou acordar a tela do aparelho
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        notificationService.checkDueDoses(medications, doseLogs, (med, horario) => {
          if (settings.soundEnabled) {
            sound.playReminder();
          }
          showToast(`⏰ Hora do Remédio: ${med.nome} (${horario})`, 'warn');
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [medications, doseLogs, settings.notificationEnabled, settings.soundEnabled]);

  const loadAllData = () => {
    setMedications(storage.getMedications());
    setDoseLogs(storage.getDoseLogs());
    setPharmacies(storage.getPharmacies());
    setProfile(storage.getProfile());
    setSettings(storage.getSettings());
    setNotes(storage.getNotes());
    setIsDemoMode(storage.isDemoMode());
  };

  const handleClearDemoData = () => {
    storage.clearDemoData();
    loadAllData();
    showToast('Dados de exemplo removidos! O app está zerado para você cadastrar seus remédios.', 'ok');
  };

  const handleLoadDemoData = () => {
    storage.loadDemoData();
    loadAllData();
    showToast('Dados de demonstração recarregados com sucesso!', 'ok');
  };

  const handleSaveNote = (note: MedicalNote) => {
    storage.saveNote(note);
    setNotes(storage.getNotes());
  };

  const handleDeleteNote = (id: string) => {
    storage.deleteNote(id);
    setNotes(storage.getNotes());
  };

  const handleTogglePinNote = (id: string) => {
    storage.togglePinNote(id);
    setNotes(storage.getNotes());
  };

  const handleOpenDonation = () => {
    setSettingsInitialSection('about');
    setActiveTab('settings');
  };

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const updated: AppSettings = { ...settings, theme: nextTheme };
    setSettings(updated);
    storage.saveSettings(updated);
    applyTheme(updated);
    showToast(nextTheme === 'dark' ? 'Modo Escuro ativado.' : 'Modo Claro ativado.', 'info');
  };

  const handleTakeDose = (med: Medication, horario?: string) => {
    const targetTime = horario || med.horarios?.[0] || '08:00';
    storage.recordDoseTaken(med.id, targetTime);
    storage.consumeDose(med.id, med.dosePorVez || 1);

    if (settings.soundEnabled) {
      sound.playDoseTaken();
    }

    loadAllData();
    showToast(`Dose de ${med.nome} registrada como tomada!`, 'ok');
  };

  const handleUndoDose = (med: Medication, horario: string) => {
    storage.undoDoseTaken(med.id, horario);
    storage.unconsumeDose(med.id, med.dosePorVez || 1);
    loadAllData();
    showToast(`Registro desfeito. Estoque corrigido.`, 'info');
  };

  const handleOpenRestock = (med: Medication) => {
    setRestockMedication(med);
    setIsRestockModalOpen(true);
  };

  const handleConfirmRestock = (medId: string, quantidade: number) => {
    const updated = storage.restockMedication(medId, quantidade);
    loadAllData();
    if (updated) {
      showToast(`+${quantidade} unidades adicionadas a ${updated.nome}!`, 'ok');
    }
  };

  const handleSaveMedication = async (med: Medication, syncToCalendar: boolean) => {
    storage.saveMedication(med);
    loadAllData();
    showToast(`"${med.nome}" salvo com sucesso!`, 'ok');

    if (
      (syncToCalendar || settings.googleCalendar.autoSyncOnSave) &&
      settings.googleCalendar.scriptUrl
    ) {
      setIsSyncingCalendar(true);
      const allMeds = storage.getMedications();
      const res = await syncWithGoogleAppsScript(settings.googleCalendar.scriptUrl, allMeds);
      setIsSyncingCalendar(false);
      if (res.success) {
        showToast('Google Agenda sincronizada com os horários atualizados!', 'ok');
      }
    }
  };

  const handleDeleteMedication = (id: string) => {
    storage.deleteMedication(id);
    loadAllData();
    showToast('Medicamento removido.', 'info');
  };

  const handleOrderWhatsAppShortcut = (med: Medication) => {
    setOrderTargetMedId(med.id);
    setActiveTab('order');
  };

  const handleQuickSyncCalendar = async () => {
    if (!settings.googleCalendar.scriptUrl) {
      setActiveTab('settings');
      showToast('Configure a URL do script do Google Agenda primeiro.', 'warn');
      return;
    }
    setIsSyncingCalendar(true);
    const res = await syncWithGoogleAppsScript(settings.googleCalendar.scriptUrl, medications);
    setIsSyncingCalendar(false);
    if (res.success) {
      showToast(res.message, 'ok');
    } else {
      showToast(res.message, 'err');
    }
  };

  // Contadores & Estatísticas
  const { totalMeds, criticalCount, warningCount, pendingDosesToday } = useMemo(() => {
    let crit = 0;
    let warn = 0;
    medications.forEach((m) => {
      const s = calculateStock(m);
      if (s.status === 'crit') crit++;
      else if (s.status === 'warn') warn++;
    });

    const todayStr = storage.getTodayDateString();
    let pending = 0;
    medications.forEach((m) => {
      (m.horarios || []).forEach((h) => {
        const taken = doseLogs.some(
          (l) => l.medicationId === m.id && l.horario === h && l.data === todayStr
        );
        if (!taken) pending++;
      });
    });

    return {
      totalMeds: medications.length,
      criticalCount: crit,
      warningCount: warn,
      pendingDosesToday: pending,
    };
  }, [medications, doseLogs]);

  // Medicamentos filtrados para a listagem
  const filteredMedications = useMemo(() => {
    return medications.filter((m) => {
      const matchSearch =
        m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.dosagem && m.dosagem.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.fabricante && m.fabricante.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      const stock = calculateStock(m);
      if (statusFilter === 'all') return true;
      return stock.status === statusFilter;
    });
  }, [medications, searchTerm, statusFilter]);

  const handleExportBackup = () => {
    const json = storage.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remed-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup exportado com sucesso!', 'ok');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors selection:bg-brand-light selection:text-brand">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'settings') {
            setSettingsInitialSection('calendar');
          }
          setActiveTab(tab);
        }}
        settings={settings}
        onToggleTheme={handleToggleTheme}
        onQuickSyncCalendar={handleQuickSyncCalendar}
        isSyncingCalendar={isSyncingCalendar}
        onOpenNewMedModal={() => {
          setMedicationToEdit(null);
          setIsMedModalOpen(true);
        }}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenDonation={handleOpenDonation}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
      />

      {/* Indicador Offline */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-center text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Modo Offline — O ReMed continua funcionando e salvando seus dados localmente.</span>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {/* ABA: MEDICAMENTOS */}
        {activeTab === 'meds' && (
          <div className="space-y-6">
            {/* Tag Amarela Informativa do Modo Demonstração (Some ao limpar) */}
            {isDemoMode && (
              <DemoModeBanner onClearDemo={handleClearDemoData} />
            )}

            {/* Modo de Emergência & SOS Discreto e Expansível */}
            <EmergencyBar
              profile={profile}
              medications={medications}
              onOpenModal={() => setIsEmergencyModalOpen(true)}
              onOpenSettingsProfile={() => {
                setSettingsInitialSection('profile');
                setActiveTab('settings');
              }}
            />

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div
                onClick={() => setStatusFilter('all')}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  statusFilter === 'all'
                    ? 'border-brand bg-brand-light ring-1 ring-brand shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <span>Total de Remédios</span>
                  <Pill className="h-4 w-4 text-brand" />
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {totalMeds}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">cadastrados no app</div>
              </div>

              <div
                onClick={() => setStatusFilter('crit')}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  statusFilter === 'crit'
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/20 ring-1 ring-rose-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  <span>Estoque Crítico</span>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
                  {criticalCount}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">acabando em ≤ 3 dias</div>
              </div>

              <div
                onClick={() => setStatusFilter('warn')}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  statusFilter === 'warn'
                    ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 ring-1 ring-amber-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-semibold">
                  <span>Em Atenção</span>
                  <Package className="h-4 w-4" />
                </div>
                <div className="mt-2 text-2xl font-black text-amber-700 dark:text-amber-400 tabular-nums">
                  {warningCount}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">acabando em ≤ 7 dias</div>
              </div>

              <div
                onClick={() => setActiveTab('doses')}
                className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <span>Doses Pendentes</span>
                  <Clock className="h-4 w-4 text-brand" />
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {pendingDosesToday}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">para tomar hoje</div>
              </div>
            </div>

            {/* Barra de Busca e Filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por remédio, miligramas ou fabricante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand shadow-xs"
                />
              </div>

              {/* Botões de Filtro */}
              <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'all'
                      ? 'bg-white dark:bg-slate-800 text-brand shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter('crit')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'crit'
                      ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Críticos ({criticalCount})
                </button>
                <button
                  onClick={() => setStatusFilter('warn')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'warn'
                      ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Atenção ({warningCount})
                </button>
                <button
                  onClick={() => setStatusFilter('ok')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'ok'
                      ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Estoque OK
                </button>
              </div>
            </div>

            {/* Grid de Medicamentos */}
            {filteredMedications.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-10 text-center shadow-xs">
                <Pill className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Nenhum medicamento encontrado</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {searchTerm
                    ? 'Tente buscar com outros termos ou limpe o filtro.'
                    : 'Adicione seus remédios com horários e quantidades para começar o controle inteligente.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={() => {
                      setMedicationToEdit(null);
                      setIsMedModalOpen(true);
                    }}
                    className="rounded-xl bg-brand hover:bg-brand-hover px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-xs cursor-pointer"
                  >
                    + Adicionar Primeiro Remédio
                  </button>
                  <button
                    onClick={handleLoadDemoData}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    Carregar Exemplos de Teste
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMedications.map((med) => (
                  <MedicationCard
                    key={med.id}
                    medication={med}
                    onTakeDose={(m) => handleTakeDose(m)}
                    onRestock={handleOpenRestock}
                    onEdit={(m) => {
                      setMedicationToEdit(m);
                      setIsMedModalOpen(true);
                    }}
                    onDelete={handleDeleteMedication}
                    onOrderWhatsApp={handleOrderWhatsAppShortcut}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: DOSES HOJE */}
        {activeTab === 'doses' && (
          <DosesTodayView
            medications={medications}
            doseLogs={doseLogs}
            onTakeDose={handleTakeDose}
            onUndoDose={handleUndoDose}
            onOpenNewMedModal={() => {
              setMedicationToEdit(null);
              setIsMedModalOpen(true);
            }}
          />
        )}

        {/* ABA: CADERNO DE ANOTAÇÕES */}
        {activeTab === 'notes' && (
          <NotesView
            notes={notes}
            medications={medications}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePinNote}
            onShowToast={showToast}
          />
        )}

        {/* ABA: PEDIR WHATSAPP */}
        {activeTab === 'order' && (
          <OrderWhatsAppView
            medications={medications}
            pharmacies={pharmacies}
            profile={profile}
            onSaveProfile={(p) => {
              setProfile(p);
              storage.saveProfile(p);
            }}
            initialSelectedMedId={orderTargetMedId}
            onOpenNewPharmacyModal={() => setIsPharmacyModalOpen(true)}
            onTabChange={setActiveTab}
            onToast={showToast}
          />
        )}

        {/* ABA: FARMÁCIAS */}
        {activeTab === 'pharmacies' && (
          <PharmaciesView
            pharmacies={pharmacies}
            onSavePharmacy={(farm) => {
              storage.savePharmacy(farm);
              loadAllData();
            }}
            onDeletePharmacy={(id) => {
              storage.deletePharmacy(id);
              loadAllData();
            }}
            onSetDefaultPharmacy={(id) => {
              storage.setDefaultPharmacy(id);
              loadAllData();
            }}
            isModalOpen={isPharmacyModalOpen}
            onCloseModal={() => setIsPharmacyModalOpen(false)}
            onOpenModal={() => setIsPharmacyModalOpen(true)}
            onToast={showToast}
          />
        )}

        {/* ABA: AJUSTES & GOOGLE AGENDA */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            initialSection={settingsInitialSection}
            onSaveSettings={(st) => {
              storage.saveSettings(st);
              setSettings(st);
              applyTheme(st);
            }}
            profile={profile}
            onSaveProfile={(pf) => {
              storage.saveProfile(pf);
              setProfile(pf);
            }}
            medications={medications}
            isDemoMode={isDemoMode}
            onClearDemoData={handleClearDemoData}
            onLoadDemoData={handleLoadDemoData}
            onClearAllData={() => {
              storage.clearAllData();
              loadAllData();
            }}
            onImportBackup={(json) => {
              const ok = storage.importBackup(json);
              if (ok) loadAllData();
              return ok;
            }}
            onExportBackup={handleExportBackup}
            onToast={showToast}
          />
        )}

        {/* Marca d'água Saulomgg e saulomgg.github.io no rodapé */}
        <FooterWatermark onOpenAbout={handleOpenDonation} />
      </main>

      {/* Modal Adicionar / Editar Medicamento */}
      <MedicationModal
        isOpen={isMedModalOpen}
        onClose={() => setIsMedModalOpen(false)}
        onSave={handleSaveMedication}
        medicationToEdit={medicationToEdit}
        pharmacies={pharmacies}
        isCalendarConnected={!!settings.googleCalendar.scriptUrl}
      />

      {/* Modal Repor Estoque */}
      <StockRestockModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setRestockMedication(null);
        }}
        medication={restockMedication}
        onConfirmRestock={handleConfirmRestock}
      />

      {/* Modal Baixar Aplicativo PWA */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onSuccess={() => showToast('Aplicativo instalado no seu dispositivo!', 'ok')}
      />

      {/* Modal Modo de Emergência SOS */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        profile={profile}
        medications={medications}
        onSaveProfile={(pf) => {
          storage.saveProfile(pf);
          setProfile(pf);
        }}
        onToast={showToast}
      />

      {/* Barra de Navegação Inferior para Celular */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingDosesCount={pendingDosesToday}
        criticalStockCount={criticalCount}
      />

      {/* Toast Flutuante */}
      {toast.show && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:right-6 z-50 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 shadow-2xl backdrop-blur-md max-w-sm text-xs transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                toast.type === 'ok'
                  ? 'bg-emerald-500'
                  : toast.type === 'err'
                  ? 'bg-rose-500'
                  : toast.type === 'warn'
                  ? 'bg-amber-500'
                  : 'bg-brand'
              }`}
            />
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{toast.message}</span>
          </div>
          <button
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
