/* ══════════════════════════════════════════
   ReMed — ui.js
   Modais, tema, PWA, toast, compartilhar
   ══════════════════════════════════════════ */

// ─── MODAIS ───
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('open');
  if (!document.querySelector('.modal-overlay.open')) {
    document.body.style.overflow = '';
  }
}
function handleOverlayClick(e, id) {
  if (e.target.id === id) closeModal(id);
}

// ─── NAVEGAÇÃO (views) ───
function switchView(viewId) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  const t = document.getElementById(viewId);
  if (t) t.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const map = { viewHome:'navHome', viewAvisos:'navAvisos', viewPedido:'navPedido', viewFarmacias:'navFarmacias' };
  const nb = document.getElementById(map[viewId]);
  if (nb) nb.classList.add('active');

  window.scrollTo(0, 0);

  if (viewId === 'viewAvisos')    renderAvisos();
  if (viewId === 'viewFarmacias') renderFarmacias();
}

// ─── TEMA ───
function applyTheme() {
  const s = storage.settings();
  if (s.light) document.body.classList.add('light');
  if (s.cor) _setCor(s.cor, false);
  _syncThemeUI();
}
function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  const s = storage.settings();
  s.light = isLight;
  storage.set(KEY_SETTINGS, s);
  _syncThemeUI();
  _updateMetaTheme();
}
function _syncThemeUI() {
  const isLight = document.body.classList.contains('light');
  const icon  = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (icon)  icon.textContent  = isLight ? '☀️' : '🌙';
  if (label) label.textContent = isLight ? 'Modo Claro (ativo)' : 'Modo Escuro (ativo)';
}
function mudarCor(hex) {
  _setCor(hex, true);
}
function _setCor(hex, save) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  const d = document.documentElement;
  d.style.setProperty('--accent',       hex);
  d.style.setProperty('--accent-glow',  `rgba(${r},${g},${b},0.25)`);
  d.style.setProperty('--accent-ultra', `rgba(${r},${g},${b},0.08)`);
  d.style.setProperty('--accent-light', `rgb(${Math.min(r+50,255)},${Math.min(g+60,255)},${Math.min(b+60,255)})`);
  d.style.setProperty('--success-glow', `rgba(${r},${g},${b},0.12)`);
  if (save) {
    const s = storage.settings();
    s.cor = hex;
    storage.set(KEY_SETTINGS, s);
  }
  const inp = document.getElementById('corPrincipal');
  if (inp) inp.value = hex;
  _updateMetaTheme();
}
function _updateMetaTheme() {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = document.body.classList.contains('light') ? '#f0fdf4' : '#0f172a';
}

// ─── TOASTS ───
function toast(msg, type='info', dur=3200) {
  const map = { ok:'toastOk', err:'toastErr', info:'toastInfo', warn:'toastWarn' };
  const msgMap = { ok:'toastOkMsg', err:'toastErrMsg', info:'toastInfoMsg', warn:'toastWarnMsg' };
  const el  = document.getElementById(map[type]);
  const txt = document.getElementById(msgMap[type]);
  if (!el || !txt) return;
  txt.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), dur);
}

// ─── PWA ───
function setupPWA() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    window._pwaPrompt = e;
  });
  window.addEventListener('appinstalled', () => {
    window._pwaPrompt = null;
    hideInstallBanner();
    toast('ReMed instalado! 🎉', 'ok');
  });
}
function showInstallBanner() {
  const b = document.getElementById('installBanner');
  if (b) b.style.display = 'block';
}
function hideInstallBanner() {
  const b = document.getElementById('installBanner');
  if (b) b.style.display = 'none';
}
async function doInstall() {
  hideInstallBanner();
  if (window._pwaPrompt) {
    try {
      window._pwaPrompt.prompt();
      const { outcome } = await window._pwaPrompt.userChoice;
      if (outcome === 'accepted') {
        const btn = document.getElementById('btnInstall');
        if (btn) {
          btn.innerHTML = '✅ <span>Instalado</span>';
          btn.disabled = true; btn.style.opacity = '.5';
        }
      }
      window._pwaPrompt = null;
    } catch (err) {
      console.error('Erro ao instalar:', err);
    }
  } else {
    toast('Use o menu do navegador → "Adicionar à tela inicial"', 'info', 5000);
  }
}

// ─── COMPARTILHAR ─── copia URL atual
async function compartilhar() {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    toast('🔗 Link copiado!', 'ok');
  } catch {
    const inp = document.createElement('input');
    inp.value = url;
    document.body.appendChild(inp); inp.select();
    document.execCommand('copy');
    document.body.removeChild(inp);
    toast('🔗 Link copiado!', 'ok');
  }
}

// ─── DATA ───
function updateDate() {
  const d = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
  const s = d.charAt(0).toUpperCase() + d.slice(1);
  ['dateDisplay','dateDisplayHeader'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = s;
  });
}

// ─── UTILS ───
function escHtml(s='') { const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
function formatDate(s) { return s ? new Date(s+'T12:00:00').toLocaleDateString('pt-BR') : '—'; }

// ─── NOTIFICAÇÕES ───
async function pedirPermissaoNotificacao() {
  if (!('Notification' in window)) {
    toast('Seu navegador não suporta notificações.', 'warn'); return;
  }
  if (Notification.permission === 'granted') {
    ativarNotificacoes(); return;
  }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    ativarNotificacoes();
  } else {
    toast('Permissão negada. Ative nas configurações do navegador.', 'warn');
    _syncNotifUI(false);
  }
}

function ativarNotificacoes() {
  const s = storage.settings();
  s.notif = true;
  storage.set(KEY_SETTINGS, s);
  _syncNotifUI(true);
  agendarNotificacoes();
  toast('🔔 Notificações ativadas!', 'ok');
}

function desativarNotificacoes() {
  const s = storage.settings();
  s.notif = false;
  storage.set(KEY_SETTINGS, s);
  _syncNotifUI(false);
  toast('🔕 Notificações desativadas.', 'info');
}

function toggleNotificacoes() {
  const s = storage.settings();
  if (s.notif) { desativarNotificacoes(); }
  else { pedirPermissaoNotificacao(); }
}

function _syncNotifUI(ativo) {
  const icon  = document.getElementById('notifIcon');
  const label = document.getElementById('notifLabel');
  const sub   = document.getElementById('notifSub');
  if (icon)  icon.textContent  = ativo ? '🔔' : '🔕';
  if (label) label.textContent = ativo ? 'Notificações Ativas' : 'Notificações Desativadas';
  if (sub)   sub.textContent   = ativo ? 'Toque para desativar' : 'Toque para ativar alertas de estoque';
}

function agendarNotificacoes() {
  if (Notification.permission !== 'granted') return;
  const meds = storage.meds();
  meds.forEach(m => {
    const { pct } = calcStock ? calcStock(m) : { pct: 100 };
    if (pct <= 15) {
      new Notification('🔴 Estoque Crítico — ReMed', {
        body: `${m.nome} está quase acabando! Apenas ${Math.round(pct)}% restante.`,
        icon: './assets/icon-192.png',
        badge: './assets/icon-192.png',
        tag: `crit_${m.id}`,
      });
    } else if (pct <= 30) {
      new Notification('🟡 Estoque Baixo — ReMed', {
        body: `${m.nome} está acabando. Considere repor em breve.`,
        icon: './assets/icon-192.png',
        badge: './assets/icon-192.png',
        tag: `warn_${m.id}`,
      });
    }
  });

  // Agendar lembretes de horário
  meds.filter(m => m.horario).forEach(m => {
    const [h, min] = m.horario.split(':').map(Number);
    const agora = new Date();
    const alvo  = new Date();
    alvo.setHours(h, min, 0, 0);
    if (alvo <= agora) alvo.setDate(alvo.getDate() + 1);
    const delay = alvo - agora;
    setTimeout(() => {
      if (Notification.permission === 'granted' && storage.settings().notif) {
        new Notification(`⏰ Hora do remédio — ReMed`, {
          body: `Está na hora de tomar ${m.nome}${m.mg ? ' ' + m.mg : ''}.`,
          icon: './assets/icon-192.png',
          tag: `hora_${m.id}`,
        });
      }
    }, delay);
  });
}

function initNotificacoes() {
  const s = storage.settings();
  _syncNotifUI(!!(s.notif && Notification.permission === 'granted'));
  if (s.notif && Notification.permission === 'granted') {
    agendarNotificacoes();
  }
}
