"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlass,
  User,
  Buildings,
  Kanban,
  CalendarBlank,
  CircleNotch,
} from "@phosphor-icons/react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { fetchClients, type Cliente } from "@/services/clients";
import { fetchEmpresas, type Empresa } from "@/services/companies";
import { fetchTasks, type Task } from "@/services/tasks";

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [clients, setClients] = useState<Cliente[]>([]);
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const router = useRouter();

  // Open via ⌘K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch results when dialog is opened
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const [clientsRes, companiesRes, tasksRes] = await Promise.all([
          fetchClients({ pageSize: 50 }).catch(() => ({ items: [] })),
          fetchEmpresas({ pageSize: 50 }).catch(() => ({ items: [] })),
          fetchTasks().catch(() => []),
        ]);
        if (!isMounted) return;
        setClients(clientsRes.items);
        setCompanies(companiesRes.items);
        setTasks(tasksRes);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    void loadData();

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  return (
    <>
      <div className="px-4 pt-3 pb-1">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex items-center w-full bg-white text-xs pl-8 pr-8 py-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300 focus:outline-none transition-colors cursor-pointer text-left"
        >
          <MagnifyingGlass className="absolute left-2.5 text-slate-400 text-sm" size={14} />
          <span>Buscar...</span>
          <div className="absolute right-2 text-[10px] text-slate-400 font-medium px-1 py-0.5 border border-slate-200 rounded bg-slate-50 leading-none">
            ⌘K
          </div>
        </button>
      </div>

      <CommandDialog isOpen={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Digite para buscar clientes, empresas, tarefas..." />
          <CommandList>
            {loading && (
              <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <CircleNotch size={14} className="animate-spin" />
                <span>Carregando dados...</span>
              </div>
            )}

            {!loading && <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>}

            {/* Navigation Pages */}
            <CommandGroup heading="Navegação Rápida">
              <CommandItem
                value="Dashboard Visão Geral"
                onSelect={() => handleSelect("/dashboard")}
              >
                <CalendarBlank size={14} className="mr-2 text-slate-400" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem
                value="Clientes Contatos Leads"
                onSelect={() => handleSelect("/clientes")}
              >
                <User size={14} className="mr-2 text-slate-400" />
                <span>Clientes</span>
              </CommandItem>
              <CommandItem
                value="Empresas Grupos"
                onSelect={() => handleSelect("/empresas")}
              >
                <Buildings size={14} className="mr-2 text-slate-400" />
                <span>Empresas</span>
              </CommandItem>
              <CommandItem
                value="Kanban Tarefas Operacional"
                onSelect={() => handleSelect("/kanban")}
              >
                <Kanban size={14} className="mr-2 text-slate-400" />
                <span>Kanban</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Clients */}
            {clients.length > 0 && (
              <CommandGroup heading="Clientes">
                {clients.slice(0, 8).map((c) => (
                  <CommandItem
                    key={`client-${c.id}`}
                    value={`${c.firstName} ${c.lastName} ${c.email || ""} ${c.cpfCnpj || ""}`}
                    onSelect={() => handleSelect(`/clientes?search=${encodeURIComponent(c.firstName)}`)}
                  >
                    <User size={14} className="mr-2 text-sky-500" />
                    <span className="font-medium">{c.firstName} {c.lastName}</span>
                    {c.email && (
                      <span className="ml-2 text-[10px] text-slate-400">({c.email})</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Companies */}
            {companies.length > 0 && (
              <CommandGroup heading="Empresas">
                {companies.slice(0, 8).map((comp) => (
                  <CommandItem
                    key={`company-${comp.id}`}
                    value={`${comp.name} ${comp.cnpj || ""} ${comp.city || ""}`}
                    onSelect={() => handleSelect(`/empresas?search=${encodeURIComponent(comp.name)}`)}
                  >
                    <Buildings size={14} className="mr-2 text-amber-500" />
                    <span className="font-medium">{comp.name}</span>
                    {comp.cnpj && (
                      <span className="ml-2 text-[10px] text-slate-400">({comp.cnpj})</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Tasks */}
            {tasks.length > 0 && (
              <CommandGroup heading="Tarefas">
                {tasks.slice(0, 8).map((t) => (
                  <CommandItem
                    key={`task-${t.id}`}
                    value={`${t.titulo} ${t.descricao || ""} ${t.status}`}
                    onSelect={() => handleSelect(`/kanban`)}
                  >
                    <Kanban size={14} className="mr-2 text-emerald-500" />
                    <span className="font-medium">{t.titulo}</span>
                    <span className="ml-auto text-[10px] text-slate-400 font-mono">
                      {t.status}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
