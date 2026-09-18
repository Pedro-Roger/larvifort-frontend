import { useState } from "react";
import { Check, Plus } from "@phosphor-icons/react";
import { createMetricAnalysis } from "@/services/metricAnalyses";
import type { MetricFilter, MetricPeriod, MetricVisualization } from "@/services/metrics";
import {
  getMetricSource,
  METRIC_BUILDER_PERIODS,
  METRIC_BUILDER_SOURCES,
  METRIC_BUILDER_VISUALIZATIONS,
  TEMPORAL_DIMENSION,
} from "./metricBuilderOptions";
import styles from "./metrics.module.css";

type Draft = {
  name: string;
  primaryId: string;
  secondaryId: string;
  period: MetricPeriod;
  visualization: MetricVisualization;
  includeTime: boolean;
  filterValue: string;
  target: string;
};

const initialDraft: Draft = {
  name: "",
  primaryId: "orders.count",
  secondaryId: "",
  period: "MONTHLY",
  visualization: "chart",
  includeTime: true,
  filterValue: "",
  target: "",
};

export default function GuidedMetricBuilder({ onSaved }: { onSaved?: () => void }) {
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [message, setMessage] = useState("");
  const patch = (changes: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setMessage("");
  };
  const primarySource = getMetricSource(draft.primaryId);
  const secondarySource = draft.secondaryId ? getMetricSource(draft.secondaryId) : undefined;

  const save = () => {
    if (!primarySource) {
      setMessage("Escolha a fonte principal da análise.");
      return;
    }
    if (!draft.includeTime) {
      setMessage("Inclua o período para salvar uma análise comparável.");
      return;
    }
    const target = Number(draft.target);
    const filters: MetricFilter[] = draft.filterValue.trim()
      ? [{ field: "status", operator: "equals", value: draft.filterValue.trim() }]
      : [];
    createMetricAnalysis({
      name: draft.name.trim() || `${primarySource.label}${secondarySource ? ` x ${secondarySource.label}` : ""}`,
      mode: "guided",
      primarySource,
      secondarySource,
      filters,
      dimensions: [TEMPORAL_DIMENSION],
      period: draft.period,
      visualization: draft.visualization,
      goal: Number.isFinite(target) && target > 0 ? { target } : undefined,
      publishedToDashboard: false,
    });
    setMessage("Análise salva. Ela já está disponível em Blocos.");
    onSaved?.();
  };

  return (
    <section id="metric-builder-guided" role="tabpanel" aria-labelledby="metric-mode-guided" className={styles.builder}>
      <div className={styles.builderHeading}>
        <div>
          <h3>Construtor guiado</h3>
          <p>Escolha o que deseja comparar e salve a análise quando estiver pronta.</p>
        </div>
      </div>
      <div className={styles.builderGrid}>
        <label>
          Nome da análise
          <input aria-label="Nome da análise" value={draft.name} onChange={(event) => patch({ name: event.target.value })} placeholder="Ex.: Visitas x pedidos do mês" />
        </label>
        <label>
          Métrica A
          <select aria-label="Métrica A" value={draft.primaryId} onChange={(event) => patch({ primaryId: event.target.value })}>
            {METRIC_BUILDER_SOURCES.map((source) => <option key={source.id} value={source.id}>{source.label}</option>)}
          </select>
        </label>
        <label>
          Comparar com
          <select aria-label="Métrica B" value={draft.secondaryId} onChange={(event) => patch({ secondaryId: event.target.value })}>
            <option value="">Sem comparação</option>
            {METRIC_BUILDER_SOURCES.filter((source) => source.id !== draft.primaryId).map((source) => <option key={source.id} value={source.id}>{source.label}</option>)}
          </select>
        </label>
        <label>
          Período
          <select aria-label="Período da análise" value={draft.period} onChange={(event) => patch({ period: event.target.value as MetricPeriod })}>
            {METRIC_BUILDER_PERIODS.map((period) => <option key={period.id} value={period.id}>{period.label}</option>)}
          </select>
        </label>
        <label>
          Visualização
          <select aria-label="Visualização" value={draft.visualization} onChange={(event) => patch({ visualization: event.target.value as MetricVisualization })}>
            {METRIC_BUILDER_VISUALIZATIONS.map((visualization) => <option key={visualization.id} value={visualization.id}>{visualization.label}</option>)}
          </select>
        </label>
        <label>
          Filtro por status
          <input aria-label="Filtro por status" value={draft.filterValue} onChange={(event) => patch({ filterValue: event.target.value })} placeholder="Ex.: confirmado" />
        </label>
        <label>
          Meta opcional
          <input aria-label="Meta opcional" type="number" min="0" value={draft.target} onChange={(event) => patch({ target: event.target.value })} placeholder="Ex.: 100" />
        </label>
      </div>
      <label className={styles.checkboxField}>
        <input type="checkbox" checked={draft.includeTime} onChange={(event) => patch({ includeTime: event.target.checked })} />
        Incluir período na comparação
      </label>
      <div className={styles.builderActions}>
        <button type="button" className={styles.primary} onClick={save}><Plus size={16} /> Salvar análise</button>
        {message && <span role="status"><Check size={15} /> {message}</span>}
      </div>
    </section>
  );
}
