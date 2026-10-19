export type MedicationForm = 
  | 'comprimido'
  | 'capsula'
  | 'gotas'
  | 'xarope'
  | 'pomada'
  | 'inalador'
  | 'ampola'
  | 'outro';

export interface Medication {
  id: string;
  nome: string;
  dosagem: string; // e.g. "50mg", "10ml", "1 comp"
  forma: MedicationForm;
  fabricante?: string;
  horarios: string[]; // e.g. ["08:00", "20:00"]
  dosePorVez: number; // e.g. 1
  estoqueAtual: number;
  estoqueTotal: number; // tamanho da caixa/total inicial
  estoqueMinimoAlerta: number; // threshold para aviso
  dataInicio: string; // YYYY-MM-DD
  duracaoDias?: number; // undefined = uso contínuo
  obs?: string;
  farmaciaId?: string;
  precoEstimado?: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
  tomadoEm: string; // ISO string
}

export interface Pharmacy {
  id: string;
  nome: string;
  whatsapp: string; // e.g. "5511999998888"
  endereco?: string;
  bairro?: string;
  cidade?: string;
  isDefault?: boolean;
  notas?: string;
}

export interface EmergencyContact {
  id: string;
  nome: string;
  parentesco?: string; // ex: "Filho", "Esposa", "Médico", "Irmão"
  telefone: string;
  whatsapp?: string;
  isPrincipal?: boolean;
}

export interface UserProfile {
  nome: string;
  telefone: string;
  endereco: string;
  bairro: string;
  cidade: string;
  complemento?: string;
  alergias?: string;
  contatoEmergencia?: string; // legado/compatibilidade
  tipoSanguineo?: string; // ex: "O+", "A+", "B+", "AB+", "O-", etc.
  dataNascimento?: string;
  condicoesSaude?: string; // ex: "Hipertensão, Diabetes Tipo 2"
  planoSaude?: string; // ex: "Unimed / Cartão SUS: 123456"
  observacoesMedicas?: string; // ex: "Portador de marcapasso, Doador"
  contatosEmergencia?: EmergencyContact[];
}

export interface GoogleCalendarConfig {
  enabled: boolean;
  scriptUrl: string; // Webhook do Google Apps Script
  autoSyncOnSave: boolean;
  lastSyncTimestamp?: string;
  status: 'idle' | 'testing' | 'connected' | 'error';
  lastError?: string;
}

export type AccentColor = 'blue' | 'teal' | 'indigo' | 'emerald' | 'amber' | 'rose';

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: AccentColor;
  soundEnabled: boolean;
  notificationEnabled: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  googleCalendar: GoogleCalendarConfig;
}

export interface StockCalculation {
  restantes: number;
  total: number;
  pct: number;
  status: 'ok' | 'warn' | 'crit';
  diasRestantes: number;
  dataTerminoEstimada: string;
}

export interface MedicalNote {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: 'consulta' | 'sintoma' | 'receita' | 'lembrete' | 'outro';
  medicationIds?: string[];
  criadoEm: string;
  atualizadoEm: string;
  fixado?: boolean;
}

export type ActiveTab = 'meds' | 'doses' | 'notes' | 'order' | 'pharmacies' | 'settings';
