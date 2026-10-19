/**
 * Código pronto para o Google Apps Script que o usuário copia e cola em
 * https://script.google.com para integrar seu ReMed PWA com o Google Agenda.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ============================================================
 * ReMed PWA — Integração Automática com Google Agenda (Calendar)
 * ============================================================
 * 
 * Este script recebe os medicamentos do seu ReMed PWA e cria
 * eventos diários recorrentes na sua Google Agenda com lembretes/alertas
 * no celular (notificação push e pop-up).
 * 
 * COMO USAR:
 * 1. Acesse: https://script.google.com/home/start
 * 2. Clique em "Novo projeto" (ou "New project")
 * 3. Apague o código padrão e cole todo este arquivo
 * 4. Clique em "Implantar" (Deploy) > "Nova implantação" (New deployment)
 * 5. Tipo: "Aplicativo da Web" (Web app)
 * 6. Executar como: "Eu" (Me)
 * 7. Quem tem acesso: "Qualquer pessoa" (Anyone)
 * 8. Clique em "Implantar" e conceda as permissões da sua conta Google
 * 9. Copie o "URL do aplicativo da Web" e cole nas configurações do ReMed PWA!
 */

function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : '{}';
    var payload = JSON.parse(rawData);
    var action = payload.action || 'sync';
    
    // Resposta de teste de conexão
    if (action === 'test') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Conexão com Google Agenda verificada com sucesso! Pronto para sincronizar.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Sincronização de medicamentos
    if (action === 'sync') {
      var meds = payload.medications || [];
      var calName = '💊 Medicamentos (ReMed)';
      var cal = getOrCreateCalendar(calName);
      
      // Limpa eventos futuros criados anteriormente pelo ReMed para evitar duplicatas
      var now = new Date();
      var futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 90); // 90 dias
      
      var existingEvents = cal.getEvents(now, futureDate);
      for (var i = 0; i < existingEvents.length; i++) {
        var ev = existingEvents[i];
        if (ev.getTag('remed_managed') === 'true') {
          ev.deleteEvent();
        }
      }
      
      var createdCount = 0;
      
      for (var m = 0; m < meds.length; m++) {
        var med = meds[m];
        if (!med.horarios || med.horarios.length === 0) continue;
        
        for (var h = 0; h < med.horarios.length; h++) {
          var horarioStr = med.horarios[h]; // Ex: "08:00"
          var parts = horarioStr.split(':');
          var hora = parseInt(parts[0], 10);
          var min = parseInt(parts[1], 10);
          
          var startDate = new Date();
          startDate.setHours(hora, min, 0, 0);
          
          // Se o horário de hoje já passou, começa a partir de amanhã
          if (startDate < now) {
            startDate.setDate(startDate.getDate() + 1);
          }
          
          var endDate = new Date(startDate.getTime() + 15 * 60 * 1000); // 15 minutos de duração
          
          var title = '💊 ' + med.nome + ' (' + (med.dosagem || '1 dose') + ')';
          var desc = 'Lembrete do ReMed PWA\\n' +
                     'Medicamento: ' + med.nome + '\\n' +
                     'Dosagem: ' + (med.dosagem || '–') + '\\n' +
                     'Forma: ' + (med.forma || 'Comprimido') + '\\n' +
                     (med.obs ? ('Observações: ' + med.obs + '\\n') : '') +
                     'Estoque atual: ' + (med.estoqueAtual !== undefined ? med.estoqueAtual : '–');
          
          // Cria evento diário recorrente
          var recurrence = CalendarApp.newRecurrence().addDailyRule();
          if (med.duracaoDias && med.duracaoDias > 0) {
            var untilDate = new Date(startDate);
            untilDate.setDate(untilDate.getDate() + med.duracaoDias);
            recurrence.addDailyRule().until(untilDate);
          }
          
          var eventSeries = cal.createEventSeries(title, startDate, endDate, recurrence, {
            description: desc
          });
          
          // Adiciona alertas no celular (10 minutos antes e no exato momento)
          eventSeries.addPopupReminder(10);
          eventSeries.addPopupReminder(0);
          eventSeries.setTag('remed_managed', 'true');
          eventSeries.setTag('remed_id', String(med.id));
          
          createdCount++;
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        calendarName: calName,
        eventsCreated: createdCount,
        message: 'Sincronizados ' + createdCount + ' horários com sua Google Agenda!'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Ação desconhecida: ' + action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Responde a requisições GET para teste rápido no navegador
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    app: 'ReMed PWA Google Calendar Integration',
    version: '2026.1'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Obtém a agenda dedicada '💊 Medicamentos (ReMed)' ou cria se não existir
function getOrCreateCalendar(name) {
  var cals = CalendarApp.getCalendarsByName(name);
  if (cals.length > 0) {
    return cals[0];
  }
  // Se não encontrar, tenta criar uma nova agenda dedicada
  try {
    return CalendarApp.createCalendar(name, {
      summary: 'Agenda sincronizada automaticamente pelo ReMed PWA para lembretes de medicação.',
      color: CalendarApp.Color.TEAL
    });
  } catch (e) {
    // Fallback: usa a agenda primária padrão do usuário
    return CalendarApp.getDefaultCalendar();
  }
}
`;
