import React, { useState } from 'react';
import {
  Pill,
  Clock,
  Package,
  Calendar,
  MessageCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { Medication, StockCalculation } from '../types';
import { calculateStock } from '../utils/storage';
import { generateGoogleCalendarDirectUrl } from '../utils/calendar';

interface MedicationCardProps {
  medication: Medication;
  onTakeDose: (med: Medication, horario?: string) => void;
  onRestock: (med: Medication) => void;
  onEdit: (med: Medication) => void;
  onDelete: (id: string) => void;
  onOrderWhatsApp: (med: Medication) => void;
  hasTakenToday?: boolean;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  onTakeDose,
  onRestock,
  onEdit,
  onDelete,
  onOrderWhatsApp,
  hasTakenToday = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const stock: StockCalculation = calculateStock(medication);

  // Status visual styles (WCAG AA compliant contrast)
  const statusStyles = {
    crit: {
      text: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-200 dark:border-rose-900/50',
      fill: 'bg-rose-500',
      badge: 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/60',
      label: `Crítico · ${stock.diasRestantes <= 0 ? 'Acabou' : `${stock.diasRestantes}d restantes`}`,
    },
    warn: {
      text: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-900/50',
      fill: 'bg-amber-500',
      badge: 'text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/60',
      label: `Atenção · ${stock.diasRestantes}d restantes`,
    },
    ok: {
      text: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-900/40',
      fill: 'bg-emerald-500',
      badge: 'text-emerald-800 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/60',
      label: `${stock.diasRestantes} dias de estoque`,
    },
  }[stock.status];

  const formaLabels: Record<string, string> = {
    comprimido: 'Comprimido',
    capsula: 'Cápsula',
    gotas: 'Gotas',
    xarope: 'Xarope',
    pomada: 'Pomada',
    inalador: 'Inalador',
    ampola: 'Ampola',
    outro: 'Dose',
  };

  return (
    <div
      className={`group relative rounded-2xl border bg-white dark:bg-slate-900 transition-all duration-200 hover:shadow-md ${
        stock.status === 'crit'
          ? 'border-rose-300 dark:border-rose-900/50 shadow-xs'
          : stock.status === 'warn'
          ? 'border-amber-300 dark:border-amber-900/50'
          : 'border-slate-200 dark:border-slate-800 shadow-xs'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Ícone da Forma Farmacêutica */}
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                stock.status === 'crit'
                  ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                  : stock.status === 'warn'
                  ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                  : 'border-brand bg-brand-light text-brand'
              }`}
            >
              <Pill className="h-5 w-5" />
            </div>

            {/* Informações Principais */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {medication.nome}
                </h3>
                {medication.dosagem && (
                  <span className="shrink-0 text-xs font-semibold text-brand">
                    {medication.dosagem}
                  </span>
                )}
              </div>

              {/* Metadados Limpos com separador · */}
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{formaLabels[medication.forma] || 'Dose'}</span>
                {medication.fabricante && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{medication.fabricante}</span>
                  </>
                )}
                {medication.horarios?.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {medication.horarios.join(', ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Menu de Ações */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
              aria-label="Opções do medicamento"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-44 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl text-slate-700 dark:text-slate-200">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(medication);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                    Editar Dados
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onRestock(medication);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    <Package className="h-3.5 w-3.5 text-slate-400" />
                    Repor Estoque
                  </button>
                  {medication.horarios?.[0] && (
                    <a
                      href={generateGoogleCalendarDirectUrl(medication, medication.horarios[0])}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Add Google Agenda
                      <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
                    </a>
                  )}
                  <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (confirm(`Remover "${medication.nome}" permanentemente?`)) {
                        onDelete(medication.id);
                      }
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir Remédio
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Barra de Estoque Visual */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Estoque: <strong className="text-slate-900 dark:text-white tabular-nums">{stock.restantes}</strong> de{' '}
              <span className="tabular-nums">{stock.total}</span> un.
            </span>
            <span className={`font-semibold ${statusStyles.text}`}>
              {statusStyles.label}
            </span>
          </div>

          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full transition-all duration-500 rounded-full ${statusStyles.fill}`}
              style={{ width: `${Math.max(3, stock.pct)}%` }}
            />
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="mt-4 flex items-center gap-2">
          {/* Tomar Dose Rápida */}
          <button
            onClick={() => onTakeDose(medication)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white py-2 px-3 text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Tomar Dose</span>
          </button>

          {/* Pedir WhatsApp */}
          <button
            onClick={() => onOrderWhatsApp(medication)}
            title="Pedir este medicamento via WhatsApp"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 px-3 text-xs font-semibold transition active:scale-[0.98]"
          >
            <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Pedir</span>
          </button>

          {/* Repor Estoque */}
          <button
            onClick={() => onRestock(medication)}
            title="Adicionar mais comprimidos / caixas"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 px-2.5 text-xs font-semibold transition active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Repor</span>
          </button>

          {/* Expandir Detalhes */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
            aria-label="Ver mais detalhes"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Painel Expandido de Detalhes */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4 rounded-b-2xl text-xs space-y-2">
          <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400">Início:</span>{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {medication.dataInicio ? new Date(medication.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR') : '–'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Previsão término:</span>{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">{stock.dataTerminoEstimada}</span>
            </div>
            <div>
              <span className="text-slate-400">Dose por vez:</span>{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{medication.dosePorVez || 1} un.</span>
            </div>
            <div>
              <span className="text-slate-400">Alerta mínimo:</span>{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{medication.estoqueMinimoAlerta || 5} un.</span>
            </div>
          </div>

          {medication.obs && (
            <div className="pt-1 text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-800/60">
              <span className="text-slate-400">Observações:</span>{' '}
              <span className="font-medium text-slate-800 dark:text-slate-200">{medication.obs}</span>
            </div>
          )}

          {medication.horarios?.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-slate-400">Horários configurados:</span>
              {medication.horarios.map((h, i) => (
                <a
                  key={i}
                  href={generateGoogleCalendarDirectUrl(medication, h)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Clique para adicionar este lembrete à sua Google Agenda"
                  className="inline-flex items-center gap-1 rounded-lg border border-brand bg-brand-light px-2 py-0.5 text-[11px] font-bold text-brand hover:opacity-90 transition"
                >
                  <Clock className="h-3 w-3" />
                  <span>{h}</span>
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
