import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Download,
  Upload,
  User,
  Palette,
  Volume2,
  Trash2,
  ShieldCheck,
  Play,
  Sun,
  Moon,
  Laptop,
  Bell,
  BellRing,
  AlertCircle,
  CheckCircle2,
  Heart,
  Smartphone,
  Sparkles,
  Share,
  MoreVertical,
  Info,
  WifiOff,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';
import { AppSettings, UserProfile, Medication, AccentColor } from '../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils/googleAppsScript';
import { testGoogleAppsScript, syncWithGoogleAppsScript, downloadICS } from '../utils/calendar';
import { sound } from '../utils/sound';
import { COLOR_PALETTES } from '../utils/theme';
import { notificationService } from '../utils/notifications';
import { usePWAInstall } from '../hooks/usePWAInstall';

export type SettingsSection = 'about' | 'donation' | 'install' | 'calendar' | 'notifications' | 'appearance' | 'profile' | 'backup';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  medications: Medication[];
  isDemoMode?: boolean;
  onClearDemoData?: () => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  onImportBackup: (json: string) => boolean;
  onExportBackup: () => void;
  onToast: (msg: string, type?: 'ok' | 'err' | 'info' | 'warn') => void;
  initialSection?: SettingsSection;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  profile,
  onSaveProfile,
  medications,
  isDemoMode,
  onClearDemoData,
  onLoadDemoData,
  onClearAllData,
  onImportBackup,
  onExportBackup,
  onToast,
  initialSection = 'calendar',
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [scriptUrlInput, setScriptUrlInput] = useState(settings.googleCalendar.scriptUrl || '');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);

  const { isInstalled, isIOS, canPromptDirectly, install } = usePWAInstall();
  const [installStatus, setInstallStatus] = useState<'idle' | 'prompting' | 'success' | 'manual'>('idle');

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const handleCopyPix = (pixKey: string) => {
    navigator.clipboard?.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
    onToast('Chave PIX copiada! Cole no app do seu banco.', 'ok');
  };

  const handleInstallClick = async () => {
    setInstallStatus('prompting');
    const result = await install();
    if (result === 'installed') {
      setInstallStatus('success');
      onToast('Aplicativo instalado com sucesso!', 'ok');
    } else if (result === 'manual') {
      setInstallStatus('manual');
    } else {
      setInstallStatus('idle');
    }
  };

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    notificationService.getPermission()
  );

  const [profileForm, setProfileForm] = useState<UserProfile>({ ...profile });

  const handleToggleNotifications = async (enable: boolean) => {
    if (!notificationService.isSupported()) {
      onToast('Seu navegador não tem suporte à API de Notificações.', 'err');
      return;
    }

    if (enable) {
      const granted = await notificationService.requestPermission();
      const currentPerm = notificationService.getPermission();
      setNotificationPermission(currentPerm);

      if (granted) {
        const updated: AppSettings = { ...settings, notificationEnabled: true };
        onSaveSettings(updated);
        onToast('Notificações no navegador ativadas com sucesso!', 'ok');
        notificationService.sendNotification('🔔 Notificações Ativadas no ReMed!', {
          body: 'Você receberá lembretes nativos quando for o horário das suas doses.',
        });
      } else {
        const updated: AppSettings = { ...settings, notificationEnabled: false };
        onSaveSettings(updated);
        onToast('Permissão de notificação negada. Ative nas permissões do navegador.', 'warn');
      }
    } else {
      const updated: AppSettings = { ...settings, notificationEnabled: false };
      onSaveSettings(updated);
      onToast('Notificações no navegador desativadas.', 'info');
    }
  };

  const handleTestNotification = async () => {
    if (!notificationService.isSupported()) {
      onToast('Notificações não são suportadas neste navegador.', 'err');
      return;
    }

    const currentPerm = notificationService.getPermission();
    if (currentPerm !== 'granted') {
      const granted = await notificationService.requestPermission();
      setNotificationPermission(notificationService.getPermission());
      if (!granted) {
        onToast('Permissão de notificação não foi concedida.', 'warn');
        return;
      }
    }

    const sent = await notificationService.sendTestNotification();
    if (sent) {
      if (settings.soundEnabled) sound.playReminder();
      onToast('Notificação de teste disparada!', 'ok');
    } else {
      onToast('Não foi possível disparar a notificação. Verifique se estão bloqueadas.', 'err');
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
    onToast('Código do Google Apps Script copiado!', 'ok');
  };

  const handleSaveCalendarConfig = () => {
    const updated: AppSettings = {
      ...settings,
      googleCalendar: {
        ...settings.googleCalendar,
        scriptUrl: scriptUrlInput.trim(),
        enabled: !!scriptUrlInput.trim(),
      },
    };
    onSaveSettings(updated);
    onToast('Configurações da Google Agenda salvas!', 'ok');
  };

  const handleTestConnection = async () => {
    if (!scriptUrlInput.trim()) {
      onToast('Cole a URL do Webhook do Google Apps Script antes de testar.', 'warn');
      return;
    }
    setIsTestingConnection(true);
    const result = await testGoogleAppsScript(scriptUrlInput);
    setIsTestingConnection(false);

    if (result.success) {
      onToast(result.message, 'ok');
      const updated: AppSettings = {
        ...settings,
        googleCalendar: {
          ...settings.googleCalendar,
          scriptUrl: scriptUrlInput.trim(),
          enabled: true,
          status: 'connected',
        },
      };
      onSaveSettings(updated);
    } else {
      onToast(result.message, 'err');
    }
  };

  const handleSyncAllMedications = async () => {
    if (!scriptUrlInput.trim()) {
      onToast('Configure a URL do Google Apps Script antes de sincronizar.', 'warn');
      return;
    }
    setIsSyncing(true);
    const result = await syncWithGoogleAppsScript(scriptUrlInput, medications);
    setIsSyncing(false);

    if (result.success) {
      onToast(result.message, 'ok');
      const updated: AppSettings = {
        ...settings,
        googleCalendar: {
          ...settings.googleCalendar,
          lastSyncTimestamp: new Date().toISOString(),
          status: 'connected',
        },
      };
      onSaveSettings(updated);
    } else {
      onToast(result.message, 'err');
    }
  };

  const handleDownloadICS = () => {
    if (medications.length === 0) {
      onToast('Nenhum medicamento para exportar.', 'warn');
      return;
    }
    downloadICS(medications);
    onToast('Arquivo .ics baixado! Abra para importar na sua agenda.', 'ok');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profileForm);
    onToast('Perfil salvo com sucesso!', 'ok');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = onImportBackup(content);
        if (ok) {
          onToast('Backup importado com sucesso! Dados atualizados.', 'ok');
        } else {
          onToast('Arquivo de backup inválido ou corrompido.', 'err');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Abas das Configurações */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xs">
        <button
          onClick={() => setActiveSection('about')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition ${
            activeSection === 'about' || activeSection === 'donation'
              ? 'bg-brand text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Info className="h-4 w-4" />
          <span>Sobre o Projeto</span>
        </button>

        <button
          onClick={() => setActiveSection('install')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition ${
            activeSection === 'install'
              ? 'bg-brand text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          <span>Baixar Aplicativo (PWA)</span>
        </button>

        <button
          onClick={() => setActiveSection('calendar')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition ${
            activeSection === 'calendar'
              ? 'bg-brand text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Google Agenda & Alarmes</span>
        </button>

        <button
          onClick={() => setActiveSection('notifications')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition ${
            activeSection === 'notifications'
              ? 'bg-brand text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Notificações do Navegador</span>
        </button>

        <button
          onClick={() => setActiveSection('appearance')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition ${
            activeSection === 'appearance'
              ? 'bg-brand text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>Cores & Aparência</span>
        </button>

        <button
          onClick={() => setActiveSection('profile')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition ${
            activeSection === 'profile'
              ? 'bg-brand text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Perfil & Emergência</span>
        </button>

        <button
          onClick={() => setActiveSection('backup')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition ${
            activeSection === 'backup'
              ? 'bg-brand text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Dados & Backup</span>
        </button>
      </div>

      {/* SEÇÃO DEDICADA: SOBRE O PROJETO, PILARES, MANIFESTO & APOIO */}
      {(activeSection === 'about' || activeSection === 'donation') && (
        <div className="space-y-6 animate-fade-in">
          {/* Header do Projeto */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand ring-1 ring-brand shadow-xs">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      Sobre o Projeto ReMed
                    </h2>
                    <span className="rounded-full bg-brand-light text-brand px-2.5 py-0.5 text-[11px] font-bold">
                      v2026 • Independente
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Desenvolvido por <strong>Saulo Meira (Saulomgg)</strong> •{' '}
                    <a
                      href="https://saulomgg.github.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand font-bold underline hover:text-brand-hover inline-flex items-center gap-1"
                    >
                      <span>saulomgg.github.io</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyPix('saulomg2@hotmail.com')}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition active:scale-95"
                >
                  {copiedPix ? <Check className="h-4 w-4" /> : <Heart className="h-4 w-4 fill-current" />}
                  <span>{copiedPix ? 'Chave PIX Copiada!' : 'Apoiar com PIX'}</span>
                </button>
              </div>
            </div>

            {/* Três Pilares Fundamentais */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4">
                <div className="flex items-center gap-2 text-brand font-bold text-sm">
                  <WifiOff className="h-4 w-4" />
                  <span>100% Offline</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Funciona sem internet, no modo avião e em qualquer lugar. Seus horários e remédios sempre disponíveis.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="h-4 w-4" />
                  <span>100% Privado</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ninguém além de você vê. Seus remédios, horários e anotações médicas ficam salvos apenas no seu aparelho.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Zero Anúncios</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Sem comerciais, sem banners piscando na tela e sem venda de dados para anunciantes ou farmácias.
                </p>
              </div>
            </div>

            {/* Manifesto & Propósito do Projeto */}
            <div className="mt-6 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-5 leading-relaxed text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Por que o ReMed foi desenvolvido?
              </h3>
              <p>
                Este programa foi concebido especialmente para o público que <strong>precisa de controle diário, rigoroso e descomplicado de seus medicamentos</strong> — seja para tratamento contínuo, cuidados com idosos na família ou uso pessoal.
              </p>
              <p>
                A maioria esmagadora dos aplicativos que você encontra por aí nas lojas de aplicativos são <strong>cheios de propagandas abusivas</strong>, cobram assinaturas mensais caras (custando entre R$ 20 a R$ 50 por mês) e obrigam você a criar conta salvando seus dados médicos em servidores externos...
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                O ReMed foi construído sob um compromisso irredutível: <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Privado</span> (ninguém além de você vê seus remédios e anotações), <span className="text-brand font-bold">100% Offline</span> (funciona em qualquer lugar sem sinal) e com zero anúncios invasivos.
              </p>
            </div>

            {/* Comparativo em Cards / Tabela */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Mercado Comum */}
              <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-200 dark:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs">
                    ✕
                  </span>
                  <h3 className="text-sm font-bold text-rose-900 dark:text-rose-300">
                    Outros Aplicativos do Mercado
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>Cheios de Anúncios:</strong> Banners piscando e vídeos de comerciais a cada tela.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>Assinaturas Caras:</strong> Cobram de <strong>R$ 19,90 a R$ 49,90 ao mês</strong> para liberar recursos básicos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>Presos à Nuvem:</strong> Se faltar internet ou sinal na rua, você fica sem acesso aos seus horários.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>Seus dados de saúde expostos:</strong> Rastreamento de dados e vendas para empresas farmacêuticas.</span>
                  </li>
                </ul>
              </div>

              {/* Card ReMed */}
              <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                    ✓
                  </span>
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                    ReMed (Desenvolvido por Saulomgg)
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span><strong>100% Offline:</strong> Funciona completo sem internet, no modo avião e em qualquer lugar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span><strong>100% Privado:</strong> Toda a sua rotina fica gravada exclusivamente no seu celular.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span><strong>Zero Propagandas:</strong> Sem nenhum anúncio, sem pop-up, foco total no seu bem-estar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span><strong>Gratuito & Completo:</strong> Alarmes na Google Agenda, WhatsApp da farmácia e Caderno de Anotações livres.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* BOX PIX COPIE E COLE */}
            <div className="mt-8 rounded-3xl border-2 border-emerald-500/50 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Chave PIX Oficial (E-mail):
                  </span>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="font-mono text-base sm:text-xl font-black text-slate-900 dark:text-white select-all">
                      saulomg2@hotmail.com
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyPix('saulomg2@hotmail.com')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs sm:text-sm font-bold transition active:scale-95 shadow-sm"
                >
                  {copiedPix ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedPix ? 'Chave PIX Copiada!' : 'Copiar Chave'}</span>
                </button>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-600 dark:text-slate-400">
                💡 <strong>Como doar:</strong> Abra o aplicativo do seu banco (Nubank, Itaú, Bradesco, Inter, Santander, etc.), vá na opção <strong>PIX &gt; Pagar com Chave &gt; Tipo E-mail</strong>, cole <strong>saulomg2@hotmail.com</strong> e escolha qualquer valor que seu coração mandar.
              </div>

              {/* Sugestões de Valores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 p-3 text-center">
                  <span className="block text-base font-extrabold text-slate-800 dark:text-slate-100">R$ 5,00</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Um cafezinho ☕</span>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 p-3 text-center">
                  <span className="block text-base font-extrabold text-slate-800 dark:text-slate-100">R$ 15,00</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Apoio Amigo 💙</span>
                </div>
                <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 text-center">
                  <span className="block text-base font-extrabold text-emerald-700 dark:text-emerald-300">R$ 30,00</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Super Apoiador 🌟</span>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 p-3 text-center">
                  <span className="block text-base font-extrabold text-slate-800 dark:text-slate-100">Qualquer valor</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">De coração ❤️</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Criador: Saulo Meira (Saulomgg)</span>
                <a
                  href="https://saulomgg.github.io"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-brand hover:underline inline-flex items-center gap-1"
                >
                  <span>Visitar saulomgg.github.io</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* GERENCIAMENTO DE DADOS DE EXEMPLO (Zerar Aplicativo) */}
            <div className="mt-6 rounded-3xl border-2 border-amber-400/80 dark:border-amber-500/60 bg-gradient-to-r from-amber-50/80 via-yellow-50/50 to-amber-100/50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-amber-950/30 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-amber-950 shadow-xs ring-2 ring-amber-300 dark:ring-amber-500/40">
                    <Lightbulb className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-amber-950 dark:text-amber-100">
                        Dados de Demonstração & Zerar Aplicativo
                      </h3>
                      {isDemoMode ? (
                        <span className="rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase text-amber-950">
                          Exemplos Ativos
                        </span>
                      ) : (
                        <span className="rounded-md bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-black uppercase">
                          App Zerado
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                      O ReMed foi feito para funcionar com privacidade total. Se você está conhecendo o sistema agora, pode navegar pelos exemplos fictícios. Para começar a usar de verdade, clique em <strong>Limpar Exemplos & Zerar Aplicativo</strong>: todos os dados de teste serão apagados, a tag amarela sumirá da tela principal e o app ficará pronto para você preencher seus próprios remédios e informações.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => {
                    if (onClearDemoData) {
                      onClearDemoData();
                    } else {
                      onClearAllData();
                    }
                    onToast('Dados de exemplo apagados! Aplicativo 100% zerado e pronto.', 'ok');
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 text-xs font-black shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Limpar Dados de Exemplo & Zerar App</span>
                </button>

                <button
                  onClick={() => {
                    onLoadDemoData();
                    onToast('Dados de demonstração recarregados com sucesso!', 'ok');
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-amber-400/80 dark:border-amber-600 bg-white dark:bg-slate-900 hover:bg-amber-100/50 dark:hover:bg-amber-950/50 text-amber-950 dark:text-amber-100 px-4 py-3 text-xs font-black transition active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4 text-amber-600" />
                  <span>Recarregar Exemplos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO: BAIXAR APLICATIVO / PWA */}
      {activeSection === 'install' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand to-cyan-500 p-1 shadow-md">
                  <img
                    src="/pwa-192x192.png"
                    alt="Logo ReMed"
                    className="h-full w-full object-contain rounded-xl"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Baixar Aplicativo no Celular
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Instale com 1 toque e coloque a logo do ReMed na tela inicial do seu celular
                  </p>
                </div>
              </div>

              {isInstalled ? (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Aplicativo Instalado</span>
                </div>
              ) : (
                <button
                  onClick={handleInstallClick}
                  disabled={installStatus === 'prompting'}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-brand hover:bg-brand-hover text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>
                    {installStatus === 'prompting'
                      ? 'Aguardando autorização...'
                      : 'Baixar e Instalar Direto'}
                  </span>
                </button>
              )}
            </div>

            {/* Explicação das 2 Formas de Baixar */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Opção 1: Automática */}
              <div className="rounded-2xl border-2 border-brand/40 bg-brand-light/30 dark:bg-brand-light/10 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Opção 1: Baixar Direto (Automático)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Basta clicar no botão <strong>&quot;Baixar e Instalar Direto&quot;</strong> acima. O seu navegador (Chrome/Edge/Brave/Android) solicitará sua permissão na tela e instalará o aplicativo instantaneamente com o ícone oficial na tela inicial.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand text-white py-2.5 text-xs font-bold shadow-xs hover:bg-brand-hover transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Autorizar Instalação Agora</span>
                </button>
              </div>

              {/* Opção 2: Manual */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Opção 2: Adicionar Manualmente pelo Menu
                  </h3>
                </div>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {isIOS ? (
                    <p>
                      <strong>No Safari do iPhone/iPad:</strong> Toque no botão de <strong>Compartilhar</strong> (ícone com quadrado e seta para cima) na barra inferior e selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong>.
                    </p>
                  ) : (
                    <p>
                      <strong>No Chrome / Celular Android:</strong> Toque no menu <strong>⋮</strong> (três pontinhos no canto superior) e clique em <strong>&quot;Instalar aplicativo&quot;</strong> ou <strong>&quot;Adicionar à tela inicial&quot;</strong>.
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500">
                    O aplicativo ficará salvo na sua tela junto dos outros apps e funcionará 100% offline!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO: GOOGLE AGENDA */}
      {activeSection === 'calendar' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand ring-1 ring-brand">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Integração com Google Agenda (Alarmes no Celular)
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                    Configure para que o ReMed salve seus horários automaticamente no seu Google Agenda. O celular alertará pontualmente nos horários de cada dose!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowScriptModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-brand bg-brand-light px-3.5 py-2 text-xs font-bold text-brand hover:opacity-90 transition whitespace-nowrap self-start sm:self-auto"
              >
                <span>Ver Tutorial Passo a Passo</span>
              </button>
            </div>

            {/* Passos Rápidos */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand">Passo 1</span>
                <h4 className="mt-1 text-xs font-bold text-slate-900 dark:text-white">Copie o Google Apps Script</h4>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Script pronto e seguro que roda na sua própria conta Google.
                </p>
                <button
                  onClick={handleCopyScript}
                  className="mt-3 flex items-center gap-1.5 rounded-xl bg-brand hover:bg-brand-hover px-3 py-1.5 text-xs font-bold text-white transition active:scale-95"
                >
                  {copiedScript ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedScript ? 'Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand">Passo 2</span>
                <h4 className="mt-1 text-xs font-bold text-slate-900 dark:text-white">Cole em script.google.com</h4>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Crie um novo projeto, cole e clique em &quot;Implantar como Web App&quot;.
                </p>
                <a
                  href="https://script.google.com/home/start"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-brand transition"
                >
                  <span>Abrir Google Scripts</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand">Passo 3</span>
                <h4 className="mt-1 text-xs font-bold text-slate-900 dark:text-white">Cole a URL Webhook aqui</h4>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Pronto! Seus medicamentos e horários serão salvos na sua agenda.
                </p>
                <span className="mt-3 inline-block text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ Configuração simples
                </span>
              </div>
            </div>

            {/* Input da URL do Webhook */}
            <div className="mt-6 space-y-3">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">
                URL do Aplicativo da Web (Google Apps Script Webhook):
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={scriptUrlInput}
                  onChange={(e) => setScriptUrlInput(e.target.value)}
                  className="w-full flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand font-mono"
                />
                <button
                  onClick={handleSaveCalendarConfig}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Salvar URL
                </button>
                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection || !scriptUrlInput.trim()}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-brand hover:bg-brand-hover px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50"
                >
                  {isTestingConnection ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  <span>Testar Conexão</span>
                </button>
              </div>

              {settings.googleCalendar.lastSyncTimestamp && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Última sincronização com sucesso:{' '}
                  {new Date(settings.googleCalendar.lastSyncTimestamp).toLocaleString('pt-BR')}
                </p>
              )}
            </div>

            {/* Ações de Sincronização */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSyncAllMedications}
                  disabled={isSyncing || !scriptUrlInput.trim()}
                  className="flex items-center gap-2 rounded-xl bg-brand hover:bg-brand-hover text-white px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sincronizar Todos os Remédios na Google Agenda Agora</span>
                </button>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={settings.googleCalendar.autoSyncOnSave}
                    onChange={(e) => {
                      const updated: AppSettings = {
                        ...settings,
                        googleCalendar: {
                          ...settings.googleCalendar,
                          autoSyncOnSave: e.target.checked,
                        },
                      };
                      onSaveSettings(updated);
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-brand"
                  />
                  <span>Sincronizar automaticamente ao salvar remédio</span>
                </label>
              </div>

              <button
                onClick={handleDownloadICS}
                title="Gera um arquivo de calendário (.ics) compatível com celular Android, iPhone e PC"
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold transition"
              >
                <Download className="h-3.5 w-3.5 text-brand" />
                <span>Exportar Arquivo .ICS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO: NOTIFICAÇÕES DO NAVEGADOR (NOTIFICATION API & SERVICE WORKER) */}
      {activeSection === 'notifications' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand ring-1 ring-brand">
                <BellRing className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Notificações do Navegador & PWA
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  Lembretes nativos emitidos pelo navegador através da <strong>Notification API</strong> e do <strong>Service Worker</strong> quando for o horário de tomar o remédio, mesmo com o app minimizado ou em segundo plano.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestNotification}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition active:scale-95 whitespace-nowrap self-start sm:self-auto"
            >
              <Play className="h-3.5 w-3.5 text-brand" />
              <span>Testar Notificação Agora</span>
            </button>
          </div>

          {/* Status da Permissão do Navegador */}
          <div>
            {notificationPermission === 'granted' ? (
              <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="font-bold">Permissão Concedida pelo Navegador</div>
                  <div className="text-[11px] opacity-90">
                    O ReMed tem autorização para disparar alertas visuais nativos no horário exato de cada medicamento.
                  </div>
                </div>
              </div>
            ) : notificationPermission === 'denied' ? (
              <div className="flex items-center gap-2.5 rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-rose-800 dark:text-rose-300">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <div>
                  <div className="font-bold">Notificações Bloqueadas no Navegador</div>
                  <div className="text-[11px] opacity-90">
                    Para receber alertas, toque no ícone de ajustes/cadeado na barra de endereços deste site e mude a permissão de &quot;Notificações&quot; para <strong>Permitir</strong>.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3.5 text-amber-800 dark:text-amber-300">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <div className="font-bold">Permissão Pendente</div>
                  <div className="text-[11px] opacity-90">
                    Ative o interruptor abaixo para que o navegador solicite sua autorização para exibir lembretes.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Principal de Notificações */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-brand" />
                Alertas Automáticos de Horário de Dose
              </h4>
              <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px] max-w-lg">
                Quando ativado, o aplicativo monitora o relógio e dispara um pop-up nativo no momento programado de cada medicação, mesmo se a aba estiver em segundo plano ou o aparelho bloqueado (no PWA instalado).
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.notificationEnabled && notificationPermission === 'granted'}
                onChange={(e) => handleToggleNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              <span className="ml-2.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                {settings.notificationEnabled && notificationPermission === 'granted' ? 'Ativado' : 'Desativado'}
              </span>
            </label>
          </div>

          {/* Horários Programados que receberão notificação hoje */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">
              Horários de Alerta Programados ({medications.reduce((acc, m) => acc + (m.horarios?.length || 0), 0)} no total):
            </h4>
            {medications.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Nenhum medicamento cadastrado ainda. Cadastre remédios para programar alertas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {medications.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs"
                  >
                    <div className="font-bold text-slate-900 dark:text-white truncate">{m.nome}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {m.dosagem || '1 dose'} · {m.dosePorVez || 1} un.
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(m.horarios || []).map((h, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-brand bg-brand-light px-1.5 py-0.5 text-[10px] font-bold text-brand"
                        >
                          ⏰ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEÇÃO 2: APARÊNCIA & CORES (TOTALMENTE FUNCIONAL!) */}
      {activeSection === 'appearance' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6 text-xs">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Personalização de Cores & Tema</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Escolha a paleta de cores e o modo de visualização. As alterações aplicam-se imediatamente!
              </p>
            </div>
          </div>

          {/* Modo de Visualização (Claro / Escuro / Sistema) */}
          <div>
            <label className="block font-bold text-slate-900 dark:text-white mb-2">Modo de Exibição:</label>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => onSaveSettings({ ...settings, theme: 'light' })}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition ${
                  settings.theme === 'light'
                    ? 'border-brand bg-brand-light ring-2 ring-brand font-bold text-brand'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="h-5 w-5 mb-1" />
                <span>Modo Claro</span>
              </button>

              <button
                type="button"
                onClick={() => onSaveSettings({ ...settings, theme: 'dark' })}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition ${
                  settings.theme === 'dark'
                    ? 'border-brand bg-brand-light ring-2 ring-brand font-bold text-brand'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="h-5 w-5 mb-1" />
                <span>Modo Escuro</span>
              </button>

              <button
                type="button"
                onClick={() => onSaveSettings({ ...settings, theme: 'system' })}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition ${
                  settings.theme === 'system'
                    ? 'border-brand bg-brand-light ring-2 ring-brand font-bold text-brand'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Laptop className="h-5 w-5 mb-1" />
                <span>Automático</span>
              </button>
            </div>
          </div>

          {/* Paleta de Cores Dinâmica (FUNCIONA NA HORA!) */}
          <div>
            <label className="block font-bold text-slate-900 dark:text-white mb-2">Paleta de Cor de Destaque:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl">
              {(Object.keys(COLOR_PALETTES) as AccentColor[]).map((key) => {
                const pal = COLOR_PALETTES[key];
                const isSelected = settings.accentColor === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onSaveSettings({ ...settings, accentColor: key });
                      onToast(`Paleta ${pal.name} ativada!`, 'ok');
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'border-brand bg-brand-light ring-2 ring-brand'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="h-6 w-6 rounded-full shrink-0 shadow-xs flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: pal.primary }}
                    >
                      {isSelected && '✓'}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{pal.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{key}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sons de Alarme e Dose */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-brand" />
                Efeitos Sonoros de Medicação
              </h4>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-[11px]">
                Toca um chime suave ao marcar remédio como tomado (100% offline).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => sound.playDoseTaken()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
              >
                <Play className="h-3 w-3" />
                <span>Testar Som</span>
              </button>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onSaveSettings({ ...settings, soundEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-brand"
                />
                <span>Habilitado</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO 3: PERFIL & ENDEREÇO */}
      {activeSection === 'profile' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Perfil do Paciente & Endereço</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estes dados são preenchidos na mensagem automática do pedido via WhatsApp.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Seu Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Saulo Meira"
                  value={profileForm.nome}
                  onChange={(e) => setProfileForm({ ...profileForm, nome: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Seu WhatsApp</label>
                <input
                  type="tel"
                  placeholder="Ex: 11 98765-4321"
                  value={profileForm.telefone}
                  onChange={(e) => setProfileForm({ ...profileForm, telefone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Endereço de Entrega (Rua e Número)</label>
                <input
                  type="text"
                  placeholder="Ex: Rua das Flores, 142"
                  value={profileForm.endereco}
                  onChange={(e) => setProfileForm({ ...profileForm, endereco: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Complemento</label>
                <input
                  type="text"
                  placeholder="Ex: Apto 42B"
                  value={profileForm.complemento || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, complemento: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Bairro</label>
                <input
                  type="text"
                  placeholder="Ex: Bela Vista"
                  value={profileForm.bairro}
                  onChange={(e) => setProfileForm({ ...profileForm, bairro: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Cidade</label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo"
                  value={profileForm.cidade}
                  onChange={(e) => setProfileForm({ ...profileForm, cidade: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            {/* SEÇÃO DA FICHA MÉDICA DE EMERGÊNCIA (SOS) */}
            <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                  SOS
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ficha Médica de Emergência (Modo SOS)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Tipo Sanguíneo</label>
                  <select
                    value={profileForm.tipoSanguineo || 'O+'}
                    onChange={(e) => setProfileForm({ ...profileForm, tipoSanguineo: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="Desconhecido">Não sei informar</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-amber-700 dark:text-amber-400 mb-1">
                    ⚠️ Alergias Graves a Medicamentos / Alimentos
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Penicilina, Dipirona, Frutos do Mar"
                    value={profileForm.alergias || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, alergias: e.target.value })}
                    className="w-full rounded-xl border border-amber-300 dark:border-amber-700/80 bg-amber-50/50 dark:bg-amber-950/20 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Condições Pré-Existentes / Diagnósticos</label>
                  <input
                    type="text"
                    placeholder="Ex: Hipertensão, Diabetes Tipo 2, Cardiopatia"
                    value={profileForm.condicoesSaude || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, condicoesSaude: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Plano de Saúde ou Cartão SUS</label>
                  <input
                    type="text"
                    placeholder="Ex: Unimed 0123456 / SUS: 8980..."
                    value={profileForm.planoSaude || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, planoSaude: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Observações Médicas para Socorristas</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Portador de marca-passo no coração, doador de órgãos, restrições alimentares..."
                  value={profileForm.observacoesMedicas || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, observacoesMedicas: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-brand hover:bg-brand-hover px-5 py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-95"
              >
                Salvar Perfil & Ficha Médica
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEÇÃO 4: DADOS & BACKUP */}
      {activeSection === 'backup' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6 text-xs">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Segurança, Backup & Demonstração</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seus dados ficam 100% seguros no seu dispositivo (LocalStorage offline-first).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Download className="h-4 w-4 text-brand" />
                  Exportar Backup Completo
                </h4>
                <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px]">
                  Baixe um arquivo JSON com todos os seus remédios, estoques e farmácias.
                </p>
              </div>
              <button
                type="button"
                onClick={onExportBackup}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Baixar Arquivo JSON</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-brand" />
                  Restaurar Backup
                </h4>
                <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px]">
                  Restaure seus dados a partir de um backup JSON salvo anteriormente.
                </p>
              </div>
              <label className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                <span>Selecionar Arquivo JSON</span>
                <input type="file" accept=".json" onChange={handleFileInput} className="hidden" />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Carregar Medicamentos de Exemplo</h4>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-[11px]">
                Preenche com remédios de exemplo (Losartana, Metformina, Vitamina D, Omeprazol) para demonstração.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Carregar dados demonstrativos de teste?')) {
                  onLoadDemoData();
                  onToast('Dados de demonstração carregados!', 'ok');
                }
              }}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition whitespace-nowrap"
            >
              Carregar Exemplos
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Deseja zerar os dados deste navegador?</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('ATENÇÃO: Deseja apagar todos os medicamentos e farmácias salvos? Esta ação não pode ser desfeita.')) {
                  onClearAllData();
                  onToast('Todos os dados foram resetados.', 'info');
                }
              }}
              className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-bold"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Limpar Tudo</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL TUTORIAL GOOGLE APPS SCRIPT */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-xl max-h-[88vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl text-slate-900 dark:text-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Como Configurar o Google Agenda</h3>
              </div>
              <button
                onClick={() => setShowScriptModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand font-bold text-xs">
                    1
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Copie o código do script pronto:</p>
                    <button
                      onClick={handleCopyScript}
                      className="mt-1.5 flex items-center gap-1.5 rounded-xl bg-brand hover:bg-brand-hover px-3 py-1 text-xs font-bold text-white transition"
                    >
                      {copiedScript ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedScript ? 'Copiado para a área de transferência!' : 'Copiar Código'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand font-bold text-xs">
                    2
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Abra o Google Apps Script:</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      Acesse <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-brand font-bold underline">script.google.com</a> com a mesma conta Google onde você usa o Google Agenda.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand font-bold text-xs">
                    3
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Crie um Novo Projeto e cole o código:</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      Clique em <strong>Novo Projeto</strong>, apague qualquer texto existente no editor e cole todo o código copiado.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand font-bold text-xs">
                    4
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Implante como Aplicativo da Web:</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      No canto superior direito, clique em <strong>Implantar (Deploy)</strong> &gt; <strong>Nova Implantação</strong>.<br />
                      • Tipo: <strong>Aplicativo da Web (Web App)</strong>.<br />
                      • Executar como: <strong>Eu</strong>.<br />
                      • Quem tem acesso: <strong>Qualquer pessoa (Anyone)</strong>.<br />
                      Clique em <strong>Implantar</strong> e autorize o acesso à sua agenda.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand font-bold text-xs">
                    5
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Copie o URL do aplicativo da Web gerado:</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      Cole a URL na caixa acima e clique em <strong>Testar Conexão</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-brand bg-brand-light p-3 text-[11px] text-slate-700 dark:text-slate-200">
                💡 <strong>Pronto!</strong> O script cria automaticamente a agenda <strong>&quot;💊 Medicamentos (ReMed)&quot;</strong> com avisos no celular 10 minutos antes e no momento exato de cada remédio!
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex justify-end">
              <button
                onClick={() => setShowScriptModal(false)}
                className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Fechar Tutorial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
