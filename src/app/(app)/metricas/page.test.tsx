import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MetricsPage from "./page";
import {
  fetchMetricsOptions,
  fetchMetricGoals,
  fetchMetricAnalysis,
  createMetricGoal,
} from "@/services/metrics";
jest.mock("@/services/metrics", () => ({
  ...jest.requireActual("@/services/metrics"),
  fetchMetricsOptions: jest.fn(),
  fetchMetricGoals: jest.fn(),
  fetchMetricAnalysis: jest.fn(),
  createMetricGoal: jest.fn(),
}));
jest.mock("./MetricsAnalysis", () => ({
  __esModule: true,
  default: () => <div>Análise disponível</div>,
}));
const options = {
  teams: [
    {
      id: "team-1",
      name: "Comercial",
      members: [{ id: "user-1", name: "Ana Silva" }],
    },
  ],
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(fetchMetricsOptions).mockResolvedValue(options);
  jest.mocked(fetchMetricGoals).mockResolvedValue([]);
  jest
    .mocked(fetchMetricAnalysis)
    .mockResolvedValue({
      series: [],
      comparison: [],
      distribution: [],
      frequency: [],
      summary: { value: 0, quantity: 0, clients: 0, visits: 0 },
    });
});
async function completeForm() {
  render(<MetricsPage />);
  await screen.findByRole("button", { name: /Comercial/ });
  expect(screen.getByRole("button", { name: /Próximo/ })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: /Comercial/ }));
  fireEvent.click(screen.getByRole("button", { name: /Próximo/ }));
  expect(screen.getByRole("button", { name: /Próximo/ })).toBeDisabled();
  fireEvent.click(screen.getByLabelText("Ana Silva"));
  fireEvent.click(screen.getByRole("button", { name: /Próximo/ }));
  fireEvent.change(screen.getByLabelText("Nome da meta"), {
    target: { value: "Vendas setembro" },
  });
  fireEvent.change(screen.getByLabelText(/Valor da meta/), {
    target: { value: "25000" },
  });
}
it("valida etapas e só confirma depois de salvar na API", async () => {
  jest
    .mocked(createMetricGoal)
    .mockImplementation(async (input) => ({
      ...input,
      id: "goal-1",
      createdAt: new Date().toISOString(),
    }));
  await completeForm();
  fireEvent.click(screen.getByRole("button", { name: "Criar meta" }));
  await screen.findByText("Meta criada com sucesso.");
  expect(createMetricGoal).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "Vendas setembro",
      teamId: "team-1",
      userIds: ["user-1"],
      target: 25000,
    }),
  );
});
it("mantém os campos e permite tentar novamente após falha", async () => {
  jest
    .mocked(createMetricGoal)
    .mockRejectedValue(new Error("Não foi possível salvar"));
  await completeForm();
  fireEvent.click(screen.getByRole("button", { name: "Criar meta" }));
  await screen.findByText("Não foi possível salvar");
  expect(screen.getByLabelText("Nome da meta")).toHaveValue("Vendas setembro");
  expect(
    screen.queryByText("Meta criada com sucesso."),
  ).not.toBeInTheDocument();
});
it("permite recuperar falha no carregamento", async () => {
  jest
    .mocked(fetchMetricsOptions)
    .mockRejectedValueOnce(new Error("Falha ao carregar times"));
  render(<MetricsPage />);
  await screen.findByText("Falha ao carregar times");
  fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: /Comercial/ }),
    ).toBeInTheDocument(),
  );
});
