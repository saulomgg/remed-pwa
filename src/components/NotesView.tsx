import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Copy,
  Check,
  Share2,
  Clock,
  Pill,
  X,
  Tag,
  Stethoscope,
  FileText,
  AlertCircle,
  Bell,
  MessageCircle,
} from 'lucide-react';
import { MedicalNote, Medication } from '../types';

interface NotesViewProps {
  notes: MedicalNote[];
  medications: Medication[];
  onSaveNote: (note: MedicalNote) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onShowToast: (msg: string) => void;
}

const CATEGORY_MAP: Record<
  MedicalNote['categoria'],
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  consulta: {
    label: 'Consulta Médica',
    icon: Stethoscope,
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  },
  receita: {
    label: 'Receita & Exame',
    icon: FileText,
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  },
  sintoma: {
    label: 'Sintomas & Reações',
    icon: AlertCircle,
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  },
  lembrete: {
    label: 'Lembrete Geral',
    icon: Bell,
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
  },
  outro: {
    label: 'Outras Notas',
    icon: Tag,
    color: 'text-slate-700 dark:text-slate-300',
    bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  },
};

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  medications,
  onSaveNote,
  onDeleteNote,
  onTogglePin,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingNote, setEditingNote] = useState<MedicalNote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for modal
  const [formTitulo, setFormTitulo] = useState('');
  const [formConteudo, setFormConteudo] = useState('');
  const [formCategoria, setFormCategoria] = useState<MedicalNote['categoria']>('consulta');
  const [formMedId, setFormMedId] = useState<string>('');
  const [formFixado, setFormFixado] = useState(false);

  const openNewNoteModal = () => {
    setEditingNote(null);
    setFormTitulo('');
    setFormConteudo('');
    setFormCategoria('consulta');
    setFormMedId('');
    setFormFixado(false);
    setIsModalOpen(true);
  };

  const openEditModal = (note: MedicalNote) => {
    setEditingNote(note);
    setFormTitulo(note.titulo);
    setFormConteudo(note.conteudo);
    setFormCategoria(note.categoria);
    setFormMedId(note.medicationIds && note.medicationIds[0] ? note.medicationIds[0] : '');
    setFormFixado(!!note.fixado);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim() || !formConteudo.trim()) {
      onShowToast('Por favor, preencha o título e o conteúdo da anotação.');
      return;
    }

    const noteToSave: MedicalNote = {
      id: editingNote ? editingNote.id : `note-${Date.now()}`,
      titulo: formTitulo.trim(),
      conteudo: formConteudo.trim(),
      categoria: formCategoria,
      medicationIds: formMedId ? [formMedId] : [],
      fixado: formFixado,
      criadoEm: editingNote ? editingNote.criadoEm : new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    onSaveNote(noteToSave);
    setIsModalOpen(false);
    onShowToast(editingNote ? 'Anotação atualizada!' : 'Nova anotação salva com sucesso!');
  };

  const handleCopyNote = (note: MedicalNote) => {
    const text = `📌 *${note.titulo}* (${CATEGORY_MAP[note.categoria].label})\n\n${note.conteudo}\n\n_Registrado no ReMed PWA_`;
    navigator.clipboard?.writeText(text);
    setCopiedId(note.id);
    onShowToast('Anotação copiada para a área de transferência!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareWhatsApp = (note: MedicalNote) => {
    const text = `📌 *${note.titulo}* (${CATEGORY_MAP[note.categoria].label})\n\n${note.conteudo}\n\n_Registrado no ReMed PWA (100% Privado)_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filtragem e ordenação (fixadas primeiro, depois data decrescente)
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        const matchesCategory = selectedCategory === 'all' || n.categoria === selectedCategory;
        const matchesSearch =
          !searchTerm ||
          n.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.conteudo.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (a.fixado && !b.fixado) return -1;
        if (!a.fixado && b.fixado) return 1;
        return new Date(b.atualizadoEm || b.criadoEm).getTime() - new Date(a.atualizadoEm || a.criadoEm).getTime();
      });
  }, [notes, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner do Caderno */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/40 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand ring-1 ring-brand/20">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Caderno de Anotações
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Guarde orientações médicas, receitas, dúvidas para a próxima consulta e sintomas de forma 100% privada.
              </p>
            </div>
          </div>

          <button
            onClick={openNewNoteModal}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand hover:bg-brand-hover px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Anotação</span>
          </button>
        </div>

        {/* Barra de Busca & Filtro de Categorias */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar anotações por palavras-chave..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-brand focus:outline-hidden transition"
            />
          </div>

          {/* Chips de Categorias */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === 'all'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todas ({notes.length})
            </button>
            {(Object.keys(CATEGORY_MAP) as MedicalNote['categoria'][]).map((catKey) => {
              const cat = CATEGORY_MAP[catKey];
              const Icon = cat.icon;
              const count = notes.filter((n) => n.categoria === catKey).length;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    selectedCategory === catKey
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lista de Notas */}
      {filteredNotes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-12 text-center bg-white/50 dark:bg-slate-900/40">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand mb-3">
            <BookOpen className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Nenhuma anotação encontrada
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'all'
              ? 'Tente remover os filtros ou buscar por outro termo.'
              : 'Seu caderno está vazio. Clique em "+ Nova Anotação" para guardar orientações médicas, dúvidas de consultas ou sintomas.'}
          </p>
          <button
            onClick={openNewNoteModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand hover:bg-brand-hover px-4 py-2 text-xs font-bold text-white transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Criar Primeira Anotação</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => {
            const cat = CATEGORY_MAP[note.categoria] || CATEGORY_MAP.outro;
            const CatIcon = cat.icon;
            const linkedMed = medications.find((m) => note.medicationIds?.includes(m.id));
            const formattedDate = new Date(note.atualizadoEm || note.criadoEm).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={note.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-xs transition hover:shadow-md ${
                  note.fixado
                    ? 'border-brand/40 ring-1 ring-brand/30 dark:border-brand/50'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Cabeçalho do Card */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${cat.bg} ${cat.color}`}
                      >
                        <CatIcon className="h-3 w-3" />
                        <span>{cat.label}</span>
                      </span>

                      {linkedMed && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          <Pill className="h-3 w-3 text-brand" />
                          <span>{linkedMed.nome} ({linkedMed.dosagem})</span>
                        </span>
                      )}
                    </div>

                    {/* Botão Fixar */}
                    <button
                      onClick={() => onTogglePin(note.id)}
                      title={note.fixado ? 'Desafixar nota' : 'Fixar nota no topo'}
                      className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                        note.fixado
                          ? 'border-brand bg-brand-light text-brand'
                          : 'border-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700'
                      }`}
                    >
                      <Pin className={`h-4 w-4 ${note.fixado ? 'rotate-45 fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Título da Anotação */}
                  <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {note.titulo}
                  </h3>

                  {/* Conteúdo com quebras de linha */}
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-6">
                    {note.conteudo}
                  </p>
                </div>

                {/* Rodapé do Card com Data e Ações */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="h-3 w-3" />
                    <span>{formattedDate}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Copiar */}
                    <button
                      onClick={() => handleCopyNote(note)}
                      title="Copiar anotação"
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                    >
                      {copiedId === note.id ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>

                    {/* Compartilhar WhatsApp */}
                    <button
                      onClick={() => handleShareWhatsApp(note)}
                      title="Compartilhar no WhatsApp"
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => openEditModal(note)}
                      title="Editar anotação"
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    {/* Excluir */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Deseja excluir a anotação "${note.titulo}"?`)) {
                          onDeleteNote(note.id);
                          onShowToast('Anotação excluída.');
                        }
                      }}
                      title="Excluir anotação"
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-900 dark:text-slate-100 my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingNote ? 'Editar Anotação' : 'Nova Anotação'}
                </h3>
                <p className="text-xs text-slate-500">
                  Caderno pessoal seguro e armazenado localmente
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Categoria */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Tipo de Anotação
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(CATEGORY_MAP) as MedicalNote['categoria'][]).map((catKey) => {
                    const cat = CATEGORY_MAP[catKey];
                    const Icon = cat.icon;
                    const isSelected = formCategoria === catKey;
                    return (
                      <button
                        type="button"
                        key={catKey}
                        onClick={() => setFormCategoria(catKey)}
                        className={`flex items-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition ${
                          isSelected
                            ? 'border-brand bg-brand-light text-brand ring-1 ring-brand'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Título da Anotação *
                </label>
                <input
                  type="text"
                  required
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ex: Consulta com Dr. Roberto, Sintomas após almoço, Exames de sangue..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-brand focus:outline-hidden"
                />
              </div>

              {/* Remédio Relacionado (Opcional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Associar a um Medicamento (Opcional)
                </label>
                <select
                  value={formMedId}
                  onChange={(e) => setFormMedId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:border-brand focus:outline-hidden"
                >
                  <option value="">Nenhum medicamento específico</option>
                  {medications.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome} ({m.dosagem})
                    </option>
                  ))}
                </select>
              </div>

              {/* Conteúdo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Conteúdo / Observações detalhadas *
                </label>
                <textarea
                  rows={6}
                  required
                  value={formConteudo}
                  onChange={(e) => setFormConteudo(e.target.value)}
                  placeholder="Escreva livremente o que foi conversado na consulta, dosagens especiais, efeitos colaterais, número da receita ou lembretes..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-brand focus:outline-hidden"
                />
              </div>

              {/* Checkbox Fixar */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-fixar"
                  checked={formFixado}
                  onChange={(e) => setFormFixado(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-slate-300 text-brand focus:ring-brand"
                />
                <label htmlFor="chk-fixar" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Fixar esta anotação com destaque no topo do caderno
                </label>
              </div>

              {/* Botões */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand hover:bg-brand-hover px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
                >
                  Salvar Anotação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
