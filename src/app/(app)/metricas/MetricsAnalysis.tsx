"use client";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartBar,
  Table,
  SquaresFour,
  ArrowClockwise,
} from "@phosphor-icons/react";
import {
  fetchMetricAnalysis,
  METRIC_TYPES,
  type MetricAnalysis,
  type MetricGoalInput,
} from "@/services/metrics";
import styles from "./metrics.module.css";
const COLORS = ["#0866ff", "#78b3ff", "#40c4aa", "#ff9035"];
const number = (value: number) =>
  value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
export default function MetricsAnalysis({
  filter,
  enabled,
  target,
}: {
  filter: MetricGoalInput;
  enabled: boolean;
  target: number;
}) {
  const [mode, setMode] = useState("charts");
  const [axis, setAxis] = useState<"value" | "quantity">("value");
  const [group, setGroup] = useState<"period" | "people">("period");
  const [response, setResponse] = useState<{
    key: string;
    data: MetricAnalysis | null;
    error: string;
  }>({ key: "", data: null, error: "" });
  const [retry, setRetry] = useState(0);
  const { teamId, userIds, type, period, startDate, endDate } = filter;
  const memberKey = [...userIds].sort().join(",");
  const requestKey = JSON.stringify([
    enabled,
    teamId,
    memberKey,
    type,
    period,
    startDate,
    endDate,
    retry,
  ]);
  const loading = response.key !== requestKey;
  const data = loading ? null : response.data;
  const error = loading ? "" : response.error;
  useEffect(() => {
    if (!enabled || !startDate || !endDate || startDate > endDate) return;
    const controller = new AbortController();
    fetchMetricAnalysis(
      {
        teamId,
        userIds: memberKey ? memberKey.split(",") : [],
        type,
        period,
        startDate,
        endDate,
      },
      controller.signal,
    )
      .then((result) => {
        if (!controller.signal.aborted)
          setResponse({ key: requestKey, data: result, error: "" });
      })
      .catch((reason) => {
        if (!controller.signal.aborted)
          setResponse({
            key: requestKey,
            data: null,
            error:
              reason instanceof Error
                ? reason.message
                : "Não foi possível carregar a análise.",
          });
      });
    return () => controller.abort();
  }, [
    enabled,
    teamId,
    memberKey,
    type,
    period,
    startDate,
    endDate,
    requestKey,
  ]);
  const validFilter =
    enabled && Boolean(startDate && endDate && startDate <= endDate);
  const title =
    METRIC_TYPES.find((item) => item.id === type)?.label ?? "Resultados";
  const currency = type === "SALES" && axis === "value";
  const format = (value: number) =>
    currency
      ? value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 2,
        })
      : number(value);
  const total = data?.summary.value ?? 0;
  const progress = target > 0 ? (total / target) * 100 : null;
  // Comparação possui quantidades por pessoa; nunca apresenta receita onde não existe.
  const chartData =
    group === "period"
      ? (data?.series ?? [])
      : (data?.comparison ?? []).map((item) => ({
          label: item.label,
          value: item.orders,
          quantity: item.orders,
        }));
  const noActivity =
    data &&
    data.series.every((item) => item.value === 0 && item.quantity === 0) &&
    data.summary.clients === 0 &&
    data.summary.visits === 0;
  return (
    <>
      <div className={styles.analysisHeader}>
        <div>
          <h2>Visualização e Análise</h2>
          <p className={styles.muted}>
            Escolha como deseja visualizar os dados da sua análise.
          </p>
        </div>
        <div className={styles.axes}>
          <label>
            Eixo X
            <select
              value={group}
              onChange={(event) =>
                setGroup(event.target.value as "period" | "people")
              }
            >
              <option value="period">Período</option>
              <option value="people">Perfil de cliente</option>
            </select>
          </label>
          <label>
            Eixo Y
            <select
              value={axis}
              disabled={group === "people"}
              onChange={(event) =>
                setAxis(event.target.value as "value" | "quantity")
              }
            >
              <option value="value">
                {type === "SALES" ? "Valor" : "Total"}
              </option>
              <option value="quantity">Quantidade</option>
            </select>
          </label>
        </div>
      </div>
      <div className={styles.modes} aria-label="Modo de visualização">
        {[
          {
            id: "charts",
            label: "Gráficos",
            note: "Barras / Pizza",
            Icon: ChartBar,
          },
          {
            id: "table",
            label: "Tabela",
            note: "Dados detalhados",
            Icon: Table,
          },
          {
            id: "cards",
            label: "Cards",
            note: "Indicadores",
            Icon: SquaresFour,
          },
        ].map(({ id, label, note, Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
            className={mode === id ? styles.selected : ""}
          >
            <Icon size={23} />
            <span>
              <strong>{label}</strong>
              <small>{note}</small>
            </span>
          </button>
        ))}
      </div>
      {!validFilter ? (
        <div className={styles.chartMessage}>
          <ChartBar size={32} />
          <p>
            {!enabled
              ? "Selecione um time para visualizar os resultados."
              : "Escolha um intervalo de datas válido."}
          </p>
        </div>
      ) : loading ? (
        <div className={styles.chartMessage} role="status">
          Carregando resultados…
        </div>
      ) : error ? (
        <div role="alert" className={styles.chartMessage}>
          <p>{error}</p>
          <button
            className={styles.secondary}
            onClick={() => setRetry((value) => value + 1)}
          >
            <ArrowClockwise size={16} /> Recarregar análise
          </button>
        </div>
      ) : (
        data && (
          <>
            {noActivity && (
              <p className={styles.noActivity}>
                Nenhum registro encontrado para este time, pessoas e intervalo.
              </p>
            )}
            {mode === "charts" && (
              <div className={styles.chartGrid}>
                <section className={styles.chartCard}>
                  <h3>
                    {group === "people"
                      ? "Pedidos por perfil de cliente"
                      : `${title} por Período`}
                  </h3>
                  <div className={styles.chart}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="metricsBars"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0" stopColor="#8fc2ff" />
                            <stop offset="1" stopColor="#126cff" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#edf2f8" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) =>
                            Number(value) >= 1000
                              ? `${number(Number(value) / 1000)}k`
                              : number(Number(value))
                          }
                        />
                        <Tooltip
                          formatter={(value) =>
                            group === "people"
                              ? number(Number(value))
                              : format(Number(value))
                          }
                        />
                        <Bar
                          dataKey={group === "people" ? "quantity" : axis}
                          name={group === "people" ? "Pedidos" : title}
                          fill="url(#metricsBars)"
                          radius={[3, 3, 0, 0]}
                          maxBarSize={28}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
                <section className={styles.chartCard}>
                  <h3>Comparações de clientes</h3>
                  <div className={styles.chart}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.comparison}
                        margin={{ top: 6, right: 8, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid stroke="#edf2f8" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip />
                        <Legend
                          wrapperStyle={{ fontSize: 9 }}
                          iconType="circle"
                          iconSize={6}
                          verticalAlign="top"
                        />
                        {[
                          { key: "clients", label: "Clientes" },
                          { key: "visits", label: "Visitas" },
                          { key: "orders", label: "Pedidos" },
                        ].map((item, index) => (
                          <Bar
                            key={item.key}
                            dataKey={item.key}
                            name={item.label}
                            fill={COLORS[index]}
                            radius={[2, 2, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
                <section className={styles.chartCard}>
                  <h3>Distribuição de Pedidos</h3>
                  <div className={styles.donutRow}>
                    <div className={styles.donut}>
                      {data.distribution.some((item) => item.value > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.distribution}
                              nameKey="label"
                              dataKey="value"
                              innerRadius="58%"
                              outerRadius="90%"
                              stroke="none"
                            >
                              {data.distribution.map((item, index) => (
                                <Cell
                                  key={item.label}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className={styles.zeroRing} />
                      )}
                      <div className={styles.donutTotal}>
                        <strong>
                          {number(
                            data.distribution.reduce(
                              (sum, item) => sum + item.value,
                              0,
                            ),
                          )}
                        </strong>
                        <small>Pedidos</small>
                      </div>
                    </div>
                    <ul className={styles.legend}>
                      {data.distribution.map((item, index) => (
                        <li key={item.label}>
                          <i
                            style={{
                              background: COLORS[index % COLORS.length],
                            }}
                          />
                          <span>{item.label}</span>
                          <strong>{number(item.value)}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
                <section className={styles.chartCard}>
                  <h3>Frequência de Pedidos</h3>
                  <div className={styles.chart}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data.frequency}
                        margin={{ top: 10, right: 8, left: -25, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="metricsArea"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0"
                              stopColor="#0866ff"
                              stopOpacity={0.24}
                            />
                            <stop
                              offset="1"
                              stopColor="#0866ff"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#edf2f8" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="value"
                          name="Pedidos"
                          stroke="#0866ff"
                          strokeWidth={2}
                          fill="url(#metricsArea)"
                          dot={{ r: 3, fill: "#fff", strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>
            )}
            {mode === "table" && (
              <div className={styles.tableWrap}>
                <table>
                  <caption>{title} por período</caption>
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>{type === "SALES" ? "Valor (R$)" : "Total"}</th>
                      <th>Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.series.map((item, index) => (
                      <tr key={`${item.label}-${index}`}>
                        <td>{item.label}</td>
                        <td>{number(item.value)}</td>
                        <td>{number(item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>Total</th>
                      <td>{number(data.summary.value)}</td>
                      <td>{number(data.summary.quantity)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            {mode === "cards" && (
              <div className={styles.indicators}>
                {[
                  {
                    label: title,
                    value:
                      type === "SALES"
                        ? total.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : number(total),
                  },
                  { label: "Quantidade", value: number(data.summary.quantity) },
                  { label: "Clientes", value: number(data.summary.clients) },
                  { label: "Visitas", value: number(data.summary.visits) },
                ].map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            )}
            {target > 0 && (
              <div className={styles.goalProgress}>
                <span>
                  Atingimento da referência <strong>{number(progress ?? 0)}%</strong>
                </span>
                <progress max={100} value={Math.min(100, progress ?? 0)} />
                <small>
                  {number(total)} de {number(target)}{" "}
                  {type === "SALES" ? "reais" : "no intervalo"}
                </small>
              </div>
            )}
            {!!data.definitions?.length && (
              <details className={styles.definitions}>
                <summary>Como os indicadores são calculados</summary>
                {data.definitions.map((definition) => (
                  <p key={definition}>{definition}</p>
                ))}
              </details>
            )}
          </>
        )
      )}
    </>
  );
}
