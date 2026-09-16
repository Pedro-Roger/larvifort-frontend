import { render, screen, fireEvent } from '@testing-library/react';
import ConfigurarMetasPage from './page';
import { useMetasConfig } from '@/hooks/useMetasConfig';

// Mock the hook
jest.mock('@/hooks/useMetasConfig');

describe('ConfigurarMetasPage', () => {
  const mockUseMetasConfig = useMetasConfig as jest.MockedFunction<typeof useMetasConfig>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when loading is true', () => {
    mockUseMetasConfig.mockReturnValue({
      loading: true,
      metaGlobalValor: 0,
      setMetaGlobalValor: jest.fn(),
      metaGlobalVolume: 0,
      setMetaGlobalVolume: jest.fn(),
      metasIndividuais: [],
      totalIndividualValor: 0,
      totalIndividualVolume: 0,
      diferencaValor: 0,
      dividirIgualitariamente: jest.fn(),
      handleUpdateConsultor: jest.fn(),
      handleSalvar: jest.fn(),
    });

    render(<ConfigurarMetasPage />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('renders the page correctly when not loading', () => {
    mockUseMetasConfig.mockReturnValue({
      loading: false,
      metaGlobalValor: 4500000,
      setMetaGlobalValor: jest.fn(),
      metaGlobalVolume: 1250,
      setMetaGlobalVolume: jest.fn(),
      metasIndividuais: [
        { nome: 'João Silva', iniciais: 'JS', regiao: 'Sul', contas: 10, historico: 'R$ 1.0M', valor: 2000000, volume: 500 }
      ],
      totalIndividualValor: 2000000,
      totalIndividualVolume: 500,
      diferencaValor: 2500000,
      dividirIgualitariamente: jest.fn(),
      handleUpdateConsultor: jest.fn(),
      handleSalvar: jest.fn(),
    });

    render(<ConfigurarMetasPage />);
    
    expect(screen.getByText('Definir Metas Comerciais')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    
    // Verify inputs for global goals
    const globalValorInputs = screen.getAllByRole('spinbutton');
    // Assuming the first input is the global valor
    expect(globalValorInputs[0]).toHaveValue(4500000);
  });

  it('calls dividirIgualitariamente when button is clicked', () => {
    const dividirIgualitariamenteMock = jest.fn();
    mockUseMetasConfig.mockReturnValue({
      loading: false,
      metaGlobalValor: 4500000,
      setMetaGlobalValor: jest.fn(),
      metaGlobalVolume: 1250,
      setMetaGlobalVolume: jest.fn(),
      metasIndividuais: [],
      totalIndividualValor: 0,
      totalIndividualVolume: 0,
      diferencaValor: 0,
      dividirIgualitariamente: dividirIgualitariamenteMock,
      handleUpdateConsultor: jest.fn(),
      handleSalvar: jest.fn(),
    });

    render(<ConfigurarMetasPage />);
    
    const button = screen.getByText('Dividir Igualitário');
    fireEvent.click(button);
    
    expect(dividirIgualitariamenteMock).toHaveBeenCalledTimes(1);
  });

  it('calls handleSalvar when save button is clicked', () => {
    const handleSalvarMock = jest.fn();
    mockUseMetasConfig.mockReturnValue({
      loading: false,
      metaGlobalValor: 4500000,
      setMetaGlobalValor: jest.fn(),
      metaGlobalVolume: 1250,
      setMetaGlobalVolume: jest.fn(),
      metasIndividuais: [],
      totalIndividualValor: 0,
      totalIndividualVolume: 0,
      diferencaValor: 0,
      dividirIgualitariamente: jest.fn(),
      handleUpdateConsultor: jest.fn(),
      handleSalvar: handleSalvarMock,
    });

    render(<ConfigurarMetasPage />);
    
    const saveButton = screen.getByText('Salvar Metas');
    fireEvent.click(saveButton);
    
    expect(handleSalvarMock).toHaveBeenCalledTimes(1);
  });
});
