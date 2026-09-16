import { useState, useMemo, useEffect } from "react";
import { fetchDashboardStats } from "@/services/dashboard";
import {
  loadCommercialGoals,
  saveCommercialGoals,
  DEFAULT_REGIOES,
  type MetaConsultor,
} from "@/services/commercialMetas";

export type { MetaConsultor };

export function useMetasConfig() {
  const [loading, setLoading] = useState(true);
  const [metaGlobalValor, setMetaGlobalValor] = useState(() => {
    const existing = loadCommercialGoals();
    return existing?.metaGlobalValor ?? 4500000;
  });
  const [metaGlobalVolume, setMetaGlobalVolume] = useState(() => {
    const existing = loadCommercialGoals();
    return existing?.metaGlobalVolume ?? 1250;
  });
  const [periodo, setPeriodo] = useState(() => {
    const existing = loadCommercialGoals();
    return existing?.periodo ?? "Q4 2026 · Safra";
  });
  const [metasIndividuais, setMetasIndividuais] = useState<MetaConsultor[]>(() => {
    const existing = loadCommercialGoals();
    return existing?.consultores ?? [];
  });
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    const existing = loadCommercialGoals();

    fetchDashboardStats()
      .then((stats) => {
        if (stats && stats.teamMembers && stats.teamMembers.length > 0) {
          const members = stats.teamMembers.map((m, i) => {
            const savedMember = existing?.consultores?.find((c) => c.nome === m.name);
            return {
              nome: m.name,
              iniciais: m.initials,
              regiao: savedMember?.regiao || DEFAULT_REGIOES[i % DEFAULT_REGIOES.length],
              contas: savedMember?.contas || (15 + i * 5),
              historico: savedMember?.historico || `R$ ${(1 + i * 0.3).toFixed(1)}M`,
              valor: savedMember?.valor || 0,
              volume: savedMember?.volume || 0,
              realizadoValor: savedMember?.realizadoValor || (m.done > 0 ? m.done * 45000 : 350000),
              realizadoVolume: savedMember?.realizadoVolume || (m.done > 0 ? m.done * 15 : 90),
              vendas: savedMember?.vendas || m.done,
              conversao: savedMember?.conversao || 70,
            };
          });
          setMetasIndividuais(members);
        }
      })
      .catch(() => {
        // keep fallback
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const dividirIgualitariamente = () => {
    if (metasIndividuais.length === 0) return;
    const valorPorPessoa = Math.round(metaGlobalValor / metasIndividuais.length);
    const volumePorPessoa = Math.round(metaGlobalVolume / metasIndividuais.length);

    setMetasIndividuais((prev) =>
      prev.map((m) => ({
        ...m,
        valor: valorPorPessoa,
        volume: volumePorPessoa,
      }))
    );
  };

  const totalIndividualValor = useMemo(() => {
    return metasIndividuais.reduce((acc, curr) => acc + (curr.valor || 0), 0);
  }, [metasIndividuais]);

  const totalIndividualVolume = useMemo(() => {
    return metasIndividuais.reduce((acc, curr) => acc + (curr.volume || 0), 0);
  }, [metasIndividuais]);

  const diferencaValor = metaGlobalValor - totalIndividualValor;

  const handleUpdateConsultor = (
    nome: string,
    campo: "valor" | "volume" | "regiao",
    novoValor: number | string
  ) => {
    setMetasIndividuais((prev) =>
      prev.map((m) => (m.nome === nome ? { ...m, [campo]: novoValor } : m))
    );
  };

  const handleSalvar = async () => {
    saveCommercialGoals({
      periodo,
      metaGlobalValor,
      metaGlobalVolume,
      consultores: metasIndividuais,
      updatedAt: new Date().toISOString(),
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
    if (typeof window !== "undefined" && typeof window.alert === "function") {
      window.alert("Metas salvas com sucesso!");
    }
  };

  return {
    loading,
    periodo,
    setPeriodo,
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
    handleSalvar,
    savedFeedback,
  };
}
