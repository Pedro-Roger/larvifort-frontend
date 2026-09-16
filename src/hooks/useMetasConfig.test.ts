import { renderHook, act, waitFor } from '@testing-library/react';
import { useMetasConfig } from './useMetasConfig';
import { fetchDashboardStats, type DashboardStats } from '@/services/dashboard';

// Mock the dashboard service
jest.mock('@/services/dashboard', () => ({
  fetchDashboardStats: jest.fn(),
}));

describe('useMetasConfig', () => {
  const mockFetchDashboardStats = fetchDashboardStats as jest.MockedFunction<typeof fetchDashboardStats>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state and fetch dashboard stats', async () => {
    mockFetchDashboardStats.mockResolvedValueOnce({
      teamMembers: [
        { name: 'João Silva', initials: 'JS' },
        { name: 'Maria Souza', initials: 'MS' },
      ],
    } as unknown as DashboardStats);

    const { result } = renderHook(() => useMetasConfig());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetchDashboardStats).toHaveBeenCalledTimes(1);
    expect(result.current.metasIndividuais).toHaveLength(2);
    expect(result.current.metasIndividuais[0].nome).toBe('João Silva');
    expect(result.current.metasIndividuais[1].nome).toBe('Maria Souza');
  });

  it('should divide goals equally among team members', async () => {
    mockFetchDashboardStats.mockResolvedValueOnce({
      teamMembers: [
        { name: 'João', initials: 'JO' },
        { name: 'Maria', initials: 'MA' },
      ],
    } as unknown as DashboardStats);

    const { result } = renderHook(() => useMetasConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setMetaGlobalValor(1000);
      result.current.setMetaGlobalVolume(100);
    });

    act(() => {
      result.current.dividirIgualitariamente();
    });

    expect(result.current.metasIndividuais[0].valor).toBe(500);
    expect(result.current.metasIndividuais[0].volume).toBe(50);
    expect(result.current.metasIndividuais[1].valor).toBe(500);
    expect(result.current.metasIndividuais[1].volume).toBe(50);
  });

  it('should update individual consultant values', async () => {
    mockFetchDashboardStats.mockResolvedValueOnce({
      teamMembers: [
        { name: 'João', initials: 'JO' },
      ],
    } as unknown as DashboardStats);

    const { result } = renderHook(() => useMetasConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleUpdateConsultor('João', 'valor', 1500);
      result.current.handleUpdateConsultor('João', 'volume', 200);
    });

    expect(result.current.metasIndividuais[0].valor).toBe(1500);
    expect(result.current.metasIndividuais[0].volume).toBe(200);
  });

  it('should calculate totals and differences correctly', async () => {
    mockFetchDashboardStats.mockResolvedValueOnce({
      teamMembers: [
        { name: 'João', initials: 'JO' },
        { name: 'Maria', initials: 'MA' },
      ],
    } as unknown as DashboardStats);

    const { result } = renderHook(() => useMetasConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setMetaGlobalValor(1000);
    });

    act(() => {
      result.current.handleUpdateConsultor('João', 'valor', 400);
      result.current.handleUpdateConsultor('João', 'volume', 10);
      result.current.handleUpdateConsultor('Maria', 'valor', 300);
      result.current.handleUpdateConsultor('Maria', 'volume', 20);
    });

    expect(result.current.totalIndividualValor).toBe(700);
    expect(result.current.totalIndividualVolume).toBe(30);
    expect(result.current.diferencaValor).toBe(300); // 1000 - 700
  });

  it('should trigger alert on handleSalvar', async () => {
    mockFetchDashboardStats.mockResolvedValueOnce({ teamMembers: [] } as unknown as DashboardStats);
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useMetasConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleSalvar();
    });

    expect(alertMock).toHaveBeenCalledWith('Metas salvas com sucesso!');
    alertMock.mockRestore();
  });
});
