"use client";

import { useMemo, useState } from "react";
import {
  AppWindow,
  ChatCircleText,
  CheckCircle,
  Gear,
  LinkSimple,
  PlugsConnected,
  ShieldCheck,
  Sparkle,
  WhatsappLogo,
} from "@phosphor-icons/react";

type SettingsSection = "integracoes" | "whatsapp" | "hubfort" | "mobile";

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
    id: "integracoes",
    title: "Integrações",
    eyebrow: "Conexões externas",
    description:
      "Central para conectar o LarviFort com canais comerciais, automações e serviços externos.",
    icon: PlugsConnected,
    status: "soon",
    items: [
      "Canais de atendimento",
      "Sincronização comercial",
      "Automação entre módulos",
    ],
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

export default function ConfiguracoesPage() {
  const [active, setActive] = useState<SettingsSection>("integracoes");
  const selected = useMemo(
    () => sections.find((section) => section.id === active) ?? sections[0],
    [active],
  );
  const Icon = selected.icon;

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
              Organize integrações, canais e recursos futuros da plataforma em
              um só lugar.
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
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isActive ? "bg-white/10" : "bg-slate-100"
                      }`}
                    >
                      <SectionIcon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">
                        {section.title}
                      </span>
                      <span
                        className={`block truncate text-[11px] ${
                          isActive ? "text-slate-300" : "text-slate-400"
                        }`}
                      >
                        {section.eyebrow}
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-white/10 text-slate-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      Em breve
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
                    <h2 className="mt-1 text-xl font-bold text-slate-950">
                      {selected.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      {selected.description}
                    </p>
                  </div>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  <Sparkle size={13} weight="fill" /> Em breve
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {selected.items.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <CheckCircle size={16} className="text-slate-400" />
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <ChatCircleText size={24} />
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900">
                Configuração ainda não disponível
              </h3>
              <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
                Esta área já está reservada para próximas integrações. Quando o
                recurso for liberado, os controles aparecerão aqui sem mudar o
                menu da plataforma.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
