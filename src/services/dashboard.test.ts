import assert from "node:assert/strict";
import test from "node:test";
import { normalizeDashboardStats } from "./dashboardNormalize.ts";

test("normalizes dashboard frequency rows when backend omits optional fields", () => {
  const stats = normalizeDashboardStats({
    frequencyData: [{ cliente: "Cliente A", visitas: 3 }],
  });

  assert.equal(stats.frequencyData.length, 1);
  assert.deepEqual(stats.frequencyData[0], {
    id: "Cliente A-0",
    cliente: "Cliente A",
    visitas: 3,
    pedidos: 0,
    ultimaVisita: "Sem registro",
    ultimoPedido: "Sem registro",
    ultimoContato: "Sem registro",
  });
});

test("normalizes dashboard ISO dates to pt-BR labels", () => {
  const stats = normalizeDashboardStats({
    frequencyData: [
      {
        cliente: "Cliente B",
        visitas: 1,
        ultimaVisita: "2026-09-16T12:00:00.000Z",
      },
    ],
  });

  assert.equal(stats.frequencyData[0]?.ultimaVisita, "16/09/2026");
});
