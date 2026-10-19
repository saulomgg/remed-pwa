import React from 'react';

interface FooterWatermarkProps {
  onOpenAbout?: () => void;
}

export const FooterWatermark: React.FC<FooterWatermarkProps> = ({ onOpenAbout }) => {
  return (
    <footer className="mt-8 mb-20 md:mb-6 pt-4 pb-2 text-center text-xs text-slate-400 dark:text-slate-500">
      <div className="flex items-center justify-center gap-1.5 flex-wrap select-none opacity-80 hover:opacity-100 transition-opacity">
        <span>desenvolvido por -</span>
        <a
          href="https://saulomgg.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand underline decoration-slate-300 dark:decoration-slate-700 underline-offset-2 transition"
        >
          Saulomgg
        </a>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <a
          href="https://saulomgg.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 dark:text-slate-400 hover:text-brand dark:hover:text-brand transition"
        >
          saulomgg.github.io
        </a>
        {onOpenAbout && (
          <>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={onOpenAbout}
              className="text-slate-500 dark:text-slate-400 hover:text-brand dark:hover:text-brand transition font-medium"
            >
              Sobre o Projeto
            </button>
          </>
        )}
      </div>
    </footer>
  );
};
