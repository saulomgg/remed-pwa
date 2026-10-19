import React, { useState } from 'react';
import { X, Download, Smartphone, CheckCircle, Share, MoreVertical, Sparkles, AlertCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { isInstalled, isIOS, isAndroid, canPromptDirectly, install } = usePWAInstall();
  const [installStatus, setInstallStatus] = useState<'idle' | 'prompting' | 'success' | 'manual'>('idle');

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    setInstallStatus('prompting');
    const result = await install();
    if (result === 'installed') {
      setInstallStatus('success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } else if (result === 'manual') {
      setInstallStatus('manual');
    } else {
      setInstallStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-900 dark:text-slate-100 my-8">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Topo: Logo & Título */}
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand to-cyan-500 shadow-md p-1">
            <img
              src="/pwa-192x192.png"
              alt="Logo ReMed"
              className="h-full w-full object-contain rounded-xl"
              onError={(e) => {
                // fallback icon
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                Baixar Aplicativo ReMed
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instale na tela inicial do celular com 1 toque
            </p>
          </div>
        </div>

        {isInstalled ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
            <CheckCircle className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-2" />
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              Aplicativo já instalado!
            </p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
              Você já está usando o ReMed na sua tela inicial como um app nativo.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Benefícios rápidos */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center border border-slate-100 dark:border-slate-800">
              <div>
                <span className="block text-xs font-bold text-brand">100% Offline</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Abre sem internet</span>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-700">
                <span className="block text-xs font-bold text-brand">Tela Cheia</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Sem barra de URL</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-brand">100% Privado</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Dados no celular</span>
              </div>
            </div>

            {/* Opção 1: Instalação Automática Direta (quando o navegador suporta prompt) */}
            <div className="rounded-2xl border-2 border-brand/40 bg-brand-light/30 dark:bg-brand-light/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-brand" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand">
                  Opção 1: Instalação Automática
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                Ao clicar no botão, o navegador solicita sua autorização e adiciona o ícone oficial do ReMed direto na sua tela inicial:
              </p>

              <button
                onClick={handleDirectInstall}
                disabled={installStatus === 'prompting'}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-hover text-white py-3 px-4 text-sm font-bold shadow-md hover:shadow-lg transition active:scale-[0.98] disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>
                  {installStatus === 'prompting'
                    ? 'Aguardando autorização no navegador...'
                    : 'Baixar e Instalar no Celular'}
                </span>
              </button>

              {installStatus === 'prompting' && (
                <p className="mt-2 text-center text-[11px] text-brand font-medium animate-pulse">
                  Olhe a mensagem que apareceu no seu navegador e toque em "Instalar" ou "Adicionar"!
                </p>
              )}

              {installStatus === 'success' && (
                <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Instalação concluída com sucesso!</span>
                </div>
              )}
            </div>

            {/* Opção 2: Instalação Manual (Passo a Passo) */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Opção 2: Instalação Manual pelo Menu
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Caso o navegador não abra a autorização automática, siga o passo correspondente ao seu aparelho:
              </p>

              {/* Guia Safari / iPhone */}
              {isIOS ? (
                <div className="space-y-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 p-3 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                    <Share className="h-4 w-4 text-brand" />
                    <span>No Safari (iPhone / iPad):</span>
                  </div>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                    <li>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima no Safari).</li>
                    <li>Role as opções para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
                    <li>Confirme no canto superior direito em <strong>"Adicionar"</strong>. Pronto!</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Android Chrome */}
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
                      <MoreVertical className="h-4 w-4 text-brand" />
                      <span>No Chrome / Celular Android:</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Toque no menu <strong>⋮</strong> (três pontinhos no canto superior direito) e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                    </p>
                  </div>

                  {/* Computador / Edge / Chrome Desktop */}
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
                      <Download className="h-4 w-4 text-brand" />
                      <span>No Computador (PC / Mac):</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Clique no ícone de <strong>Instalar</strong> na barra de endereços do navegador (ao lado da estrela de favoritos) ou vá no menu do navegador e selecione "Instalar ReMed".
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
