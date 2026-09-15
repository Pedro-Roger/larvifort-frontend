"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChartBar,
  Check,
  CheckCircle,
  UsersThree,
  CalendarDots,
  Target,
  SpinnerGap,
} from "@phosphor-icons/react";
import {
  createMetricGoal,
  defaultMetricDates,
  fetchMetricGoals,
  fetchMetricsOptions,
  METRIC_TYPES,
  METRIC_PERIODS,
  type MetricGoal,
  type MetricGoalInput,
  type MetricTeam,
} from "@/services/metrics";
import MetricsAnalysis from "./MetricsAnalysis";
import styles from "./metrics.module.css";

export default function MetricsPage() {
  const [teams, setTeams] = useState<MetricTeam[]>([]);
  const [goals, setGoals] = useState<MetricGoal[]>([]);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<MetricGoalInput>(() => ({
    name: "",
    teamId: "",
    userIds: [],
    type: "SALES",
    period: "WEEKLY",
    target: 0,
    ...defaultMetricDates(),
  }));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [success, setSuccess] = useState("");
  const [savedId, setSavedId] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([fetchMetricsOptions(), fetchMetricGoals()])
      .then(([options, stored]) => {
        if (!active) return;
        setTeams(options.teams);
        setGoals(stored);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as métricas.",
        );
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadAttempt]);
  const team = teams.find((item) => item.id === form.teamId);
  const patch = (value: Partial<MetricGoalInput>) => {
    setForm((previous) => ({ ...previous, ...value }));
    setSuccess("");
    setSaveError("");
    setSavedId("");
  };
  const selectedType = METRIC_TYPES.find((item) => item.id === form.type)!;
  const datesValid = Boolean(
    form.startDate && form.endDate && form.startDate <= form.endDate,
  );
  const canAdvance =
    step === 1 ? Boolean(team && team.members.length) : form.userIds.length > 0;
  const reset = () => {
    setStep(1);
    setForm({
      name: "",
      teamId: "",
      userIds: [],
      type: "SALES",
      period: "WEEKLY",
      target: 0,
      ...defaultMetricDates(),
    });
    setSuccess("");
    setSaveError("");
    setSavedId("");
  };
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (
      saving ||
      savedId ||
      !team ||
      !form.userIds.length ||
      !datesValid ||
      !form.name.trim() ||
      !Number.isFinite(form.target) ||
      form.target <= 0
    )
      return;
    setSaving(true);
    setSaveError("");
    setSuccess("");
    try {
      const goal = await createMetricGoal({ ...form, name: form.name.trim() });
      setGoals((previous) => [goal, ...previous]);
      setSavedId(goal.id);
      setSuccess("Meta criada com sucesso.");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a meta. Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <div>
          <h1>Métricas</h1>
          <p>Defina metas e acompanhe a evolução do seu time.</p>
        </div>
        <Link href="/dashboard">
          Ver dashboard <ArrowRight size={15} />
        </Link>
      </div>
      {loadError ? (
        <div className={styles.error} role="alert">
          <p>{loadError}</p>
          <button
            onClick={() => {
              setLoading(true);
              setLoadError("");
              setLoadAttempt((value) => value + 1);
            }}
          >
            Tentar novamente
          </button>
        </div>
      ) : loading ? (
        <div className={styles.loading} role="status">
          <SpinnerGap size={24} className={styles.spinner} /> Carregando times e
          metas…
        </div>
      ) : (
        <>
          <div className={styles.workspace}>
            <section className={styles.wizard} aria-label="Criar meta">
              <div className={styles.topline}>
                <button
                  onClick={() => (step > 1 ? setStep(step - 1) : reset())}
                  disabled={saving}
                >
                  <ArrowLeft size={14} /> Voltar
                </button>
                <span>Etapa {step} de 3</span>
              </div>
              <h2>Vamos criar sua meta?</h2>
              <p className={styles.intro}>
                Selecione o time, as pessoas e personalize sua meta para
                acompanhar os resultados.
              </p>
              <ol className={styles.steps} aria-label="Etapas de criação">
                {[
                  "Selecione o Time",
                  "Selecione Pessoas",
                  "Personalize a meta",
                ].map((label, index) => (
                  <li
                    key={label}
                    className={index + 1 <= step ? styles.activeStep : ""}
                    aria-current={index + 1 === step ? "step" : undefined}
                  >
                    <span>
                      {index + 1 < step ? <Check size={15} /> : index + 1}
                    </span>
                    <small>{label}</small>
                  </li>
                ))}
              </ol>
              <form onSubmit={save} className={styles.form}>
                <fieldset disabled={saving} className={styles.fields}>
                  {step === 1 && (
                    <>
                      <h3>Selecione o Time</h3>
                      <p className={styles.muted}>
                        Escolha o time que será responsável pela meta.
                      </p>
                      {teams.length ? (
                        <div className={styles.teamGrid}>
                          {teams.map((item) => (
                            <button
                              type="button"
                              key={item.id}
                              aria-pressed={form.teamId === item.id}
                              className={`${styles.teamButton} ${form.teamId === item.id ? styles.selected : ""}`}
                              onClick={() =>
                                patch({ teamId: item.id, userIds: [] })
                              }
                            >
                              <ChartBar size={25} />
                              {form.teamId === item.id && (
                                <CheckCircle
                                  weight="fill"
                                  size={18}
                                  className={styles.check}
                                />
                              )}
                              <strong>{item.name}</strong>
                              <small>
                                {item.members.length}{" "}
                                {item.members.length === 1
                                  ? "pessoa disponível"
                                  : "pessoas disponíveis"}
                              </small>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.empty}>
                          Nenhum time disponível.{" "}
                          <Link href="/equipe">
                            Cadastre um time em Equipe.
                          </Link>
                        </div>
                      )}
                      <h4 className={styles.descriptionHeading}>
                        Descrição do time
                      </h4>
                      <div className={styles.teamDescription}>
                        <span className={styles.iconTile}>
                          <ChartBar size={24} />
                        </span>
                        <div>
                          <strong>{team?.name ?? "Escolha um time"}</strong>
                          <p>
                            {team
                              ? `${team.members.length} pessoas ativas para participar da meta e acompanhar os resultados.`
                              : "Os times cadastrados aparecem acima. Selecione um para começar."}
                          </p>
                          {team && !team.members.length && (
                            <Link href="/equipe">
                              Adicione pessoas ao time para continuar.
                            </Link>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <h3>Selecione as Pessoas</h3>
                      <p className={styles.muted}>
                        Quem vai participar da meta do time {team?.name}?
                      </p>
                      <div className={styles.peopleTop}>
                        <span>{form.userIds.length} selecionadas</span>
                        <button
                          type="button"
                          onClick={() =>
                            patch({
                              userIds:
                                form.userIds.length === team?.members.length
                                  ? []
                                  : (team?.members.map((member) => member.id) ??
                                    []),
                            })
                          }
                        >
                          {form.userIds.length === team?.members.length
                            ? "Desmarcar todas"
                            : "Selecionar todas"}
                        </button>
                      </div>
                      <div className={styles.people}>
                        {team?.members.map((member) => (
                          <label
                            key={member.id}
                            className={
                              form.userIds.includes(member.id)
                                ? styles.selectedPerson
                                : ""
                            }
                          >
                            <span className={styles.avatar}>
                              {member.name
                                .split(" ")
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")}
                            </span>
                            <span>{member.name}</span>
                            <input
                              type="checkbox"
                              aria-label={member.name}
                              checked={form.userIds.includes(member.id)}
                              onChange={(event) =>
                                patch({
                                  userIds: event.target.checked
                                    ? [...form.userIds, member.id]
                                    : form.userIds.filter(
                                        (id) => id !== member.id,
                                      ),
                                })
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <h3>Personalize a meta</h3>
                      <p className={styles.muted}>
                        {team?.name} · {form.userIds.length} pessoas
                        selecionadas
                      </p>
                      <div className={styles.inputs}>
                        <label>
                          Nome da meta
                          <input
                            required
                            maxLength={120}
                            value={form.name}
                            onChange={(event) =>
                              patch({ name: event.target.value })
                            }
                            placeholder="Ex.: Vendas de setembro"
                          />
                        </label>
                        <label>
                          Tipo de meta
                          <select
                            value={form.type}
                            onChange={(event) =>
                              patch({
                                type: event.target
                                  .value as MetricGoalInput["type"],
                              })
                            }
                          >
                            {METRIC_TYPES.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Valor da meta{" "}
                          {form.type === "SALES" ? "(R$)" : "(quantidade)"}
                          <input
                            required
                            type="number"
                            min={form.type === "SALES" ? "0.01" : "1"}
                            step={form.type === "SALES" ? "0.01" : "1"}
                            value={form.target || ""}
                            onChange={(event) =>
                              patch({ target: Number(event.target.value) })
                            }
                            placeholder="0"
                          />
                        </label>
                        <div className={styles.dateRow}>
                          <label>
                            Data inicial
                            <input
                              required
                              type="date"
                              value={form.startDate}
                              onChange={(event) =>
                                patch({ startDate: event.target.value })
                              }
                            />
                          </label>
                          <label>
                            Data final
                            <input
                              required
                              type="date"
                              min={form.startDate}
                              value={form.endDate}
                              onChange={(event) =>
                                patch({ endDate: event.target.value })
                              }
                            />
                          </label>
                        </div>
                        {!datesValid && (
                          <p className={styles.fieldError}>
                            A data final deve ser igual ou posterior à inicial.
                          </p>
                        )}
                        <p className={styles.note}>
                          A meta vale para todo o intervalo. O período escolhido
                          à direita define como os resultados são agrupados.
                        </p>
                      </div>
                    </>
                  )}
                </fieldset>
                {saveError && (
                  <div role="alert" className={styles.error}>
                    {saveError}
                  </div>
                )}
                {success && (
                  <div role="status" className={styles.success}>
                    <CheckCircle size={20} />
                    {success}
                  </div>
                )}
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={reset}
                    disabled={saving}
                  >
                    {savedId ? "Nova meta" : "Cancelar"}
                  </button>
                  {step < 3 ? (
                    <button
                      type="button"
                      className={styles.primary}
                      disabled={!canAdvance}
                      onClick={() => setStep(step + 1)}
                    >
                      Próximo <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className={styles.primary}
                      disabled={
                        saving ||
                        Boolean(savedId) ||
                        !datesValid ||
                        !form.target ||
                        !form.name.trim()
                      }
                    >
                      {saving
                        ? "Salvando…"
                        : savedId
                          ? "Meta salva"
                          : "Criar meta"}
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </form>
            </section>
            <section
              className={styles.analysisPanel}
              aria-label="Visualização e análise"
            >
              <MetricsAnalysis
                filter={form}
                enabled={Boolean(team)}
                target={form.target}
              />
              <div className={styles.configuration}>
                <section className={styles.configCard}>
                  <h3>Tipos de Meta</h3>
                  <p className={styles.muted}>
                    Escolha o tipo de meta que deseja definir.
                  </p>
                  <div className={styles.typeList}>
                    {METRIC_TYPES.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        disabled={saving}
                        aria-pressed={form.type === item.id}
                        onClick={() => patch({ type: item.id })}
                      >
                        <span
                          className={`${styles.typeIcon} ${styles["type" + index]}`}
                        >
                          <Target size={18} />
                        </span>
                        <span>
                          <strong>{item.label}</strong>
                          <small>{item.description}</small>
                        </span>
                        <ArrowRight size={13} />
                      </button>
                    ))}
                  </div>
                </section>
                <section className={styles.configCard}>
                  <h3>Período</h3>
                  <p className={styles.muted}>
                    Defina o agrupamento do acompanhamento.
                  </p>
                  <div className={styles.periods}>
                    {METRIC_PERIODS.map((item) => (
                      <button
                        type="button"
                        disabled={saving}
                        key={item.id}
                        aria-pressed={form.period === item.id}
                        className={
                          form.period === item.id ? styles.selected : ""
                        }
                        onClick={() => patch({ period: item.id })}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className={styles.periodInfo}>
                    <CalendarDots size={22} />
                    <div>
                      <strong>
                        Visualização{" "}
                        {METRIC_PERIODS.find(
                          (item) => item.id === form.period,
                        )?.label.toLowerCase()}
                      </strong>
                      <p>
                        {selectedType.label} agrupadas no período escolhido.
                      </p>
                    </div>
                  </div>
                  <div className={styles.analysisDates}>
                    <label>
                      Analisar de
                      <input
                        type="date"
                        value={form.startDate}
                        disabled={saving}
                        onChange={(event) =>
                          patch({ startDate: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      Até
                      <input
                        type="date"
                        min={form.startDate}
                        value={form.endDate}
                        disabled={saving}
                        onChange={(event) =>
                          patch({ endDate: event.target.value })
                        }
                      />
                    </label>
                  </div>
                </section>
              </div>
            </section>
          </div>
          <section className={styles.savedGoals}>
            <div>
              <h2>Metas salvas</h2>
              <p className={styles.muted}>
                Selecione uma meta para consultar sua configuração e os
                resultados.
              </p>
            </div>
            {goals.length ? (
              <div className={styles.goalList}>
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    disabled={saving}
                    onClick={() => {
                      setForm({
                        ...goal,
                        startDate: goal.startDate.slice(0, 10),
                        endDate: goal.endDate.slice(0, 10),
                      });
                      setStep(3);
                      setSavedId(goal.id);
                      setSuccess("");
                      setSaveError("");
                    }}
                  >
                    <Target size={23} />
                    <span>
                      <strong>{goal.name}</strong>
                      <small>
                        {teams.find((item) => item.id === goal.teamId)?.name ??
                          "Time"}{" "}
                        ·{" "}
                        {
                          METRIC_TYPES.find((item) => item.id === goal.type)
                            ?.label
                        }{" "}
                        ·{" "}
                        {goal.target.toLocaleString(
                          "pt-BR",
                          goal.type === "SALES"
                            ? { style: "currency", currency: "BRL" }
                            : {},
                        )}
                      </small>
                    </span>
                    <ArrowRight size={18} />
                  </button>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>
                <UsersThree size={24} />
                Suas metas aparecerão aqui depois de salvar.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
