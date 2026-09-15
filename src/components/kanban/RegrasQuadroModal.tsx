"use client";

import { useState, useEffect, useCallback } from "react";
import { X, CircleNotch, WarningCircle, Plus, Trash, DotsThree, Gear, Users, Bell, FileText } from "@phosphor-icons/react";
import { fetchBoardRules, createBoardRule, updateBoardRule, deleteBoardRule, reorderBoardRules, type BoardRule, type BoardRuleInput, type Projeto, type TaskColumn } from "@/services/tasks";
import type { User } from "@/services/users";

interface RegrasQuadroModalProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
  onSuccess?: () => void;
  columns?: TaskColumn[];
  users?: User[];
  projetos?: Projeto[];
}

const RULE_TYPE_CONFIG = {
  AUTO_TRANSITION: { label: "Transição Automática", icon: Gear, color: "bg-violet-500", description: "Mover tarefas automaticamente entre colunas baseado em gatilhos" },
  WIP_LIMIT: { label: "Limite WIP", icon: FileText, color: "bg-amber-500", description: "Limitar número de tarefas por coluna" },
  AUTO_ASSIGN: { label: "Atribuição Automática", icon: Users, color: "bg-emerald-500", description: "Atribuir responsáveis automaticamente baseado em regras" },
  NOTIFICATION: { label: "Notificação", icon: Bell, color: "bg-sky-500", description: "Enviar notificações em eventos específicos" },
  CUSTOM: { label: "Regra Personalizada", icon: Gear, color: "bg-slate-500", description: "Regra customizada para necessidades específicas" },
  HIDE_CARD: { label: "Ocultar Card", icon: FileText, color: "bg-red-500", description: "Ocultar cards conforme perfil, responsável ou status" },
  HIDE_CLIENT: { label: "Ocultar Cliente", icon: Users, color: "bg-orange-500", description: "Esconder o cliente no card para perfis selecionados" },
  HIDE_VALUE: { label: "Ocultar Valor", icon: FileText, color: "bg-amber-600", description: "Esconder o valor do pedido para perfis selecionados" },
  HIDE_STALE: { label: "Card Parado", icon: WarningCircle, color: "bg-fuchsia-500", description: "Ocultar cards sem atualização após determinado número de dias" },
  VIEW_SCOPE: { label: "Visibilidade", icon: Users, color: "bg-indigo-500", description: "Definir se usuário comum vê só seus cards ou todos" },
  ALLOW_MOVE: { label: "Permitir Movimentação", icon: Gear, color: "bg-emerald-600", description: "Permitir movimentação conforme perfil e colunas" },
  DENY_MOVE: { label: "Bloquear Movimentação", icon: WarningCircle, color: "bg-red-600", description: "Bloquear movimentação conforme perfil e colunas" },
} as const;

type RuleType = keyof typeof RULE_TYPE_CONFIG;

const DEFAULT_CONFIGS: Record<RuleType, Record<string, unknown>> = {
  AUTO_TRANSITION: { triggerColumnId: "", targetColumnId: "", condition: "ALL_TASKS_DONE" },
  WIP_LIMIT: { columnId: "", maxTasks: 5 },
  AUTO_ASSIGN: { columnId: "", assigneeIds: [], strategy: "ROUND_ROBIN" },
  NOTIFICATION: { event: "TASK_MOVED", recipients: [], template: "" },
  CUSTOM: { script: "" },
  HIDE_CARD: { role: "USER", assigneeId: "", status: "" },
  HIDE_CLIENT: { role: "USER" },
  HIDE_VALUE: { role: "USER" },
  HIDE_STALE: { role: "USER", minDays: 3 },
  VIEW_SCOPE: { role: "USER", mode: "OWN" },
  ALLOW_MOVE: { role: "USER", fromColumnId: "", toColumnId: "" },
  DENY_MOVE: { role: "USER", fromColumnId: "", toColumnId: "" },
};

function RuleItem({
  rule,
  draggedRuleId,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  handleToggleEnabled,
  handleDelete,
  startEdit,
}: {
  rule: BoardRule;
  draggedRuleId: string | null;
  handleDragStart: (e: React.DragEvent, ruleId: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetRuleId: string) => void;
  handleDragEnd: () => void;
  handleToggleEnabled: (rule: BoardRule) => void;
  handleDelete: (ruleId: string) => void;
  startEdit: (rule: BoardRule) => void;
}) {
  const typeConfig = RULE_TYPE_CONFIG[rule.type];
  const Icon = typeConfig.icon;
  const isDragging = draggedRuleId === rule.id;

  return (
    <div
      key={rule.id}
      draggable
      onDragStart={(e) => handleDragStart(e, rule.id)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, rule.id)}
      onDragEnd={handleDragEnd}
      className={`relative p-4 rounded-xl border transition-all ${
        isDragging
          ? "bg-sky-50/60 border-2 border-dashed border-sky-400 opacity-75"
          : "bg-white border-slate-200 hover:border-sky-200"
      }`}
    >
      {/* Drag handle */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
        <button
          type="button"
          className="w-7 h-7 rounded-md hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-grab active:cursor-grabbing"
          aria-label="Reordenar regra"
        >
          <DotsThree size={16} />
        </button>
      </div>

      <div className="ml-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${typeConfig.color} text-white`}>
                <Icon size={14} />
              </div>
              <h4 className="font-semibold text-sm text-slate-800">{rule.name}</h4>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${rule.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {rule.enabled ? "Ativa" : "Inativa"}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{typeConfig.label}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rule.description || "Sem descrição"}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              Config: {JSON.stringify(rule.config)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={() => handleToggleEnabled(rule)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-xs text-slate-500">Ativa</span>
            </label>
            <button
              type="button"
              onClick={() => startEdit(rule)}
              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
              aria-label="Editar regra"
            >
              <Gear size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(rule.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              aria-label="Excluir regra"
            >
              <Trash size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RuleConfigFields({
  type,
  config,
  setConfig,
  boardId,
  columns,
  users,
  projetos,
}: {
  type: RuleType;
  config: Record<string, unknown>;
  setConfig: (value: Record<string, unknown>) => void;
  boardId: string;
  columns: TaskColumn[];
  users: User[];
  projetos: Projeto[];
}) {
  const update = (key: string, value: string | number) => setConfig({ ...config, [key]: value });
  const selectClass = "w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500";
  const labelClass = "block text-xs font-semibold text-slate-700 mb-1";
  const columnOptions = columns.map((column) => <option key={column.id} value={column.id}>{column.title}</option>);
  const projectValue = String(config.projectId ?? boardId);
  const userValue = String(config.userId ?? "");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label>
          <span className={labelClass}>Projeto alvo</span>
          <select value={projectValue} onChange={(e) => update("projectId", e.target.value)} className={selectClass}>
            {projetos.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>
        <label>
          <span className={labelClass}>Usuário alvo</span>
          <select value={userValue} onChange={(e) => update("userId", e.target.value)} className={selectClass}>
            <option value="">Todos os usuários</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>)}
          </select>
        </label>
      </div>

      {(type === "VIEW_SCOPE" || type === "ALLOW_MOVE" || type === "DENY_MOVE" || type.startsWith("HIDE_")) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label>
            <span className={labelClass}>Perfil</span>
            <select value={String(config.role ?? "USER")} onChange={(e) => update("role", e.target.value)} className={selectClass}>
              <option value="USER">Usuário comum</option><option value="ADMIN">Administrador</option>
            </select>
          </label>
          {type !== "VIEW_SCOPE" && <label>
            <span className={labelClass}>Responsável</span>
            <select value={String(config.assigneeId ?? "")} onChange={(e) => update("assigneeId", e.target.value)} className={selectClass}>
              <option value="">Qualquer responsável</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>)}
            </select>
          </label>}
          {type === "VIEW_SCOPE" && <label>
            <span className={labelClass}>Visão dos cards</span>
            <select value={String(config.mode ?? "OWN")} onChange={(e) => update("mode", e.target.value)} className={selectClass}>
              <option value="OWN">Somente os próprios</option><option value="ALL">Todos os cards</option>
            </select>
          </label>}
          {type.startsWith("HIDE_") && type !== "HIDE_CLIENT" && type !== "HIDE_VALUE" && <label>
            <span className={labelClass}>Status</span>
            <select value={String(config.status ?? "")} onChange={(e) => update("status", e.target.value)} className={selectClass}>
              <option value="">Qualquer status</option><option value="BACKLOG">Backlog</option><option value="EM_ANDAMENTO">Em andamento</option><option value="EM_REVISAO">Em revisão</option><option value="CONCLUIDO">Concluído</option>
            </select>
          </label>}
        </div>
      )}

      {(type === "ALLOW_MOVE" || type === "DENY_MOVE") && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label><span className={labelClass}>Coluna de origem</span><select value={String(config.fromColumnId ?? "")} onChange={(e) => update("fromColumnId", e.target.value)} className={selectClass}><option value="">Qualquer coluna</option>{columnOptions}</select></label>
        <label><span className={labelClass}>Coluna de destino</span><select value={String(config.toColumnId ?? "")} onChange={(e) => update("toColumnId", e.target.value)} className={selectClass}><option value="">Qualquer coluna</option>{columnOptions}</select></label>
      </div>}

      {type === "AUTO_TRANSITION" && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label><span className={labelClass}>Coluna de origem</span><select value={String(config.triggerColumnId ?? "")} onChange={(e) => update("triggerColumnId", e.target.value)} className={selectClass}><option value="">Selecione a origem</option>{columnOptions}</select></label>
        <label><span className={labelClass}>Coluna alvo</span><select value={String(config.targetColumnId ?? "")} onChange={(e) => update("targetColumnId", e.target.value)} className={selectClass}><option value="">Selecione o destino</option>{columnOptions}</select></label>
      </div>}

      {type === "WIP_LIMIT" && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label><span className={labelClass}>Coluna alvo</span><select value={String(config.columnId ?? "")} onChange={(e) => update("columnId", e.target.value)} className={selectClass}><option value="">Selecione a coluna</option>{columnOptions}</select></label>
        <label><span className={labelClass}>Máximo de cards</span><input type="number" min={1} value={Number(config.maxTasks ?? 5)} onChange={(e) => update("maxTasks", Number(e.target.value))} className={selectClass} /></label>
      </div>}

      {type === "HIDE_STALE" && <label><span className={labelClass}>Dias sem atualização</span><input type="number" min={0} value={Number(config.minDays ?? 3)} onChange={(e) => update("minDays", Number(e.target.value))} className={selectClass} /></label>}

      {type === "CUSTOM" && <textarea value={JSON.stringify(config, null, 2)} onChange={(e) => { try { setConfig(JSON.parse(e.target.value) as Record<string, unknown>); } catch { /* aguarda JSON válido */ } }} className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg" rows={4} aria-label="Configuração personalizada" />}
    </div>
  );
}

function EditForm({
  rule,
  editName,
  setEditName,
  editDescription,
  setEditDescription,
  editConfig,
  setEditConfig,
  editEnabled,
  setEditEnabled,
  handleEdit,
  onCancel,
  loading,
  boardId,
  columns,
  users,
  projetos,
}: {
  rule: BoardRule;
  editName: string;
  setEditName: (v: string) => void;
  editDescription: string;
  setEditDescription: (v: string) => void;
  editConfig: Record<string, unknown>;
  setEditConfig: (v: Record<string, unknown>) => void;
  editEnabled: boolean;
  setEditEnabled: (v: boolean) => void;
  handleEdit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  boardId: string;
  columns: TaskColumn[];
  users: User[];
  projetos: Projeto[];
}) {
  const typeConfig = RULE_TYPE_CONFIG[rule.type];
  const Icon = typeConfig.icon;

  return (
    <form onSubmit={handleEdit} className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon size={16} className={typeConfig.color} />
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
          autoFocus
        />
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={editEnabled}
            onChange={(e) => setEditEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span className="text-xs text-slate-600">Ativa</span>
        </label>
      </div>
      <textarea
        value={editDescription}
        onChange={(e) => setEditDescription(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
        rows={2}
        placeholder="Descrição opcional"
      />
      <RuleConfigFields type={rule.type} config={editConfig} setConfig={setEditConfig} boardId={boardId} columns={columns} users={users} projetos={projetos} />
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm shadow-sky-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <> <CircleNotch size={12} className="animate-spin" /> Salvando... </> : "Salvar"}
        </button>
      </div>
    </form>
  );
}

export default function RegrasQuadroModal({ open, onClose, boardId, columns = [], users = [], projetos = [] }: RegrasQuadroModalProps) {
  const [rules, setRules] = useState<BoardRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRule, setEditingRule] = useState<BoardRule | null>(null);
  const [draggedRuleId, setDraggedRuleId] = useState<string | null>(null);

  // Create form state
  const [newRuleType, setNewRuleType] = useState<RuleType>("AUTO_TRANSITION");
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleDescription, setNewRuleDescription] = useState("");
  const [newRuleConfig, setNewRuleConfig] = useState<Record<string, unknown>>({});
  const [newRuleEnabled, setNewRuleEnabled] = useState(true);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editConfig, setEditConfig] = useState<Record<string, unknown>>({});
  const [editEnabled, setEditEnabled] = useState(true);

  // Function declarations (using useCallback for stability)
  const loadRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBoardRules(boardId);
      setRules(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar regras");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  const resetForms = useCallback(() => {
    setNewRuleName("");
    setNewRuleDescription("");
    setNewRuleConfig({ ...DEFAULT_CONFIGS[newRuleType] });
    setNewRuleEnabled(true);
    setEditName("");
    setEditDescription("");
    setEditEnabled(true);
  }, [newRuleType]);

  const handleTypeChange = useCallback((type: RuleType) => {
    setNewRuleType(type);
    setNewRuleConfig({ ...DEFAULT_CONFIGS[type] });
  }, []);

  // Effect to load rules when modal opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      try {
        await loadRules();
        if (!cancelled) {
          setShowCreateForm(false);
          setEditingRule(null);
          resetForms();
        }
      } catch {
        // Error handled in loadRules
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, boardId, loadRules, resetForms]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) {
      setError("Nome da regra é obrigatório");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const input: BoardRuleInput = {
        type: newRuleType,
        name: newRuleName.trim(),
        description: newRuleDescription.trim(),
        enabled: newRuleEnabled,
        config: newRuleConfig,
        boardId,
      };
      await createBoardRule(boardId, input);
      await loadRules();
      setShowCreateForm(false);
      resetForms();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar regra");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    if (!editName.trim()) {
      setError("Nome da regra é obrigatório");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateBoardRule(editingRule.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        enabled: editEnabled,
        type: editingRule.type,
        config: editConfig,
      });
      await loadRules();
      setEditingRule(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar regra");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta regra?")) return;
    setLoading(true);
    try {
      await deleteBoardRule(ruleId);
      await loadRules();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir regra");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (rule: BoardRule) => {
    try {
      await updateBoardRule(rule.id, { enabled: !rule.enabled });
      await loadRules();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao alterar status");
    }
  };

  const handleDragStart = (e: React.DragEvent, ruleId: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", ruleId);
    setDraggedRuleId(ruleId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetRuleId: string) => {
    e.preventDefault();
    const fromRuleId = e.dataTransfer.getData("text/plain");
    if (fromRuleId === targetRuleId || !fromRuleId) return;

    const fromIndex = rules.findIndex((r) => r.id === fromRuleId);
    const toIndex = rules.findIndex((r) => r.id === targetRuleId);
    if (fromIndex === -1 || toIndex === -1) return;

    // Optimistic update
    const newRules = [...rules];
    const [moved] = newRules.splice(fromIndex, 1);
    newRules.splice(toIndex, 0, moved);
    setRules(newRules);

    // Persist
    const ruleOrders = newRules.map((r, i) => ({ id: r.id, order: i }));
    try {
      await reorderBoardRules(boardId, ruleOrders);
    } catch {
      loadRules(); // Revert on error
    }

    setDraggedRuleId(null);
  };

  const handleDragEnd = () => {
    setDraggedRuleId(null);
  };

  const startEdit = (rule: BoardRule) => {
    setEditingRule(rule);
    setEditName(rule.name);
    setEditDescription(rule.description);
    setEditConfig({ ...rule.config });
    setEditEnabled(rule.enabled);
  };

  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    setShowCreateForm(false);
    setEditingRule(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={handleClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden z-10">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Gear size={20} className="text-sky-600" />
            <h2 className="text-base font-bold text-slate-800">Editor de Regras do Quadro</h2>
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

          {/* Rules List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">Regras Configuradas ({rules.length})</h3>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Nova Regra
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : rules.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <Gear size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">Nenhuma regra configurada</p>
                <p className="text-xs text-slate-400 mt-1">Clique em &ldquo;Nova Regra&rdquo; para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  editingRule?.id === rule.id ? (
                    <EditForm
                      key={rule.id}
                      rule={rule}
                      editName={editName}
                      setEditName={setEditName}
                      editDescription={editDescription}
                      setEditDescription={setEditDescription}
                      editConfig={editConfig}
                      setEditConfig={setEditConfig}
                      editEnabled={editEnabled}
                      setEditEnabled={setEditEnabled}
                      handleEdit={handleEdit}
                      onCancel={() => setEditingRule(null)}
                      loading={loading}
                      boardId={boardId}
                      columns={columns}
                      users={users}
                      projetos={projetos}
                    />
                  ) : (
                    <RuleItem
                      key={rule.id}
                      rule={rule}
                      draggedRuleId={draggedRuleId}
                      handleDragStart={handleDragStart}
                      handleDragOver={handleDragOver}
                      handleDrop={handleDrop}
                      handleDragEnd={handleDragEnd}
                      handleToggleEnabled={handleToggleEnabled}
                      handleDelete={handleDelete}
                      startEdit={startEdit}
                    />
                  )
                ))}
              </div>
            )}
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-5 animate-in fade-in slide-in-from-top-2 duration-150">
              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Plus size={14} className="text-sky-600" />
                Criar Nova Regra
              </h4>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Regra <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(RULE_TYPE_CONFIG) as RuleType[]).map((type) => {
                        const cfg = RULE_TYPE_CONFIG[type];
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleTypeChange(type)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                              newRuleType === type
                                ? `border-2 ${cfg.color} bg-white text-slate-800`
                                : "border-slate-200 text-slate-600 hover:border-sky-300"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className={`w-5 h-5 rounded flex items-center justify-center ${cfg.color}`}>
                                <cfg.icon size={12} className="text-white" />
                              </div>
                              <span>{cfg.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Regra <span className="text-red-500">*</span></label>
                    <input
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="Ex: Mover para Concluído ao finalizar"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
                  <textarea
                    value={newRuleDescription}
                    onChange={(e) => setNewRuleDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                    rows={2}
                    placeholder="Descreva o que esta regra faz..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Configuração</label>
                  <RuleConfigFields type={newRuleType} config={newRuleConfig} setConfig={setNewRuleConfig} boardId={boardId} columns={columns} users={users} projetos={projetos} />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-sky-100">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRuleEnabled}
                      onChange={(e) => setNewRuleEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-xs text-slate-600">Regra ativa após criação</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm shadow-sky-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? <> <CircleNotch size={12} className="animate-spin" /> Criando... </> : "Criar Regra"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Rule Type Descriptions */}
          <details className="group">
            <summary className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer">
              <Gear size={14} className="text-sky-600" />
              <span>Tipos de Regras Disponíveis</span>
              <span className="ml-auto text-slate-400 transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              {(Object.keys(RULE_TYPE_CONFIG) as RuleType[]).map((type) => {
                const cfg = RULE_TYPE_CONFIG[type];
                return (
                  <div key={type} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                    <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${cfg.color}`}>
                      <cfg.icon size={12} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{cfg.label}</p>
                      <p className="text-slate-500">{cfg.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
