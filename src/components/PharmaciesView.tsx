import React, { useState } from 'react';
import {
  Building2,
  MessageCircle,
  Plus,
  Star,
  MapPin,
  Trash2,
  Edit2,
  ExternalLink,
  X,
} from 'lucide-react';
import { Pharmacy } from '../types';
import { cleanWhatsAppNumber } from '../utils/whatsapp';

interface PharmaciesViewProps {
  pharmacies: Pharmacy[];
  onSavePharmacy: (pharmacy: Pharmacy) => void;
  onDeletePharmacy: (id: string) => void;
  onSetDefaultPharmacy: (id: string) => void;
  isModalOpen: boolean;
  onCloseModal: () => void;
  onOpenModal: () => void;
  onToast: (msg: string, type?: 'ok' | 'err' | 'info' | 'warn') => void;
}

export const PharmaciesView: React.FC<PharmaciesViewProps> = ({
  pharmacies,
  onSavePharmacy,
  onDeletePharmacy,
  onSetDefaultPharmacy,
  isModalOpen,
  onCloseModal,
  onOpenModal,
  onToast,
}) => {
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null);
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [notas, setNotas] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const openFormForEdit = (farm: Pharmacy) => {
    setEditingPharmacy(farm);
    setNome(farm.nome);
    setWhatsapp(farm.whatsapp);
    setEndereco(farm.endereco || '');
    setBairro(farm.bairro || '');
    setCidade(farm.cidade || '');
    setNotas(farm.notas || '');
    setIsDefault(!!farm.isDefault);
    onOpenModal();
  };

  const openFormForNew = () => {
    setEditingPharmacy(null);
    setNome('');
    setWhatsapp('');
    setEndereco('');
    setBairro('');
    setCidade('');
    setNotas('');
    setIsDefault(pharmacies.length === 0);
    onOpenModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !whatsapp.trim()) return;

    const farm: Pharmacy = {
      id: editingPharmacy ? editingPharmacy.id : `farm-${Date.now()}`,
      nome: nome.trim(),
      whatsapp: cleanWhatsAppNumber(whatsapp),
      endereco: endereco.trim() || undefined,
      bairro: bairro.trim() || undefined,
      cidade: cidade.trim() || undefined,
      notas: notas.trim() || undefined,
      isDefault,
    };

    onSavePharmacy(farm);
    onCloseModal();
    onToast(editingPharmacy ? 'Farmácia atualizada!' : 'Farmácia cadastrada!', 'ok');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Rede de Farmácias
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">· Contato Direto</span>
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Farmácias & Drogarias Favoritas</h2>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
            Cadastre os contatos de WhatsApp das farmácias do seu bairro para pedir com 1 clique.
          </p>
        </div>

        <button
          onClick={openFormForNew}
          className="flex items-center gap-1.5 rounded-xl bg-brand hover:bg-brand-hover px-4 py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-95 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Farmácia</span>
        </button>
      </div>

      {/* Grid de Farmácias */}
      {pharmacies.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-white/60 dark:bg-slate-900/40">
          <Building2 className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nenhuma farmácia cadastrada ainda</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Adicione uma drogaria para poder enviar seus orçamentos e pedidos diretamente pelo WhatsApp.
          </p>
          <button
            onClick={openFormForNew}
            className="mt-4 rounded-xl bg-brand hover:bg-brand-hover px-4 py-2 text-xs font-bold text-white transition"
          >
            + Cadastrar Farmácia
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pharmacies.map((farm) => {
            const cleanPhone = cleanWhatsAppNumber(farm.whatsapp);
            const directChatUrl = `https://wa.me/${cleanPhone}`;

            return (
              <div
                key={farm.id}
                className={`rounded-2xl border p-4 transition-all bg-white dark:bg-slate-900 ${
                  farm.isDefault
                    ? 'border-brand ring-1 ring-brand shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-brand">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{farm.nome}</h3>
                        {farm.isDefault && (
                          <span className="text-[10px] font-bold text-brand bg-brand-light border border-brand rounded-md px-1.5 py-0.2">
                            Padrão
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                        <MessageCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span>{farm.whatsapp}</span>
                      </div>
                      {farm.endereco && (
                        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate">
                            {farm.endereco}
                            {farm.bairro ? ` - ${farm.bairro}` : ''}
                            {farm.cidade ? `, ${farm.cidade}` : ''}
                          </span>
                        </div>
                      )}
                      {farm.notas && (
                        <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 italic">{farm.notas}</p>
                      )}
                    </div>
                  </div>

                  {/* Estrela de Farmácia Padrão */}
                  <button
                    onClick={() => onSetDefaultPharmacy(farm.id)}
                    title={farm.isDefault ? 'Farmácia principal para pedidos' : 'Tornar farmácia principal'}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      farm.isDefault ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${farm.isDefault ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Ações da Farmácia */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <a
                    href={directChatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-3 py-1.5 text-xs font-bold transition active:scale-95"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Conversar no WhatsApp</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openFormForEdit(farm)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remover "${farm.nome}" da lista?`)) {
                          onDeletePharmacy(farm.id);
                        }
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Formulário Farmácia */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingPharmacy ? 'Editar Farmácia' : 'Cadastrar Farmácia'}
                </h3>
              </div>
              <button
                onClick={onCloseModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-300 mb-1">
                  Nome da Farmácia / Drogaria <span className="text-brand">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Drogaria São Paulo (Bairro)"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-300 mb-1">
                  Número de WhatsApp (com DDD) <span className="text-brand">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 11 99999-8888 ou 5511999998888"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-300 mb-1">Endereço</label>
                  <input
                    type="text"
                    placeholder="Rua, número"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-300 mb-1">Bairro / Região</label>
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-300 mb-1">Notas / Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Atende 24h, entrega grátis"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-brand"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Definir como farmácia padrão nos pedidos</span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand hover:bg-brand-hover px-4 py-2 text-xs font-bold text-white transition active:scale-95"
                >
                  Salvar Farmácia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
