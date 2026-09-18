import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MetricBlocksView from "./MetricBlocksView";
import { createMetricAnalysis, loadMetricAnalyses } from "@/services/metricAnalyses";

const orders = {
  id: "orders.count",
  label: "Pedidos",
  entity: "orders",
  measure: "count",
  aggregation: "count" as const,
};
const visits = {
  id: "appointments.visits",
  label: "Visitas",
  entity: "appointments",
  measure: "count",
  aggregation: "count" as const,
};

beforeEach(() => window.localStorage.clear());

function createAnalysis() {
  return createMetricAnalysis({
    name: "Conversão comercial",
    mode: "advanced",
    primarySource: orders,
    secondarySource: visits,
    sources: [orders, visits],
    filters: [],
    dimensions: [{ id: "period", label: "Período" }],
    period: "MONTHLY",
    visualization: "chart",
    definition: "Pedidos ÷ Visitas",
    publishedToDashboard: false,
  });
}

it("mostra as fontes e a definição da análise avançada", async () => {
  createAnalysis();
  render(<MetricBlocksView />);

  await screen.findByText("Conversão comercial");
  expect(screen.getByText("Pedidos, Visitas · Mensal")).toBeInTheDocument();
  expect(screen.getByText("Definição: Pedidos ÷ Visitas")).toBeInTheDocument();
  expect(screen.getByText("Resultado: ainda não calculado")).toBeInTheDocument();
});

it("edita, duplica, publica, oculta e exclui um bloco", async () => {
  createAnalysis();
  render(<MetricBlocksView />);

  await screen.findByText("Conversão comercial");
  fireEvent.click(screen.getByRole("button", { name: "Editar Conversão comercial" }));
  fireEvent.change(screen.getByLabelText("Nome do bloco"), {
    target: { value: "Conversão revisada" },
  });
  fireEvent.change(screen.getByLabelText("Métrica A do bloco"), {
    target: { value: "orders.revenue" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  await waitFor(() =>
    expect(loadMetricAnalyses()[0]).toEqual(
      expect.objectContaining({
        name: "Conversão revisada",
        sources: [
          expect.objectContaining({ id: "orders.revenue" }),
          expect.objectContaining({ id: "appointments.visits" }),
        ],
      }),
    ),
  );

  fireEvent.click(screen.getByRole("button", { name: "Duplicar Conversão revisada" }));
  await waitFor(() => expect(loadMetricAnalyses()).toHaveLength(2));

  fireEvent.click(
    screen.getByRole("button", {
      name: "Publicar Conversão revisada no dashboard",
    }),
  );
  await waitFor(() => expect(loadMetricAnalyses()[0].publishedToDashboard).toBe(true));

  fireEvent.click(
    screen.getByRole("button", {
      name: "Ocultar Conversão revisada do dashboard",
    }),
  );
  await waitFor(() => expect(loadMetricAnalyses()[0].publishedToDashboard).toBe(false));

  fireEvent.click(screen.getByRole("button", { name: "Excluir Conversão revisada" }));
  await waitFor(() => expect(loadMetricAnalyses()).toHaveLength(1));
});
