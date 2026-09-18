import { useEffect, useState } from "react";
import { Copy, Eye, EyeSlash, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import {
  createMetricAnalysis,
  duplicateMetricAnalysis,
  loadMetricAnalyses,
  METRIC_ANALYSES_EVENT,
  removeMetricAnalysis,
  setMetricAnalysisPublished,
  updateMetricAnalysis,
} from "@/services/metricAnalyses";
import type { MetricAnalysis, MetricPeriod, MetricVisualization } from "@/services/metrics";
import {
  getMetricSource,
  METRIC_BUILDER_PERIODS,
  METRIC_BUILDER_SOURCES,
  METRIC_BUILDER_VISUALIZATIONS,
  TEMPORAL_DIMENSION,
} from "./metricBuilderOptions";
import styles from "./metrics.module.css";

type Editor = {
  id?: string;
  name: string;
  primaryId: string;
  secondaryId: string;
  period: MetricPeriod;
  visualization: MetricVisualization;
};

const emptyEditor = (): Editor => ({
  name: "",
  primaryId: "orders.count",
  secondaryId: "",
  period: "MONTHLY",
  visualization: "chart",
});

function editorFromAnalysis(analysis: MetricAnalysis): Editor {
  return {
    id: analysis.id,
    name: analysis.name,
    primaryId: analysis.primarySource.id,
    secondaryId: analysis.secondarySource?.id ?? "",
    period: analysis.period,
    visualization: analysis.visualization,
  };
}

export default function MetricBlocksView() {
  const [analyses, setAnalyses] = useState<MetricAnalysis[]>([]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [message, setMessage] = useState("");
  const refresh = () => setAnalyses(loadMetricAnalyses());

  useEffect(() => {
    void Promise.resolve().then(refresh);
    window.addEventListener(METRIC_ANALYSES_EVENT, refresh);
    return () => window.removeEventListener(METRIC_ANALYSES_EVENT, refresh);
  }, []);

  const saveEditor = () => {
    if (!editor) return;
    const primarySource = getMetricSource(editor.primaryId);
    if (!primarySource) {
      setMessage("Escolha uma fonte para salvar a análise.");
      return;
    }
    const secondarySource = editor.secondaryId ? getMetricSource(editor.secondaryId) : undefined;
    const changes = {
      name: editor.name.trim() || primarySource.label,
      primarySource,
      secondarySource,
      period: editor.period,
      visualization: editor.visualization,
    };
    if (editor.id) updateMetricAnalysis(editor.id, changes);
    else createMetricAnalysis({ ...changes, mode: "blocks", filters: [], dimensions: [TEMPORAL_DIMENSION], publishedToDashboard: false });
    setEditor(null);
    setMessage("Análise atualizada.");
  };

  const remove = (id: string) => {
    removeMetricAnalysis(id);
    setMessage("Análise excluída.");
  };

  return (
    <section id="metric-builder-blocks" role="tabpanel" aria-labelledby="metric-mode-blocks" className={styles.builder}>
      <div className={styles.builderHeading}>
        <div>
          <h3>Análises salvas</h3>
          <p>Edite ou publique os blocos que fazem sentido para o dashboard.</p>
        </div>
        <button type="button" className={styles.primary} onClick={() => { setEditor(emptyEditor()); setMessage(""); }}><Plus size={16} /> Adicionar análise</button>
      </div>
      {editor && (
        <div className={styles.inlineEditor} aria-label="Editor de análise">
          <label>Nome<input aria-label="Nome do bloco" value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} /></label>
          <label>Métrica A<select aria-label="Métrica A do bloco" value={editor.primaryId} onChange={(event) => setEditor({ ...editor, primaryId: event.target.value })}>{METRIC_BUILDER_SOURCES.map((source) => <option key={source.id} value={source.id}>{source.label}</option>)}</select></label>
          <label>Comparar com<select aria-label="Métrica B do bloco" value={editor.secondaryId} onChange={(event) => setEditor({ ...editor, secondaryId: event.target.value })}><option value="">Sem comparação</option>{METRIC_BUILDER_SOURCES.filter((source) => source.id !== editor.primaryId).map((source) => <option key={source.id} value={source.id}>{source.label}</option>)}</select></label>
          <label>Período<select aria-label="Período do bloco" value={editor.period} onChange={(event) => setEditor({ ...editor, period: event.target.value as MetricPeriod })}>{METRIC_BUILDER_PERIODS.map((period) => <option key={period.id} value={period.id}>{period.label}</option>)}</select></label>
          <label>Visualização<select aria-label="Visualização do bloco" value={editor.visualization} onChange={(event) => setEditor({ ...editor, visualization: event.target.value as MetricVisualization })}>{METRIC_BUILDER_VISUALIZATIONS.map((visualization) => <option key={visualization.id} value={visualization.id}>{visualization.label}</option>)}</select></label>
          <div className={styles.inlineEditorActions}><button type="button" className={styles.secondary} onClick={() => setEditor(null)}>Cancelar</button><button type="button" className={styles.primary} onClick={saveEditor}>Salvar</button></div>
        </div>
      )}
      {!analyses.length ? (
        <div className={styles.emptyState}><p>Nenhuma análise salva ainda.</p><span>Use “Adicionar análise” ou o modo Guiado para começar.</span></div>
      ) : (
        <div className={styles.blocksGrid}>
          {analyses.map((analysis) => (
            <article className={styles.analysisBlock} key={analysis.id}>
              <div>
                <h4>{analysis.name}</h4>
                <p>{analysis.primarySource.label}{analysis.secondarySource ? ` x ${analysis.secondarySource.label}` : ""} · {METRIC_BUILDER_PERIODS.find((period) => period.id === analysis.period)?.label}</p>
              </div>
              <span className={styles.blockVisualization}>{METRIC_BUILDER_VISUALIZATIONS.find((item) => item.id === analysis.visualization)?.label}</span>
              <div className={styles.blockActions}>
                <button type="button" aria-label={`Editar ${analysis.name}`} onClick={() => { setEditor(editorFromAnalysis(analysis)); setMessage(""); }}><PencilSimple size={16} /></button>
                <button type="button" aria-label={`Duplicar ${analysis.name}`} onClick={() => { duplicateMetricAnalysis(analysis.id); setMessage("Análise duplicada."); }}><Copy size={16} /></button>
                <button type="button" aria-label={analysis.publishedToDashboard ? `Ocultar ${analysis.name} do dashboard` : `Publicar ${analysis.name} no dashboard`} onClick={() => { setMetricAnalysisPublished(analysis.id, !analysis.publishedToDashboard); setMessage(analysis.publishedToDashboard ? "Análise ocultada do dashboard." : "Análise publicada no dashboard."); }}>{analysis.publishedToDashboard ? <EyeSlash size={16} /> : <Eye size={16} />}</button>
                <button type="button" aria-label={`Excluir ${analysis.name}`} className={styles.danger} onClick={() => remove(analysis.id)}><Trash size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
      {message && <p className={styles.builderMessage} role="status">{message}</p>}
    </section>
  );
}
