import React, { useState } from 'react';
import { X, Package, Check } from 'lucide-react';
import { Medication } from '../types';

interface StockRestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: Medication | null;
  onConfirmRestock: (medId: string, quantidade: number) => void;
}

export const StockRestockModal: React.FC<StockRestockModalProps> = ({
  isOpen,
  onClose,
  medication,
  onConfirmRestock,
}) => {
  const [quantidade, setQuantidade] = useState<number>(30);

  if (!isOpen || !medication) return null;

  const boxSize = medication.estoqueTotal || 30;

  const handleQuickAdd = (qty: number) => {
    onConfirmRestock(medication.id, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light text-brand">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Repor Estoque</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{medication.nome}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3 text-center">
            <span className="text-slate-500 dark:text-slate-400">Estoque atual:</span>{' '}
            <strong className="text-base font-bold text-slate-900 dark:text-white tabular-nums">{medication.estoqueAtual}</strong>{' '}
            <span className="text-slate-500 dark:text-slate-400">unidades</span>
          </div>

          <div>
            <span className="block font-semibold text-slate-800 dark:text-slate-300 mb-2">Adicionar rápido:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickAdd(boxSize)}
                className="rounded-xl border border-brand bg-brand-light p-2.5 text-center text-brand hover:opacity-90 transition active:scale-95 font-bold"
              >
                +1 Caixa ({boxSize} un.)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(10)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95 font-semibold"
              >
                +10 unidades
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(20)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95 font-semibold"
              >
                +20 unidades
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(5)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95 font-semibold"
              >
                +5 unidades
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 dark:text-slate-300 mb-1">Ou quantidade personalizada:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <button
                type="button"
                onClick={() => handleQuickAdd(quantidade)}
                className="flex items-center gap-1.5 rounded-xl bg-brand hover:bg-brand-hover px-4 py-2 text-xs font-bold text-white transition active:scale-95"
              >
                <Check className="h-4 w-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
