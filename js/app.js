/* ══════════════════════════════════════════
   ReMed — app.js
   Lógica principal: medicamentos, farmácias,
   pedidos WhatsApp, backup, avisos
   ══════════════════════════════════════════ */

// ─────────────────────────────────────────
// MEDICAMENTOS
// ─────────────────────────────────────────

function calcStock(med) {
  const hoje  = new Date();
  const inicio = new Date(med.inicio + 'T12:00:00');
  const diasPassados = Math.max(0, Math.floor((hoje - inicio) / 86400000));
  const usados = diasPassados * (med.doseDia || 1);
  const restantes = Math.max(0, med.total - usados);
  const pct = med.total > 0 ? (restantes / med.total) * 100 : 0;
  return { restantes, pct };
}

function stockStatus(pct) {
  if (pct <= 15) return 'crit';
  if (pct <= 30) return 'warn';
  return 'ok';
}

function renderMeds() {
  const container = document.getElementById('medsList');
  const meds = storage.meds();

  if (!meds.length) {
    container.innerHTML = `
      <div class="empty">
        <span class="empty-emo">💊</span>
        <h3>Nenhum medicamento cadastrado</h3>
        <p>Adicione seus remédios para acompanhar doses e estoque.</p>
        <button class="pill-btn pill-btn-primary" onclick="openModal('modalNovoMed')">+ Adicionar Remédio</button>
      </div>`;
    updateHeroStats();
    return;
  }

  // Ordena: críticos primeiro
  meds.sort((a, b) => calcStock(a).pct - calcStock(b).pct);

  container.innerHTML = '';
  meds.forEach(med => {
    const { restantes, pct } = calcStock(med);
    const status = stockStatus(pct);
    const iconClass = status === 'crit' ? 'critical' : status === 'warn' ? 'warning' : '';
    const badgeClass = status === 'crit' ? 'badge-crit' : status === 'warn' ? 'badge-warn' : 'badge-ok';
    const badgeText = status === 'crit' ? '🔴 Crítico' : status === 'warn' ? '🟡 Atenção' : '🟢 OK';

    const card = document.createElement('div');
    card.className = 'med-card';
    card.id = `medCard_${med.id}`;
    card.innerHTML = `
      <div class="med-card-header" onclick="toggleMedCard(${med.id})">
        <div class="med-icon ${iconClass}">💊</div>
        <div class="med-info">
          <div class="med-name">${escHtml(med.nome)}${med.mg ? ' ' + escHtml(med.mg) : ''}</div>
          <div class="med-hint" style="font-size:0.68rem;color:var(--accent-light);margin-top:2px;opacity:0.7;">▼ toque para ver detalhes</div>
          <div class="med-meta">
            <span>${med.horario || '–'}</span>
            <span>·</span>
            <span>${med.doseDia || 1} comp/dia</span>
            ${med.fabricante ? `<span>·</span><span>${escHtml(med.fabricante)}</span>` : ''}
            <span class="badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="stock-bar-wrap">
            <div class="stock-bar">
              <div class="stock-bar-fill ${status === 'crit' ? 'crit' : status === 'warn' ? 'warn' : ''}"
                   style="width:${Math.max(2,pct)}%"></div>
            </div>
          </div>
        </div>
        <span class="med-chevron">›</span>
      </div>
      <div class="med-card-body">
        <div class="med-detail-row">
          <span>Estoque restante</span>
          <span>${restantes} comp. (${pct.toFixed(0)}%)</span>
        </div>
        <div class="med-detail-row">
          <span>Total da caixa</span>
          <span>${med.total} comp.</span>
        </div>
        <div class="med-detail-row">
          <span>Início do tratamento</span>
          <span>${formatDate(med.inicio)}</span>
        </div>
        <div class="med-detail-row">
          <span>Horário</span>
          <span>${med.horario || 'Não definido'}</span>
        </div>
        ${med.obs ? `<div class="med-detail-row"><span>Obs.</span><span style="text-align:right;max-width:60%">${escHtml(med.obs)}</span></div>` : ''}
        <div class="med-actions">
          <button class="pill-btn pill-btn-warning" onclick="reporEstoque(${med.id})">📦 Repor Estoque</button>
          <button class="pill-btn pill-btn-ghost"   onclick="editarMed(${med.id})">✏️ Editar</button>
          <button class="pill-btn pill-btn-danger"  onclick="deletarMed(${med.id})">✕</button>
        </div>
      </div>`;
    container.appendChild(card);
  });

  updateHeroStats();
  renderLembretes();
}

function toggleMedCard(id) {
  const card = document.getElementById(`medCard_${id}`);
  if (!card) return;
  card.classList.toggle('expanded');
  const hint = card.querySelector('.med-hint');
  if (hint) hint.style.display = card.classList.contains('expanded') ? 'none' : '';
}

function updateHeroStats() {
  const meds = storage.meds();
  const total = meds.length;
  let criticos = 0, avisos = 0;
  meds.forEach(m => {
    const { pct } = calcStock(m);
    if (pct <= 15) criticos++;
    else if (pct <= 30) avisos++;
  });
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('totalMeds',     total);
  el('criticalCount', criticos);
  el('warningCount',  avisos);
}

// ─── FORM NOVO MED ───
function setupFormMed() {
  const form = document.getElementById('formNovoMed');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const id = form.dataset.editId ? parseInt(form.dataset.editId) : null;
    const med = {
      id:      id || Date.now(),
      nome:       document.getElementById('medNome').value.trim(),
      mg:         document.getElementById('medMg').value.trim(),
      fabricante: document.getElementById('medFabricante').value.trim(),
      horario:    document.getElementById('medHorario').value,
      inicio:     document.getElementById('medInicio').value,
      doseDia:    parseInt(document.getElementById('medDoseDia').value) || 1,
      total:      parseInt(document.getElementById('medTotal').value) || 30,
      obs:        document.getElementById('medObs').value.trim(),
    };
    const meds = storage.meds();
    if (id) {
      const idx = meds.findIndex(m => m.id === id);
      if (idx !== -1) meds[idx] = med;
    } else {
      meds.push(med);
    }
    storage.set(KEY_MEDS, meds);
    renderMeds();
    closeModal('modalNovoMed');
    form.reset(); delete form.dataset.editId;
    document.getElementById('medModalTitle').textContent = '💊 Novo Remédio';
    toast(id ? '✏️ Remédio atualizado!' : '✅ Remédio adicionado!', 'ok');
  });
}

function editarMed(id) {
  const med = storage.meds().find(m => m.id === id);
  if (!med) return;
  const form = document.getElementById('formNovoMed');
  form.dataset.editId = id;
  document.getElementById('medModalTitle').textContent = '✏️ Editar Remédio';
  document.getElementById('medNome').value       = med.nome;
  document.getElementById('medMg').value         = med.mg || '';
  document.getElementById('medFabricante').value = med.fabricante || '';
  document.getElementById('medHorario').value    = med.horario || '';
  document.getElementById('medInicio').value     = med.inicio || '';
  document.getElementById('medDoseDia').value    = med.doseDia || 1;
  document.getElementById('medTotal').value      = med.total || 30;
  document.getElementById('medObs').value        = med.obs || '';
  openModal('modalNovoMed');
}

function deletarMed(id) {
  if (!confirm('Remover este medicamento?')) return;
  storage.set(KEY_MEDS, storage.meds().filter(m => m.id !== id));
  renderMeds();
  toast('Remédio removido.', 'info');
}

function reporEstoque(id) {
  const meds = storage.meds();
  const med  = meds.find(m => m.id === id);
  if (!med) return;
  const qtd = prompt(`Quantos comprimidos adicionar ao estoque de "${med.nome}"?`, '30');
  if (!qtd || isNaN(qtd)) return;
  med.total  += parseInt(qtd);
  med.inicio  = new Date().toISOString().slice(0,10); // reseta contagem
  storage.set(KEY_MEDS, meds);
  renderMeds();
  toast(`📦 +${qtd} comprimidos adicionados!`, 'ok');
}

// ─── LEMBRETES DO DIA ───
function renderLembretes() {
  const container = document.getElementById('lembretesHoje');
  if (!container) return;
  const meds = storage.meds().filter(m => m.horario);
  meds.sort((a,b) => a.horario.localeCompare(b.horario));

  if (!meds.length) {
    container.innerHTML = `<div class="empty" style="padding:20px 0"><span class="empty-emo">⏰</span><p>Nenhum lembrete configurado.</p></div>`;
    return;
  }

  const now = new Date();
  const hhmm = now.toTimeString().slice(0,5);

  container.innerHTML = meds.map(m => {
    const passou = m.horario < hhmm;
    const { pct } = calcStock(m);
    const status = stockStatus(pct);
    return `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);">
        <div style="width:38px;height:38px;border-radius:11px;background:${passou?'rgba(100,116,139,0.15)':'var(--accent-ultra)'};border:1px solid ${passou?'var(--border)':'var(--accent-glow)'};display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">${passou?'✅':'⏰'}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:0.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(m.nome)}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">${m.horario} · ${m.doseDia||1} comp.</div>
        </div>
        <span class="badge badge-${status === 'crit'?'crit':status==='warn'?'warn':'ok'}">${pct.toFixed(0)}%</span>
      </div>`;
  }).join('');
}

// ─────────────────────────────────────────
// FARMÁCIAS
// ─────────────────────────────────────────

function renderFarmacias() {
  const container = document.getElementById('farmaciasList');
  if (!container) return;
  const farms = storage.farmacias();

  if (!farms.length) {
    container.innerHTML = `
      <div class="empty">
        <span class="empty-emo">🏥</span>
        <h3>Nenhuma farmácia cadastrada</h3>
        <p>Adicione farmácias para enviar pedidos via WhatsApp.</p>
      </div>`;
    return;
  }
  container.innerHTML = farms.map(f => `
    <div class="farm-card" id="farmCard_${f.id}">
      <div class="farm-icon">🏥</div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:0.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(f.nome)}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">${escHtml(f.whatsapp)}${f.endereco ? ' · '+escHtml(f.endereco) : ''}</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button class="pill-btn pill-btn-ghost" style="font-size:0.8rem;" onclick="enviarWhatsApp(${f.id})">📲 Pedido</button>
        <button class="pill-btn pill-btn-danger" style="font-size:0.75rem;padding:0 10px;" onclick="deletarFarmacia(${f.id})">✕</button>
      </div>
    </div>`).join('');
}

function setupFormFarmacia() {
  const form = document.getElementById('formNovaFarmacia');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const farm = {
      id:        Date.now(),
      nome:      document.getElementById('farmNome').value.trim(),
      whatsapp:  document.getElementById('farmWhats').value.trim().replace(/\D/g,''),
      endereco:  document.getElementById('farmEndereco').value.trim(),
    };
    const farms = storage.farmacias();
    farms.push(farm);
    storage.set(KEY_FARMACIAS, farms);
    renderFarmacias();
    closeModal('modalNovaFarmacia');
    form.reset();
    toast('🏥 Farmácia salva!', 'ok');
  });
}

function deletarFarmacia(id) {
  if (!confirm('Remover esta farmácia?')) return;
  storage.set(KEY_FARMACIAS, storage.farmacias().filter(f => f.id !== id));
  renderFarmacias();
  toast('Farmácia removida.', 'info');
}

// ─────────────────────────────────────────
// PEDIDO WHATSAPP
// ─────────────────────────────────────────

let _pedidoStep = 1;
let _pedidoSelecionados = new Set();
let _pedidoFarmaciaId  = null;

function openPedido() {
  _pedidoStep = 1;
  _pedidoSelecionados.clear();
  _pedidoFarmaciaId = null;
  renderPedidoStep();
  openModal('modalPedido');
}

function renderPedidoStep() {
  // Atualiza abas
  [1,2,3].forEach(n => {
    const btn = document.getElementById(`stepTab${n}`);
    if (btn) btn.classList.toggle('active', n === _pedidoStep);
  });
  ['pedidoStep1','pedidoStep2','pedidoStep3'].forEach((id,i) => {
    const el = document.getElementById(id);
    if (el) el.style.display = (i+1 === _pedidoStep) ? 'block' : 'none';
  });

  if (_pedidoStep === 1) renderPedidoMeds();
  if (_pedidoStep === 2) renderPedidoFarmacias();
  if (_pedidoStep === 3) renderPedidoPreview();
}

function renderPedidoMeds() {
  const c = document.getElementById('pedidoMeds');
  const meds = storage.meds();
  if (!meds.length) {
    c.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:20px">Nenhum medicamento cadastrado ainda.</p>';
    return;
  }
  c.innerHTML = meds.map(m => {
    const { restantes, pct } = calcStock(m);
    const checked = _pedidoSelecionados.has(m.id);
    return `
      <div class="check-item ${checked?'checked':''}" id="checkMed_${m.id}" onclick="togglePedidoMed(${m.id})">
        <div class="check-box">${checked ? '✓' : ''}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:0.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(m.nome)}</div>
          <div style="font-size:0.73rem;color:var(--text-muted);margin-top:2px;">${restantes} comp. restantes (${pct.toFixed(0)}%)</div>
        </div>
        ${pct <= 30 ? '<span class="badge badge-crit" style="flex-shrink:0;">Reabastecer</span>' : ''}
      </div>`;
  }).join('');
}

function togglePedidoMed(id) {
  if (_pedidoSelecionados.has(id)) _pedidoSelecionados.delete(id);
  else _pedidoSelecionados.add(id);
  renderPedidoMeds();
}

function renderPedidoFarmacias() {
  const c = document.getElementById('pedidoFarmacias');
  const farms = storage.farmacias();
  if (!farms.length) {
    c.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:20px">Nenhuma farmácia cadastrada. <span style="color:var(--accent-light);cursor:pointer;text-decoration:underline" onclick="closeModal('modalPedido');switchView('viewFarmacias')">Adicionar agora</span></p>`;
    return;
  }
  c.innerHTML = farms.map(f => `
    <div class="farm-card ${_pedidoFarmaciaId === f.id ? 'selected' : ''}" onclick="selecionarFarmacia(${f.id})">
      <div class="farm-icon">🏥</div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:0.9rem;">${escHtml(f.nome)}</div>
        <div style="font-size:0.73rem;color:var(--text-muted);margin-top:2px;">${escHtml(f.whatsapp)}</div>
      </div>
      ${_pedidoFarmaciaId === f.id ? '<span style="color:var(--accent-light);font-size:1.3rem">✓</span>' : ''}
    </div>`).join('');
}

function selecionarFarmacia(id) {
  _pedidoFarmaciaId = id;
  renderPedidoFarmacias();
}

function renderPedidoPreview() {
  const txt = document.getElementById('pedidoMsgEdit');
  const perfil = storage.perfil();
  const nome   = perfil.nome || '';
  const data   = new Date().toLocaleDateString('pt-BR');

  let linhasMeds = '';
  if (_pedidoSelecionados.size) {
    const meds = storage.meds().filter(m => _pedidoSelecionados.has(m.id));
    linhasMeds = meds.map(m => {
      let s = `• ${m.nome}`;
      if (m.mg) s += ` ${m.mg}`;
      if (m.fabricante) s += ` (${m.fabricante})`;
      return s;
    }).join('\n');
  }

  let msg = `Olá! 👋`;
  if (nome) msg += ` Meu nome é *${nome}*.`;
  msg += `\n\nGostaria de solicitar um orçamento dos seguintes medicamentos:`;
  if (linhasMeds) {
    msg += `\n\n${linhasMeds}`;
  } else {
    msg += `\n\n_(adicione os medicamentos desejados aqui)_`;
  }
  msg += `\n\n*Data:* ${data}`;
  msg += `\n\nAguardo retorno. Obrigado! 🙏`;

  if (txt) txt.value = msg;
}

function pedidoProx() {
  if (_pedidoStep === 2 && !_pedidoFarmaciaId) { toast('Selecione uma farmácia para enviar o pedido.', 'warn'); return; }
  if (_pedidoStep < 3) { _pedidoStep++; renderPedidoStep(); const b=document.getElementById("btnPedidoProx"); if(b) b.textContent = _pedidoStep===3 ? "📲 Enviar via WhatsApp" : "Próximo →"; }
}
function pedidoAntes() {
  if (_pedidoStep > 1) { _pedidoStep--; renderPedidoStep(); }
}

function enviarPedidoWhatsApp() {
  if (!_pedidoFarmaciaId) { toast('Selecione uma farmácia primeiro.', 'warn'); return; }
  const farm = storage.farmacias().find(f => f.id === _pedidoFarmaciaId);
  const txt = document.getElementById('pedidoMsgEdit');
  const msg = txt ? txt.value : document.getElementById('pedidoPreview')?.dataset.msg;
  if (!farm || !msg) return;
  const url = `https://wa.me/55${farm.whatsapp}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
  closeModal('modalPedido');
  toast('📲 Abrindo WhatsApp...', 'ok');
}

function enviarWhatsApp(farmId) {
  _pedidoFarmaciaId = farmId;
  _pedidoStep = 1;
  _pedidoSelecionados.clear();
  renderPedidoStep();
  openModal('modalPedido');
}

// ─────────────────────────────────────────
// AVISOS
// ─────────────────────────────────────────

function renderAvisos() {
  const c = document.getElementById('avisosList');
  if (!c) return;
  const meds   = storage.meds();
  const avisos = [];

  meds.forEach(m => {
    const { restantes, pct } = calcStock(m);
    if (pct <= 15)      avisos.push({ t:'danger', txt:`<strong>${escHtml(m.nome)}</strong> está <strong>crítico</strong> — apenas ${restantes} comprimidos restantes!` });
    else if (pct <= 30) avisos.push({ t:'warn',   txt:`<strong>${escHtml(m.nome)}</strong> está acabando — ${restantes} comprimidos restantes.` });
  });

  if (!avisos.length) {
    c.innerHTML = `
      <div class="alert-card ok">
        <span style="font-size:1.3rem">✅</span>
        <div>
          <div style="font-weight:700;font-size:0.9rem;color:#34d399">Tudo em dia!</div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin-top:3px">Todos os medicamentos estão com estoque adequado.</div>
        </div>
      </div>`;
    return;
  }
  c.innerHTML = avisos.map(a => `
    <div class="alert-card ${a.t}">
      <span style="font-size:1.3rem">${a.t==='danger'?'🔴':'🟡'}</span>
      <div style="font-size:0.85rem;color:var(--text);line-height:1.5">${a.txt}</div>
    </div>`).join('');
}

// ─────────────────────────────────────────
// BACKUP
// ─────────────────────────────────────────

function exportarDados() {
  const bkp = {
    perfil:    storage.perfil(),
    meds:      storage.meds(),
    farmacias: storage.farmacias(),
    history:   storage.history(),
    settings:  storage.settings(),
    exportado: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(bkp, null, 2)], { type:'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `backup-remed-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  toast('📤 Backup exportado!', 'ok');
}

function importarDados(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    try {
      const d = JSON.parse(ev.target.result);
      if (d.perfil)    storage.set(KEY_PERFIL,     d.perfil);
      if (d.meds)      storage.set(KEY_MEDS,        d.meds);
      if (d.farmacias) storage.set(KEY_FARMACIAS,   d.farmacias);
      if (d.history)   storage.set(KEY_HISTORY,     d.history);
      if (d.settings)  storage.set(KEY_SETTINGS,    d.settings);
      toast('📥 Dados restaurados! Conta recuperada.', 'ok', 5000);
      setTimeout(() => location.reload(), 1500);
    } catch {
      toast('❌ Arquivo inválido ou corrompido.', 'err');
    }
  };
  r.readAsText(f);
  e.target.value = '';
}

function limparTudo() {
  if (confirm('⚠️ Apagar todos os dados? Esta ação não pode ser desfeita.')) {
    localStorage.clear();
    location.reload();
  }
}

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  updateDate();
  applyTheme();
  setupPWA();
  _atualizarHeaderNome();
  initNotificacoes();
  setupFormMed();
  setupFormFarmacia();
  renderMeds();
  renderLembretes();

  // Cor personalizada
  const corInput = document.getElementById('corPrincipal');
  if (corInput) corInput.addEventListener('input', e => mudarCor(e.target.value));

  // Importar dados
  const importFile = document.getElementById('importFile');
  if (importFile) importFile.addEventListener('change', importarDados);
});
