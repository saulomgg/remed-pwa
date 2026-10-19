import React, { useState } from 'react';
import { Lightbulb, Trash2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface DemoModeBannerProps {
  onClearDemo: () => void;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({ onClearDemo }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    onClearDemo();
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400 dark:border-amber-500/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/70 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-amber-950/40 p-4 sm:p-5 text-amber-950 dark:text-amber-100 shadow-md shadow-amber-500/10 transition-all animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Lado Esquerdo: Ícone & Mensagem */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/90 text-amber-950 shadow-xs ring-2 ring-amber-300 dark:ring-amber-500/40">
            <Lightbulb className="h-6 w-6 stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-950 shadow-2xs">
                Exemplo Ativo
              </span>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-amber-950 dark:text-amber-100">
                Você está visualizando dados de demonstração
              </h2>
            </div>
            <p className="mt-1 text-xs text-amber-900/90 dark:text-amber-200/90 font-medium leading-relaxed">
              O aplicativo foi preenchido com remédios, anotações e fichas de exemplo para você testar todas as funções.
              Clique no botão ao lado para apagar os exemplos, sumir com esta tag e deixar o app <strong>100% zerado</strong> para cadastrar seus próprios medicamentos!
            </p>
          </div>
        </div>

        {/* Lado Direito: Ações */}
        <div className="flex items-center gap-2 shrink-0">
          {!isConfirming ? (
            <button
              onClick={() => setIsConfirming(true)}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 dark:bg-amber-500 dark:hover:bg-amber-400 text-amber-950 px-4 py-2.5 text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Limpar Exemplos & Zerar App</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleConfirm}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2.5 text-xs font-black shadow-md transition active:scale-95"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Sim, Apagar Tudo</span>
              </button>
              <button
                onClick={() => setIsConfirming(false)}
                className="rounded-2xl border border-amber-400/80 dark:border-amber-600 px-3 py-2.5 text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-200/50 dark:hover:bg-amber-900/40 transition"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
