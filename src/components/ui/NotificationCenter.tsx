"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  X,
  Check,
  Archive,
  Trash,
  Info,
  CheckCircle,
  WarningCircle,
  XCircle,
  Gear,
  ArrowCounterClockwise,
  ArrowSquareOut,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Notification, NotificationType } from "@/services/notifications";
import { formatDateBR, cn } from "@/lib/utils";

interface NotificationCenterProps {
  variant?: "sidebar" | "header" | "icon-only";
}

const TYPE_CONFIG: Record<
  NotificationType,
  {
    icon: typeof Info;
    iconColor: string;
    bgColor: string;
    borderColor: string;
    badgeText: string;
    badgeBg: string;
  }
> = {
  info: {
    icon: Info,
    iconColor: "text-sky-600",
    bgColor: "bg-sky-50/70",
    borderColor: "border-sky-200",
    badgeText: "text-sky-700",
    badgeBg: "bg-sky-100",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-50/70",
    borderColor: "border-emerald-200",
    badgeText: "text-emerald-700",
    badgeBg: "bg-emerald-100",
  },
  warning: {
    icon: WarningCircle,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-50/70",
    borderColor: "border-amber-200",
    badgeText: "text-amber-700",
    badgeBg: "bg-amber-100",
  },
  error: {
    icon: XCircle,
    iconColor: "text-rose-600",
    bgColor: "bg-rose-50/70",
    borderColor: "border-rose-200",
    badgeText: "text-rose-700",
    badgeBg: "bg-rose-100",
  },
};

export default function NotificationCenter({
  variant = "sidebar",
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    preferences,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    archive,
    unarchive,
    deleteNotification,
    clearArchived,
    updatePreferences,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "unread" | "archived" | "preferences"
  >("all");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsFeedback, setPrefsFeedback] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read && !n.archived;
    if (activeTab === "archived") return n.archived;
    if (activeTab === "preferences") return false;
    return !n.archived;
  });

  const archivedCount = notifications.filter((n) => n.archived).length;
  const activeCount = notifications.filter((n) => !n.archived).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && !notification.archived) {
      markAsRead(notification.id);
    }
    const actionUrl = notification.actionUrl;
    if (actionUrl) {
      // Use setTimeout to defer the navigation to avoid immutability warnings
      setTimeout(() => {
        window.location.href = actionUrl;
      }, 0);
    }
  };

  const handleTogglePreference = async (
    key: keyof typeof preferences,
    value: boolean
  ) => {
    setSavingPrefs(true);
    await updatePreferences({ [key]: value });
    setSavingPrefs(false);
    setPrefsFeedback(true);
    setTimeout(() => setPrefsFeedback(false), 2000);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      {variant === "sidebar" ? (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-xs font-medium cursor-pointer",
            isOpen
              ? "bg-brand-50/80 text-brand-700 font-semibold border border-brand-100 shadow-sm"
              : "text-slate-600 hover:bg-slate-100/80"
          )}
          aria-expanded={isOpen}
          aria-label="Abrir central de notificações"
        >
          <div className="flex items-center gap-2.5">
            <Bell
              size={18}
              className={isOpen ? "text-brand-600" : "text-slate-500"}
              weight={unreadCount > 0 ? "fill" : "regular"}
            />
            <span>Notificações</span>
          </div>
          {unreadCount > 0 && (
            <span className="bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 bg-white shadow-sm transition-colors cursor-pointer"
          aria-expanded={isOpen}
          aria-label="Notificações"
        >
          <Bell
            size={18}
            className={unreadCount > 0 ? "text-brand-600" : "text-slate-600"}
            weight={unreadCount > 0 ? "fill" : "regular"}
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Floating Dropdown Drawer */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-150",
            variant === "sidebar"
              ? "left-0 sm:left-full sm:ml-2 sm:-mt-10 w-[360px] sm:w-[420px]"
              : "right-0 w-[360px] sm:w-[420px]"
          )}
          style={{ maxHeight: "calc(100vh - 120px)" }}
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
                <Bell size={16} weight="fill" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Central de Notificações
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold text-brand-700 bg-brand-100 rounded-full">
                  {unreadCount} nova{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    activeTab === "preferences" ? "all" : "preferences"
                  )
                }
                className={cn(
                  "p-1.5 rounded-lg transition-colors cursor-pointer",
                  activeTab === "preferences"
                    ? "bg-brand-100 text-brand-700"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                )}
                title="Preferências de Notificação"
                aria-label="Preferências"
              >
                <Gear size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          {activeTab !== "preferences" && (
            <div className="flex items-center border-b border-slate-100 bg-slate-50/40 px-3 py-1.5 gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5",
                  activeTab === "all"
                    ? "bg-white text-slate-800 font-semibold shadow-xs border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                <span>Todas</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({activeCount})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("unread")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5",
                  activeTab === "unread"
                    ? "bg-white text-slate-800 font-semibold shadow-xs border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                <span>Não lidas</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-1.5 py-0.2 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("archived")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5",
                  activeTab === "archived"
                    ? "bg-white text-slate-800 font-semibold shadow-xs border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                <span>Arquivadas</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({archivedCount})
                </span>
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto max-h-[420px] min-h-[220px]">
            {activeTab === "preferences" ? (
              /* Notification Preferences Panel */
              <div className="p-4 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      Preferências do Usuário
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Personalize quais notificações você deseja receber
                    </p>
                  </div>
                  {prefsFeedback && (
                    <span className="text-[11px] text-emerald-600 font-medium animate-fade-in">
                      Salvo!
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="font-medium text-slate-700">
                        Notificações no Navegador
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Alertas visuais e push no navegador
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.browserNotifications}
                      disabled={savingPrefs}
                      onChange={(e) =>
                        handleTogglePreference(
                          "browserNotifications",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="font-medium text-slate-700">
                        Alertas por E-mail
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Receber resumos de atividades e menções
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      disabled={savingPrefs}
                      onChange={(e) =>
                        handleTogglePreference(
                          "emailNotifications",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="font-medium text-slate-700">
                        Atribuição de Tarefas
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Quando uma tarefa for delegada a você
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.taskAssigned}
                      disabled={savingPrefs}
                      onChange={(e) =>
                        handleTogglePreference(
                          "taskAssigned",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="font-medium text-slate-700">
                        Mudança de Status de Tarefas
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Transições de estágio e hand-offs intersetoriais
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.taskStatusChanged}
                      disabled={savingPrefs}
                      onChange={(e) =>
                        handleTogglePreference(
                          "taskStatusChanged",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="font-medium text-slate-700">
                        Alertas do Sistema
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Avisos operacionais e atualizações críticas
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.systemAlerts}
                      disabled={savingPrefs}
                      onChange={(e) =>
                        handleTogglePreference("systemAlerts", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="font-medium text-slate-700">
                        Sons de Notificação
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Emitir efeito sonoro ao receber alertas
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.soundEnabled}
                      disabled={savingPrefs}
                      onChange={(e) =>
                        handleTogglePreference("soundEnabled", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab("all")}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Voltar às notificações
                  </button>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              /* Empty State */
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Bell size={24} weight="regular" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  {activeTab === "unread"
                    ? "Nenhuma notificação não lida"
                    : activeTab === "archived"
                    ? "Nenhuma notificação arquivada"
                    : "Nenhuma notificação por enquanto"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  {activeTab === "unread"
                    ? "Você está em dia com todas as suas mensagens e tarefas!"
                    : activeTab === "archived"
                    ? "Notificações arquivadas aparecerão aqui quando você optar por guardá-las."
                    : "Quando houver novas movimentações ou alertas no CRM, eles serão listados aqui."}
                </p>
              </div>
            ) : (
              /* Notification List */
              <div className="divide-y divide-slate-100">
                {filteredNotifications.map((notification) => {
                  const config =
                    TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
                  const Icon = config.icon;

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "p-3.5 hover:bg-slate-50/80 transition-colors flex items-start gap-3 group relative cursor-pointer",
                        !notification.read && !notification.archived
                          ? "bg-brand-50/20"
                          : ""
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                          config.bgColor,
                          config.borderColor,
                          config.iconColor
                        )}
                      >
                        <Icon size={18} weight="fill" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5
                              className={cn(
                                "text-xs text-slate-800 break-words",
                                !notification.read
                                  ? "font-bold text-slate-900"
                                  : "font-semibold"
                              )}
                            >
                              {notification.title}
                            </h5>
                            {!notification.read && !notification.archived && (
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatDateBR(notification.createdAt)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed break-words line-clamp-3">
                          {notification.message}
                        </p>

                        {/* Action URL */}
                        {notification.actionUrl && (
                          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700">
                            <span>
                              {notification.actionLabel || "Visualizar"}
                            </span>
                            <ArrowSquareOut size={12} />
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div
                        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-start"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!notification.archived ? (
                          <>
                            {notification.read ? (
                              <button
                                type="button"
                                onClick={() => markAsUnread(notification.id)}
                                title="Marcar como não lida"
                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded cursor-pointer transition-colors"
                              >
                                <ArrowCounterClockwise size={13} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => markAsRead(notification.id)}
                                title="Marcar como lida"
                                className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded cursor-pointer transition-colors"
                              >
                                <Check size={13} weight="bold" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => archive(notification.id)}
                              title="Arquivar"
                              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded cursor-pointer transition-colors"
                            >
                              <Archive size={13} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => unarchive(notification.id)}
                            title="Desarquivar"
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded cursor-pointer transition-colors"
                          >
                            <ArrowCounterClockwise size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteNotification(notification.id)}
                          title="Excluir"
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {activeTab !== "preferences" && (
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
              {activeTab === "archived" ? (
                archivedCount > 0 ? (
                  <button
                    type="button"
                    onClick={clearArchived}
                    className="text-[11px] text-red-600 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash size={12} />
                    <span>Limpar todas arquivadas</span>
                  </button>
                ) : (
                  <span />
                )
              ) : unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Check size={12} weight="bold" />
                  <span>Marcar todas como lidas</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Todas as mensagens em dia
                </span>
              )}

              <button
                type="button"
                onClick={() => setActiveTab("preferences")}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <SlidersHorizontal size={12} />
                <span>Preferências</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
