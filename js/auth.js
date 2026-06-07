function abrirAjustes() {
  _preencherPerfil();
  openModal('modalSettings');
}

function _preencherPerfil() {
  const p = storage.perfil();
  const el = document.getElementById('perfilNomeInput');
  const el2 = document.getElementById('perfilEndInput');
  const el3 = document.getElementById('perfilTelInput');
  if (el)  el.value  = p.nome     || '';
  if (el2) el2.value = p.endereco || '';
  if (el3) el3.value = p.telefone || '';
}

function salvarPerfil() {
  const nome     = document.getElementById('perfilNomeInput')?.value.trim()  || '';
  const endereco = document.getElementById('perfilEndInput')?.value.trim()   || '';
  const telefone = document.getElementById('perfilTelInput')?.value.trim()   || '';
  storage.set(KEY_PERFIL, { nome, endereco, telefone });
  _atualizarHeaderNome();
  toast('✅ Perfil salvo!', 'ok');
}

function _atualizarHeaderNome() {
  const p = storage.perfil();
  const hdr = document.getElementById('userNameDisplayHeader');
  if (hdr) hdr.textContent = p.nome ? `Olá, ${p.nome.split(' ')[0]} 👋` : 'ReMed 💊';
}

function desconectarUsuario() {}
