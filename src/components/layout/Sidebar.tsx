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
  Handshake,
  Kanban,
  ChartBar,
  Buildings,
  AddressBook,
  UsersThree,
  ClipboardText,
  Gear,
  Question,
  SignOut,
  CaretUpDown,
  List,
  X,
} from "@phosphor-icons/react";

const mainMenu = [
  { label: "Dashboard", href: "/dashboard", icon: SquaresFour },
  { label: "Notificações", href: "#", icon: Bell, badge: 3 },
  { label: "Agenda", href: "/agenda", icon: CalendarDots },
  { label: "Negócios", href: "#", icon: Handshake },
  { label: "Quadro", href: "/kanban", icon: Kanban },
  { label: "Pesquisa", href: "/pesquisa", icon: ClipboardText },
];

const registros = [
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
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[calc(100vw-2rem)] flex-col justify-between border-r border-slate-200/80 bg-[#fafbfc] select-none transition-transform duration-200 lg:static lg:z-10 lg:w-64 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center gap-2 border-b border-slate-200/70 p-4">
            <div className="relative h-12 w-full">
              <Image
                src="/larvifort.png"
                alt="LarviFort"
                fill
                sizes="224px"
                className="object-contain"
                priority
              />
            </div>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={closeMobile}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Search Bar */}
          <GlobalSearch />

          {/* Navigation Links */}
          <div className="px-3 py-2 space-y-4">
            {/* Main Menu */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
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
                            ? "bg-brand-50/80 text-brand-700 font-semibold border border-brand-100 shadow-sm"
                            : "text-slate-600 hover:bg-slate-100/80"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            size={18}
                            className={
                              isActive ? "text-brand-600" : "text-slate-500"
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
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
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
                          ? "bg-brand-50/80 text-brand-700 font-semibold border border-brand-100 shadow-sm"
                          : "text-slate-600 hover:bg-slate-100/80"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={
                          isActive ? "text-brand-600" : "text-slate-500"
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
        <div className="mt-auto px-3 py-4 border-t border-slate-200/70 space-y-0.5 text-xs font-medium text-slate-500">
          <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="min-w-0 text-left leading-tight">
              <p className="truncate text-xs font-semibold text-slate-800">
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
                ? "bg-slate-900 text-white"
                : "hover:bg-slate-100/80 text-slate-600"
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
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100/80 text-slate-600 transition-colors"
          >
            <Question size={18} className="text-slate-400" />
            <span>Ajuda & Suporte</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100/80 text-slate-600 transition-colors"
          >
            <SignOut size={18} className="text-slate-400" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
