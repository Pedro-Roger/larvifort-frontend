import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MetricsAnalysis from "./MetricsAnalysis";
import { fetchMetricAnalysis, type MetricGoalInput } from "@/services/metrics";
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
