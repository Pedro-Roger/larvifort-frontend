import {
  getMetricSource,
  getMetricSourceFilters,
  METRIC_SOURCES,
  type MetricSource,
} from "./metrics";

describe("catálogo de fontes de métricas", () => {
  it("expõe o catálogo operacional completo para construir análises", () => {
    expect(METRIC_SOURCES.map((source) => source.id)).toEqual([
      "orders.count",
      "orders.revenue",
      "appointments.visits",
      "appointments.meetings",
      "clients.new",
      "clients.existing",
      "stock.on_hand",
      "reservations.active",
      "laboratory.analyses",
      "separation.orders",
      "deliveries.completed",
      "after-sales.followups",
    ]);
  });

  it("reutiliza as fontes selecionadas para oferecer filtros compatíveis", () => {
    const filters = getMetricSourceFilters([
      getMetricSource("orders.count")!,
      getMetricSource("appointments.visits")!,
    ]);

    expect(filters.map((filter) => filter.id)).toEqual([
      "orders.count.status",
      "orders.count.client",
      "orders.count.responsible",
      "appointments.visits.status",
      "appointments.visits.client",
      "appointments.visits.responsible",
    ]);
  });

  it("mantém análises salvas antes do catálogo sem filtros indisponíveis", () => {
    const legacySource: MetricSource = {
      id: "orders.legacy",
      label: "Pedidos legados",
      entity: "orders",
      measure: "count",
    };

    expect(getMetricSourceFilters([legacySource])).toEqual([]);
  });
});
