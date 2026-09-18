import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import MetricsAnalysis from "./MetricsAnalysis";
import { fetchMetricAnalysis, type MetricGoalInput } from "@/services/metrics";
import { loadMetricAnalyses } from "@/services/metricAnalyses";
jest.mock("@/services/metrics", () => ({
  ...jest.requireActual("@/services/metrics"),
  fetchMetricAnalysis: jest.fn(),
}));
jest.mock("recharts", () => ({
  ResponsiveContainer: () => null,
  Area: () => null,
  AreaChart: () => null,
  Bar: () => null,
  BarChart: () => null,
  CartesianGrid: () => null,
  Cell: () => null,
  Legend: () => null,
  Pie: () => null,
  PieChart: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));
const filter: MetricGoalInput = {
  name: "",
  teamId: "t1",
  userIds: ["u1"],
  type: "SALES",
  period: "WEEKLY",
  target: 200,
  startDate: "2026-09-01",
  endDate: "2026-09-30",
};
const data = {
  series: [{ label: "2026-09-01", value: 100, quantity: 2 }],
  comparison: [],
  distribution: [],
  frequency: [],
  summary: { value: 100, quantity: 2, clients: 1, visits: 3 },
};
beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  jest.mocked(fetchMetricAnalysis).mockResolvedValue(data);
});
it("alterna tabela e indicadores com valores reais e atingimento", async () => {
  render(<MetricsAnalysis filter={filter} enabled target={200} />);
  await screen.findByText("50%");
  fireEvent.click(screen.getByRole("button", { name: /Tabela/ }));
  expect(screen.getByRole("table")).toHaveTextContent("2026-09-01");
  fireEvent.click(screen.getByRole("button", { name: /Gráficos/ }));
  fireEvent.click(screen.getByRole("button", { name: /Cards/ }));
  expect(screen.getByText(/R\$\s*100,00/)).toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});
it("recarrega ao mudar os filtros e impede análise com datas invertidas", async () => {
  const { rerender } = render(
    <MetricsAnalysis filter={filter} enabled target={200} />,
  );
  await screen.findByText("50%");
  rerender(
    <MetricsAnalysis
      filter={{ ...filter, period: "MONTHLY" }}
      enabled
      target={200}
    />,
  );
  await waitFor(() => expect(fetchMetricAnalysis).toHaveBeenCalledTimes(2));
  rerender(
    <MetricsAnalysis
      filter={{ ...filter, endDate: "2026-08-01" }}
      enabled
      target={200}
    />,
  );
  expect(
    screen.getByText("Escolha um intervalo de datas válido."),
  ).toBeInTheDocument();
  expect(fetchMetricAnalysis).toHaveBeenCalledTimes(2);
});
it("recupera falha da análise sem fingir valores zerados", async () => {
  jest
    .mocked(fetchMetricAnalysis)
    .mockRejectedValueOnce(new Error("Análise indisponível"));
  render(<MetricsAnalysis filter={filter} enabled target={200} />);
  await screen.findByText("Análise indisponível");
  fireEvent.click(screen.getByRole("button", { name: "Recarregar análise" }));
  await screen.findByText("50%");
});

it("preserva o rascunho ao trocar de modo e salva uma análise guiada", async () => {
  render(<MetricsAnalysis filter={filter} enabled target={200} />);
  await screen.findByText("50%");
  fireEvent.change(
    screen.getByPlaceholderText("Ex.: Visitas x pedidos do mês"),
    {
    target: { value: "Visitas x pedidos" },
    },
  );
  fireEvent.click(screen.getByRole("tab", { name: /^Avançado/ }));
  expect(screen.getByRole("tab", { name: /^Avançado/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  fireEvent.click(screen.getByRole("tab", { name: /^Guiado/ }));
  expect(screen.getByPlaceholderText("Ex.: Visitas x pedidos do mês")).toHaveValue(
    "Visitas x pedidos",
  );
  fireEvent.click(screen.getByRole("button", { name: "Salvar análise" }));
  await screen.findByText("Análise salva. Ela já está disponível em Blocos.");
  expect(loadMetricAnalyses()).toEqual([
    expect.objectContaining({
      mode: "guided",
      name: "Visitas x pedidos",
      primarySource: expect.objectContaining({ id: "orders.count" }),
    }),
  ]);
});

it("permite trocar os modos pelo teclado", async () => {
  render(<MetricsAnalysis filter={filter} enabled target={200} />);
  await screen.findByText("50%");
  const guided = screen.getByRole("tab", { name: /^Guiado/ });
  guided.focus();

  fireEvent.keyDown(guided, { key: "ArrowRight" });

  expect(screen.getByRole("tab", { name: /^Blocos/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("tab", { name: /^Blocos/ })).toHaveFocus();
});

it("exibe o catálogo operacional e salva a meta com um filtro da fonte escolhida", async () => {
  render(<MetricsAnalysis filter={filter} enabled target={200} />);
  await screen.findByText("50%");

  expect(screen.getByText("Fontes de dados conectadas")).toBeInTheDocument();
  const catalog = screen.getByText("Fontes de dados conectadas").closest("details");
  expect(catalog).not.toBeNull();
  expect(within(catalog!).getByText("Pós-venda")).toBeInTheDocument();
  const guidedPanel = screen.getByRole("tabpanel", { name: /Guiado/ });
  fireEvent.change(within(guidedPanel).getByLabelText("Métrica B"), {
    target: { value: "appointments.visits" },
  });
  fireEvent.change(within(guidedPanel).getByLabelText("Filtrar dados de"), {
    target: { value: "appointments.visits" },
  });
  fireEvent.change(within(guidedPanel).getByLabelText("Campo do filtro"), {
    target: { value: "appointments.visits.status" },
  });
  fireEvent.change(within(guidedPanel).getByLabelText("Valor do filtro"), {
    target: { value: "confirmado" },
  });
  fireEvent.change(within(guidedPanel).getByLabelText("Meta opcional"), {
    target: { value: "75" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar análise" }));

  expect(loadMetricAnalyses()[0]).toEqual(
    expect.objectContaining({
      goal: { target: 75 },
      filters: [
        {
          field: "appointments.visits.status",
          operator: "equals",
          value: "confirmado",
        },
      ],
    }),
  );
});

it("mostra carregamento, vazio e erro sem substituir dados por mocks", async () => {
  let resolveRequest: ((value: typeof data) => void) | undefined;
  jest.mocked(fetchMetricAnalysis).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
  );
  const { rerender } = render(<MetricsAnalysis filter={filter} enabled target={200} />);
  expect(screen.getByRole("status")).toHaveTextContent("Carregando resultados");

  resolveRequest?.({
    ...data,
    series: [{ label: "2026-09-01", value: 0, quantity: 0 }],
    summary: { value: 0, quantity: 0, clients: 0, visits: 0 },
  });
  await screen.findByText("Nenhum registro encontrado para este time, pessoas e intervalo.");

  jest.mocked(fetchMetricAnalysis).mockRejectedValueOnce(new Error("Fonte indisponível"));
  rerender(
    <MetricsAnalysis
      filter={{ ...filter, period: "MONTHLY" }}
      enabled
      target={200}
    />,
  );
  await screen.findByText("Fonte indisponível");
});
