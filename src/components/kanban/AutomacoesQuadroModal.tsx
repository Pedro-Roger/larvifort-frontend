"use client";

import { useState, useEffect, useCallback } from "react";
import { X, CircleNotch, WarningCircle, Plus, Trash, DotsThree, Gear, Play } from "@phosphor-icons/react";
import {
  fetchBoardAutomations,
  createBoardAutomation,
  updateBoardAutomation,
  deleteBoardAutomation,
  reorderBoardAutomations,
  testBoardAutomation,
  type BoardAutomation,
  type BoardAutomationInput,
} from "@/services/tasks";

interface AutomacoesQuadroModalProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
  onSuccess?: () => void;
}

const TRIGGER_CONFIG = {
  TASK_CREATED: { label: "Tarefa Criada", description: "Quando uma nova tarefa é criada no quadro" },
  TASK_MOVED: { label: "Tarefa Movida", description: "Quando uma tarefa é movida entre colunas" },
  TASK_COMPLETED: { label: "Tarefa Concluída", description: "Quando uma tarefa atinge status final" },
  TASK_ASSIGNED: { label: "Tarefa Atribuída", description: "Quando uma tarefa é atribuída a um responsável" },
  DUE_DATE_APPROACHING: { label: "Prazo Próximo", description: "Quando o prazo da tarefa está próximo" },
  COLUMN_WIP_EXCEEDED: { label: "WIP Excedido", description: "Quando o limite WIP de uma coluna é ultrapassado" },
  SCHEDULED: { label: "Agendado", description: "Execução em horário/data programada" },
  APPOINTMENT_CREATED: { label: "Compromisso Criado", description: "Quando um novo compromisso é agendado" },
  APPOINTMENT_COMPLETED: { label: "Compromisso Concluído", description: "Quando um compromisso é finalizado (check-in)" },
} as const;

const ACTION_CONFIG = {
  MOVE_TASK: { label: "Mover Tarefa", description: "Mover tarefa para outra coluna" },
  ASSIGN_USER: { label: "Atribuir Usuário", description: "Atribuir tarefa a um responsável" },
  SET_PRIORITY: { label: "Definir Prioridade", description: "Alterar prioridade da tarefa" },
  ADD_TAG: { label: "Adicionar Tag", description: "Adicionar tag/categoria à tarefa" },
  SEND_NOTIFICATION: { label: "Enviar Notificação", description: "Enviar notificação para membro" },
  CREATE_CHILD_TASK: { label: "Criar Subtarefa", description: "Criar subtarefa vinculada à original" },
  UPDATE_FIELD: { label: "Atualizar Campo", description: "Atualizar campo personalizado da tarefa" },
  WEBHOOK: { label: "Webhook", description: "Enviar dados para endpoint externo" },
  CREATE_TASK_FROM_APPOINTMENT: { label: "Criar Tarefa do Compromisso", description: "Criar tarefa no quadro a partir do compromisso agendado" },
} as const;

type TriggerType = keyof typeof TRIGGER_CONFIG;
type ActionType = keyof typeof ACTION_CONFIG;

function AutomationItem({
  automation,
  draggedId,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onToggleEnabled,
  onDelete,
  onEdit,
  onTest,
}: {
  automation: BoardAutomation;
  draggedId: string | null;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  onDragEnd: () => void;
  onToggleEnabled: (a: BoardAutomation) => void;
  onDelete: (id: string) => void;
  onEdit: (a: BoardAutomation) => void;
  onTest: (a: BoardAutomation) => void;
}) {
  const isDragging = draggedId === automation.id;

  const triggerInfo = TRIGGER_CONFIG[automation.trigger];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, automation.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, automation.id)}
      onDragEnd={onDragEnd}
      className={`relative p-4 rounded-xl border transition-all ${
        isDragging
          ? "bg-amber-50/60 border-2 border-dashed border-amber-400 opacity-75"
          : "bg-white border-slate-200 hover:border-amber-200"
      }`}
    >
      {/* Drag handle */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
        <button type="button" className="w-7 h-7 rounded-md hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-grab active:cursor-grabbing" aria-label="Reordenar automação">
          <DotsThree size={16} />
        </button>
      </div>

      <div className="ml-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500 text-white">
                <Gear size={14} />
              </div>
              <h4 className="font-semibold text-sm text-slate-800">{automation.name}</h4>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${automation.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {automation.enabled ? "Ativa" : "Inativa"}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{triggerInfo.label}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{automation.description || "Sem descrição"}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">Gatilho</span>
              {automation.actions.map((action, i) => {
                const actionInfo = ACTION_CONFIG[action.type as ActionType];
                return (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium flex items-center gap-1">
                    <span className="text-slate-400">→</span>
                    {actionInfo?.label || action.type}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => onTest(automation)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" aria-label="Testar automação" title="Testar">
              <Play size={14} />
            </button>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={automation.enabled} onChange={() => onToggleEnabled(automation)} className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
              <span className="text-xs text-slate-500">Ativa</span>
            </label>
            <button type="button" onClick={() => onEdit(automation)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" aria-label="Editar automação">
              <Gear size={14} />
            </button>
            <button type="button" onClick={() => onDelete(automation.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" aria-label="Excluir automação">
              <Trash size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditForm({
  editName,
  setEditName,
  editDescription,
  setEditDescription,
  editEnabled,
  setEditEnabled,
  editTrigger,
  setEditTrigger,
  editActions,
  setEditActions,
  handleEdit,
  onCancel,
  loading,
}: {
  editName: string;
  setEditName: (v: string) => void;
  editDescription: string;
  setEditDescription: (v: string) => void;
  editEnabled: boolean;
  setEditEnabled: (v: boolean) => void;
  editTrigger: TriggerType;
  setEditTrigger: (v: TriggerType) => void;
  editActions: Array<{ type: ActionType; config: Record<string, unknown>; order: number }>;
  setEditActions: (v: Array<{ type: ActionType; config: Record<string, unknown>; order: number }>) => void;
  handleEdit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <form onSubmit={handleEdit} className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500 text-white">
          <Gear size={14} />
        </div>
        <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500" autoFocus />
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={editEnabled} onChange={(e) => setEditEnabled(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
          <span className="text-xs text-slate-600">Ativa</span>
        </label>
      </div>
      <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500" rows={2} placeholder="Descrição opcional" />
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Gatilho</label>
        <select value={editTrigger} onChange={(e) => setEditTrigger(e.target.value as TriggerType)} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500">
          {(Object.keys(TRIGGER_CONFIG) as TriggerType[]).map((t) => (
            <option key={t} value={t}>{TRIGGER_CONFIG[t].label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Ações</label>
        <div className="space-y-2">
          {editActions.map((action, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-4">{i + 1}.</span>
              <select value={action.type} onChange={(e) => { const newActions = [...editActions]; newActions[i] = { ...newActions[i], type: e.target.value as ActionType }; setEditActions(newActions); }} className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500">
                {(Object.keys(ACTION_CONFIG) as ActionType[]).map((a) => (
                  <option key={a} value={a}>{ACTION_CONFIG[a].label}</option>
                ))}
              </select>
              <button type="button" onClick={() => setEditActions(editActions.filter((_, j) => j !== i))} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer" aria-label="Remover ação">
                <Trash size={12} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setEditActions([...editActions, { type: "MOVE_TASK", config: {}, order: editActions.length }])} className="mt-1.5 px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer">+ Adicionar Ação</button>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">Cancelar</button>
        <button type="submit" disabled={loading} className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm shadow-amber-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">{loading ? <> <CircleNotch size={12} className="animate-spin" /> Salvando... </> : "Salvar"}</button>
      </div>
    </form>
  );
}

export default function AutomacoesQuadroModal({ open, onClose, boardId }: AutomacoesQuadroModalProps) {
  const [automations, setAutomations] = useState<BoardAutomation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<BoardAutomation | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Create form state
  const [newTrigger, setNewTrigger] = useState<TriggerType>("TASK_CREATED");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newActions, setNewActions] = useState<Array<{ type: ActionType; config: Record<string, unknown>; order: number }>>([{ type: "MOVE_TASK", config: {}, order: 0 }]);
  const [newEnabled, setNewEnabled] = useState(true);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTrigger, setEditTrigger] = useState<TriggerType>("TASK_CREATED");
  const [editActions, setEditActions] = useState<Array<{ type: ActionType; config: Record<string, unknown>; order: number }>>([]);
  const [editEnabled, setEditEnabled] = useState(true);

  const loadAutomations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBoardAutomations(boardId);
      setAutomations(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar automações");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  const resetForms = useCallback(() => {
    setNewName("");
    setNewDescription("");
    setNewActions([{ type: "MOVE_TASK", config: {}, order: 0 }]);
    setNewEnabled(true);
    setEditName("");
    setEditDescription("");
    setEditTrigger("TASK_CREATED");
    setEditActions([]);
    setEditEnabled(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        await loadAutomations();
        if (!cancelled) {
          setShowCreateForm(false);
          setEditingAutomation(null);
          resetForms();
        }
      } catch {
        // Error handled in loadAutomations
      }
    })();
    return () => { cancelled = true; };
  }, [open, boardId, loadAutomations, resetForms]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) { setError("Nome da automação é obrigatório"); return; }
    setLoading(true);
    setError(null);
    try {
      const input: BoardAutomationInput = {
        name: newName.trim(),
        description: newDescription.trim(),
        enabled: newEnabled,
        trigger: newTrigger,
        triggerConfig: {},
        actions: newActions.map((a, i) => ({ ...a, order: i })),
        boardId,
      };
      await createBoardAutomation(boardId, input);
      await loadAutomations();
      setShowCreateForm(false);
      resetForms();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar automação");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAutomation) return;
    if (!editName.trim()) { setError("Nome da automação é obrigatório"); return; }
    setLoading(true);
    setError(null);
    try {
      await updateBoardAutomation(editingAutomation.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        enabled: editEnabled,
        trigger: editTrigger,
        actions: editActions.map((a, i) => ({ ...a, order: i })),
      });
      await loadAutomations();
      setEditingAutomation(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar automação");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta automação?")) return;
    setLoading(true);
    try {
      await deleteBoardAutomation(id);
      await loadAutomations();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir automação");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (automation: BoardAutomation) => {
    try {
      await updateBoardAutomation(automation.id, { enabled: !automation.enabled });
      await loadAutomations();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao alterar status");
    }
  };

  const handleTest = async (automation: BoardAutomation) => {
    try {
      const result = await testBoardAutomation(automation.id);
      alert(`Teste da automação "${automation.name}":\n\nStatus: ${result.success ? "✅ Sucesso" : "❌ Falha"}\n\nLogs:\n${result.logs.map((l, i) => `${i + 1}. ${l}`).join("\n") || "(nenhum log)"}`);
    } catch (err: unknown) {
      alert("Erro ao testar automação: " + (err instanceof Error ? err.message : "Erro desconhecido"));
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

    const fromIndex = automations.findIndex((a) => a.id === fromId);
    const toIndex = automations.findIndex((a) => a.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    // Optimistic update
    const newAutomations = [...automations];
    const [moved] = newAutomations.splice(fromIndex, 1);
    newAutomations.splice(toIndex, 0, moved);
    setAutomations(newAutomations);

    // Persist
    const automationOrders = newAutomations.map((a, i) => ({ id: a.id, order: i }));
    try {
      await reorderBoardAutomations(boardId, automationOrders);
    } catch {
      loadAutomations(); // Revert on error
    }

    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const startEdit = (automation: BoardAutomation) => {
    setEditingAutomation(automation);
    setEditName(automation.name);
    setEditDescription(automation.description);
    setEditTrigger(automation.trigger);
    setEditActions([...automation.actions]);
    setEditEnabled(automation.enabled);
  };

  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    setShowCreateForm(false);
    setEditingAutomation(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={handleClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden z-10">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2">
            <Gear size={20} className="text-amber-600" />
            <h2 className="text-base font-bold text-slate-800">Editor de Automações do Quadro</h2>
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

          {/* Automations List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">Automações Configuradas ({automations.length})</h3>
              <button type="button" onClick={() => setShowCreateForm(true)} className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer">
                <Plus size={14} /> Nova Automação
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : automations.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <Gear size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">Nenhuma automação configurada</p>
                <p className="text-xs text-slate-400 mt-1">Clique em &ldquo;Nova Automação&rdquo; para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {automations.map((automation) => (
                  editingAutomation?.id === automation.id ? (
                    <EditForm
                      key={automation.id}
                      editName={editName}
                      setEditName={setEditName}
                      editDescription={editDescription}
                      setEditDescription={setEditDescription}
                      editEnabled={editEnabled}
                      setEditEnabled={setEditEnabled}
                      editTrigger={editTrigger}
                      setEditTrigger={setEditTrigger}
                      editActions={editActions}
                      setEditActions={setEditActions}
                      handleEdit={handleEdit}
                      onCancel={() => setEditingAutomation(null)}
                      loading={loading}
                    />
                  ) : (
                    <AutomationItem
                      key={automation.id}
                      automation={automation}
                      draggedId={draggedId}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      onToggleEnabled={handleToggleEnabled}
                      onDelete={handleDelete}
                      onEdit={startEdit}
                      onTest={handleTest}
                    />
                  )
                ))}
              </div>
            )}
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 animate-in fade-in slide-in-from-top-2 duration-150">
              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Plus size={14} className="text-amber-600" />
                Criar Nova Automação
              </h4>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gatilho</label>
                    <select value={newTrigger} onChange={(e) => setNewTrigger(e.target.value as TriggerType)} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500">
                      {(Object.keys(TRIGGER_CONFIG) as TriggerType[]).map((t) => (
                        <option key={t} value={t}>{TRIGGER_CONFIG[t].label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Automação <span className="text-red-500">*</span></label>
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="Ex: Mover para Concluído automaticamente" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
                  <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500" rows={2} placeholder="Descreva o que esta automação faz..." />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ações</label>
                  <div className="space-y-2">
                    {newActions.map((action, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-4">{i + 1}.</span>
                        <select value={action.type} onChange={(e) => { const newActs = [...newActions]; newActs[i] = { ...newActs[i], type: e.target.value as ActionType }; setNewActions(newActs); }} className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500">
                          {(Object.keys(ACTION_CONFIG) as ActionType[]).map((a) => (
                            <option key={a} value={a}>{ACTION_CONFIG[a].label}</option>
                          ))}
                        </select>
                        <button type="button" onClick={() => setNewActions(newActions.filter((_, j) => j !== i))} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer" aria-label="Remover ação">
                          <Trash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setNewActions([...newActions, { type: "MOVE_TASK", config: {}, order: newActions.length }])} className="mt-1.5 px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer">+ Adicionar Ação</button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-amber-100">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={newEnabled} onChange={(e) => setNewEnabled(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                    <span className="text-xs text-slate-600">Automação ativa após criação</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setShowCreateForm(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm shadow-amber-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">{loading ? <> <CircleNotch size={12} className="animate-spin" /> Criando... </> : "Criar Automação"}</button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Trigger Type Descriptions */}
          <details className="group">
            <summary className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer">
              <Gear size={14} className="text-amber-600" />
              <span>Gatilhos Disponíveis</span>
              <span className="ml-auto text-slate-400 transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              {(Object.keys(TRIGGER_CONFIG) as TriggerType[]).map((t) => (
                <div key={t} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                  <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 bg-amber-500 text-white">
                    <Gear size={12} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{TRIGGER_CONFIG[t].label}</p>
                    <p className="text-slate-500">{TRIGGER_CONFIG[t].description}</p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">Fechar</button>
        </div>
      </div>
    </div>
  );
}