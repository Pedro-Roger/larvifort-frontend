import { apiGet } from "./api";
import {
  fetchReservations,
  normalizeReservation,
} from "./reservations";

jest.mock("./api", () => ({
  apiDelete: jest.fn(),
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

describe("reservations service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("normaliza reserva com status ACTIVA por padrão", () => {
    expect(normalizeReservation({ id: "reservation-1" }).status).toBe("ACTIVA");
    expect(
      normalizeReservation({ id: "reservation-2", status: "CONSUMIDA" }).status,
    ).toBe("CONSUMIDA");
  });

  it("busca somente reservas ativas", async () => {
    jest.mocked(apiGet).mockResolvedValue({ data: [] });

    await fetchReservations();

    expect(apiGet).toHaveBeenCalledWith("/stock/reservations?status=ACTIVA");
  });
});
