import { Medication, Pharmacy, UserProfile } from '../types';

export interface OrderItem {
  medication: Medication;
  quantidadeCaixas: number;
}

export function cleanWhatsAppNumber(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  // Se não começa com 55 e tem 10 ou 11 dígitos, acrescenta 55 (Brasil)
  if (!digits.startsWith('55') && (digits.length === 10 || digits.length === 11)) {
    return `55${digits}`;
  }
  return digits;
}

export function formatWhatsAppMessage({
  profile,
  pharmacy,
  items,
  customNote,
  includeAddress = true,
}: {
  profile?: UserProfile;
  pharmacy?: Pharmacy;
  items: OrderItem[];
  customNote?: string;
  includeAddress?: boolean;
}): string {
  const patientName = profile?.nome?.trim();
  const greeting = 'Olá! 👋';
  const intro = patientName
    ? `${greeting} Meu nome é *${patientName}* e gostaria de solicitar um orçamento/pedido dos seguintes medicamentos:`
    : `${greeting} Gostaria de solicitar um orçamento/pedido dos seguintes medicamentos:`;

  const itemsList = items
    .filter((it) => it.quantidadeCaixas > 0)
    .map((it, idx) => {
      const m = it.medication;
      const brand = m.fabricante ? ` (${m.fabricante})` : '';
      const dose = m.dosagem ? ` ${m.dosagem}` : '';
      return `${idx + 1}. *${m.nome}*${dose}${brand}\n   └ Quantidade: *${it.quantidadeCaixas} ${
        it.quantidadeCaixas === 1 ? 'caixa' : 'caixas'
      }*`;
    })
    .join('\n\n');

  let text = `${intro}\n\n${itemsList || '(Nenhum item selecionado)'}`;

  if (customNote && customNote.trim()) {
    text += `\n\n📝 *Observação:* ${customNote.trim()}`;
  }

  if (includeAddress && profile?.endereco?.trim()) {
    text += `\n\n📍 *Endereço para Entrega:*\n${profile.endereco.trim()}`;
    if (profile.bairro?.trim()) text += ` - ${profile.bairro.trim()}`;
    if (profile.cidade?.trim()) text += ` - ${profile.cidade.trim()}`;
    if (profile.complemento?.trim()) text += ` (${profile.complemento.trim()})`;
  }

  text += `\n\nVocês têm disponível para pronta entrega ou envio? Poderiam me passar o valor? Obrigado!`;

  return text;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = cleanWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}
