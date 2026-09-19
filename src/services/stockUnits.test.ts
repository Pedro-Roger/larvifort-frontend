import { apiPost } from "./api";
import {
  createStockUnit,
  normalizeLocation,
  normalizeUnit,
} from "./stockUnits";

jest.mock("./api", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
}));

describe("stockUnits service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("normaliza unidade com o contrato canônico de status e cidade", () => {
    expect(normalizeUnit({ id: "unit-1", name: "Unidade Norte" })).toEqual({
      id: "unit-1",
      name: "Unidade Norte",
      city: null,
      status: "ACTIVA",
      locations: [],
    });
    expect(normalizeUnit({ status: "INACTIVA" }).status).toBe("INACTIVA");
  });

  it("normaliza local com status ACTIVA por padrão", () => {
    expect(normalizeLocation({ id: "location-1", unitId: "unit-1" })).toEqual({
      id: "location-1",
      unitId: "unit-1",
      name: "Local",
      type: "BERCARIO",
      capacity: null,
      status: "ACTIVA",
    });
  });

  it("envia payload de unidade com city e sem code", async () => {
    jest.mocked(apiPost).mockResolvedValue({
      id: "unit-1",
      name: "Unidade Norte",
      city: "Fortaleza",
      status: "ACTIVA",
    });

    await createStockUnit({
      name: "Unidade Norte",
      city: "Fortaleza",
      status: "ACTIVA",
    });

    expect(apiPost).toHaveBeenCalledWith("/stock/units", {
      name: "Unidade Norte",
      city: "Fortaleza",
      status: "ACTIVA",
    });
  });
});
