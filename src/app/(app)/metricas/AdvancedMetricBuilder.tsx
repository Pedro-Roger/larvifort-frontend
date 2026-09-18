import { useMemo, useState } from "react";
import { Check, Plus } from "@phosphor-icons/react";
import { createMetricAnalysis } from "@/services/metricAnalyses";
import type { MetricOperation, MetricPeriod, MetricVisualization } from "@/services/metrics";
import {
  getMetricSource,
  buildMetricExpression,
  isBinaryMetricOperation,
  METRIC_BUILDER_OPERATIONS,
  METRIC_BUILDER_PERIODS,
  METRIC_BUILDER_SOURCES,
  METRIC_BUILDER_VISUALIZATIONS,
  TEMPORAL_DIMENSION,
} from "./metricBuilderOptions";
import styles from "./metrics.module.css";

export default function AdvancedMetricBuilder({ onSaved }: { onSaved?: () => void }) {
  const [name, setName] = useState("");
  const [sourceIds, setSourceIds] = useState<string[]>(["orders.count", "appointments.visits"]);
  const [operation, setOperation] = useState<MetricOperation>("ratio");
  const [period, setPeriod] = useState<MetricPeriod>("MONTHLY");
  const [visualization, setVisualization] = useState<MetricVisualization>("chart");
  const [includeTime, setIncludeTime] = useState(true);
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");
  const sources = useMemo(() => sourceIds.map(getMetricSource).filter((source): source is NonNullable<typeof source> => Boolean(source)), [sourceIds]);
  const expression = useMemo(() => buildMetricExpression(operation, sources), [operation, sources]);
  const requiresPair = isBinaryMetricOperation(operation);
  const invalidExpression = !sources.length || (requiresPair && sources.length < 2);

  const toggleSource = (id: string) => {
    setSourceIds((current) => current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id]);
    setMessage("");
  };
  const save = () => {
    if (invalidExpression) {
      setMessage("Selecione as fontes exigidas pela operação escolhida.");
      return;
    }
    if (!includeTime) {
      setMessage("Inclua o período para salvar uma análise comparável.");
      return;
    }
    const numericTarget = Number(target);
    createMetricAnalysis({
      name: name.trim() || expression,
      mode: "advanced",
      primarySource: sources[0],
      secondarySource: sources[1],
      sources,
      filters: [],
      dimensions: [TEMPORAL_DIMENSION],
      period,
      visualization,
      goal: Number.isFinite(numericTarget) && numericTarget > 0 ? { target: numericTarget } : undefined,
      definition: expression,
      operation,
      result: { status: "pending" },
      publishedToDashboard: false,
    });
    setMessage("Análise avançada salva. Ela já está disponível em Blocos.");
    onSaved?.();
  };

  return (
    <section id="metric-builder-advanced" role="tabpanel" aria-labelledby="metric-mode-advanced" className={styles.builder}>
      <div className={styles.builderHeading}><div><h3>Construtor avançado</h3><p>Combine fontes com uma regra de cálculo visível antes de salvar.</p></div></div>
      <div className={styles.builderGrid}>
        <label>Nome da análise<input aria-label="Nome da análise avançada" value={name} onChange={(event) => { setName(event.target.value); setMessage(""); }} placeholder="Ex.: Pedidos por visita" /></label>
        <label>Operação<select aria-label="Operação" value={operation} onChange={(event) => { const nextOperation = event.target.value as MetricOperation; setOperation(nextOperation); if (isBinaryMetricOperation(nextOperation)) setSourceIds((current) => current.slice(0, 2)); setMessage(""); }}>{(Object.keys(METRIC_BUILDER_OPERATIONS) as MetricOperation[]).map((value) => <option key={value} value={value}>{METRIC_BUILDER_OPERATIONS[value]}</option>)}</select></label>
        <label>Período<select aria-label="Período avançado" value={period} onChange={(event) => setPeriod(event.target.value as MetricPeriod)}>{METRIC_BUILDER_PERIODS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label>Visualização<select aria-label="Visualização avançada" value={visualization} onChange={(event) => setVisualization(event.target.value as MetricVisualization)}>{METRIC_BUILDER_VISUALIZATIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label>Meta opcional<input aria-label="Meta avançada" type="number" min="0" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="Ex.: 85" /></label>
      </div>
      <fieldset className={styles.sourcePicker}><legend>Fontes da análise{requiresPair ? " (operações binárias usam duas fontes)" : ""}</legend>{METRIC_BUILDER_SOURCES.map((source) => <label key={source.id}><input type="checkbox" checked={sourceIds.includes(source.id)} disabled={requiresPair && !sourceIds.includes(source.id) && sourceIds.length >= 2} onChange={() => toggleSource(source.id)} />{source.label}</label>)}</fieldset>
      <label className={styles.checkboxField}><input type="checkbox" checked={includeTime} onChange={(event) => setIncludeTime(event.target.checked)} />Incluir período na comparação</label>
      <div className={styles.expression} aria-live="polite"><span>Expressão</span><strong>{expression}</strong></div>
      <div className={styles.builderActions}><button type="button" className={styles.primary} onClick={save}><Plus size={16} /> Salvar análise</button>{message && <span role="status"><Check size={15} /> {message}</span>}</div>
    </section>
  );
}
