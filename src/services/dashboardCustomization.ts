export type WidgetCategory =
  | "metas"
  | "vendas"
  | "equipe"
  | "clientes"
  | "atividades"
  | "metricas";

export type DashboardLayoutItem = {
  id: string;
  type: "standard" | "custom_metric";
  title: string;
  description: string;
  category: WidgetCategory;
  enabled: boolean;
  order: number;
};

export const DASHBOARD_LAYOUT_EVENT = "larvifort:dashboard-layout-changed";
const STORAGE_KEY = "larvifort:dashboard-layout:v2";

export const DEFAULT_STANDARD_WIDGETS: DashboardLayoutItem[] = [
  {
    id: "metas_overview",
    type: "standard",
    title: "Metas Comerciais & Progresso",
    description: "Visão global de faturamento R$ e volume em toneladas com atingimento e projeção",
    category: "metas",
    enabled: true,
    order: 0,
  },
  {
    id: "metas_consultores",
    type: "standard",
    title: "Metas & Desempenho por Consultor",
    description: "Ranking individual com cota, realizado, % de atingimento e regiões",
    category: "metas",
    enabled: true,
    order: 1,
  },
  {
    id: "goal_chart",
    type: "standard",
    title: "Gráfico de Metas (Realizado vs Meta)",
    description: "Comparativo visual em barras de Valor e Volume por vendedor",
    category: "metas",
    enabled: true,
    order: 2,
  },
  {
    id: "sales_rate",
    type: "standard",
    title: "Taxa de Conversão & Indicadores Comerciais",
    description: "Clientes ativos, taxa de conversão, ticket médio e vendas do mês",
    category: "vendas",
    enabled: true,
    order: 3,
  },
  {
    id: "team_workload",
    type: "standard",
    title: "Desempenho e Carga da Equipe",
    description: "Status das atividades de cada membro, tarefas concluídas e pendentes",
    category: "equipe",
    enabled: true,
    order: 4,
  },
  {
    id: "visit_chart",
    type: "standard",
    title: "Visitas a Clientes & Check-in GPS",
    description: "Gráfico de frequência de visitas presenciais por cliente",
    category: "clientes",
    enabled: true,
    order: 5,
  },
  {
    id: "client_frequency",
    type: "standard",
    title: "Frequência de Compras e Últimos Contatos",
    description: "Tabela detalhada com datas de última visita, último pedido e contato",
    category: "clientes",
    enabled: true,
    order: 6,
  },
  {
    id: "recent_activity",
    type: "standard",
    title: "Atividades Recentes do CRM",
    description: "Feed em tempo real das últimas movimentações no Kanban e tarefas",
    category: "atividades",
    enabled: true,
    order: 7,
  },
];

export function loadDashboardLayout(): DashboardLayoutItem[] {
  if (typeof window === "undefined") return DEFAULT_STANDARD_WIDGETS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STANDARD_WIDGETS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with default to ensure newly added standard widgets aren't missing
      const existingIds = new Set(parsed.map((item: DashboardLayoutItem) => item.id));
      const missingDefaults = DEFAULT_STANDARD_WIDGETS.filter((def) => !existingIds.has(def.id));
      const combined = [...parsed, ...missingDefaults].sort((a, b) => a.order - b.order);
      return combined;
    }
    return DEFAULT_STANDARD_WIDGETS;
  } catch {
    return DEFAULT_STANDARD_WIDGETS;
  }
}

export function saveDashboardLayout(items: DashboardLayoutItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const normalized = items.map((item, idx) => ({
      ...item,
      order: idx,
    }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event(DASHBOARD_LAYOUT_EVENT));
  } catch (err) {
    console.error("Failed to save dashboard layout:", err);
  }
}

export function toggleWidgetItem(id: string, forcedState?: boolean): DashboardLayoutItem[] {
  const current = loadDashboardLayout();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        enabled: typeof forcedState === "boolean" ? forcedState : !item.enabled,
      };
    }
    return item;
  });
  saveDashboardLayout(updated);
  return updated;
}

export function moveWidgetItem(id: string, direction: "up" | "down"): DashboardLayoutItem[] {
  const items = [...loadDashboardLayout()];
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return items;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return items;

  const [moved] = items.splice(index, 1);
  items.splice(targetIndex, 0, moved);

  saveDashboardLayout(items);
  return items;
}

export function resetDashboardLayout(): DashboardLayoutItem[] {
  saveDashboardLayout(DEFAULT_STANDARD_WIDGETS);
  return DEFAULT_STANDARD_WIDGETS;
}
