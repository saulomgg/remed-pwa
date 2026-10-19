import { Medication } from '../types';

export interface SyncResult {
  success: boolean;
  message: string;
  count?: number;
}

/**
 * Envia medicamentos para o Webhook do Google Apps Script
 */
export async function syncWithGoogleAppsScript(
  scriptUrl: string,
  medications: Medication[]
): Promise<SyncResult> {
  if (!scriptUrl || !scriptUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'Insira uma URL válida do Aplicativo da Web do Google Apps Script.',
    };
  }

  const cleanUrl = scriptUrl.trim();
  const payload = {
    action: 'sync',
    timestamp: new Date().toISOString(),
    medications: medications.map((m) => ({
      id: m.id,
      nome: m.nome,
      dosagem: m.dosagem,
      forma: m.forma,
      horarios: m.horarios,
      dosePorVez: m.dosePorVez,
      estoqueAtual: m.estoqueAtual,
      duracaoDias: m.duracaoDias,
      obs: m.obs,
    })),
  };

  try {
    // Tenta fetch com mode cors
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Google Apps Script prefere text/plain para evitar pre-flight OPTIONS complexos
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      try {
        const data = await response.json();
        return {
          success: data.success !== false,
          message: data.message || 'Sincronizado com sucesso na sua Google Agenda!',
          count: data.eventsCreated,
        };
      } catch {
        return {
          success: true,
          message: 'Sinal de sincronização enviado com sucesso para a Google Agenda!',
        };
      }
    }

    return {
      success: false,
      message: `Erro ao comunicar com Google Script: HTTP ${response.status}`,
    };
  } catch (err: unknown) {
    // Apps Script redirects podem disparar erro de CORS em navegadores, mas a execução ainda pode ocorrer no backend do Google.
    // Vamos verificar se foi bloqueio de CORS do redirect
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
      return {
        success: true,
        message: 'Comando enviado para a Google Agenda! Verifique sua agenda (Google Calendar) em instantes.',
      };
    }
    return {
      success: false,
      message: `Falha na requisição: ${errorMsg}`,
    };
  }
}

/**
 * Testa o Webhook do Google Apps Script
 */
export async function testGoogleAppsScript(scriptUrl: string): Promise<SyncResult> {
  if (!scriptUrl || !scriptUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL inválida. Comece com https://script.google.com/macros/s/...',
    };
  }

  try {
    const response = await fetch(scriptUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action: 'test' }),
    });

    if (response.ok) {
      try {
        const data = await response.json();
        return {
          success: true,
          message: data.message || 'Conexão validada com sucesso!',
        };
      } catch {
        return {
          success: true,
          message: 'Webhook respondeu com sucesso!',
        };
      }
    }
    return {
      success: false,
      message: `Resposta do servidor: HTTP ${response.status}`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Erro ao conectar: ${errorMsg}. Verifique se a implantação está configurada para 'Qualquer pessoa'.`,
    };
  }
}

/**
 * Gera URL direta para adicionar evento único ou recorrente no Google Calendar Web
 */
export function generateGoogleCalendarDirectUrl(
  med: Medication,
  horario: string
): string {
  const [hora, min] = horario.split(':').map((n) => parseInt(n, 10) || 0);

  const start = new Date();
  start.setHours(hora, min, 0, 0);

  // Formato YYYYMMDDTHHmmSS
  const formatGCalDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const end = new Date(start.getTime() + 15 * 60 * 1000); // 15 min duration

  const title = encodeURIComponent(`💊 Tomar ${med.nome} (${med.dosagem})`);
  const details = encodeURIComponent(
    `ReMed PWA - Lembrete de Medicamento\n` +
      `Medicamento: ${med.nome}\n` +
      `Dosagem: ${med.dosagem}\n` +
      `Forma: ${med.forma}\n` +
      (med.obs ? `Observações: ${med.obs}\n` : '') +
      `Horário prescrito: ${horario}`
  );

  // Recorrente Diário
  const recur = 'RRULE:FREQ=DAILY';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${formatGCalDate(
    start
  )}/${formatGCalDate(end)}&recur=${encodeURIComponent(recur)}`;
}

/**
 * Gera arquivo .ics (iCalendar) para importar em qualquer agenda (Google Calendar, Apple Calendar, Outlook)
 */
export function generateICSContent(medications: Medication[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ReMed PWA//Medicamentos Gestao Inteligente//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:💊 Medicamentos (ReMed)',
    'X-WR-TIMEZONE:America/Sao_Paulo',
  ];

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  medications.forEach((med) => {
    (med.horarios || []).forEach((horario, idx) => {
      const [h, m] = horario.split(':').map((x) => parseInt(x, 10) || 0);
      const now = new Date();
      const year = now.getFullYear();
      const month = pad(now.getMonth() + 1);
      const day = pad(now.getDate());

      const dtStart = `${year}${month}${day}T${pad(h)}${pad(m)}00`;
      const endMin = (m + 15) % 60;
      const endHour = m + 15 >= 60 ? (h + 1) % 24 : h;
      const dtEnd = `${year}${month}${day}T${pad(endHour)}${pad(endMin)}00`;

      const uid = `remed-${med.id}-${idx}-${Date.now()}@remed.pwa`;
      const summary = `💊 Tomar ${med.nome} (${med.dosagem})`;
      const desc = `Lembrete do ReMed PWA\\nMedicamento: ${med.nome} (${med.dosagem})\\nForma: ${med.forma}\\n${
        med.obs ? `Obs: ${med.obs}\\n` : ''
      }`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${year}${month}${day}T120000Z`);
      lines.push(`DTSTART:${dtStart}`);
      lines.push(`DTEND:${dtEnd}`);
      lines.push('RRULE:FREQ=DAILY');
      lines.push(`SUMMARY:${summary}`);
      lines.push(`DESCRIPTION:${desc}`);
      lines.push('STATUS:CONFIRMED');

      // Alarme sonoro/notificação 10 min antes
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-PT10M');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:Hora de tomar ${med.nome}`);
      lines.push('END:VALARM');

      lines.push('END:VEVENT');
    });
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Dispara o download do arquivo .ics
 */
export function downloadICS(medications: Medication[]): void {
  const content = generateICSContent(medications);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `remed-medicamentos-${new Date().toISOString().slice(0, 10)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
