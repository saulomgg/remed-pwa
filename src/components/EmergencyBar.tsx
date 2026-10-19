import React, { useState } from 'react';
import {
  Siren,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageCircle,
  AlertTriangle,
  Heart,
  Droplet,
  ExternalLink,
  Shield,
  Hospital,
  Flame,
  UserPlus,
} from 'lucide-react';
import { UserProfile, Medication } from '../types';

interface EmergencyBarProps {
  profile: UserProfile;
  medications: Medication[];
  onOpenModal: () => void;
  onOpenSettingsProfile?: () => void;
}

export const EmergencyBar: React.FC<EmergencyBarProps> = ({
  profile,
  medications,
  onOpenModal,
  onOpenSettingsProfile,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const contacts = profile.contatosEmergencia || [];
  const primaryContact = contacts.find((c) => c.isPrincipal) || contacts[0];

  const handleSendSosWhatsapp = (contactPhone: string, contactName: string) => {
    const cleanPhone = contactPhone.replace(/\D/g, '');
    const phoneWithDDI = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    const userName = profile.nome || 'o usuário';
    const address = profile.endereco
      ? `${profile.endereco}${profile.complemento ? `, ${profile.complemento}` : ''} - ${profile.bairro || ''}, ${profile.cidade || ''}`
      : 'Endereço não informado';
    const allergies = profile.alergias || 'Nenhuma informada';
    const blood = profile.tipoSanguineo || 'Não informado';

    const text = encodeURIComponent(
      `🚨 *ALERTA SOS MÉDICO - RE-MED*\n\n` +
      `Olá ${contactName}, esta é uma mensagem de emergência enviada através do app ReMed por *${userName}*.\n\n` +
      `⚠️ *Estou precisando de ajuda urgente / socorro médico!*\n` +
      `📍 *Localização/Endereço:* ${address}\n` +
      `🩸 *Tipo Sanguíneo:* ${blood}\n` +
      `⚠️ *Alergias:* ${allergies}\n\n` +
      `Por favor, entre em contato imediatamente ou acione o SAMU 192 se necessário!`
    );

    window.open(`https://wa.me/${phoneWithDDI}?text=${text}`, '_blank');
  };

  return (
    <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900/90 shadow-xs transition-all overflow-hidden">
      {/* Barra Principal (Discreta por padrão) */}
      <div className="p-3 sm:py-2.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Esquerda: Identificador discreto & Resumo de Sangue/Alergias */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/80">
            <Siren className="h-4 w-4" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Modo Emergência & SOS
            </span>

            {profile.tipoSanguineo && (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                <Droplet className="h-3 w-3 fill-rose-500 text-rose-500" />
                <span>{profile.tipoSanguineo}</span>
              </span>
            )}

            {profile.alergias && (
              <span className="hidden md:inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-300 max-w-[200px] truncate">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                <span className="truncate">Alergia: {profile.alergias}</span>
              </span>
            )}
          </div>
        </div>

        {/* Direita: Ações Rápidas Discretas */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:192"
            title="Ligar para o SAMU (192)"
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/80 px-2.5 py-1.5 text-xs font-black hover:bg-rose-100 dark:hover:bg-rose-900/60 transition active:scale-95"
          >
            <Phone className="h-3 w-3" />
            <span>192 SAMU</span>
          </a>

          <button
            onClick={onOpenModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <span>Ficha SOS</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isExpanded ? 'Recolher detalhes de emergência' : 'Expandir opções rápidas de socorro'}
          >
            <span>{isExpanded ? 'Recolher' : 'Opções'}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Painel Expansível com Números e Contatos */}
      {isExpanded && (
        <div className="border-t border-rose-100 dark:border-rose-950/60 bg-rose-50/30 dark:bg-slate-950/50 p-4 sm:p-5 space-y-4 animate-fade-in">
          {/* Grade 1: Números Oficiais de Socorro */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-2">
              Discagem Imediata (Serviços Públicos 24h)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href="tel:192"
                className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white p-2.5 text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Hospital className="h-4 w-4 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-rose-100">Ambulância</div>
                  <div className="font-black text-sm leading-tight">192 SAMU</div>
                </div>
              </a>

              <a
                href="tel:193"
                className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white p-2.5 text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Flame className="h-4 w-4 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-amber-100">Resgate</div>
                  <div className="font-black text-sm leading-tight">193 Bombeiros</div>
                </div>
              </a>

              <a
                href="tel:190"
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white p-2.5 text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Shield className="h-4 w-4 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-blue-100">Polícia</div>
                  <div className="font-black text-sm leading-tight">190 PM</div>
                </div>
              </a>

              <a
                href="tel:08007226001"
                className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white p-2.5 text-xs font-bold shadow-xs transition active:scale-95"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-purple-100">Intoxicação</div>
                  <div className="font-black text-xs leading-tight">0800 ANVISA</div>
                </div>
              </a>
            </div>
          </div>

          {/* Grade 2: Contatos Pessoais de Emergência */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Seus Contatos de Emergência
              </h3>
              {onOpenSettingsProfile && (
                <button
                  onClick={onOpenSettingsProfile}
                  className="text-[11px] text-slate-500 hover:text-brand dark:hover:text-brand-light font-bold flex items-center gap-1"
                >
                  <UserPlus className="h-3 w-3" />
                  <span>Gerenciar Contatos</span>
                </button>
              )}
            </div>

            {contacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                          {contact.nome}
                        </span>
                        {contact.isPrincipal && (
                          <span className="rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1.5 py-0.2 text-[9px] font-black uppercase">
                            Principal
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {contact.parentesco || 'Contato'} • {contact.telefone}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${contact.telefone.replace(/\D/g, '')}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition active:scale-95"
                        title={`Ligar para ${contact.nome}`}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() =>
                          handleSendSosWhatsapp(contact.whatsapp || contact.telefone, contact.nome)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xs transition active:scale-95"
                        title={`Enviar mensagem de socorro no WhatsApp para ${contact.nome}`}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-rose-200 dark:border-rose-900/60 p-3 text-center bg-white/50 dark:bg-slate-900/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nenhum contato pessoal de emergência cadastrado ainda.
                </p>
                {onOpenSettingsProfile && (
                  <button
                    onClick={onOpenSettingsProfile}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    <UserPlus className="h-3 w-3" />
                    <span>Adicionar contatos de familiares e médicos no perfil</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Rodapé do Painel: Abrir Ficha Completa */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-rose-100 dark:border-rose-900/40">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              💡 Para socorristas e paramédicos: abra a ficha em tela cheia com alto contraste.
            </span>
            <button
              onClick={onOpenModal}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 text-xs font-black hover:opacity-90 transition active:scale-95"
            >
              <span>Abrir Ficha de Alto Contraste Completa</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
