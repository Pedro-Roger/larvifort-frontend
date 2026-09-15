"use client";

import { useState, useEffect } from "react";
import {
  X, CircleNotch, Trash, Paperclip,
  CheckCircle, WhatsappLogo, ArrowRight, ArrowsLeftRight
} from "@phosphor-icons/react";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import { getTaskDetails, deleteTask, updateTask, uploadTaskAttachment, deleteTaskAttachment, type TaskWithDetails, type StatusTarefa, type Projeto } from "@/services/tasks";
import { fetchSubtasks, createSubtask, updateSubtask, deleteSubtask, type Subtask } from "@/services/subtasks";
import { fetchClients, type Cliente } from "@/services/clients";
import type { User } from "@/services/users";

interface TaskDetailModalProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  users?: User[];
  projetos?: Projeto[];
  onUpdate?: (updated: TaskWithDetails) => void;
  onDelete?: () => void;
  onTransfer?: () => void;
}

export default function TaskDetailModal({
  open, onClose, taskId, users = [], projetos = [], onUpdate, onDelete, onTransfer,
}: TaskDetailModalProps) {
  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const [editedStatus, setEditedStatus] = useState("");
  const [editedAssigneeId, setEditedAssigneeId] = useState<string>("");
  const [editedProjetoId, setEditedProjetoId] = useState<string>("");
  const [editedClienteId, setEditedClienteId] = useState<string>("");
  const [clients, setClients] = useState<Cliente[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [subtaskSaving, setSubtaskSaving] = useState(false);
  
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !taskId) return;
    
    let isMounted = true;
    const loadTask = async () => {
      setLoading(true);
      setError(null);
      setTask(null);
      try {
        const [data, loadedSubtasks] = await Promise.all([
          getTaskDetails(taskId),
          fetchSubtasks(taskId),
        ]);
        if (!isMounted) return;
        setTask(data);
        setSubtasks(loadedSubtasks.length > 0 ? loadedSubtasks : data.childrenTasks.map((child) => ({
          id: child.id,
          titulo: child.titulo,
          status: child.status,
          progresso: child.status === "CONCLUIDO" ? 100 : 0,
          parentId: data.id,
          assigneeId: null,
        })));
        setEditedTitle(data.titulo);
        setEditedDesc(data.descricao || "");
        setEditedStatus(data.status);
        setEditedAssigneeId(data.assigneeId || "");
        setEditedProjetoId(data.projetoId || "");
        setEditedClienteId(data.clienteId || "");
        void fetchClients({ pageSize: 100 }).then((result) => {
          if (isMounted) setClients(result.items);
        }).catch(() => {
          if (isMounted) setClients([]);
        });
      } catch (err: unknown) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar detalhes da tarefa.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadTask();

    return () => { isMounted = false; };
  }, [open, taskId]);

  if (!open) return null;

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    setError(null);
    try {
      const updatedStr = await updateTask(taskId, {
        titulo: editedTitle.trim(),
        descricao: editedDesc.trim() || null,
        status: editedStatus as StatusTarefa,
        assigneeId: editedAssigneeId || null,
        clienteId: editedClienteId || null,
        projetoId: editedProjetoId || task.projetoId,
      });
      const chosenUser = users.find(u => u.id === editedAssigneeId);
      const merged: TaskWithDetails = { 
        ...task, 
        ...updatedStr, 
        titulo: editedTitle.trim(), 
        descricao: editedDesc.trim() || null, 
        status: editedStatus as StatusTarefa,
        assigneeId: editedAssigneeId || null,
        assigneeName: chosenUser ? `${chosenUser.firstName} ${chosenUser.lastName}` : (editedAssigneeId ? task.assigneeName : null),
        assigneeInitials: chosenUser ? `${chosenUser.firstName?.[0] || ""}${chosenUser.lastName?.[0] || ""}`.toUpperCase() : (editedAssigneeId ? task.assigneeInitials : null),
        projetoId: editedProjetoId || task.projetoId,
        clienteId: editedClienteId || null,
      };
      onUpdate?.(merged);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar tarefa.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!task || !e.target.files?.length) return;
    setSaving(true);
    try {
      const file = e.target.files[0];
      const attachment = await uploadTaskAttachment(taskId, file);
      setTask({ ...task, attachments: [...task.attachments, attachment] });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload do arquivo.");
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!task) return;
    setSaving(true);
    try {
      await deleteTaskAttachment(taskId, attachmentId);
      setTask({ ...task, attachments: task.attachments.filter(a => a.id !== attachmentId) });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir arquivo.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    setSaving(true);
    try {
      await deleteTask(taskId);
      onDelete?.();
      setConfirmDeleteOpen(false);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir tarefa.");
      setConfirmDeleteOpen(false);
      setSaving(false);
    }
  };

  const handleWhatsapp = () => {
    if (!task?.phone) return;
    const cleanPhone = task.phone.replace(/\D/g, "");
    const text = encodeURIComponent(`Olá, sobre a tarefa "${task.titulo}" do projeto...`);
    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, "_blank");
  };

  const refreshTaskAfterSubtaskChange = async () => {
    const [updatedTask, updatedSubtasks] = await Promise.all([
      getTaskDetails(taskId),
      fetchSubtasks(taskId),
    ]);
    setTask(updatedTask);
    setSubtasks(updatedSubtasks);
    onUpdate?.(updatedTask);
  };

  const handleCreateSubtask = async () => {
    const titulo = newSubtaskTitle.trim();
    if (!titulo) return;
    setSubtaskSaving(true);
    setError(null);
    try {
      await createSubtask(taskId, { titulo, assigneeId: task?.assigneeId ?? null });
      setNewSubtaskTitle("");
      await refreshTaskAfterSubtaskChange();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar subtarefa.");
    } finally {
      setSubtaskSaving(false);
    }
  };

  const handleToggleSubtask = async (subtask: Subtask) => {
    setSubtaskSaving(true);
    setError(null);
    try {
      await updateSubtask(taskId, subtask.id, {
        status: subtask.status === "CONCLUIDO" ? "BACKLOG" : "CONCLUIDO",
        progresso: subtask.status === "CONCLUIDO" ? 0 : 100,
      });
      await refreshTaskAfterSubtaskChange();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar subtarefa.");
    } finally {
      setSubtaskSaving(false);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    setSubtaskSaving(true);
    setError(null);
    try {
      await deleteSubtask(taskId, subtaskId);
      await refreshTaskAfterSubtaskChange();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir subtarefa.");
    } finally {
      setSubtaskSaving(false);
    }
  };

  if (!task && loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl p-8 shadow-2xl"><CircleNotch size={32} className="animate-spin text-sky-600" /></div>
    </div>
  );
  if (!task && error) return (
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl p-6 shadow-2xl border border-red-200">
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button onClick={onClose} className="px-4 py-2 bg-red-600 text-white rounded-lg">Fechar</button>
      </div>
    </div>
  );
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 mb-1">
              <span>Tarefa #{task.id.slice(-4) || "---"}</span>
              {task.clienteName && <span>• {task.clienteName}</span>}
            </div>
            <input
              className="w-full text-base font-bold text-slate-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-0.5 -mx-1"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              disabled={saving}
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-0 overflow-y-auto flex-1">
          {/* Left: Content */}
          <div className="px-6 py-5 space-y-5">
            {/* Description */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descrição e Orientações</h3>
              <textarea
                rows={4}
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                disabled={saving}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600 resize-y placeholder:text-slate-400"
                placeholder="Detalhes operacionais, instruções para execução..."
              />
            </section>

            {/* Order Info */}
            {task.orderNumber && (
              <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-1.5">
                  <ArrowRight size={14} />
                  Ordem de Pedido Vinculada
                </div>
                <div className="flex items-center justify-between gap-3 text-xs text-amber-700">
                  <span className="font-medium">#{task.orderNumber}</span>
                  {task.orderTotal !== null && (
                    <span className="font-bold">R$ {task.orderTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  )}
                </div>
              </section>
            )}

            {/* Subtasks / Herança */}
            {task.parentTask && (
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Herança / Tarefa Mãe</h3>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded">MÃE</span>
                    <span className="text-xs text-slate-600 font-medium">#{task.parentTask.id.slice(-4)} — {task.parentTask.titulo}</span>
                  </div>
                </div>
              </section>
            )}
            
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atividades e subtarefas ({subtasks.length})</h3>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5">
                <div className="flex gap-2">
                  <input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void handleCreateSubtask(); }}
                    disabled={subtaskSaving}
                    placeholder="Adicionar uma subtarefa..."
                    className="min-w-0 flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                  <button
                    type="button"
                    onClick={() => void handleCreateSubtask()}
                    disabled={subtaskSaving || !newSubtaskTitle.trim()}
                    className="px-3 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 disabled:opacity-50 cursor-pointer"
                  >Adicionar</button>
                </div>
                {subtasks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-1">Nenhuma subtarefa adicionada.</p>
                ) : subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2 text-xs text-slate-600 group">
                    <button
                      type="button"
                      onClick={() => void handleToggleSubtask(subtask)}
                      disabled={subtaskSaving}
                      aria-label={subtask.status === "CONCLUIDO" ? "Reabrir subtarefa" : "Concluir subtarefa"}
                      className="shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {subtask.status === "CONCLUIDO" ? <CheckCircle size={16} weight="fill" className="text-emerald-500" /> : <span className="block w-4 h-4 rounded-full border-2 border-slate-300 hover:border-brand-500" />}
                    </button>
                    <span className={subtask.status === "CONCLUIDO" ? "line-through text-slate-400 flex-1" : "flex-1"}>{subtask.titulo}</span>
                    <button
                      type="button"
                      onClick={() => void handleDeleteSubtask(subtask.id)}
                      disabled={subtaskSaving}
                      aria-label="Excluir subtarefa"
                      className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer disabled:opacity-50"
                    ><Trash size={12} /></button>
                  </div>
                ))}
              </div>
            </section>

            {/* Attachments */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Anexos</h3>
              <div className="space-y-2">
                {task.attachments.map((f) => (
                  <div key={f.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:border-sky-300 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Paperclip size={14} className="text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{f.name}</p>
                        <p className="text-[10px] text-slate-400">{f.size} • {f.mimeType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <a href={f.url} target="_blank" rel="noreferrer" className="text-xs text-sky-600 hover:text-sky-700 font-medium cursor-pointer">Baixar</a>
                      <button onClick={() => handleDeleteAttachment(f.id)} className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"><Trash size={12}/></button>
                    </div>
                  </div>
                ))}
                <label className="w-full py-2 rounded-lg border border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:text-sky-600 hover:border-sky-300 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <Paperclip size={14} /> Anexar arquivo
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </section>
          </div>

          {/* Right: Meta + Actions */}
          <div className="border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50/40 p-5 space-y-4">
            {/* Quadro / Setor */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Cliente</label>
              <select
                value={editedClienteId}
                onChange={(e) => setEditedClienteId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600"
              >
                <option value="">Sem cliente vinculado</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Pedidos desta atividade devem usar este cliente.</p>
            </div>

            {/* Quadro / Setor */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Quadro / Setor</label>
              <select
                value={editedProjetoId}
                onChange={(e) => setEditedProjetoId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600"
              >
                {projetos.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Status / Coluna */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Status / Coluna</label>
              <select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="EM_REVISAO">Em Revisão</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
            </div>

            {/* Assignee Selector */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Responsável</label>
              <select
                value={editedAssigneeId}
                onChange={(e) => setEditedAssigneeId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 mb-1.5"
              >
                <option value="">Não atribuído</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.teamName || "Sem time"})
                  </option>
                ))}
              </select>
            </div>

            {/* Transfer to another sector */}
            {onTransfer && (
              <button
                type="button"
                onClick={onTransfer}
                className="flex items-center gap-2 px-3 py-2.5 w-full justify-center rounded-xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 transition-colors text-xs font-semibold cursor-pointer"
              >
                <ArrowsLeftRight size={18} />
                <span>Passagem de Bastão / Transferir Setor</span>
              </button>
            )}

            {/* WhatsApp Action */}
            <button
               type="button"
               onClick={handleWhatsapp}
               disabled={!task.phone}
               className="flex items-center gap-2 px-3 py-2.5 w-full justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              <WhatsappLogo size={18} />
              <span>{task.phone ? `WhatsApp (${task.phone})` : "Sem WhatsApp"}</span>
            </button>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500">Progresso</span>
                <span className="text-xs font-bold text-sky-600">{task.progresso}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${task.progresso}%` }} />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Prazo</label>
              <div className="text-xs font-medium text-slate-700">{task.prazo ? new Date(task.prazo).toLocaleDateString() : "Sem prazo definido"}</div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Tags</label>
              <div className="flex flex-wrap gap-1">
                {task.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">{t}</span>
                ))}
              </div>
            </div>

            {/* Delete */}
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="w-full text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash size={14} /> Excluir Tarefa
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all disabled:opacity-70 cursor-pointer"
          >
            {saving && <CircleNotch size={14} className="animate-spin" />}
            <span>Salvar Alterações</span>
          </button>
        </div>

        {confirmDeleteOpen && (
          <ConfirmDeleteModal
            open={true}
            title="Excluir Tarefa"
            message={`Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.`}
            onClose={() => setConfirmDeleteOpen(false)}
            onConfirm={handleDeleteTask}
          />
        )}
      </div>
    </div>
  );
}
