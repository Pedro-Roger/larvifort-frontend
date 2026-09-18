"use client";

import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlass, PencilSimple, Plus, SpinnerGap } from "@phosphor-icons/react";
import { createProduct, fetchProducts, updateProduct, type Product } from "@/services/products";

const money = (value: number | null) =>
  value == null ? "—" : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const emptyProduct = (): Omit<Product, "id"> => ({
  name: "",
  code: null,
  unit: "MILHEIRO",
  defaultPrice: null,
  active: true,
});

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setProducts(await fetchProducts());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => !query || `${product.name} ${product.code ?? ""}`.toLowerCase().includes(query));
  }, [products, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyProduct());
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({ name: product.name, code: product.code, unit: product.unit, defaultPrice: product.defaultPrice, active: product.active });
    setModalOpen(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || saving) return;
    setSaving(true);
    try {
      const product = editing ? await updateProduct(editing.id, form) : await createProduct(form);
      setProducts((current) => editing ? current.map((item) => item.id === product.id ? product : item) : [product, ...current]);
      setEditing(null);
      setModalOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar o produto.");
    } finally {
      setSaving(false);
    }
  }

  return <main className="min-h-full bg-[#f5f7fa] p-4 sm:p-6 xl:p-7">
    <div className="mx-auto max-w-[1200px] space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Catálogo operacional</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Produtos</h1><p className="mt-1 text-sm text-slate-500">Produtos, unidades de medida e preços usados nos pedidos.</p></div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-[#073B82] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B4FA3]"><Plus size={17} /> Novo produto</button>
      </header>
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4"><div className="relative max-w-md"><MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto ou código..." className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm" /></div></div>
        {loading ? <div className="flex justify-center gap-2 p-12 text-sm text-slate-500"><SpinnerGap className="animate-spin" /> Carregando produtos...</div> : error ? <div className="p-12 text-center text-sm text-red-600">{error}<button onClick={() => void load()} className="ml-2 font-semibold underline">Tentar novamente</button></div> : filtered.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">{search ? "Nenhum produto encontrado para esta busca." : "Nenhum produto cadastrado."}</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500"><tr><th className="px-4 py-3">Produto</th><th className="px-4 py-3">Código</th><th className="px-4 py-3">Unidade</th><th className="px-4 py-3">Preço padrão</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Ações</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((product) => <tr key={product.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-semibold text-slate-800">{product.name}</td><td className="px-4 py-3 text-slate-500">{product.code || "—"}</td><td className="px-4 py-3 text-slate-600">{product.unit}</td><td className="px-4 py-3 text-slate-700">{money(product.defaultPrice)}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${product.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{product.active ? "Ativo" : "Inativo"}</span></td><td className="px-4 py-3 text-right"><button aria-label={`Editar ${product.name}`} onClick={() => openEdit(product)} className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><PencilSimple size={16} /></button></td></tr>)}</tbody></table></div>}
      </section>
    </div>
    {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"><form onSubmit={save} className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="text-lg font-bold text-slate-950">{editing ? "Editar produto" : "Novo produto"}</h2><button type="button" onClick={() => setModalOpen(false)} className="text-sm text-slate-500">Fechar</button></div><div className="grid gap-4 p-5"><label className="text-sm font-semibold text-slate-700">Nome<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal" /></label><label className="text-sm font-semibold text-slate-700">Código<input value={form.code ?? ""} onChange={(event) => setForm({ ...form, code: event.target.value || null })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Unidade<select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal"><option>MILHEIRO</option><option>UNIDADE</option><option>KG</option><option>LITRO</option></select></label><label className="text-sm font-semibold text-slate-700">Preço padrão<input type="number" min="0" step="0.01" value={form.defaultPrice ?? ""} onChange={(event) => setForm({ ...form, defaultPrice: event.target.value ? Number(event.target.value) : null })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal" /></label></div><label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Produto ativo</label></div><div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4"><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancelar</button><button disabled={saving} className="rounded-lg bg-[#073B82] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Salvando..." : "Salvar produto"}</button></div></form></div>}
  </main>;
}
