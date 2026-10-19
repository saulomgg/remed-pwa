import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  AlertTriangle,
  Heart,
  Droplet,
  User,
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  Check,
  Siren,
  Hospital,
  Flame,
  Shield,
  Pill,
  Share2,
  Copy,
  Info,
} from 'lucide-react';
import { UserProfile, EmergencyContact, Medication } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  medications: Medication[];
  onSaveProfile: (profile: UserProfile) => void;
  onToast: (message: string, type?: 'ok' | 'err' | 'info' | 'warn') => void;
}

const PUBLIC_EMERGENCY_NUMBERS = [
  {
    nome: 'SAMU (Ambulância)',
    numero: '192',
    descricao: 'Urgência e emergência médica pré-hospitalar',
    cor: 'bg-rose-600 hover:bg-rose-700 text-white',
    icon: Hospital,
  },
  {
    nome: 'Bombeiros (Resgate)',
    numero: '193',
    descricao: 'Resgate, traumas graves, acidentes e incêndios',
    cor: 'bg-amber-600 hover:bg-amber-700 text-white',
    icon: Flame,
  },
  {
    nome: 'Polícia Militar',
    numero: '190',
    descricao: 'Emergências de segurança e socorro público',
    cor: 'bg-blue-600 hover:bg-blue-700 text-white',
    icon: Shield,
  },
  {
    nome: 'Disque Intoxicação (ANVISA)',
    numero: '08007226001',
    numeroFormatado: '0800 722 6001',
    descricao: 'Central toxicológica / superdosagem de remédios',
    cor: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    icon: AlertTriangle,
  },
];

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  profile,
  medications,
  onSaveProfile,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'contacts' | 'services'>('card');
  const [isEditingMedicalData, setIsEditingMedicalData] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(true);

  // Formulário de Edição da Ficha Médica
  const [medicalForm, setMedicalForm] = useState({
    nome: profile.nome || '',
    tipoSanguineo: profile.tipoSanguineo || 'O+',
    alergias: profile.alergias || '',
    condicoesSaude: profile.condicoesSaude || '',
    planoSaude: profile.planoSaude || '',
    observacoesMedicas: profile.observacoesMedicas || '',
    dataNascimento: profile.dataNascimento || '',
  });

  // Formulário de Novo Contato de Emergência
  const [newContactForm, setNewContactForm] = useState({
    nome: '',
    parentesco: 'Familiar',
    telefone: '',
    whatsapp: '',
  });

  if (!isOpen) return null;

  const contacts = profile.contatosEmergencia || [];

  const handleSaveMedicalData = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      nome: medicalForm.nome.trim(),
      tipoSanguineo: medicalForm.tipoSanguineo.trim(),
      alergias: medicalForm.alergias.trim(),
      condicoesSaude: medicalForm.condicoesSaude.trim(),
      planoSaude: medicalForm.planoSaude.trim(),
      observacoesMedicas: medicalForm.observacoesMedicas.trim(),
      dataNascimento: medicalForm.dataNascimento.trim(),
    };
    onSaveProfile(updated);
    setIsEditingMedicalData(false);
    onToast('Ficha médica de emergência atualizada com sucesso!', 'ok');
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactForm.nome.trim() || !newContactForm.telefone.trim()) {
      onToast('Informe o nome e o telefone do contato de emergência.', 'warn');
      return;
    }

    const cleanPhone = newContactForm.telefone.replace(/\D/g, '');
    const cleanWhatsApp = (newContactForm.whatsapp || newContactForm.telefone).replace(/\D/g, '');

    const newContact: EmergencyContact = {
      id: `em-${Date.now()}`,
      nome: newContactForm.nome.trim(),
      parentesco: newContactForm.parentesco.trim() || 'Familiar',
      telefone: cleanPhone,
      whatsapp: cleanWhatsApp,
      isPrincipal: contacts.length === 0,
    };

    const updatedContacts = [...contacts, newContact];
    const updatedProfile: UserProfile = {
      ...profile,
      contatosEmergencia: updatedContacts,
    };

    onSaveProfile(updatedProfile);
    setNewContactForm({ nome: '', parentesco: 'Familiar', telefone: '', whatsapp: '' });
    setIsAddingContact(false);
    onToast('Contato de emergência adicionado!', 'ok');
  };

  const handleDeleteContact = (id: string) => {
    const updatedContacts = contacts.filter((c) => c.id !== id);
    onSaveProfile({ ...profile, contatosEmergencia: updatedContacts });
    onToast('Contato removido.', 'info');
  };

  const handleSendSOSWhatsApp = (contact: EmergencyContact) => {
    const targetNumber = contact.whatsapp || contact.telefone;
    const cleanNumber = targetNumber.replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;

    const activeMedsList = medications.length > 0
      ? medications.map((m) => `• ${m.nome} (${m.dosagem})`).join('\n')
      : 'Nenhum cadastrado';

    const message = `🚨 *EMERGÊNCIA MÉDICA (ReMed)* 🚨
Olá *${contact.nome}*, aqui é um pedido de socorro urgente de *${profile.nome || 'Saulo Meira'}*!

Estou enfrentando uma emergência de saúde neste momento e preciso de ajuda imediata.

📋 *Ficha Médica Rápida:*
🩸 *Tipo Sanguíneo:* ${profile.tipoSanguineo || 'Não informado'}
⚠️ *Alergias:* ${profile.alergias || 'Nenhuma relatada'}
🩺 *Condições Pré-existentes:* ${profile.condicoesSaude || 'Nenhuma relatada'}
🏥 *Convênio / SUS:* ${profile.planoSaude || 'Não informado'}
📍 *Endereço:* ${profile.endereco ? `${profile.endereco}, ${profile.bairro} - ${profile.cidade}` : 'Verificar localização'}

💊 *Remédios de Uso Contínuo:*
${activeMedsList}

Por favor, tente entrar em contato comigo pelo telefone ou acione o SAMU 192 urgentemente!`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${fullNumber}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onToast(`Abrindo WhatsApp de SOS para ${contact.nome}...`, 'ok');
  };

  const handleCopyMedicalReport = () => {
    const activeMedsList = medications.length > 0
      ? medications.map((m) => `• ${m.nome} (${m.dosagem})`).join('\n')
      : 'Nenhum cadastrado';

    const report = `🚨 FICHA MÉDICA DE EMERGÊNCIA — ReMed
Paciente: ${profile.nome || 'Não informado'}
Tipo Sanguíneo: ${profile.tipoSanguineo || 'Não informado'}
Alergias Críticas: ${profile.alergias || 'Nenhuma'}
Condições de Saúde: ${profile.condicoesSaude || 'Nenhuma'}
Plano de Saúde / SUS: ${profile.planoSaude || 'Não informado'}
Observações: ${profile.observacoesMedicas || 'Nenhuma'}
Endereço: ${profile.endereco ? `${profile.endereco}, ${profile.bairro} - ${profile.cidade}` : 'Não informado'}

Medicamentos em Uso:
${activeMedsList}
`;
    navigator.clipboard?.writeText(report);
    onToast('Ficha de emergência copiada para a área de transferência!', 'ok');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className={`w-full max-w-2xl rounded-3xl border-2 transition-all my-auto shadow-2xl overflow-hidden ${
          highContrastMode
            ? 'bg-slate-950 border-amber-400 text-white shadow-amber-500/10'
            : 'bg-white dark:bg-slate-900 border-rose-500 text-slate-900 dark:text-white'
        }`}
      >
        {/* Banner de Emergência de Alto Contraste */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-800 p-4 sm:p-5 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/40 animate-pulse">
              <Siren className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-white px-2 py-0.5 text-xs font-black uppercase tracking-wider text-rose-800">
                  SOS ALERTA
                </span>
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Modo de Emergência Médica
                </h2>
              </div>
              <p className="text-xs text-rose-100 font-medium">
                Informações críticas para socorristas, médicos e contatos de apoio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHighContrastMode(!highContrastMode)}
              title="Alternar contraste da tela"
              className="hidden sm:inline-flex rounded-xl bg-black/30 hover:bg-black/50 px-2.5 py-1.5 text-xs font-bold transition"
            >
              {highContrastMode ? '☀️ Contraste Suave' : '⚡ Alto Contraste'}
            </button>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/30 hover:bg-black/50 text-white transition active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Abas Internas do Modo Emergência */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 p-2 gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'card'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Ficha Médica</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Phone className="h-4 w-4" />
            <span>Meus Contatos ({contacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'services'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Hospital className="h-4 w-4" />
            <span>Serviços 192 / 193</span>
          </button>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* ABA 1: FICHA MÉDICA DE ALTO CONTRASTE */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              {!isEditingMedicalData ? (
                <>
                  {/* Bloco Destaque: Nome e Tipo Sanguíneo */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 rounded-2xl border-2 border-slate-700 bg-slate-900/90 p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Paciente / Usuário
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                          {profile.nome || 'Nome Não Cadastrado'}
                        </h3>
                        {profile.dataNascimento && (
                          <p className="text-xs text-slate-400 mt-1">
                            Nascimento: {profile.dataNascimento}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-center gap-1.5">
                        <User className="h-4 w-4 text-brand" />
                        <span>Tel: {profile.telefone || 'Não informado'}</span>
                      </div>
                    </div>

                    {/* Bloco Tipo Sanguíneo Gigante */}
                    <div className="rounded-2xl border-2 border-red-500 bg-red-950/60 p-4 text-center flex flex-col items-center justify-center shadow-lg shadow-red-900/30">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-300">
                        <Droplet className="h-4 w-4 fill-current text-red-400" />
                        <span>Tipo Sanguíneo</span>
                      </div>
                      <div className="text-4xl sm:text-5xl font-black text-white tracking-wider my-1 drop-shadow-md">
                        {profile.tipoSanguineo || 'O+'}
                      </div>
                      <span className="text-[10px] font-bold text-red-200">
                        Identificação Crítica
                      </span>
                    </div>
                  </div>

                  {/* ALERGIAS GRAVES — CAIXA DE ALERTA DE PERIGO */}
                  <div className="rounded-2xl border-2 border-amber-400 bg-amber-950/40 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-wider">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <span>Alergias Críticas a Medicamentos / Alimentos</span>
                    </div>
                    <div className="mt-2 text-base sm:text-lg font-bold text-white bg-black/40 rounded-xl p-3 border border-amber-400/30">
                      {profile.alergias ? (
                        <span className="text-amber-200 font-black">
                          ⚠️ {profile.alergias}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal text-xs">
                          Nenhuma alergia grave cadastrada. Clique em editar para adicionar.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Condições de Saúde & Plano/SUS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                        Condições Crônicas / Doenças Pré-Existentes
                      </span>
                      <p className="mt-1.5 text-sm font-bold text-slate-100">
                        {profile.condicoesSaude || 'Nenhuma informada'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                        Plano de Saúde / Número do Cartão SUS
                      </span>
                      <p className="mt-1.5 text-sm font-bold text-slate-100">
                        {profile.planoSaude || 'SUS / Não informado'}
                      </p>
                    </div>
                  </div>

                  {/* Remédios de Uso Contínuo */}
                  <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Pill className="h-4 w-4 text-brand" />
                        <span>Medicamentos Ativos em Uso ({medications.length})</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Salvos no ReMed
                      </span>
                    </div>

                    {medications.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {medications.map((m) => (
                          <div
                            key={m.id}
                            className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-white block">{m.nome}</span>
                              <span className="text-[11px] text-slate-400">
                                {m.dosagem} • {m.duracaoDias ? `${m.duracaoDias} dias` : 'Uso contínuo'}
                              </span>
                            </div>
                            <span className="rounded-md bg-brand-light/20 text-brand text-[10px] font-bold px-2 py-0.5">
                              {m.horarios?.join(', ') || 'Diário'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Nenhum medicamento cadastrado no momento.</p>
                    )}
                  </div>

                  {/* Endereço Residencial do Paciente */}
                  {profile.endereco && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
                      <strong className="text-white">Endereço Residencial:</strong> {profile.endereco}
                      {profile.complemento && ` - ${profile.complemento}`} - {profile.bairro}, {profile.cidade}
                    </div>
                  )}

                  {/* Ações Rápidas da Ficha */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() => setIsEditingMedicalData(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 text-xs font-bold transition active:scale-95"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Editar Dados Médicos</span>
                    </button>

                    <button
                      onClick={handleCopyMedicalReport}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 text-xs font-bold transition active:scale-95"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar Ficha Completa</span>
                    </button>
                  </div>
                </>
              ) : (
                /* FORMULÁRIO DE EDIÇÃO DOS DADOS MÉDICOS */
                <form onSubmit={handleSaveMedicalData} className="space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white">Editar Informações Médicas de Emergência</h3>
                    <button
                      type="button"
                      onClick={() => setIsEditingMedicalData(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-300 mb-1">Nome Completo</label>
                      <input
                        type="text"
                        value={medicalForm.nome}
                        onChange={(e) => setMedicalForm({ ...medicalForm, nome: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="Ex: Saulo Meira"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Tipo Sanguíneo</label>
                      <select
                        value={medicalForm.tipoSanguineo}
                        onChange={(e) => setMedicalForm({ ...medicalForm, tipoSanguineo: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="Desconhecido">Não Sei / Desconhecido</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-amber-300 mb-1">
                      ⚠️ Alergias Graves (Medicamentos, Alimentos, Substâncias)
                    </label>
                    <input
                      type="text"
                      value={medicalForm.alergias}
                      onChange={(e) => setMedicalForm({ ...medicalForm, alergias: e.target.value })}
                      placeholder="Ex: Penicilina, Dipirona, Anti-inflamatórios, Frutos do Mar"
                      className="w-full rounded-xl border border-amber-500/60 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Condições Pré-Existentes / Doenças</label>
                      <input
                        type="text"
                        value={medicalForm.condicoesSaude}
                        onChange={(e) => setMedicalForm({ ...medicalForm, condicoesSaude: e.target.value })}
                        placeholder="Ex: Hipertensão, Diabetes Tipo 2, Asma"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Plano de Saúde ou Cartão SUS</label>
                      <input
                        type="text"
                        value={medicalForm.planoSaude}
                        onChange={(e) => setMedicalForm({ ...medicalForm, planoSaude: e.target.value })}
                        placeholder="Ex: Unimed 12345 / Cartão SUS: 7000..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Observações Médicas Importantes</label>
                    <textarea
                      rows={2}
                      value={medicalForm.observacoesMedicas}
                      onChange={(e) => setMedicalForm({ ...medicalForm, observacoesMedicas: e.target.value })}
                      placeholder="Ex: Portador de marcapasso, cirurgias prévias, doador de órgãos..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingMedicalData(false)}
                      className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs font-bold text-white shadow-md active:scale-95"
                    >
                      Salvar Ficha Médica
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ABA 2: CONTATOS DE EMERGÊNCIA PESSOAIS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-emerald-400" />
                    <span>Contatos Pessoais de Socorro</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Disque em 1 toque ou envie mensagem de socorro no WhatsApp
                  </p>
                </div>

                {!isAddingContact && (
                  <button
                    onClick={() => setIsAddingContact(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 text-xs font-bold transition active:scale-95 shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Adicionar Contato</span>
                  </button>
                )}
              </div>

              {/* FORMULÁRIO DE ADIÇÃO DE CONTATO */}
              {isAddingContact && (
                <form
                  onSubmit={handleAddContact}
                  className="rounded-2xl border-2 border-rose-500/80 bg-slate-900 p-4 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="font-bold text-white text-xs">Novo Contato de Emergência</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingContact(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-300 mb-1">Nome do Contato</label>
                      <input
                        type="text"
                        placeholder="Ex: Maria Meira / Dr. Carlos"
                        value={newContactForm.nome}
                        onChange={(e) => setNewContactForm({ ...newContactForm, nome: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-300 mb-1">Parentesco / Relação</label>
                      <input
                        type="text"
                        placeholder="Ex: Esposa, Filho, Mãe, Médico"
                        value={newContactForm.parentesco}
                        onChange={(e) => setNewContactForm({ ...newContactForm, parentesco: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-300 mb-1">Telefone de Ligação</label>
                      <input
                        type="tel"
                        placeholder="Ex: 11 99123-4567"
                        value={newContactForm.telefone}
                        onChange={(e) => setNewContactForm({ ...newContactForm, telefone: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-300 mb-1">WhatsApp (se for diferente)</label>
                      <input
                        type="tel"
                        placeholder="Ex: 11 99123-4567"
                        value={newContactForm.whatsapp}
                        onChange={(e) => setNewContactForm({ ...newContactForm, whatsapp: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingContact(false)}
                      className="rounded-xl bg-slate-800 px-3 py-1.5 text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5"
                    >
                      Salvar Contato
                    </button>
                  </div>
                </form>
              )}

              {/* LISTA DE CONTATOS CADASTRADOS */}
              {contacts.length > 0 ? (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="rounded-2xl border-2 border-slate-700 bg-slate-900/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-white">{contact.nome}</h4>
                          {contact.parentesco && (
                            <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-slate-300">
                              {contact.parentesco}
                            </span>
                          )}
                          {contact.isPrincipal && (
                            <span className="rounded-full bg-rose-600/30 border border-rose-500 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          📞 {contact.telefone}
                        </p>
                      </div>

                      {/* Botões de Ação Imediata */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Ligar agora */}
                        <a
                          href={`tel:${contact.telefone}`}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold transition active:scale-95 shadow-md shadow-emerald-950/40"
                        >
                          <Phone className="h-4 w-4" />
                          <span>Ligar Agora</span>
                        </a>

                        {/* Enviar WhatsApp de SOS */}
                        <button
                          onClick={() => handleSendSOSWhatsApp(contact)}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold transition active:scale-95 shadow-md shadow-emerald-950/40"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>WhatsApp SOS</span>
                        </button>

                        {/* Excluir contato */}
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          title="Remover contato"
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mx-auto">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Nenhum Contato Pessoal Cadastrado</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Adicione familiares, cuidadores ou médicos para poder ligar ou enviar mensagens rápidas de socorro com 1 toque.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddingContact(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Primeiro Contato</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ABA 3: SERVIÇOS PÚBLICOS DE URGÊNCIA */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Hospital className="h-4 w-4 text-rose-500" />
                  <span>Números Oficiais de Emergência e Resgate (Brasil)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Toque para discar imediatamente em caso de perigo à vida
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PUBLIC_EMERGENCY_NUMBERS.map((servico) => {
                  const Icon = servico.icon;
                  return (
                    <div
                      key={servico.numero}
                      className="rounded-2xl border-2 border-slate-700 bg-slate-900/90 p-4 flex flex-col justify-between space-y-3 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white">
                            <Icon className="h-5 w-5 text-rose-400" />
                          </div>
                          <div>
                            <span className="font-black text-white text-base block">
                              {servico.nome}
                            </span>
                            <span className="text-[11px] text-slate-400 line-clamp-2">
                              {servico.descricao}
                            </span>
                          </div>
                        </div>

                        <span className="text-2xl font-black text-white font-mono">
                          {servico.numeroFormatado || servico.numero}
                        </span>
                      </div>

                      <a
                        href={`tel:${servico.numero}`}
                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black shadow-md transition active:scale-95 ${servico.cor}`}
                      >
                        <Phone className="h-4 w-4" />
                        <span>Discar {servico.numeroFormatado || servico.numero} Agora</span>
                      </a>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3.5 text-xs text-slate-400 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  As ligações para <strong>192 (SAMU)</strong>, <strong>193 (Bombeiros)</strong> e <strong>190 (Polícia)</strong> são <strong>gratuitas</strong> e funcionam de qualquer celular mesmo sem saldo ou bloqueado.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-3.5 sm:p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            <span>Ficha salva 100% no seu aparelho (offline)</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 font-bold transition"
          >
            Fechar SOS
          </button>
        </div>
      </div>
    </div>
  );
};
