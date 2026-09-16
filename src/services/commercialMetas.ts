export type MetaConsultor = {
  nome: string;
  iniciais: string;
  regiao: string;
  contas: number;
  historico: string;
  valor: number;
  volume: number;
  realizadoValor?: number;
  realizadoVolume?: number;
  vendas?: number;
  conversao?: number;
};

export type CommercialGoalsConfig = {
  periodo: string;
  metaGlobalValor: number;
  metaGlobalVolume: number;
  consultores: MetaConsultor[];
  updatedAt: string;
};

export const COMMERCIAL_METAS_EVENT = "larvifort:commercial-metas-changed";
const STORAGE_KEY = "larvifort:commercial-metas:v2";

export const DEFAULT_REGIOES = [
  "Ribeirão Preto / SP",
  "Mato Grosso / MT",
  "Goiás / GO",
  "Paraná / PR",
  "Sul de Minas / MG",
  "Nordeste / CE-RN",
];

const DEFAULT_MEMBERS = [
  { nome: "João Silva", iniciais: "JS", regiao: "Ribeirão Preto / SP", contas: 24, historico: "R$ 1.8M", valor: 1200000, volume: 320, realizadoValor: 980000, realizadoVolume: 280, vendas: 18, conversao: 75 },
  { nome: "Maria Souza", iniciais: "MS", regiao: "Mato Grosso / MT", contas: 30, historico: "R$ 2.1M", valor: 1400000, volume: 380, realizadoValor: 1350000, realizadoVolume: 360, vendas: 22, conversao: 82 },
  { nome: "Carlos Santos", iniciais: "CS", regiao: "Goiás / GO", contas: 18, historico: "R$ 1.2M", valor: 950000, volume: 270, realizadoValor: 720000, realizadoVolume: 210, vendas: 14, conversao: 68 },
  { nome: "Ana Lima", iniciais: "AL", regiao: "Paraná / PR", contas: 20, historico: "R$ 1.4M", valor: 950000, volume: 280, realizadoValor: 890000, realizadoVolume: 250, vendas: 16, conversao: 72 },
];

export const DEFAULT_COMMERCIAL_GOALS: CommercialGoalsConfig = {
  periodo: "Q4 2026 · Safra",
  metaGlobalValor: 4500000,
  metaGlobalVolume: 1250,
  consultores: DEFAULT_MEMBERS,
  updatedAt: new Date().toISOString(),
};

export function loadCommercialGoals(): CommercialGoalsConfig {
  if (typeof window === "undefined") return DEFAULT_COMMERCIAL_GOALS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COMMERCIAL_GOALS;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.metaGlobalValor === "number" &&
      Array.isArray(parsed.consultores) &&
      parsed.consultores.length > 0
    ) {
      return parsed as CommercialGoalsConfig;
    }
    return DEFAULT_COMMERCIAL_GOALS;
  } catch {
    return DEFAULT_COMMERCIAL_GOALS;
  }
}

export function saveCommercialGoals(config: CommercialGoalsConfig): void {
  if (typeof window === "undefined") return;
  try {
    const payload: CommercialGoalsConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new Event(COMMERCIAL_METAS_EVENT));
  } catch (err) {
    console.error("Failed to save commercial goals:", err);
  }
}

export function calcGoalsTotals(config: CommercialGoalsConfig) {
  const totalIndividualValor = config.consultores.reduce((acc, curr) => acc + (curr.valor || 0), 0);
  const totalIndividualVolume = config.consultores.reduce((acc, curr) => acc + (curr.volume || 0), 0);
  const totalRealizadoValor = config.consultores.reduce((acc, curr) => acc + (curr.realizadoValor || 0), 0);
  const totalRealizadoVolume = config.consultores.reduce((acc, curr) => acc + (curr.realizadoVolume || 0), 0);

  const pctValor = config.metaGlobalValor > 0 ? (totalRealizadoValor / config.metaGlobalValor) * 100 : 0;
  const pctVolume = config.metaGlobalVolume > 0 ? (totalRealizadoVolume / config.metaGlobalVolume) * 100 : 0;
  const diferencaValor = config.metaGlobalValor - totalIndividualValor;

  return {
    totalIndividualValor,
    totalIndividualVolume,
    totalRealizadoValor,
    totalRealizadoVolume,
    pctValor: Math.min(Math.round(pctValor), 100),
    pctVolume: Math.min(Math.round(pctVolume), 100),
    rawPctValor: pctValor,
    rawPctVolume: pctVolume,
    diferencaValor,
  };
}
