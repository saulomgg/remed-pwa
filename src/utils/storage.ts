import {
  Medication,
  DoseLog,
  Pharmacy,
  UserProfile,
  AppSettings,
  StockCalculation,
  MedicalNote,
} from '../types';

export const STORAGE_KEYS = {
  MEDS: 'remed_v2_meds',
  LOGS: 'remed_v2_logs',
  PHARMACIES: 'remed_v2_pharmacies',
  PROFILE: 'remed_v2_profile',
  SETTINGS: 'remed_v2_settings',
  NOTES: 'remed_v2_notes',
  IS_DEMO: 'remed_v2_is_demo',
  // Chaves legadas para migração automática:
  LEGACY_MEDS: 'remed_medicamentos',
  LEGACY_FARMS: 'remed_farmacias',
  LEGACY_PERFIL: 'remed_perfil',
  LEGACY_SETTINGS: 'remed_settings',
};

export const EMPTY_PROFILE: UserProfile = {
  nome: '',
  telefone: '',
  endereco: '',
  bairro: '',
  cidade: '',
  complemento: '',
  alergias: '',
  contatoEmergencia: '',
  tipoSanguineo: '',
  dataNascimento: '',
  condicoesSaude: '',
  planoSaude: '',
  observacoesMedicas: '',
  contatosEmergencia: [],
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  accentColor: 'blue',
  soundEnabled: true,
  notificationEnabled: true,
  fontSize: 'md',
  googleCalendar: {
    enabled: false,
    scriptUrl: '',
    autoSyncOnSave: false,
    status: 'idle',
  },
};

export const DEMO_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    nome: 'Losartana Potássica',
    dosagem: '50mg',
    forma: 'comprimido',
    fabricante: 'EMS',
    horarios: ['08:00', '20:00'],
    dosePorVez: 1,
    estoqueAtual: 6,
    estoqueTotal: 60,
    estoqueMinimoAlerta: 10,
    dataInicio: new Date().toISOString().slice(0, 10),
    obs: 'Tomar com água, preferencialmente nos mesmos horários.',
    farmaciaId: 'farm-1',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: 'med-2',
    nome: 'Metformina',
    dosagem: '850mg',
    forma: 'comprimido',
    fabricante: 'Medley',
    horarios: ['12:30'],
    dosePorVez: 1,
    estoqueAtual: 14,
    estoqueTotal: 30,
    estoqueMinimoAlerta: 8,
    dataInicio: new Date().toISOString().slice(0, 10),
    obs: 'Tomar durante ou logo após o almoço.',
    farmaciaId: 'farm-1',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: 'med-3',
    nome: 'Vitamina D3',
    dosagem: '7.000 UI',
    forma: 'capsula',
    fabricante: 'Eurofarma',
    horarios: ['09:00'],
    dosePorVez: 1,
    estoqueAtual: 28,
    estoqueTotal: 30,
    estoqueMinimoAlerta: 5,
    dataInicio: new Date().toISOString().slice(0, 10),
    obs: 'Uso contínuo conforme recomendação médica.',
    farmaciaId: 'farm-2',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: 'med-4',
    nome: 'Omeprazol',
    dosagem: '20mg',
    forma: 'capsula',
    fabricante: 'Neo Química',
    horarios: ['07:30'],
    dosePorVez: 1,
    estoqueAtual: 3,
    estoqueTotal: 28,
    estoqueMinimoAlerta: 6,
    dataInicio: new Date().toISOString().slice(0, 10),
    obs: 'Tomar pela manhã em jejum, 30 min antes do café.',
    farmaciaId: 'farm-2',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
];

export const DEMO_PHARMACIES: Pharmacy[] = [
  {
    id: 'farm-1',
    nome: 'Drogaria São Paulo (Centro)',
    whatsapp: '5511999887766',
    endereco: 'Av. Paulista, 1200',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    isDefault: true,
    notas: 'Entrega rápida em até 2h. Aceita Pix e cartão.',
  },
  {
    id: 'farm-2',
    nome: 'Farmácia Pague Menos',
    whatsapp: '5511988776655',
    endereco: 'Rua Augusta, 540',
    bairro: 'Consolação',
    cidade: 'São Paulo',
    isDefault: false,
    notas: 'Desconto de convênio na terça-feira.',
  },
];

export const DEMO_PROFILE: UserProfile = {
  nome: 'Saulo Meira',
  telefone: '11987654321',
  endereco: 'Rua das Palmeiras, 380',
  bairro: 'Jardins',
  cidade: 'São Paulo',
  complemento: 'Apto 42',
  alergias: 'Penicilina e Dipirona',
  tipoSanguineo: 'O+',
  dataNascimento: '1985-05-14',
  condicoesSaude: 'Hipertensão Arterial Sistêmica',
  planoSaude: 'SulAmérica Saúde / Cartão SUS: 898001234567890',
  observacoesMedicas: 'Uso contínuo de anti-hipertensivo pela manhã. Não suspender medicação sem orientação médica.',
  contatoEmergencia: 'Maria Meira (Esposa) - (11) 99123-4567',
  contatosEmergencia: [
    {
      id: 'em-1',
      nome: 'Maria Meira',
      parentesco: 'Esposa',
      telefone: '11991234567',
      whatsapp: '5511991234567',
      isPrincipal: true,
    },
    {
      id: 'em-2',
      nome: 'Dr. Carlos Mendes',
      parentesco: 'Médico Cardiologista',
      telefone: '11988887777',
      whatsapp: '5511988887777',
      isPrincipal: false,
    },
  ],
};

export const DEMO_NOTES: MedicalNote[] = [
  {
    id: 'note-1',
    titulo: 'Recomendações da Consulta - Cardiologista',
    conteudo: 'Aferir a pressão arterial pela manhã em repouso. Manter a Losartana às 08h e 20h. Fazer exame de sangue (hemograma, creatinina, potássio) antes do retorno em 3 meses.',
    categoria: 'consulta',
    medicationIds: ['med-1'],
    criadoEm: new Date(Date.now() - 86400000 * 3).toISOString(),
    atualizadoEm: new Date(Date.now() - 86400000 * 3).toISOString(),
    fixado: true,
  },
  {
    id: 'note-2',
    titulo: 'Receita Médica Válida até Dezembro',
    conteudo: 'Receita médica de uso contínuo carimbada pelo posto de saúde. Farmácia Popular retira Losartana gratuitamente apresentando CPF e cartão do SUS.',
    categoria: 'receita',
    medicationIds: ['med-1'],
    criadoEm: new Date(Date.now() - 86400000 * 7).toISOString(),
    atualizadoEm: new Date(Date.now() - 86400000 * 7).toISOString(),
    fixado: false,
  },
  {
    id: 'note-3',
    titulo: 'Anotações de Sintomas & Reações',
    conteudo: 'Observar se ocorrem tonturas ou dores de cabeça após a caminhada matinal. Se persistir, avisar o cardiologista.',
    categoria: 'sintoma',
    medicationIds: [],
    criadoEm: new Date(Date.now() - 86400000 * 1).toISOString(),
    atualizadoEm: new Date(Date.now() - 86400000 * 1).toISOString(),
    fixado: false,
  },
];

class StorageService {
  private get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, val: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('Erro ao salvar no LocalStorage:', e);
    }
  }

  // Migração transparente de dados legados do remed-pwa
  init(): void {
    if (typeof window === 'undefined') return;

    const isDemoStored = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
    if (isDemoStored === null) {
      // Primeira vez que o usuário abre o app: modo demonstração ativo
      localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'true');
    }

    // Se já tiver v2, não precisa migrar
    const existingMeds = localStorage.getItem(STORAGE_KEYS.MEDS);
    if (!existingMeds) {
      const legacyMedsStr = localStorage.getItem(STORAGE_KEYS.LEGACY_MEDS);
      if (legacyMedsStr) {
        try {
          const legacyMeds = JSON.parse(legacyMedsStr);
          if (Array.isArray(legacyMeds) && legacyMeds.length > 0) {
            const converted: Medication[] = legacyMeds.map((m: any, idx: number) => {
              const horarios = m.horario ? [m.horario] : ['08:00'];
              return {
                id: m.id ? String(m.id) : `med-${idx}-${Date.now()}`,
                nome: m.nome || 'Medicamento',
                dosagem: m.mg || '',
                forma: 'comprimido',
                fabricante: m.fabricante || '',
                horarios: horarios,
                dosePorVez: 1,
                estoqueAtual: m.total ? Math.max(0, m.total - (m.usados || 0)) : 10,
                estoqueTotal: m.total || 30,
                estoqueMinimoAlerta: Math.max(4, Math.round((m.total || 30) * 0.2)),
                dataInicio: m.inicio || new Date().toISOString().slice(0, 10),
                obs: m.obs || '',
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString(),
              };
            });
            this.set(STORAGE_KEYS.MEDS, converted);
            localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'false');
          }
        } catch {}
      } else {
        // Se estiver completamente vazio, inicializa com os dados demo para o usuário testar!
        this.loadDemoData();
      }
    }

    // Migração farmácias legadas
    const existingFarms = localStorage.getItem(STORAGE_KEYS.PHARMACIES);
    if (!existingFarms) {
      const legacyFarmsStr = localStorage.getItem(STORAGE_KEYS.LEGACY_FARMS);
      if (legacyFarmsStr) {
        try {
          const legacyFarms = JSON.parse(legacyFarmsStr);
          if (Array.isArray(legacyFarms) && legacyFarms.length > 0) {
            const converted: Pharmacy[] = legacyFarms.map((f: any, idx: number) => ({
              id: f.id ? String(f.id) : `farm-${idx}-${Date.now()}`,
              nome: f.nome || 'Farmácia',
              whatsapp: (f.whatsapp || '').replace(/\D/g, ''),
              endereco: f.endereco || '',
              isDefault: idx === 0,
            }));
            this.set(STORAGE_KEYS.PHARMACIES, converted);
          }
        } catch {}
      }
    }

    // Migração perfil
    const existingProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!existingProfile) {
      const legacyProfileStr = localStorage.getItem(STORAGE_KEYS.LEGACY_PERFIL);
      if (legacyProfileStr) {
        try {
          const p = JSON.parse(legacyProfileStr);
          this.set(STORAGE_KEYS.PROFILE, {
            nome: p.nome || '',
            telefone: p.telefone || '',
            endereco: p.endereco || '',
            bairro: p.bairro || '',
            cidade: p.cidade || '',
          });
        } catch {}
      }
    }
  }

  // --- MEDICAMENTOS ---
  getMedications(): Medication[] {
    return this.get<Medication[]>(STORAGE_KEYS.MEDS, []);
  }

  saveMedication(med: Medication): void {
    const list = this.getMedications();
    const idx = list.findIndex((m) => m.id === med.id);
    if (idx >= 0) {
      list[idx] = { ...med, atualizadoEm: new Date().toISOString() };
    } else {
      list.push({ ...med, criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() });
    }
    this.set(STORAGE_KEYS.MEDS, list);
  }

  deleteMedication(id: string): void {
    const list = this.getMedications().filter((m) => m.id !== id);
    this.set(STORAGE_KEYS.MEDS, list);
  }

  // Repor estoque
  restockMedication(id: string, quantidadeAdicionar: number): Medication | null {
    const list = this.getMedications();
    const med = list.find((m) => m.id === id);
    if (!med) return null;
    med.estoqueAtual += Math.max(1, quantidadeAdicionar);
    med.atualizadoEm = new Date().toISOString();
    this.set(STORAGE_KEYS.MEDS, list);
    return med;
  }

  // Reduzir estoque (ao tomar dose)
  consumeDose(id: string, quantidadeDose: number = 1): Medication | null {
    const list = this.getMedications();
    const med = list.find((m) => m.id === id);
    if (!med) return null;
    med.estoqueAtual = Math.max(0, med.estoqueAtual - quantidadeDose);
    med.atualizadoEm = new Date().toISOString();
    this.set(STORAGE_KEYS.MEDS, list);
    return med;
  }

  // Reverter dose (desmarcar)
  unconsumeDose(id: string, quantidadeDose: number = 1): Medication | null {
    const list = this.getMedications();
    const med = list.find((m) => m.id === id);
    if (!med) return null;
    med.estoqueAtual += quantidadeDose;
    med.atualizadoEm = new Date().toISOString();
    this.set(STORAGE_KEYS.MEDS, list);
    return med;
  }

  // --- REGISTROS DE DOSES (LOGS) ---
  getDoseLogs(): DoseLog[] {
    return this.get<DoseLog[]>(STORAGE_KEYS.LOGS, []);
  }

  getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isDoseTaken(medicationId: string, horario: string, dataStr: string = this.getTodayDateString()): boolean {
    const logs = this.getDoseLogs();
    return logs.some((l) => l.medicationId === medicationId && l.horario === horario && l.data === dataStr);
  }

  recordDoseTaken(medicationId: string, horario: string, dataStr: string = this.getTodayDateString()): void {
    const logs = this.getDoseLogs();
    const exists = logs.some((l) => l.medicationId === medicationId && l.horario === horario && l.data === dataStr);
    if (!exists) {
      logs.push({
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        medicationId,
        horario,
        data: dataStr,
        tomadoEm: new Date().toISOString(),
      });
      this.set(STORAGE_KEYS.LOGS, logs);
    }
  }

  undoDoseTaken(medicationId: string, horario: string, dataStr: string = this.getTodayDateString()): void {
    const logs = this.getDoseLogs().filter(
      (l) => !(l.medicationId === medicationId && l.horario === horario && l.data === dataStr)
    );
    this.set(STORAGE_KEYS.LOGS, logs);
  }

  // --- FARMÁCIAS ---
  getPharmacies(): Pharmacy[] {
    return this.get<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, []);
  }

  savePharmacy(farm: Pharmacy): void {
    const list = this.getPharmacies();
    const idx = list.findIndex((f) => f.id === farm.id);
    if (farm.isDefault) {
      list.forEach((f) => (f.isDefault = false));
    }
    if (idx >= 0) {
      list[idx] = farm;
    } else {
      if (list.length === 0) farm.isDefault = true;
      list.push(farm);
    }
    this.set(STORAGE_KEYS.PHARMACIES, list);
  }

  deletePharmacy(id: string): void {
    const list = this.getPharmacies().filter((f) => f.id !== id);
    if (list.length > 0 && !list.some((f) => f.isDefault)) {
      list[0].isDefault = true;
    }
    this.set(STORAGE_KEYS.PHARMACIES, list);
  }

  setDefaultPharmacy(id: string): void {
    const list = this.getPharmacies().map((f) => ({
      ...f,
      isDefault: f.id === id,
    }));
    this.set(STORAGE_KEYS.PHARMACIES, list);
  }

  // --- PERFIL & EMERGÊNCIA ---
  getProfile(): UserProfile {
    const saved = this.get<Partial<UserProfile>>(STORAGE_KEYS.PROFILE, EMPTY_PROFILE);
    return {
      nome: saved.nome ?? '',
      telefone: saved.telefone ?? '',
      endereco: saved.endereco ?? '',
      bairro: saved.bairro ?? '',
      cidade: saved.cidade ?? '',
      complemento: saved.complemento ?? '',
      alergias: saved.alergias ?? '',
      tipoSanguineo: saved.tipoSanguineo ?? '',
      dataNascimento: saved.dataNascimento ?? '',
      condicoesSaude: saved.condicoesSaude ?? '',
      planoSaude: saved.planoSaude ?? '',
      observacoesMedicas: saved.observacoesMedicas ?? '',
      contatoEmergencia: saved.contatoEmergencia ?? '',
      contatosEmergencia: saved.contatosEmergencia ?? [],
    };
  }

  saveProfile(profile: UserProfile): void {
    this.set(STORAGE_KEYS.PROFILE, profile);
  }

  // --- ANOTAÇÕES & CADERNO MÉDICO ---
  getNotes(): MedicalNote[] {
    return this.get<MedicalNote[]>(STORAGE_KEYS.NOTES, []);
  }

  saveNote(note: MedicalNote): void {
    const list = this.getNotes();
    const idx = list.findIndex(n => n.id === note.id);
    const now = new Date().toISOString();
    if (idx >= 0) {
      list[idx] = { ...note, atualizadoEm: now };
    } else {
      list.unshift({ ...note, criadoEm: now, atualizadoEm: now });
    }
    this.set(STORAGE_KEYS.NOTES, list);
  }

  deleteNote(id: string): void {
    const list = this.getNotes().filter(n => n.id !== id);
    this.set(STORAGE_KEYS.NOTES, list);
  }

  togglePinNote(id: string): void {
    const list = this.getNotes().map(n => n.id === id ? { ...n, fixado: !n.fixado } : n);
    this.set(STORAGE_KEYS.NOTES, list);
  }

  // --- CONFIGURAÇÕES ---
  getSettings(): AppSettings {
    const saved = this.get<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS, {});
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      googleCalendar: {
        ...DEFAULT_SETTINGS.googleCalendar,
        ...(saved.googleCalendar || {}),
      },
    };
  }

  saveSettings(settings: AppSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  }

  // --- DEMO DATA & RESET ---
  isDemoMode(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.IS_DEMO) === 'true';
  }

  setDemoMode(val: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, val ? 'true' : 'false');
  }

  loadDemoData(): void {
    this.set(STORAGE_KEYS.MEDS, DEMO_MEDICATIONS);
    this.set(STORAGE_KEYS.PHARMACIES, DEMO_PHARMACIES);
    this.set(STORAGE_KEYS.PROFILE, DEMO_PROFILE);
    this.set(STORAGE_KEYS.NOTES, DEMO_NOTES);
    this.set(STORAGE_KEYS.LOGS, []);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'true');
      localStorage.setItem('remed_v2_notes_init', '1');
    }
  }

  clearDemoData(): void {
    this.set(STORAGE_KEYS.MEDS, []);
    this.set(STORAGE_KEYS.PHARMACIES, []);
    this.set(STORAGE_KEYS.PROFILE, EMPTY_PROFILE);
    this.set(STORAGE_KEYS.NOTES, []);
    this.set(STORAGE_KEYS.LOGS, []);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'false');
      localStorage.setItem('remed_v2_notes_init', '1');
    }
  }

  clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.MEDS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.PHARMACIES);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.IS_DEMO);
    localStorage.removeItem('remed_v2_notes_init');
  }

  exportBackup(): string {
    return JSON.stringify(
      {
        version: '2026.1',
        exportDate: new Date().toISOString(),
        medications: this.getMedications(),
        doseLogs: this.getDoseLogs(),
        pharmacies: this.getPharmacies(),
        profile: this.getProfile(),
        notes: this.getNotes(),
        settings: this.getSettings(),
      },
      null,
      2
    );
  }

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.medications && Array.isArray(data.medications)) {
        this.set(STORAGE_KEYS.MEDS, data.medications);
      }
      if (data.doseLogs && Array.isArray(data.doseLogs)) {
        this.set(STORAGE_KEYS.LOGS, data.doseLogs);
      }
      if (data.pharmacies && Array.isArray(data.pharmacies)) {
        this.set(STORAGE_KEYS.PHARMACIES, data.pharmacies);
      }
      if (data.notes && Array.isArray(data.notes)) {
        this.set(STORAGE_KEYS.NOTES, data.notes);
      }
      if (data.profile) {
        this.set(STORAGE_KEYS.PROFILE, data.profile);
      }
      if (data.settings) {
        this.set(STORAGE_KEYS.SETTINGS, data.settings);
      }
      return true;
    } catch (e) {
      console.error('Falha ao importar backup:', e);
      return false;
    }
  }
}

export const storage = new StorageService();

/**
 * Cálculo inteligente de estoque e previsão
 */
export function calculateStock(med: Medication): StockCalculation {
  const restantes = Math.max(0, med.estoqueAtual);
  const total = Math.max(1, med.estoqueTotal || restantes);
  const pct = Math.min(100, Math.max(0, (restantes / total) * 100));

  const dosesPorDia = (med.horarios?.length || 1) * (med.dosePorVez || 1);
  const diasRestantes = dosesPorDia > 0 ? Math.floor(restantes / dosesPorDia) : 999;

  let status: 'ok' | 'warn' | 'crit' = 'ok';
  if (restantes <= (med.estoqueMinimoAlerta || 5) || pct <= 18 || diasRestantes <= 3) {
    status = 'crit';
  } else if (pct <= 35 || diasRestantes <= 7) {
    status = 'warn';
  }

  const d = new Date();
  d.setDate(d.getDate() + diasRestantes);
  const dataTerminoEstimada = d.toLocaleDateString('pt-BR');

  return {
    restantes,
    total,
    pct,
    status,
    diasRestantes,
    dataTerminoEstimada,
  };
}
