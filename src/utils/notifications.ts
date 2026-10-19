import { Medication, DoseLog } from '../types';

const pwaIcon = `${import.meta.env.BASE_URL}pwa-192x192.png`;

export interface ExtendedNotificationOptions extends NotificationOptions {
  renotify?: boolean;
}

class NotificationService {
  private notifiedMap: Set<string> = new Set();

  /**
   * Verifica se o navegador tem suporte à Notification API
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Obtém o status atual da permissão
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Solicita permissão ao usuário
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.warn('Erro ao solicitar permissão de notificação:', err);
      return false;
    }
  }

  /**
   * Dispara notificação usando Service Worker (para suporte a segundo plano)
   * ou fallback para a Notification API padrão
   */
  async sendNotification(
    title: string,
    options: ExtendedNotificationOptions = {}
  ): Promise<boolean> {
    if (!this.isSupported()) return false;
    if (Notification.permission !== 'granted') return false;

    const defaultOptions: NotificationOptions = {
      icon: pwaIcon,
      badge: pwaIcon,
      requireInteraction: false,
      ...options,
    };

    try {
      // 1. Tenta disparar via ServiceWorkerRegistration (funciona em segundo plano e PWA instalado)
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          if (reg && 'showNotification' in reg) {
            await reg.showNotification(title, defaultOptions);
            return true;
          }
        } catch {
          // fallback para new Notification
        }
      }

      // 2. Fallback direto da API de Notificação
      const notif = new Notification(title, defaultOptions);
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return true;
    } catch (e) {
      console.warn('Falha ao exibir notificação:', e);
      return false;
    }
  }

  /**
   * Dispara lembrete formatado para uma medicação específica
   */
  async sendDoseReminder(med: Medication, horario: string): Promise<boolean> {
    const doseText = med.dosagem ? ` (${med.dosagem})` : '';
    const title = `💊 Hora do Remédio: ${med.nome}`;
    const body = `Horário das ${horario} atingido! Tome sua dose de ${med.nome}${doseText}.${
      med.obs ? ` Obs: ${med.obs}` : ''
    }`;

    return this.sendNotification(title, {
      body,
      tag: `remed-dose-${med.id}-${horario}`,
      renotify: true,
      data: { medId: med.id, horario },
    });
  }

  /**
   * Envia uma notificação de teste imediata
   */
  async sendTestNotification(): Promise<boolean> {
    return this.sendNotification('💊 ReMed: Teste de Notificação', {
      body: 'Perfeito! Suas notificações de medicamentos estão ativas e funcionando.',
      tag: 'remed-test',
      renotify: true,
    });
  }

  /**
   * Verifica se há algum medicamento no minuto atual para alertar
   */
  checkDueDoses(
    medications: Medication[],
    doseLogs: DoseLog[],
    onAlert?: (med: Medication, horario: string) => void
  ): void {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    medications.forEach((med) => {
      (med.horarios || []).forEach((horario) => {
        // Verifica se é o minuto exato do agendamento
        if (horario === currentHHMM) {
          const key = `${med.id}_${horario}_${todayStr}`;

          // Se já notificamos neste minuto hoje, não repete
          if (this.notifiedMap.has(key)) return;

          // Se a dose já foi registrada como tomada hoje, não notifica
          const alreadyTaken = doseLogs.some(
            (l) => l.medicationId === med.id && l.horario === horario && l.data === todayStr
          );
          if (alreadyTaken) return;

          // Marca como notificado e dispara
          this.notifiedMap.add(key);
          this.sendDoseReminder(med, horario);
          if (onAlert) {
            onAlert(med, horario);
          }
        }
      });
    });
  }
}

export const notificationService = new NotificationService();
