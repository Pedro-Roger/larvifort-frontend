"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AppWindow,
  ChatCircleText,
  CheckCircle,
  Gear,
  LinkSimple,
  PlugsConnected,
  ShieldCheck,
  ShoppingCart,
  Sparkle,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { fetchColumns, fetchProjetos, type Projeto, type TaskColumn } from "@/services/tasks";
import { loadOrderSettings, saveOrderSettings, type OrderSettings } from "@/services/orderSettings";

type SettingsSection = "pedidos" | "integracoes" | "whatsapp" | "hubfort" | "mobile";

type SettingsItem = {
  id: SettingsSection;
  title: string;
  eyebrow: string;
  description: string;
  icon: React.ElementType;
  status: "available" | "soon";
  items: string[];
};

const sections: SettingsItem[] = [
  {
    id: "pedidos",
    title: "Pedidos",
    eyebrow: "Quadro e produto",
    description:
      "Defina onde pedidos viram cards no quadro e qual produto/valor será usado no lançamento rápido.",
    icon: ShoppingCart,
    status: "available",
    items: ["Coluna automática", "Produto padrão", "Valor nos cards"],
  },
  {
    id: "integracoes",
    title: "Integrações",
    eyebrow: "Conexões externas",
    description:
      "Central para conectar o LarviFort com canais comerciais, automações e serviços externos.",
    icon: PlugsConnected,
    status: "soon",
    items: ["Canais de atendimento", "Sincronização comercial", "Automação entre módulos"],
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    eyebrow: "Atendimento e mensagens",
    description:
      "Envio e recebimento de conversas comerciais direto pelo CRM, vinculado a clientes e empresas.",
    icon: WhatsappLogo,
    status: "soon",
    items: ["Conversas por cliente", "Histórico no CRM", "Avisos e lembretes"],
  },
  {
    id: "hubfort",
    title: "HubFort",
    eyebrow: "Ecossistema LarviFort",
    description:
      "Área preparada para integrar o CRM com o HubFort e centralizar dados operacionais.",
    icon: LinkSimple,
    status: "soon",
    items: ["Dados compartilhados", "Acesso unificado", "Integrações futuras"],
  },
  {
    id: "mobile",
    title: "Aplicativo móvel",
    eyebrow: "App de campo",
    description:
      "Configurações futuras do app móvel, incluindo símbolo, identidade e recursos de campo.",
    icon: AppWindow,
    status: "soon",
    items: ["Símbolo do app", "Check-in em campo", "Agenda móvel"],
  },
];

function emptySettings(): OrderSettings {
  return loadOrderSettings();
}

export default function ConfiguracoesPage() {
  const [active, setActive] = useState<SettingsSection>("pedidos");
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [columns, setColumns] = useState<TaskColumn[]>([]);
  const [settings, setSettings] = useState<OrderSettings>(emptySettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selected = useMemo(
    () => sections.find((section) => section.id === active) ?? sections[0],
    [active],
  );
  const Icon = selected.icon;

  useEffect(() => {
    fetchProjetos().then(setProjetos).catch(() => setProjetos([]));
  }, []);

  useEffect(() => {
    if (!settings.projectId) return;
    fetchColumns(settings.projectId).then(setColumns).catch(() => setColumns([]));
  }, [settings.projectId]);

  function updateSettings<K extends keyof OrderSettings>(key: K, value: OrderSettings[K]) {
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    setSaving(true);
    saveOrderSettings(settings);
    setSaving(false);
    setSaved(true);
  }

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6 xl:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Administração
            </span>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Configurações
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Ajuste módulos da plataforma e prepare integrações futuras em um só lugar.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
            <ShieldCheck size={16} className="text-slate-500" />
            Ambiente seguro
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center gap-2 px-2 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Gear size={15} /> Menu
            </div>
            <nav className="space-y-1">
              {sections.map((section) => {
                const SectionIcon = section.icon;
                const isActive = active === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActive(section.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                      isActive
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-white/10" : "bg-slate-100"}`}>
                      <SectionIcon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{section.title}</span>
                      <span className={`block truncate text-[11px] ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                        {section.eyebrow}
                      </span>
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-500"}`}>
                      {section.status === "available" ? "Ativo" : "Em breve"}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-800">
                    <Icon size={28} weight="bold" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {selected.eyebrow}
                    </span>
                    <h2 className="mt-1 text-xl font-bold text-slate-950">{selected.title}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{selected.description}</p>
                  </div>
                </div>
                <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${selected.status === "available" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                  <Sparkle size={13} weight="fill" /> {selected.status === "available" ? "Ativo" : "Em breve"}
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {selected.items.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <CheckCircle size={16} className="text-slate-400" />
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selected.id === "pedidos" ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-950">Automação de pedidos</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Todo novo pedido pode virar card automaticamente na coluna escolhida.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                    Projeto do quadro
                    <select
                      value={settings.projectId ?? ""}
                      onChange={(event) => {
                        setColumns([]);
                        setSettings((current) => ({ ...current, projectId: event.target.value, columnId: "" }));
                        setSaved(false);
                      }}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="">Selecione um projeto</option>
                      {projetos.map((projeto) => (
                        <option key={projeto.id} value={projeto.id}>{projeto.name}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                    Coluna para receber pedidos
                    <select
                      value={settings.columnId ?? ""}
                      onChange={(event) => updateSettings("columnId", event.target.value)}
                      disabled={!settings.projectId}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
                    >
                      <option value="">Selecione uma coluna</option>
                      {columns.map((column) => (
                        <option key={column.id} value={column.id}>{column.title}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                    Produto padrão
                    <input
                      value={settings.defaultProductName}
                      onChange={(event) => updateSettings("defaultProductName", event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      placeholder="Larvas"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                      Unidade
                      <input
                        value={settings.defaultUnit}
                        onChange={(event) => updateSettings("defaultUnit", event.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        placeholder="un"
                      />
                    </label>
                    <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                      Valor unitário
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={settings.defaultUnitPrice}
                        onChange={(event) => updateSettings("defaultUnitPrice", Number(event.target.value || 0))}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      />
                    </label>
                  </div>
                </div>

                <label className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={settings.allowFromTask}
                    onChange={(event) => updateSettings("allowFromTask", event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600"
                  />
                  <span>
                    <strong className="block text-slate-900">Permitir pedido direto da tarefa</strong>
                    Ativa o ponto de configuração para criar pedido a partir do card quando o fluxo de tarefa pedir isso.
                  </span>
                </label>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    O valor total do pedido aparece no card e no total da coluna do quadro.
                  </p>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
                  >
                    {saving ? "Salvando..." : "Salvar configurações"}
                  </button>
                </div>
                {saved && <p className="mt-3 text-sm font-semibold text-emerald-700">Configurações salvas.</p>}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <ChatCircleText size={24} />
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">Configuração ainda não disponível</h3>
                <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
                  Esta área já está reservada para próximas integrações. Quando o recurso for liberado, os controles aparecerão aqui sem mudar o menu da plataforma.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
