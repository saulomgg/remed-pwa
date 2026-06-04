/* ══════════════════════════════════════════
   ReMed — auth.js
   Onboarding, cadastro offline-first, sem deslogar
   ══════════════════════════════════════════ */

function usuarioLogado() {
  return storage.isReg() && !!storage.user();
}

// ─── ONBOARDING (primeiro acesso) ───
function checkOnboarding() {
  if (usuarioLogado()) {
    atualizarHeaderUsuario();
  }
}

function submitOnboarding(e) {
  if (e) e.preventDefault();
  const nome   = document.getElementById('obNome')?.value.trim();
  const email  = document.getElementById('obEmail')?.value.trim();
  const tel    = document.getElementById('obTel')?.value.trim();
  const erroEl = document.getElementById('obErro');
  const btn    = document.getElementById('obBtn');

  if (!nome || nome.length < 2)                              { _obErro('Digite seu nome.'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  { _obErro('E-mail inválido.'); return; }
  if (!tel || tel.replace(/\D/g,'').length < 10)             { _obErro('WhatsApp inválido (mínimo 10 dígitos).'); return; }

  if (erroEl) erroEl.style.display = 'none';
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Salvando...';
  }

  const userData = { nome, email, telefone: tel, cadastradoEm: new Date().toISOString() };
  storage.set(KEY_USER, userData);
  localStorage.setItem(KEY_REG, '1');

  // Removido envio para Worker externo para manter 100% offline

  const m = document.getElementById('modalOnboarding');
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
  atualizarHeaderUsuario();
  toast(`Bem-vindo(a), ${nome.split(' ')[0]}! 💊`, 'ok');
  setTimeout(() => toast('💡 Faça o backup agora para proteger seus dados!', 'info', 5000), 2000);
}

function _obErro(msg) {
  const el = document.getElementById('obErro');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

// ─── AJUSTES ───
function abrirAjustes() {
  if (!usuarioLogado()) {
    const m = document.getElementById('modalOnboarding');
    if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
  } else {
    _preencherSettings();
    openModal('modalSettings');
  }
}

function _preencherSettings() {
  const user = storage.user();
  const el   = document.getElementById('contaDados');
  if (!el) return;
  if (!user) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:14px 16px;margin-bottom:16px;">
      <div style="font-weight:700;font-size:1rem;margin-bottom:6px;">${escHtml(user.nome)}</div>
      <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:3px;">📧 ${escHtml(user.email)}</div>
      <div style="font-size:0.82rem;color:var(--text-muted);">📱 ${escHtml(user.telefone)}</div>
    </div>`;
}

// ─── HEADER ───
function atualizarHeaderUsuario() {
  const user = storage.user();
  const hdr  = document.getElementById('userNameDisplayHeader');
  if (!user) return;
  if (hdr) hdr.textContent = `ReMed 💊`;
}

// ─── SEM DESLOGAR ───
function desconectarUsuario() {
  toast('Para trocar de conta, use o Backup e restaure em outro dispositivo.', 'info');
}
