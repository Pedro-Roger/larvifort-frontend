"use client";

import { useMetasConfig } from "@/hooks/useMetasConfig";
import {
  Check,
  ChartLineUp,
  FloppyDisk,
  Info,
  Target,
  UsersThree,
  X
} from "@phosphor-icons/react";
import Link from "next/link";

export default function ConfigurarMetasPage() {
  const {
    loading,
    metaGlobalValor,
    setMetaGlobalValor,
    metaGlobalVolume,
    setMetaGlobalVolume,
    metasIndividuais,
    totalIndividualValor,
    diferencaValor,
    dividirIgualitariamente,
    handleUpdateConsultor,
    handleSalvar
  } = useMetasConfig();

  if (loading) {
    return (
      <div className="min-h-full bg-[#f8faff] p-8 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  // Formatador
  const formatMoney = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-full bg-[#080d1a] text-slate-100 p-4 sm:p-6 lg:p-8 selection:bg-sky-500 selection:text-white">
      {/* Background gradients for the dark theme */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-500/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto rounded-2xl border border-sky-400/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="px-6 py-5 border-b border-slate-700/40 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400/20 to-indigo-500/20 border border-sky-300/30 flex items-center justify-center text-sky-300 shadow-[0_0_15px_-3px_rgba(125,211,252,0.2)]">
              <Target size={24} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Definir Metas Comerciais</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-400/10 border border-sky-400/25 text-sky-300">
                  Q4 2026 · Safra
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Estipule os objetivos globais da equipe e distribua cotas individuais por consultor técnico.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="h-8 w-8 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
              <X size={18} weight="bold" />
            </Link>
          </div>
        </header>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* SEÇÃO 1: METAS GLOBAIS DO TIME */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChartLineUp size={20} weight="duotone" className="text-sky-300" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Meta Global do Time de Vendas</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-sky-300/20">
                <div className="flex items-start justify-between">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Meta de Faturamento (R$)</label>
                    <p className="text-[11px] text-slate-400">Receita total projetada</p>
                  </div>
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-mono">BRL</span>
                </div>
                <div className="mt-3 relative flex items-center">
                  <span className="absolute left-3 text-sky-300 font-semibold text-sm">R$</span>
                  <input 
                    type="number"
                    value={metaGlobalValor}
                    onChange={(e) => setMetaGlobalValor(Number(e.target.value))}
                    className="w-full bg-slate-900/60 text-lg font-bold font-mono text-white pl-10 pr-4 py-2.5 rounded-lg border border-sky-300/30 focus:border-sky-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-sky-300/20">
                <div className="flex items-start justify-between">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Meta de Volume (Toneladas)</label>
                    <p className="text-[11px] text-slate-400">Expedição física total</p>
                  </div>
                  <span className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-mono">TON</span>
                </div>
                <div className="mt-3 relative flex items-center">
                  <input 
                    type="number"
                    value={metaGlobalVolume}
                    onChange={(e) => setMetaGlobalVolume(Number(e.target.value))}
                    className="w-full bg-slate-900/60 text-lg font-bold font-mono text-white pl-4 pr-16 py-2.5 rounded-lg border border-sky-300/30 focus:border-sky-300 focus:outline-none"
                  />
                  <span className="absolute right-3 text-slate-400 font-medium text-xs">ton</span>
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 2: AÇÕES */}
          <section className="bg-slate-900/30 p-3.5 rounded-xl border border-slate-700/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">Distribuição Rápida:</span>
              <div className="inline-flex rounded-lg border border-slate-700/60 p-0.5 bg-slate-950/60">
                <button 
                  onClick={dividirIgualitariamente}
                  className="px-2.5 py-1 text-xs rounded-md bg-sky-500/20 border border-sky-400/30 text-sky-300 font-medium"
                >
                  Dividir Igualitário
                </button>
              </div>
            </div>
          </section>

          {/* SEÇÃO 3: METAS INDIVIDUAIS */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <UsersThree size={20} weight="duotone" className="text-sky-300" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Metas Individuais</h2>
            </div>
            
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/50">
                    <th className="py-3 px-4">Consultor</th>
                    <th className="py-3 px-4 w-52">Valor (R$)</th>
                    <th className="py-3 px-4 w-44">Volume (Ton)</th>
                    <th className="py-3 px-4 text-center w-24">% da Cota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {metasIndividuais.map((m) => {
                    const perc = metaGlobalValor > 0 ? (m.valor / metaGlobalValor) * 100 : 0;
                    return (
                      <tr key={m.nome} className="hover:bg-slate-800/30">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs ring-2 ring-sky-400/20">
                              {m.iniciais}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-100">{m.nome}</div>
                              <div className="text-[11px] text-slate-400">{m.regiao}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <input 
                            type="number"
                            value={m.valor}
                            onChange={(e) => handleUpdateConsultor(m.nome, 'valor', Number(e.target.value))}
                            className="w-full bg-slate-900/60 text-xs font-mono text-white px-3 py-1.5 rounded-lg border border-slate-700 focus:border-sky-300 focus:outline-none"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <input 
                            type="number"
                            value={m.volume}
                            onChange={(e) => handleUpdateConsultor(m.nome, 'volume', Number(e.target.value))}
                            className="w-full bg-slate-900/60 text-xs font-mono text-white px-3 py-1.5 rounded-lg border border-slate-700 focus:border-sky-300 focus:outline-none"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold text-sky-300 bg-sky-400/10 border border-sky-400/20">
                            {perc.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Soma Individual: <strong className="font-mono text-white">{formatMoney(totalIndividualValor)}</strong>
              </span>
              <span className={`font-medium flex items-center gap-1 ${diferencaValor === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {diferencaValor === 0 ? <Check weight="bold" /> : <Info weight="bold" />} 
                Diferença: {formatMoney(diferencaValor)}
              </span>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/60 flex justify-end gap-3">
          <Link href="/dashboard" className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/70 border border-slate-700/60">
            Cancelar
          </Link>
          <button 
            onClick={handleSalvar}
            className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-sky-300 to-sky-400 hover:opacity-95 shadow-[0_0_15px_-3px_rgba(125,211,252,0.5)] flex items-center gap-2"
          >
            <FloppyDisk size={16} weight="bold" />
            Salvar Metas
          </button>
        </footer>
      </div>
    </div>
  );
}
