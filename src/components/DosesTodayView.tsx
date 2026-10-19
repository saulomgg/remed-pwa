import React from 'react';
import {
  Clock,
  CheckCircle2,
  Circle,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Medication, DoseLog } from '../types';
import { calculateStock } from '../utils/storage';

interface DosesTodayViewProps {
  medications: Medication[];
  doseLogs: DoseLog[];
  onTakeDose: (med: Medication, horario: string) => void;
  onUndoDose: (med: Medication, horario: string) => void;
  onOpenNewMedModal: () => void;
}

interface DoseItem {
  medication: Medication;
  horario: string;
  isTaken: boolean;
  takenAt?: string;
  period: 'madrugada' | 'manha' | 'tarde' | 'noite';
}

export const DosesTodayView: React.FC<DosesTodayViewProps> = ({
  medications,
  doseLogs,
  onTakeDose,
  onUndoDose,
  onOpenNewMedModal,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const allDoses: DoseItem[] = [];

  medications.forEach((med) => {
    (med.horarios || []).forEach((horario) => {
      const log = doseLogs.find(
        (l) => l.medicationId === med.id && l.horario === horario && l.data === todayStr
      );
      const hour = parseInt(horario.split(':')[0], 10) || 0;
      let period: DoseItem['period'] = 'manha';
      if (hour < 6) period = 'madrugada';
      else if (hour < 12) period = 'manha';
      else if (hour < 18) period = 'tarde';
      else period = 'noite';

      allDoses.push({
        medication: med,
        horario,
        isTaken: !!log,
        takenAt: log?.tomadoEm,
        period,
      });
    });
  });

  allDoses.sort((a, b) => a.horario.localeCompare(b.horario));

  const totalDoses = allDoses.length;
  const takenCount = allDoses.filter((d) => d.isTaken).length;
  const pendingCount = totalDoses - takenCount;
  const progressPct = totalDoses > 0 ? Math.round((takenCount / totalDoses) * 100) : 0;

  const nextPendingDose = allDoses.find((d) => !d.isTaken && d.horario >= currentHHMM) ||
                          allDoses.find((d) => !d.isTaken);

  if (totalDoses === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-8 text-center shadow-xs">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand mb-3">
          <Clock className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Nenhum horário programado para hoje</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          Cadastre medicamentos com horários específicos para ver sua rotina diária aqui.
        </p>
        <button
          onClick={onOpenNewMedModal}
          className="mt-4 rounded-xl bg-brand hover:bg-brand-hover px-4 py-2 text-xs font-bold text-white transition active:scale-95"
        >
          + Adicionar Medicamento
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progresso do Dia */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Progresso Diário
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
            </div>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
              {pendingCount === 0 ? 'Parabéns! Todas as doses foram tomadas 🎉' : `${pendingCount} ${pendingCount === 1 ? 'dose pendente' : 'doses pendentes'}`}
            </h2>
            {nextPendingDose && (
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                Próxima dose:{' '}
                <strong className="text-brand font-bold">
                  {nextPendingDose.horario} — {nextPendingDose.medication.nome} ({nextPendingDose.medication.dosagem})
                </strong>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{progressPct}%</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {takenCount} de {totalDoses} doses
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Lista de Doses em Linha do Tempo */}
      <div className="space-y-3">
        {allDoses.map((item, idx) => {
          const med = item.medication;
          const stock = calculateStock(med);
          const isLate = !item.isTaken && item.horario < currentHHMM;

          return (
            <div
              key={`${med.id}-${item.horario}-${idx}`}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${
                item.isTaken
                  ? 'border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 opacity-75'
                  : isLate
                  ? 'border-amber-300 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Horário */}
                <div
                  className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 min-w-[58px] ${
                    item.isTaken
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      : isLate
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-700'
                      : 'bg-brand-light text-brand ring-1 ring-brand'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 mb-0.5" />
                  <span className="text-xs font-bold tabular-nums">{item.horario}</span>
                </div>

                {/* Info Medicamento */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm font-bold truncate ${
                        item.isTaken ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {med.nome}
                    </h4>
                    {med.dosagem && (
                      <span className="text-xs font-semibold text-brand shrink-0">
                        {med.dosagem}
                      </span>
                    )}
                  </div>

                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{med.dosePorVez || 1} un.</span>
                    {med.obs && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[180px] sm:max-w-xs">{med.obs}</span>
                      </>
                    )}
                    {stock.status === 'crit' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Estoque: {stock.restantes} un.
                        </span>
                      </>
                    )}
                  </div>

                  {item.isTaken && item.takenAt && (
                    <div className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Tomado às {new Date(item.takenAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="shrink-0 flex items-center gap-2">
                {item.isTaken ? (
                  <button
                    onClick={() => onUndoDose(med, item.horario)}
                    title="Desfazer e retornar para pendente"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">Tomado</span>
                    <RotateCcw className="h-3 w-3 text-slate-400 ml-1" />
                  </button>
                ) : (
                  <button
                    onClick={() => onTakeDose(med, item.horario)}
                    className="flex items-center gap-1.5 rounded-xl bg-brand hover:bg-brand-hover px-4 py-2 text-xs font-bold text-white shadow-xs transition-all active:scale-95"
                  >
                    <Circle className="h-3.5 w-3.5" />
                    <span>Tomar</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
