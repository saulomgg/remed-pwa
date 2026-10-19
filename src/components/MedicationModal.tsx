import React, { useState, useEffect } from 'react';
import { X, Plus, Clock, Pill, Calendar } from 'lucide-react';
import { Medication, MedicationForm, Pharmacy } from '../types';

interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (med: Medication, syncToCalendar: boolean) => void;
  medicationToEdit?: Medication | null;
  pharmacies: Pharmacy[];
  isCalendarConnected: boolean;
}

export const MedicationModal: React.FC<MedicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  medicationToEdit,
  pharmacies,
  isCalendarConnected,
}) => {
  const [nome, setNome] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [forma, setForma] = useState<MedicationForm>('comprimido');
  const [fabricante, setFabricante] = useState('');
  const [horarios, setHorarios] = useState<string[]>(['08:00']);
  const [dosePorVez, setDosePorVez] = useState<number>(1);
  const [estoqueAtual, setEstoqueAtual] = useState<number>(30);
  const [estoqueTotal, setEstoqueTotal] = useState<number>(30);
  const [estoqueMinimoAlerta, setEstoqueMinimoAlerta] = useState<number>(6);
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [duracaoDias, setDuracaoDias] = useState<string>('');
  const [obs, setObs] = useState('');
  const [farmaciaId, setFarmaciaId] = useState('');
  const [syncToCalendar, setSyncToCalendar] = useState(isCalendarConnected);
  const [customTimeInput, setCustomTimeInput] = useState('12:00');

  useEffect(() => {
    if (medicationToEdit) {
      setNome(medicationToEdit.nome || '');
      setDosagem(medicationToEdit.dosagem || '');
      setForma(medicationToEdit.forma || 'comprimido');
      setFabricante(medicationToEdit.fabricante || '');
      setHorarios(medicationToEdit.horarios?.length ? [...medicationToEdit.horarios] : ['08:00']);
      setDosePorVez(medicationToEdit.dosePorVez || 1);
      setEstoqueAtual(medicationToEdit.estoqueAtual ?? 30);
      setEstoqueTotal(medicationToEdit.estoqueTotal || 30);
      setEstoqueMinimoAlerta(medicationToEdit.estoqueMinimoAlerta || 6);
      setDataInicio(medicationToEdit.dataInicio || new Date().toISOString().slice(0, 10));
      setDuracaoDias(medicationToEdit.duracaoDias ? String(medicationToEdit.duracaoDias) : '');
      setObs(medicationToEdit.obs || '');
      setFarmaciaId(medicationToEdit.farmaciaId || '');
      setSyncToCalendar(isCalendarConnected);
    } else {
      setNome('');
      setDosagem('');
      setForma('comprimido');
      setFabricante('');
      setHorarios(['08:00']);
      setDosePorVez(1);
      setEstoqueAtual(30);
      setEstoqueTotal(30);
      setEstoqueMinimoAlerta(6);
      setDataInicio(new Date().toISOString().slice(0, 10));
      setDuracaoDias('');
      setObs('');
      setFarmaciaId(pharmacies.find((p) => p.isDefault)?.id || '');
      setSyncToCalendar(isCalendarConnected);
    }
  }, [medicationToEdit, isOpen, isCalendarConnected, pharmacies]);

  if (!isOpen) return null;

  const handleApplyPreset = (times: string[]) => {
    setHorarios(times);
  };

  const handleAddCustomTime = () => {
    if (!customTimeInput) return;
    if (!horarios.includes(customTimeInput)) {
      const next = [...horarios, customTimeInput].sort();
      setHorarios(next);
    }
  };

  const handleRemoveTime = (index: number) => {
    const next = horarios.filter((_, i) => i !== index);
    setHorarios(next.length ? next : ['08:00']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const med: Medication = {
      id: medicationToEdit ? medicationToEdit.id : `med-${Date.now()}`,
      nome: nome.trim(),
      dosagem: dosagem.trim(),
      forma,
      fabricante: fabricante.trim() || undefined,
      horarios: horarios.length > 0 ? horarios : ['08:00'],
      dosePorVez: Math.max(1, Number(dosePorVez) || 1),
      estoqueAtual: Math.max(0, Number(estoqueAtual) || 0),
      estoqueTotal: Math.max(1, Number(estoqueTotal) || Number(estoqueAtual) || 30),
      estoqueMinimoAlerta: Math.max(1, Number(estoqueMinimoAlerta) || 5),
      dataInicio: dataInicio || new Date().toISOString().slice(0, 10),
      duracaoDias: duracaoDias ? parseInt(duracaoDias, 10) : undefined,
      obs: obs.trim() || undefined,
      farmaciaId: farmaciaId || undefined,
      criadoEm: medicationToEdit?.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    onSave(med, syncToCalendar);
    onClose();
  };

  const commonMedsSuggestions = [
    'Losartana',
    'Metformina',
    'Dipirona',
    'Omeprazol',
    'Atenolol',
    'Paracetamol',
    'Sinvastatina',
    'Levotiroxina',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl text-slate-900 dark:text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light text-brand">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {medicationToEdit ? 'Editar Medicamento' : 'Novo Medicamento'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Preencha horários e estoque para alertas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body com Scroll */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-4 text-xs">
          {/* Nome do Remédio */}
          <div>
            <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Nome do Medicamento <span className="text-brand">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Losartana Potássica"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
            />
            {!medicationToEdit && !nome && (
              <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Sugestões:</span>
                {commonMedsSuggestions.slice(0, 5).map((sug) => (
                  <button
                    type="button"
                    key={sug}
                    onClick={() => setNome(sug)}
                    className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] text-slate-700 dark:text-slate-300 hover:border-brand hover:text-brand transition"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dosagem & Forma Farmacêutica */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Dosagem / Apresentação</label>
              <input
                type="text"
                placeholder="Ex: 50mg, 1 comp, 10ml"
                value={dosagem}
                onChange={(e) => setDosagem(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Tipo de Apresentação</label>
              <select
                value={forma}
                onChange={(e) => setForma(e.target.value as MedicationForm)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="comprimido">Comprimido</option>
                <option value="capsula">Cápsula</option>
                <option value="gotas">Gotas</option>
                <option value="xarope">Xarope / Líquido</option>
                <option value="pomada">Pomada / Gel</option>
                <option value="inalador">Inalador / Spray</option>
                <option value="ampola">Injetável / Ampola</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          {/* Fabricante */}
          <div>
            <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Fabricante / Laboratório (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: EMS, Medley, Eurofarma, Genérico"
              value={fabricante}
              onChange={(e) => setFabricante(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Horários das Doses */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-brand" />
                Horários das Doses
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {horarios.length} {horarios.length === 1 ? 'horário' : 'horários'}
              </span>
            </div>

            {/* Presets Rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset(['08:00'])}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2 py-1.5 text-center text-[11px] text-slate-700 dark:text-slate-300 hover:border-brand hover:text-brand"
              >
                1x ao dia (08h)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(['08:00', '20:00'])}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2 py-1.5 text-center text-[11px] text-slate-700 dark:text-slate-300 hover:border-brand hover:text-brand"
              >
                2x ao dia (12h)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(['08:00', '14:00', '20:00'])}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2 py-1.5 text-center text-[11px] text-slate-700 dark:text-slate-300 hover:border-brand hover:text-brand"
              >
                3x ao dia (8h)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(['06:00', '12:00', '18:00', '24:00'])}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2 py-1.5 text-center text-[11px] text-slate-700 dark:text-slate-300 hover:border-brand hover:text-brand"
              >
                4x ao dia (6h)
              </button>
            </div>

            {/* Horários Selecionados */}
            <div className="flex flex-wrap gap-2 pt-1">
              {horarios.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-xl border border-brand bg-brand-light px-3 py-1 text-xs font-bold text-brand"
                >
                  <Clock className="h-3 w-3" />
                  <span>{h}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTime(i)}
                    className="ml-1 text-slate-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Adicionar horário específico */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="time"
                value={customTimeInput}
                onChange={(e) => setCustomTimeInput(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomTime}
                className="flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar Horário
              </button>
            </div>
          </div>

          {/* Estoque e Doses */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Estoque Atual</label>
              <input
                type="number"
                min="0"
                value={estoqueAtual}
                onChange={(e) => setEstoqueAtual(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Total da Caixa</label>
              <input
                type="number"
                min="1"
                value={estoqueTotal}
                onChange={(e) => setEstoqueTotal(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Alerta Mínimo</label>
              <input
                type="number"
                min="1"
                value={estoqueMinimoAlerta}
                onChange={(e) => setEstoqueMinimoAlerta(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Datas e Duração */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Data Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Duração em Dias</label>
              <input
                type="number"
                min="1"
                placeholder="Vazio = Contínuo"
                value={duracaoDias}
                onChange={(e) => setDuracaoDias(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Farmácia */}
          {pharmacies.length > 0 && (
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Farmácia de Preferência (Opcional)</label>
              <select
                value={farmaciaId}
                onChange={(e) => setFarmaciaId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="">Selecione uma farmácia...</option>
                {pharmacies.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome} {f.isDefault ? '(Padrão)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Instruções / Observações</label>
            <textarea
              rows={2}
              placeholder="Ex: Tomar em jejum com água."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Sincronização Google Agenda Checkbox */}
          <div className="rounded-xl border border-brand bg-brand-light p-3 flex items-start gap-3">
            <input
              type="checkbox"
              id="syncGCalCheck"
              checked={syncToCalendar}
              onChange={(e) => setSyncToCalendar(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand"
            />
            <label htmlFor="syncGCalCheck" className="cursor-pointer">
              <span className="font-bold text-brand flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Salvar eventos e alarmes no Google Agenda
              </span>
              <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                Cria os lembretes diários com notificações no celular pela sua Google Agenda.
              </p>
            </label>
          </div>

          {/* Footer Ações */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand hover:bg-brand-hover px-5 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95"
            >
              {medicationToEdit ? 'Atualizar Medicamento' : 'Salvar Medicamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
