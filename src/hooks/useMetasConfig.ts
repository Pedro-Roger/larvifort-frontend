import { useState, useMemo, useEffect } from "react";
import { fetchDashboardStats } from "@/services/dashboard";

export type MetaConsultor = {
  nome: string;
  iniciais: string;
  regiao: string;
  contas: number;
  historico: string;
  valor: number;
  volume: number;
};

export function useMetasConfig() {
  const [loading, setLoading] = useState(true);
  const [metaGlobalValor, setMetaGlobalValor] = useState(4500000);
  const [metaGlobalVolume, setMetaGlobalVolume] = useState(1250);
  
  const [metasIndividuais, setMetasIndividuais] = useState<MetaConsultor[]>([]);

  useEffect(() => {
    fetchDashboardStats().then((stats) => {
      // Mock regions and accounts for the UI demo based on the TeamMembers
      const regioes = ["Ribeirão Preto", "Mato Grosso", "Goiás", "Paraná", "Sul de Minas"];
      
      const iniciais = stats.teamMembers.map((m, i) => ({
        nome: m.name,
        iniciais: m.initials,
        regiao: regioes[i % regioes.length],
        contas: 10 + i * 5,
        historico: `R$ ${(1 + i * 0.2).toFixed(1)}M`,
        valor: 0,
        volume: 0,
      }));
      setMetasIndividuais(iniciais);
      setLoading(false);
    });
  }, []);

  const dividirIgualitariamente = () => {
    if (metasIndividuais.length === 0) return;
    const valorPorPessoa = metaGlobalValor / metasIndividuais.length;
    const volumePorPessoa = metaGlobalVolume / metasIndividuais.length;
    
    setMetasIndividuais(prev => prev.map(m => ({
      ...m,
      valor: valorPorPessoa,
      volume: volumePorPessoa,
    })));
  };

  const totalIndividualValor = useMemo(() => {
    return metasIndividuais.reduce((acc, curr) => acc + curr.valor, 0);
  }, [metasIndividuais]);

  const totalIndividualVolume = useMemo(() => {
    return metasIndividuais.reduce((acc, curr) => acc + curr.volume, 0);
  }, [metasIndividuais]);

  const diferencaValor = metaGlobalValor - totalIndividualValor;
  
  const handleUpdateConsultor = (nome: string, campo: 'valor' | 'volume', novoValor: number) => {
    setMetasIndividuais(prev => prev.map(m => 
      m.nome === nome ? { ...m, [campo]: novoValor } : m
    ));
  };

  const handleSalvar = async () => {
    // Aqui iria a chamada para a API
    alert("Metas salvas com sucesso!");
  };

  return {
    loading,
    metaGlobalValor,
    setMetaGlobalValor,
    metaGlobalVolume,
    setMetaGlobalVolume,
    metasIndividuais,
    totalIndividualValor,
    totalIndividualVolume,
    diferencaValor,
    dividirIgualitariamente,
    handleUpdateConsultor,
    handleSalvar
  };
}
