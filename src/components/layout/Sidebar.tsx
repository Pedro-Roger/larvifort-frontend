"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import NotificationCenter from "@/components/ui/NotificationCenter";
import GlobalSearch from "./GlobalSearch";
import {
  SquaresFour,
  Bell,
  CalendarDots,
  ShoppingCart,
  Kanban,
  ChartBar,
  Buildings,
  AddressBook,
  UsersThree,
  ClipboardText,
  Cube,
  Package,
  LinkSimple,
  Flask,
  CheckCircle,
  Truck,
  MapPin,
  FileText,
  Heartbeat,
  Gear,
  Question,
  SignOut,
  CaretUpDown,
  List,
  X,
} from "@phosphor-icons/react";

const mainMenu = [
  { label: "Dashboard", href: "/dashboard", icon: SquaresFour },
  { label: "Estoque", href: "/estoque", icon: Package },
  { label: "Reservas", href: "/estoque/reservas", icon: LinkSimple },
  { label: "Laboratório", href: "/laboratorio", icon: Flask },
  { label: "Separação", href: "/separacao", icon: CheckCircle },
  { label: "Logística", href: "/logistica", icon: Truck },
  { label: "Entregas", href: "/entregas", icon: MapPin },
  { label: "Fiscal", href: "/fiscal", icon: FileText },
  { label: "Pós-venda", href: "/pos-venda", icon: Heartbeat },
  { label: "Notificações", href: "#", icon: Bell, badge: 3 },
  { label: "Agenda", href: "/agenda", icon: CalendarDots },
  { label: "Pedidos", href: "/pedidos", icon: ShoppingCart },
  { label: "Quadro", href: "/kanban", icon: Kanban },
  { label: "Pesquisa", href: "/pesquisa", icon: ClipboardText },
];

const registros = [
  { label: "Produtos", href: "/produtos", icon: Cube },
  { label: "Unidades e berçários", href: "/estoque/unidades", icon: Buildings },
  { label: "Métricas", href: "/metricas", icon: ChartBar },
  { label: "Empresas", href: "/empresas", icon: Buildings },
  { label: "Clientes & Contatos", href: "/clientes", icon: AddressBook },
  { label: "Equipe", href: "/equipe", icon: UsersThree },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    router.replace("/");
  }

  const closeMobile = () => setMobileOpen(false);
  const displayName =
    [user?.firstName, user?.lastName]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(" ") ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Usuário";

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menu"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-50 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
      >
        <List size={21} />
      </button>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[calc(100vw-2rem)] flex-col justify-between border-r border-slate-900/30 bg-[#0E1B2F] text-slate-200 select-none transition-transform duration-200 lg:static lg:z-10 lg:w-52 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center gap-2 border-b border-white/10 p-4">
            <div className="relative h-12 w-full">
              <Image
                src="/larvifort.png"
                alt="LarviFort"
                fill
                sizes="224px"
              className="object-contain brightness-0 invert"
                priority
              />
            </div>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={closeMobile}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Search Bar */}
          <GlobalSearch />

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-4">
            {/* Main Menu */}
            <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3">
                Menu Principal
              </span>
              <nav className="mt-1.5 space-y-0.5 text-xs font-medium">
                {mainMenu
                  .filter((item) => item.label !== "Notificações")
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={closeMobile}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                           isActive
                             ? "border-l-2 border-blue-300 bg-[#17345d] text-white font-semibold"
                             : "text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            size={18}
                            className={
                               isActive ? "text-blue-200" : "text-slate-400"
                            }
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-brand-100 text-brand-700 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                <NotificationCenter variant="sidebar" />
              </nav>
            </div>

            {/* Registros */}
            <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3">
                Registros
              </span>
              <nav className="mt-1.5 space-y-0.5 text-xs font-medium">
                {registros.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeMobile}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                           isActive
                             ? "border-l-2 border-blue-300 bg-[#17345d] text-white font-semibold"
                             : "text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={
                           isActive ? "text-blue-200" : "text-slate-400"
                        }
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Footer Menu */}
        <div className="mt-auto px-3 py-4 border-t border-white/10 space-y-0.5 text-xs font-medium text-slate-300">
          <div className="mb-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <div className="min-w-0 text-left leading-tight">
                <p className="truncate text-xs font-semibold text-white">
                {displayName}
              </p>
                <p className="truncate text-[11px] text-slate-400">
                {user?.email ?? ""}
              </p>
            </div>
            <CaretUpDown className="shrink-0 text-slate-400" size={14} />
          </div>
          <Link
            href="/configuracoes"
            onClick={closeMobile}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
              pathname === "/configuracoes"
                 ? "bg-[#17345d] text-white"
                 : "hover:bg-white/10 text-slate-300"
            }`}
          >
            <Gear
              size={18}
              className={
                 pathname === "/configuracoes" ? "text-white" : "text-slate-400"
              }
            />
            <span>Configurações</span>
          </Link>
          <Link
            href="#"
            onClick={closeMobile}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
          >
            <Question size={18} className="text-slate-400" />
            <span>Ajuda & Suporte</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
          >
            <SignOut size={18} className="text-slate-400" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
