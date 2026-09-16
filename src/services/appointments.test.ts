import { fetchAppointments, normalizeAppointment } from "./appointments";
import { apiGet } from "./api";

jest.mock("./api", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn(),
}));

describe("appointments service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("normaliza data ISO para YYYY-MM-DD sem deslocar fuso", () => {
    expect(normalizeAppointment({ id: "a1", data: "2026-09-16T12:00:00.000Z" }).data).toBe("2026-09-16");
  });

  it("busca compromissos com parametros de/ate esperados pela API", async () => {
    jest.mocked(apiGet).mockResolvedValue({ data: [] });

    await fetchAppointments({ startDate: "2026-09-01", endDate: "2026-09-30" });

    expect(apiGet).toHaveBeenCalledWith("/appointments?de=2026-09-01&ate=2026-09-30");
  });
});
