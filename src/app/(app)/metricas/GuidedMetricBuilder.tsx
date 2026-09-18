import { useState } from "react";
import { Check, Plus } from "@phosphor-icons/react";
import { createMetricAnalysis } from "@/services/metricAnalyses";
import {
  getMetricSourceFilters,
  type MetricFilter,
  type MetricPeriod,
  type MetricVisualization,
} from "@/services/metrics";
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
  filterSourceId: string;
  filterKey: string;
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
  filterSourceId: "orders.count",
  filterKey: "orders.count.status",
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
  const selectedSources = [primarySource, secondarySource].filter(
    (source): source is NonNullable<typeof source> => Boolean(source),
  );
  const sourceFilters = getMetricSourceFilters(selectedSources);
  const selectedFilter =
    sourceFilters.find((item) => item.id === draft.filterKey) ?? sourceFilters[0];

  const selectFilterSource = (sourceId: string) => {
    const nextFilter = getMetricSourceFilters(
      selectedSources.filter((source) => source.id === sourceId),
    )[0];
    patch({
      filterSourceId: sourceId,
      filterKey: nextFilter?.id ?? "",
    });
  };

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
    const filters: MetricFilter[] = draft.filterValue.trim() && selectedFilter
      ? [{ field: selectedFilter.id, operator: "equals", value: draft.filterValue.trim() }]
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
      result: { status: "pending" },
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
          <select aria-label="Métrica A" value={draft.primaryId} onChange={(event) => {
            const primaryId = event.target.value;
            patch({
              primaryId,
              filterSourceId: primaryId,
              filterKey: `${primaryId}.${getMetricSource(primaryId)?.filterFields?.[0]?.id ?? ""}`,
            });
          }}>
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
          Filtrar dados de
          <select aria-label="Filtrar dados de" value={selectedFilter?.sourceId ?? draft.filterSourceId} onChange={(event) => selectFilterSource(event.target.value)}>
            {selectedSources.map((source) => <option key={source.id} value={source.id}>{source.label}</option>)}
          </select>
        </label>
        <label>
          Campo do filtro
          <select aria-label="Campo do filtro" value={selectedFilter?.id ?? ""} onChange={(event) => patch({ filterKey: event.target.value })}>
            {sourceFilters.filter((item) => item.sourceId === (selectedFilter?.sourceId ?? draft.filterSourceId)).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label>
          Valor do filtro
          <input aria-label="Valor do filtro" value={draft.filterValue} onChange={(event) => patch({ filterValue: event.target.value })} placeholder="Ex.: confirmado" />
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
