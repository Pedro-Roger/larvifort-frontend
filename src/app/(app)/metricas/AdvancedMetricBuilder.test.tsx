import { fireEvent, render, screen } from "@testing-library/react";
import AdvancedMetricBuilder from "./AdvancedMetricBuilder";
import { loadMetricAnalyses } from "@/services/metricAnalyses";

beforeEach(() => window.localStorage.clear());

it("recusa salvar uma operação avançada sem as fontes exigidas", () => {
  render(<AdvancedMetricBuilder />);

  fireEvent.click(screen.getByLabelText("Pedidos"));
  fireEvent.click(screen.getByLabelText("Visitas"));
  fireEvent.click(screen.getByRole("button", { name: "Salvar análise" }));

  expect(
    screen.getByText("Selecione as fontes exigidas pela operação escolhida."),
  ).toBeInTheDocument();
  expect(loadMetricAnalyses()).toEqual([]);
});

it("recusa salvar uma análise avançada sem dimensão temporal", () => {
  render(<AdvancedMetricBuilder />);

  fireEvent.click(screen.getByLabelText("Incluir período na comparação"));
  fireEvent.click(screen.getByRole("button", { name: "Salvar análise" }));

  expect(
    screen.getByText("Inclua o período para salvar uma análise comparável."),
  ).toBeInTheDocument();
  expect(loadMetricAnalyses()).toEqual([]);
});

it("salva todas as fontes e a expressão de uma agregação avançada", () => {
  render(<AdvancedMetricBuilder />);

  fireEvent.change(screen.getByLabelText("Operação"), {
    target: { value: "sum" },
  });
  fireEvent.click(screen.getByLabelText("Faturamento"));
  fireEvent.click(screen.getByRole("button", { name: "Salvar análise" }));

  expect(loadMetricAnalyses()).toEqual([
    expect.objectContaining({
      mode: "advanced",
      sources: [
        expect.objectContaining({ id: "orders.count" }),
        expect.objectContaining({ id: "appointments.visits" }),
        expect.objectContaining({ id: "orders.revenue" }),
      ],
      definition: "Soma de Pedidos, Visitas, Faturamento",
    }),
  ]);
});
