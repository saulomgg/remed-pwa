import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Building2,
  Plus,
  Minus,
  Check,
  MapPin,
  Copy,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  User,
  Edit3,
} from 'lucide-react';
import { Medication, Pharmacy, UserProfile } from '../types';
import { calculateStock } from '../utils/storage';
import { formatWhatsAppMessage, buildWhatsAppLink, OrderItem } from '../utils/whatsapp';

interface OrderWhatsAppViewProps {
  medications: Medication[];
  pharmacies: Pharmacy[];
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  initialSelectedMedId?: string | null;
  onOpenNewPharmacyModal: () => void;
  onTabChange: (tab: any) => void;
  onToast: (msg: string, type?: 'ok' | 'err' | 'info' | 'warn') => void;
}

export const OrderWhatsAppView: React.FC<OrderWhatsAppViewProps> = ({
  medications,
  pharmacies,
  profile,
  onSaveProfile,
  initialSelectedMedId,
  onOpenNewPharmacyModal,
  onTabChange,
  onToast,
}) => {
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('');
  const [patientName, setPatientName] = useState<string>(profile.nome || '');
  const [customNote, setCustomNote] = useState('');
  const [includeAddress, setIncludeAddress] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'lowStock' | 'selected'>('lowStock');

  // Mensagem editável personalizada pelo usuário
  const [editableMessage, setEditableMessage] = useState<string>('');
  const [isCustomEdited, setIsCustomEdited] = useState(false);

  // Inicializa farmácia padrão
  useEffect(() => {
    if (pharmacies.length > 0 && !selectedPharmacyId) {
      const defaultFarm = pharmacies.find((p) => p.isDefault) || pharmacies[0];
      setSelectedPharmacyId(defaultFarm.id);
    }
  }, [pharmacies, selectedPharmacyId]);

  // Sincroniza se o profile.nome mudar
  useEffect(() => {
    if (profile.nome && !patientName) {
      setPatientName(profile.nome);
    }
  }, [profile.nome]);

  // Se veio de um clique "Pedir neste remédio", seleciona imediatamente
  useEffect(() => {
    if (initialSelectedMedId) {
      setSelectedItems((prev) => ({
        ...prev,
        [initialSelectedMedId]: prev[initialSelectedMedId] || 1,
      }));
      setFilterMode('selected');
    }
  }, [initialSelectedMedId]);

  // Auto-seleciona medicamentos críticos na primeira visita
  useEffect(() => {
    if (Object.keys(selectedItems).length === 0 && medications.length > 0) {
      const lowStockMeds = medications.filter((m) => {
        const s = calculateStock(m);
        return s.status === 'crit' || s.status === 'warn';
      });
      if (lowStockMeds.length > 0) {
        const initialMap: Record<string, number> = {};
        lowStockMeds.forEach((m) => {
          initialMap[m.id] = 1;
        });
        setSelectedItems(initialMap);
      } else {
        setFilterMode('all');
      }
    }
  }, [medications]);

  // Recalcula a mensagem automática quando os itens, nome ou opções mudarem (a não ser que o usuário tenha editado manualmente)
  useEffect(() => {
    if (isCustomEdited) return;

    const currentPharmacy = pharmacies.find((p) => p.id === selectedPharmacyId);
    const orderItems: OrderItem[] = Object.entries(selectedItems)
      .map(([medId, qty]) => {
        const medication = medications.find((m) => m.id === medId);
        if (!medication) return null;
        return { medication, quantidadeCaixas: qty };
      })
      .filter(Boolean) as OrderItem[];

    const generated = formatWhatsAppMessage({
      profile: { ...profile, nome: patientName },
      pharmacy: currentPharmacy,
      items: orderItems,
      customNote,
      includeAddress,
    });

    setEditableMessage(generated);
  }, [selectedItems, selectedPharmacyId, patientName, customNote, includeAddress, isCustomEdited, profile, pharmacies, medications]);

  const handleNameChange = (val: string) => {
    setPatientName(val);
    onSaveProfile({ ...profile, nome: val });
    setIsCustomEdited(false); // Atualiza na mensagem
  };

  const toggleItem = (medId: string) => {
    setIsCustomEdited(false);
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[medId]) {
        delete copy[medId];
      } else {
        copy[medId] = 1;
      }
      return copy;
    });
  };

  const updateQuantity = (medId: string, delta: number) => {
    setIsCustomEdited(false);
    setSelectedItems((prev) => {
      const current = prev[medId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[medId];
        return copy;
      }
      return { ...prev, [medId]: next };
    });
  };

  const handleSelectAllLowStock = () => {
    setIsCustomEdited(false);
    const newMap: Record<string, number> = { ...selectedItems };
    medications.forEach((m) => {
      const s = calculateStock(m);
      if (s.status === 'crit' || s.status === 'warn') {
        if (!newMap[m.id]) newMap[m.id] = 1;
      }
    });
    setSelectedItems(newMap);
    onToast('Medicamentos com estoque baixo adicionados ao pedido!', 'ok');
  };

  const handleResetToAutoMessage = () => {
    setIsCustomEdited(false);
    const currentPharmacy = pharmacies.find((p) => p.id === selectedPharmacyId);
    const orderItems: OrderItem[] = Object.entries(selectedItems)
      .map(([medId, qty]) => {
        const medication = medications.find((m) => m.id === medId);
        if (!medication) return null;
        return { medication, quantidadeCaixas: qty };
      })
      .filter(Boolean) as OrderItem[];

    const generated = formatWhatsAppMessage({
      profile: { ...profile, nome: patientName },
      pharmacy: currentPharmacy,
      items: orderItems,
      customNote,
      includeAddress,
    });
    setEditableMessage(generated);
    onToast('Mensagem restaurada para o modelo automático!', 'info');
  };

  const selectedMedicationsCount = Object.keys(selectedItems).length;
  const currentPharmacy = pharmacies.find((p) => p.id === selectedPharmacyId);

  const handleCopyMessage = () => {
    if (!editableMessage.trim()) {
      onToast('Nenhum texto para copiar.', 'warn');
      return;
    }
    navigator.clipboard.writeText(editableMessage);
    onToast('Texto do pedido copiado!', 'ok');
  };

  const handleSendWhatsApp = () => {
    if (!selectedMedicationsCount && !editableMessage.trim()) {
      onToast('Selecione pelo menos um medicamento para o pedido.', 'warn');
      return;
    }
    if (!currentPharmacy) {
      onToast('Cadastre ou selecione uma farmácia primeiro.', 'warn');
      return;
    }
    const url = buildWhatsAppLink(currentPharmacy.whatsapp, editableMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredMeds = medications.filter((m) => {
    const s = calculateStock(m);
    if (filterMode === 'lowStock') return s.status === 'crit' || s.status === 'warn';
    if (filterMode === 'selected') return !!selectedItems[m.id];
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Elegante */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Pedido Express via WhatsApp
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">· 100% Editável</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Monte seu pedido e converse direto com a farmácia
            </h2>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
              Selecione os remédios abaixo. Você pode alterar seu nome e editar qualquer parte da mensagem antes de enviar.
            </p>
          </div>

          {/* Farmácia de Destino */}
          <div className="flex flex-col sm:items-end gap-1.5 min-w-[240px]">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Enviar para qual Farmácia:
            </span>
            {pharmacies.length > 0 ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedPharmacyId}
                  onChange={(e) => {
                    setSelectedPharmacyId(e.target.value);
                    setIsCustomEdited(false);
                  }}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand flex-1"
                >
                  {pharmacies.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome} {f.isDefault ? '★' : ''}
                    </option>
                  ))}
                </select>
                <button
                  onClick={onOpenNewPharmacyModal}
                  title="Cadastrar nova farmácia"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-brand hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenNewPharmacyModal}
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-brand bg-brand-light px-3 py-2 text-xs font-semibold text-brand transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Cadastrar Primeira Farmácia
              </button>
            )}
          </div>
        </div>

        {/* Campo de Nome do Usuário Direto na Tela */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            <User className="h-4 w-4 text-brand" />
            <span>Seu Nome no Pedido:</span>
          </label>
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Digite seu nome (Ex: Saulo Meira)"
              value={patientName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <span className="text-[11px] text-slate-400">
            Aparece na saudação: <em>&quot;Olá! Meu nome é {patientName || '...'}&quot;</em>
          </span>
        </div>
      </div>

      {/* Grid Principal: Seletor de Remédios (Esq) + Mensagem Editável (Dir) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Lista de Remédios */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1">
              <button
                onClick={() => setFilterMode('lowStock')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filterMode === 'lowStock'
                    ? 'bg-white dark:bg-slate-800 text-brand shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Estoque Baixo
              </button>
              <button
                onClick={() => setFilterMode('all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filterMode === 'all'
                    ? 'bg-white dark:bg-slate-800 text-brand shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todos ({medications.length})
              </button>
              <button
                onClick={() => setFilterMode('selected')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filterMode === 'selected'
                    ? 'bg-white dark:bg-slate-800 text-brand shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Selecionados ({selectedMedicationsCount})
              </button>
            </div>

            <button
              onClick={handleSelectAllLowStock}
              className="text-xs font-bold text-brand hover:underline transition"
            >
              + Adicionar todos no fim
            </button>
          </div>

          {/* Cards de Seleção de Medicamento */}
          <div className="space-y-2.5">
            {filteredMeds.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 bg-white/50 dark:bg-slate-900/40">
                {filterMode === 'lowStock'
                  ? 'Nenhum medicamento com estoque baixo no momento. Veja a aba "Todos" para pedir outros remédios.'
                  : 'Nenhum medicamento selecionado.'}
              </div>
            ) : (
              filteredMeds.map((med) => {
                const isSelected = !!selectedItems[med.id];
                const quantity = selectedItems[med.id] || 0;
                const stock = calculateStock(med);

                return (
                  <div
                    key={med.id}
                    onClick={() => toggleItem(med.id)}
                    className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand bg-brand-light ring-1 ring-brand'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                          isSelected
                            ? 'border-brand bg-brand text-white font-bold'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-transparent'
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {med.nome}
                          </span>
                          {med.dosagem && (
                            <span className="text-xs font-semibold text-brand shrink-0">
                              {med.dosagem}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>
                            Resta:{' '}
                            <strong className="text-slate-700 dark:text-slate-200 tabular-nums">
                              {stock.restantes}
                            </strong>{' '}
                            un.
                          </span>
                          {stock.status === 'crit' && (
                            <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                              · <AlertTriangle className="h-3 w-3 inline" /> Acabando em {stock.diasRestantes}d
                            </span>
                          )}
                          {med.fabricante && <span>· {med.fabricante}</span>}
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isSelected ? (
                        <div className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 shadow-xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(med.id, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 dark:text-white min-w-[50px] text-center tabular-nums">
                            {quantity} {quantity === 1 ? 'cx' : 'cxs'}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(med.id, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleItem(med.id)}
                          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-brand hover:text-brand transition"
                        >
                          + Adicionar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna Direita: Mensagem Editável & Disparo WhatsApp */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mensagem para o WhatsApp</h3>
              </div>
              {isCustomEdited && (
                <button
                  type="button"
                  onClick={handleResetToAutoMessage}
                  title="Restaurar mensagem gerada automaticamente com base nos itens selecionados"
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-brand transition"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Restaurar Padrão</span>
                </button>
              )}
            </div>

            {/* Opções Rápidas */}
            <div className="space-y-3 text-xs">
              {profile.endereco ? (
                <label className="flex items-start gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeAddress}
                    onChange={(e) => {
                      setIncludeAddress(e.target.checked);
                      setIsCustomEdited(false);
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-brand"
                  />
                  <span>
                    Incluir endereço de entrega:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {profile.endereco}, {profile.bairro}
                    </strong>
                  </span>
                </label>
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-2.5 text-slate-500 text-[11px] flex items-center justify-between">
                  <span>Endereço não cadastrado.</span>
                  <button
                    onClick={() => onTabChange('settings')}
                    className="text-brand font-semibold hover:underline"
                  >
                    Cadastrar
                  </button>
                </div>
              )}

              {/* Observação rápida */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pergunta ou observação rápida:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pode ser genérico? Qual o valor do frete?"
                  value={customNote}
                  onChange={(e) => {
                    setCustomNote(e.target.value);
                    setIsCustomEdited(false);
                  }}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              {/* Caixa Editável da Mensagem (Textarea Direto!) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                    <span>Texto que será enviado (você pode editar livremente):</span>
                  </label>
                  {isCustomEdited && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      Modificado manualmente
                    </span>
                  )}
                </div>
                <textarea
                  rows={9}
                  value={editableMessage}
                  onChange={(e) => {
                    setEditableMessage(e.target.value);
                    setIsCustomEdited(true);
                  }}
                  className="w-full rounded-2xl border border-emerald-500/40 bg-emerald-50/30 dark:bg-slate-950 p-3.5 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 border-l-4 border-l-emerald-500 shadow-inner"
                  placeholder="A mensagem será montada aqui..."
                />
              </div>
            </div>

            {/* Ações de Envio com visual WhatsApp Oficial */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleSendWhatsApp}
                disabled={!editableMessage.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 text-sm shadow-md shadow-emerald-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="h-5 w-5 fill-current" />
                <span>Enviar Pedido pelo WhatsApp</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>

              <button
                onClick={handleCopyMessage}
                disabled={!editableMessage.trim()}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-3 text-xs transition active:scale-[0.98] disabled:opacity-50"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar Mensagem Formatada</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
