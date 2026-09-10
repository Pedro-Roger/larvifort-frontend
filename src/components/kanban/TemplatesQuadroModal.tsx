"use client";

import { useState, useEffect, useCallback } from "react";
import { X, CircleNotch, WarningCircle, Plus, Trash, DotsThree, FileText, CheckCircle } from "@phosphor-icons/react";
import {
  fetchBoardTemplates,
  createBoardTemplate,
  updateBoardTemplate,
  deleteBoardTemplate,
  reorderBoardTemplates,
  applyBoardTemplate,
  type BoardTemplate,
  type BoardTemplateInput,
  type TemplateField,
  type StatusTarefa,
  type Prioridade,
} from "@/services/tasks";

interface TemplatesQuadroModalProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
  onSuccess?: (task: { id: string; titulo: string }) => void;
}

const STATUS_OPTIONS: { value: StatusTarefa; label: string }[] = [
  { value: "BACKLOG", label: "Backlog" },
  { value: "EM_ANDAMENTO", label: "Em Andamento" },
  { value: "EM_REVISAO", label: "Em Revisão" },
  { value: "CONCLUIDO", label: "Concluído" },
];

const PRIORIDADE_OPTIONS: { value: Prioridade; label: string }[] = [
  { value: "ALTA", label: "Alta" },
  { value: "MEDIA", label: "Média" },
  { value: "BAIXA", label: "Baixa" },
];

const FIELD_TYPES: { value: TemplateField["type"]; label: string }[] = [
  { value: "text", label: "Texto" },
  { value: "textarea", label: "Texto Longo" },
  { value: "select", label: "Seleção" },
  { value: "number", label: "Número" },
  { value: "date", label: "Data" },
];

function TemplateItem({
  template,
  index,
  draggedId,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onToggleEnabled,
  onDelete,
  onEdit,
  onApply,
}: {
  template: BoardTemplate;
  index: number;
  draggedId: string | null;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  onDragEnd: () => void;
  onToggleEnabled: (t: BoardTemplate) => void;
  onDelete: (id: string) => void;
  onEdit: (t: BoardTemplate) => void;
  onApply: (t: BoardTemplate) => void;
}) {
  const isDragging = draggedId === template.id;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, template.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, template.id)}
      onDragEnd={onDragEnd}
      className={`relative p-4 rounded-xl border transition-all ${
        isDragging
          ? "bg-emerald-50/60 border-2 border-dashed border-emerald-400 opacity-75"
          : "bg-white border-slate-200 hover:border-emerald-200"
      }`}
    >
      {/* Drag handle */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
        <button type="button" className="w-7 h-7 rounded-md hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-grab active:cursor-grabbing" aria-label="Reordenar template">
          <DotsThree size={16} />
        </button>
      </div>

      <div className="ml-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500 text-white">
                <FileText size={14} />
              </div>
              <h4 className="font-semibold text-sm text-slate-800">{template.name}</h4>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${template.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {template.enabled ? "Ativo" : "Inativo"}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{template.status}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{template.priority}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{template.description || "Sem descrição"}</p>
            {template.fields.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">{template.fields.length} campos</span>
                {template.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => onApply(template)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" aria-label="Aplicar template" title="Aplicar template">
              <CheckCircle size={14} />
            </button>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={template.enabled} onChange={() => onToggleEnabled(template)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              <span className="text-xs text-slate-500">Ativo</span>
            </label>
            <button type="button" onClick={() => onEdit(template)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" aria-label="Editar template">
              <FileText size={14} />
            </button>
            <button type="button" onClick={() => onDelete(template.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" aria-label="Excluir template">
              <Trash size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditForm({
  template,
  editName,
  setEditName,
  editDescription,
  setEditDescription,
  editEnabled,
  setEditEnabled,
  editStatus,
  setEditStatus,
  editPriority,
  setEditPriority,
  editTags,
  setEditTags,
  editFields,
  setEditFields,
  handleEdit,
  onCancel,
  loading,
}: {
  template: BoardTemplate;
  editName: string;
  setEditName: (v: string) => void;
  editDescription: string;
  setEditDescription: (v: string) => void;
  editEnabled: boolean;
  setEditEnabled: (v: boolean) => void;
  editStatus: StatusTarefa;
  setEditStatus: (v: StatusTarefa) => void;
  editPriority: Prioridade;
  setEditPriority: (v: Prioridade) => void;
  editTags: string[];
  setEditTags: (v: string[]) => void;
  editFields: TemplateField[];
  setEditFields: (v: TemplateField[]) => void;
  handleEdit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <form onSubmit={handleEdit} className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500 text-white">
          <FileText size={14} />
        </div>
        <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" autoFocus />
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={editEnabled} onChange={(e) => setEditEnabled(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          <span className="text-xs text-slate-600">Ativo</span>
        </label>
      </div>
      <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" rows={2} placeholder="Descrição opcional" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
          <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as StatusTarefa)} className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Prioridade</label>
          <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as Prioridade)} className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
            {PRIORIDADE_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (separadas por vírgula)</label>
          <input value={editTags.join(", ")} onChange={(e) => setEditTags(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="tag1, tag2" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Campos do Template</label>
        <div className="space-y-2">
          {editFields.map((field, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-4">{i + 1}.</span>
              <input
                value={field.label}
                onChange={(e) => { const newFields = [...editFields]; newFields[i] = { ...newFields[i], label: e.target.value }; setEditFields(newFields); }}
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Nome do campo"
              />
              <select value={field.type} onChange={(e) => { const newFields = [...editFields]; newFields[i] = { ...newFields[i], type: e.target.value as TemplateField["type"] }; setEditFields(newFields); }} className="px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
                {FIELD_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
              <button type="button" onClick={() => setEditFields(editFields.filter((_, j) => j !== i))} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer" aria-label="Remover campo">
                <Trash size={12} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setEditFields([...editFields, { key: "", label: "", value: "", type: "text", required: false }])} className="mt-1.5 px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer">+ Adicionar Campo</button>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">Cancelar</button>
        <button type="submit" disabled={loading} className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">{loading ? <> <CircleNotch size={12} className="animate-spin" /> Salvando... </> : "Salvar"}</button>
      </div>
    </form>
  );
}

export default function TemplatesQuadroModal({ open, onClose, boardId, onSuccess }: TemplatesQuadroModalProps) {
  const [templates, setTemplates] = useState<BoardTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BoardTemplate | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStatus, setNewStatus] = useState<StatusTarefa>("BACKLOG");
  const [newPriority, setNewPriority] = useState<Prioridade>("MEDIA");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newFields, setNewFields] = useState<TemplateField[]>([]);
  const [newEnabled, setNewEnabled] = useState(true);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEnabled, setEditEnabled] = useState(true);
  const [editStatus, setEditStatus] = useState<StatusTarefa>("BACKLOG");
  const [editPriority, setEditPriority] = useState<Prioridade>("MEDIA");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editFields, setEditFields] = useState<TemplateField[]>([]);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBoardTemplates(boardId);
      setTemplates(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar templates");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  const resetForms = useCallback(() => {
    setNewName("");
    setNewDescription("");
    setNewStatus("BACKLOG");
    setNewPriority("MEDIA");
    setNewTags([]);
    setNewFields([]);
    setNewEnabled(true);
    setEditName("");
    setEditDescription("");
    setEditEnabled(true);
    setEditStatus("BACKLOG");
    setEditPriority("MEDIA");
    setEditTags([]);
    setEditFields([]);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        await loadTemplates();
        if (!cancelled) {
          setShowCreateForm(false);
          setEditingTemplate(null);
          resetForms();
        }
      } catch {
        // Error handled in loadTemplates
      }
    })();
    return () => { cancelled = true; };
  }, [open, boardId, loadTemplates, resetForms]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) { setError("Nome do template é obrigatório"); return; }
    setLoading(true);
    setError(null);
    try {
      const input: BoardTemplateInput = {
        name: newName.trim(),
        description: newDescription.trim(),
        enabled: newEnabled,
        status: newStatus,
        priority: newPriority,
        tags: newTags,
        fields: newFields.map((f, i) => ({ ...f, key: f.key || `field_${i}` })),
        boardId,
      };
      await createBoardTemplate(boardId, input);
      await loadTemplates();
      setShowCreateForm(false);
      resetForms();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar template");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    if (!editName.trim()) { setError("Nome do template é obrigatório"); return; }
    setLoading(true);
    setError(null);
    try {
      await updateBoardTemplate(editingTemplate.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        enabled: editEnabled,
        status: editStatus,
        priority: editPriority,
        tags: editTags,
        fields: editFields.map((f, i) => ({ ...f, key: f.key || `field_${i}` })),
      });
      await loadTemplates();
      setEditingTemplate(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar template");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este template?")) return;
    setLoading(true);
    try {
      await deleteBoardTemplate(id);
      await loadTemplates();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir template");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (template: BoardTemplate) => {
    try {
      await updateBoardTemplate(template.id, { enabled: !template.enabled });
      await loadTemplates();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao alterar status");
    }
  };

  const handleApply = async (template: BoardTemplate) => {
    try {
      const result = await applyBoardTemplate(template.id);
      onSuccess?.({ id: result.id, titulo: result.titulo });
      onClose();
    } catch (err: unknown) {
      alert("Erro ao aplicar template: " + (err instanceof Error ? err.message : "Erro desconhecido"));
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const fromId = e.dataTransfer.getData("text/plain");
    if (fromId === targetId || !fromId) return;

    const fromIndex = templates.findIndex((t) => t.id === fromId);
    const toIndex = templates.findIndex((t) => t.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    // Optimistic update
    const newTemplates = [...templates];
    const [moved] = newTemplates.splice(fromIndex, 1);
    newTemplates.splice(toIndex, 0, moved);
    setTemplates(newTemplates);

    // Persist
    const templateOrders = newTemplates.map((t, i) => ({ id: t.id, order: i }));
    try {
      await reorderBoardTemplates(boardId, templateOrders);
    } catch {
      loadTemplates(); // Revert on error
    }

    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const startEdit = (template: BoardTemplate) => {
    setEditingTemplate(template);
    setEditName(template.name);
    setEditDescription(template.description);
    setEditEnabled(template.enabled);
    setEditStatus(template.status);
    setEditPriority(template.priority);
    setEditTags([...template.tags]);
    setEditFields(template.fields.map((f) => ({ ...f })));
  };

  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    setShowCreateForm(false);
    setEditingTemplate(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={handleClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden z-10">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-emerald-600" />
            <h2 className="text-base font-bold text-slate-800">Templates Opt-in do Quadro</h2>
          </div>
          <button type="button" onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer" disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600">
              <WarningCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Templates List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">Templates Configurados ({templates.length})</h3>
              <button type="button" onClick={() => setShowCreateForm(true)} className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer">
                <Plus size={14} /> Novo Template
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : templates.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">Nenhum template configurado</p>
                <p className="text-xs text-slate-400 mt-1">Clique em &ldquo;Novo Template&rdquo; para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template, index) => (
                  editingTemplate?.id === template.id ? (
                    <EditForm
                      key={template.id}
                      template={template}
                      editName={editName}
                      setEditName={setEditName}
                      editDescription={editDescription}
                      setEditDescription={setEditDescription}
                      editEnabled={editEnabled}
                      setEditEnabled={setEditEnabled}
                      editStatus={editStatus}
                      setEditStatus={setEditStatus}
                      editPriority={editPriority}
                      setEditPriority={setEditPriority}
                      editTags={editTags}
                      setEditTags={setEditTags}
                      editFields={editFields}
                      setEditFields={setEditFields}
                      handleEdit={handleEdit}
                      onCancel={() => setEditingTemplate(null)}
                      loading={loading}
                    />
                  ) : (
                    <TemplateItem
                      key={template.id}
                      template={template}
                      index={index}
                      draggedId={draggedId}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      onToggleEnabled={handleToggleEnabled}
                      onDelete={handleDelete}
                      onEdit={startEdit}
                      onApply={handleApply}
                    />
                  )
                ))}
              </div>
            )}
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 animate-in fade-in slide-in-from-top-2 duration-150">
              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Plus size={14} className="text-emerald-600" />
                Criar Novo Template
              </h4>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Template <span className="text-red-500">*</span></label>
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Ex: Tarefa de Suporte" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status Padrão</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as StatusTarefa)} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Prioridade Padrão</label>
                    <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as Prioridade)} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
                      {PRIORIDADE_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (separadas por vírgula)</label>
                    <input value={newTags.join(", ")} onChange={(e) => setNewTags(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="suporte, urgente" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
                  <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" rows={2} placeholder="Descreva este template..." />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Campos do Template</label>
                  <div className="space-y-2">
                    {newFields.map((field, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-4">{i + 1}.</span>
                        <input
                          value={field.label}
                          onChange={(e) => { const newF = [...newFields]; newF[i] = { ...newF[i], label: e.target.value }; setNewFields(newF); }}
                          className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="Nome do campo"
                        />
                        <select value={field.type} onChange={(e) => { const newF = [...newFields]; newF[i] = { ...newF[i], type: e.target.value as TemplateField["type"] }; setNewFields(newF); }} className="px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
                          {FIELD_TYPES.map((ft) => (
                            <option key={ft.value} value={ft.value}>{ft.label}</option>
                          ))}
                        </select>
                        <button type="button" onClick={() => setNewFields(newFields.filter((_, j) => j !== i))} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer" aria-label="Remover campo">
                          <Trash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setNewFields([...newFields, { key: "", label: "", value: "", type: "text", required: false }])} className="mt-1.5 px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer">+ Adicionar Campo</button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-emerald-100">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={newEnabled} onChange={(e) => setNewEnabled(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-xs text-slate-600">Template ativo após criação</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setShowCreateForm(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">{loading ? <> <CircleNotch size={12} className="animate-spin" /> Criando... </> : "Criar Template"}</button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">Fechar</button>
        </div>
      </div>
    </div>
  );
}