"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChatCircleDots,
  X,
  ArrowsClockwise,
  PaperPlaneRight,
  MagnifyingGlass,
  Lightning,
  Question,
  ArrowUpRight,
  Kanban,
  CalendarDots,
  AddressBook,
  Buildings,
  Target,
  ClipboardText,
  UsersThree,
  SquaresFour,
  CaretDown,
  CaretUp,
  User,
  Gear,
  Check,
  Copy,
  Sun,
} from "@phosphor-icons/react";
import {
  LIA_QUICK_ACTIONS,
  LIA_FAQ_LIST,
  getLiaResponse,
  type ChatMessage,
  type QuickAction,
  type FAQItem,
} from "./liaKnowledgeBase";
import { queryLiaAI } from "@/services/aiChat";

const ACTION_ICONS: Record<string, React.ElementType> = {
  Kanban,
  CalendarDots,
  AddressBook,
  Buildings,
  Target,
  ClipboardText,
  UsersThree,
  SquaresFour,
  User,
  Gear,
};

type ActiveTab = "chat" | "actions" | "faq";

let messageCounter = 0;
function createMessageId(prefix: string) {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

const CLEAN_SUGGESTIONS = [
  "Resumo do dia e pendências",
  "Próximas visitas e reuniões",
  "Metas e vendas deste mês",
  "Como fazer check-in na visita?",
  "Como criar regras no Kanban?",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    sender: "lia",
    text: "Olá. Sou a **Lia**, assistente do **LarviFort CRM**.\n\nPosso ajudar com resumo do dia, agenda, clientes, metas e uso da plataforma.",
    timestamp: "Agora",
    suggestedQuestions: CLEAN_SUGGESTIONS,
    actions: [
      { label: "Gerar resumo do dia", actionKey: "daily-briefing" },
      { label: "Ver Ações Rápidas", actionKey: "tab-actions" },
      { label: "Ajuda", actionKey: "tab-faq" },
    ],
  },
];

export default function LiaFloatingAssistant() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const [showTooltip, setShowTooltip] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // FAQ state
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategory, setFaqCategory] = useState<string>("all");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(
    "faq-agenda-checkin-gps",
  );

  // Actions search state
  const [actionSearch, setActionSearch] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (activeTab === "chat" && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, activeTab, isOpen]);

  // Focus input when chat tab is opened
  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, activeTab]);

  // Close tooltip after 10s
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const query = (textToSend || inputValue).trim();
      if (!query || isTyping) return;

      const timeStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const userMessage: ChatMessage = {
        id: createMessageId("user"),
        sender: "user",
        text: query,
        timestamp: timeStr,
      };

      setMessages((prev) => [...prev, userMessage]);
      if (!textToSend) setInputValue("");
      setIsTyping(true);

      // Query AI backend with live CRM Context
      try {
        const aiResult = await queryLiaAI({
          messages: messages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
          customPrompt: query,
        });

        if (aiResult.reply) {
          const liaMessage: ChatMessage = {
            id: createMessageId("lia"),
            sender: "lia",
            text: aiResult.reply,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            actions: [
              { label: "Ir para o Kanban", href: "/kanban" },
              { label: "Abrir Agenda", href: "/agenda" },
              { label: "Ver Dashboard", href: "/dashboard" },
            ],
            suggestedQuestions: [
              "Atualizar resumo do dia",
              "Quem está mais perto da meta este mês?",
              "Clientes sem visita recente",
            ],
          };

          setMessages((prev) => [...prev, liaMessage]);
          setIsTyping(false);
          return;
        }
      } catch (err) {
        console.warn("AI query failed, using local rules:", err);
      }

      // Smooth fallback to local intelligent knowledge base
      setTimeout(() => {
        const liaReply = getLiaResponse(query);
        const liaMessage: ChatMessage = {
          id: createMessageId("lia"),
          sender: "lia",
          text: liaReply.text,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          actions: liaReply.actions,
          suggestedQuestions: liaReply.suggestedQuestions,
        };

        setMessages((prev) => [...prev, liaMessage]);
        setIsTyping(false);
      }, 450);
    },
    [inputValue, isTyping, messages],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: createMessageId("welcome"),
        sender: "lia",
        text: "Conversa reiniciada. Como posso ajudar?",
        timestamp: "Agora",
        suggestedQuestions: CLEAN_SUGGESTIONS,
        actions: [
          { label: "Gerar resumo do dia", actionKey: "daily-briefing" },
          { label: "Ver Ações Rápidas", actionKey: "tab-actions" },
        ],
      },
    ]);
  };

  const handleTriggerDailyBriefing = () => {
    setActiveTab("chat");
    handleSendMessage(
      "Gere um resumo objetivo do CRM com: resumo de ontem; prioridades de hoje; próximas visitas e reuniões; metas e pontos de atenção.",
    );
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteAction = (
    action: QuickAction | { href?: string; actionKey?: string },
  ) => {
    if (action.actionKey === "daily-briefing") {
      handleTriggerDailyBriefing();
      return;
    }
    if (action.actionKey === "tab-actions") {
      setActiveTab("actions");
      return;
    }
    if (action.actionKey === "tab-faq") {
      setActiveTab("faq");
      return;
    }
    if (action.href) {
      router.push(action.href);
      setIsOpen(false);
    }
  };

  // Filtered FAQ items
  const filteredFaqList = useMemo(() => {
    return LIA_FAQ_LIST.filter((item) => {
      const matchesSearch =
        faqSearch.trim() === "" ||
        item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
        item.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
        item.keywords.some((kw) =>
          kw.toLowerCase().includes(faqSearch.toLowerCase()),
        );
      const matchesCat = faqCategory === "all" || item.category === faqCategory;
      return matchesSearch && matchesCat;
    });
  }, [faqSearch, faqCategory]);

  // Filtered Quick Actions
  const filteredQuickActions = useMemo(() => {
    if (!actionSearch.trim()) return LIA_QUICK_ACTIONS;
    const query = actionSearch.toLowerCase();
    return LIA_QUICK_ACTIONS.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query),
    );
  }, [actionSearch]);

  // Markdown renderer for bold text, headers, and bullet points
  const renderFormattedText = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      if (line.startsWith("### ") || line.startsWith("## ")) {
        const headerText = line.replace(/^#{2,3}\s+/, "");
        return (
          <h4
            key={idx}
            className="font-bold text-xs sm:text-sm text-slate-900 mt-2 mb-1 flex items-center gap-1.5"
          >
            {headerText}
          </h4>
        );
      }

      const isBullet =
        line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ");
      const isNumbered = /^\d+\.\s/.test(line);

      let lineContent = line;
      if (isBullet) lineContent = line.slice(2);
      else if (isNumbered) lineContent = line.replace(/^\d+\.\s/, "");

      const parts = lineContent.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div
            key={idx}
            className="flex items-start gap-2 my-0.5 text-xs sm:text-[13px] leading-relaxed"
          >
            <span className="text-brand-600 font-bold select-none">•</span>
            <span className="flex-1">{renderedParts}</span>
          </div>
        );
      }

      if (isNumbered) {
        const numMatch = line.match(/^(\d+)\.\s/);
        const number = numMatch ? numMatch[1] : "•";
        return (
          <div
            key={idx}
            className="flex items-start gap-2 my-0.5 text-xs sm:text-[13px] leading-relaxed"
          >
            <span className="text-brand-600 font-bold select-none">
              {number}.
            </span>
            <span className="flex-1">{renderedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="my-0.5 text-xs sm:text-[13px] leading-relaxed">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* FLOATING TRIGGER BUTTON (BOTTOM RIGHT) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6 flex flex-col items-end pointer-events-auto">
        {/* Tooltip bubble when closed */}
        {!isOpen && showTooltip && (
          <div className="mb-3 mr-1 relative flex items-center gap-2 rounded-2xl bg-white/95 px-3.5 py-2 text-xs font-medium text-slate-700 shadow-xl border border-slate-200 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[240px]">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                Fale com a <strong>Lia</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="ml-1 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              title="Fechar dica"
            >
              <X size={12} />
            </button>
            <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-slate-200 bg-white" />
          </div>
        )}

        {/* Circular Avatar Trigger */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className={`group relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full p-0.5 shadow-2xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-brand-500/30 ${
            isOpen
              ? "bg-slate-900 text-white scale-95"
              : "bg-slate-900 hover:scale-105 active:scale-95 shadow-slate-900/20"
          }`}
          aria-label={isOpen ? "Fechar assistente Lia" : "Abrir assistente Lia"}
          title={isOpen ? "Fechar Lia" : "Abrir Lia"}
        >
          {isOpen ? (
            <div className="flex items-center justify-center">
              <X size={26} weight="bold" className="text-white" />
            </div>
          ) : (
            <div className="relative h-full w-full rounded-full overflow-hidden border-2 border-white/90 shadow-inner bg-slate-900 flex items-center justify-center">
              <Image
                src="/lia.png"
                alt="Lia"
                fill
                sizes="64px"
                priority
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING ASSISTANT CARD / MODAL */}
      {/* ========================================================================= */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 flex w-[430px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100dvh-7.5rem)] flex-col rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
          role="dialog"
          aria-label="Assistente Lia"
        >
          {/* Header - Clean & Minimalist */}
          <div className="relative flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5 text-slate-900">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                <Image
                  src="/lia.png"
                  alt="Lia Avatar"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-1 ring-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                    Lia
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Online • Suporte da plataforma
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {activeTab === "chat" && (
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Reiniciar conversa"
                >
                  <ArrowsClockwise size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                title="Fechar assistente"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-white px-2 pt-2 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-t-xl py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "chat"
                  ? "bg-white text-brand-700 shadow-sm border-t border-x border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <ChatCircleDots
                size={15}
                weight={activeTab === "chat" ? "fill" : "regular"}
              />
              <span>Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("actions")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-t-xl py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "actions"
                  ? "bg-white text-brand-700 shadow-sm border-t border-x border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Lightning
                size={15}
                weight={activeTab === "actions" ? "fill" : "regular"}
              />
              <span>Ações Rápidas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("faq")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-t-xl py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "faq"
                  ? "bg-white text-brand-700 shadow-sm border-t border-x border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Question
                size={15}
                weight={activeTab === "faq" ? "fill" : "regular"}
              />
              <span>Ajuda</span>
            </button>
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 min-h-0 flex flex-col bg-white">
            {/* ================================================================= */}
            {/* TAB 1: CHAT WITH LIA */}
            {/* ================================================================= */}
            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`flex gap-2.5 max-w-[90%] ${
                          msg.sender === "user"
                            ? "flex-row-reverse"
                            : "flex-row"
                        }`}
                      >
                        {msg.sender === "lia" && (
                          <div className="relative h-7 w-7 shrink-0 rounded-full overflow-hidden border border-slate-200 bg-slate-800 shadow-sm mt-0.5">
                            <Image
                              src="/lia.png"
                              alt="Lia"
                              fill
                              sizes="28px"
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div
                          className={`group relative rounded-2xl px-3.5 py-2.5 text-slate-800 shadow-xs ${
                            msg.sender === "user"
                              ? "bg-brand-600 text-white rounded-br-xs"
                              : "bg-slate-100/90 text-slate-800 rounded-bl-xs border border-slate-200/70"
                          }`}
                        >
                          <div
                            className={
                              msg.sender === "user"
                                ? "text-white text-xs sm:text-[13px]"
                                : "text-slate-800"
                            }
                          >
                            {renderFormattedText(msg.text)}
                          </div>

                          {/* Action links inside Lia's answer */}
                          {msg.actions && msg.actions.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-slate-200/60 pt-2">
                              {msg.actions.map((act, aIdx) => (
                                <button
                                  key={aIdx}
                                  type="button"
                                  onClick={() => handleExecuteAction(act)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-xs border border-brand-200 hover:bg-brand-50 transition-colors cursor-pointer"
                                >
                                  <span>{act.label}</span>
                                  <ArrowUpRight size={12} />
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Copy button for Lia messages */}
                          {msg.sender === "lia" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyMessage(msg.id, msg.text)
                              }
                              className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 rounded transition-opacity cursor-pointer bg-white/70 shadow-xs"
                              title="Copiar texto"
                            >
                              {copiedId === msg.id ? (
                                <Check size={11} className="text-emerald-600" />
                              ) : (
                                <Copy size={11} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {msg.timestamp}
                      </span>

                      {/* Suggested questions from Lia */}
                      {msg.suggestedQuestions &&
                        msg.suggestedQuestions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5 pl-9 max-w-full">
                            {msg.suggestedQuestions.map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => handleSendMessage(sug)}
                                className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors cursor-pointer text-left"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-7 w-7 shrink-0 rounded-full overflow-hidden border border-slate-200 bg-slate-800 shadow-sm">
                        <Image
                          src="/lia.png"
                          alt="Lia"
                          fill
                          sizes="28px"
                          className="object-cover"
                        />
                      </div>
                      <div className="rounded-xl rounded-bl-xs bg-slate-100 border border-slate-200/70 px-3 py-2.5 flex items-center gap-2">
                        <ArrowsClockwise
                          size={14}
                          className="text-slate-400 animate-spin"
                        />
                        <span className="text-[11px] font-medium text-slate-500">
                          Processando resposta...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-3 border-t border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-300 px-3 py-1.5 shadow-xs focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Digite sua pergunta..."
                      className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isTyping}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white disabled:opacity-40 hover:bg-brand-700 transition-colors cursor-pointer shadow-xs shrink-0"
                      title="Enviar mensagem"
                    >
                      <PaperPlaneRight size={15} weight="fill" />
                    </button>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-slate-400">
                    <span>Pressione Enter para enviar</span>
                    <span className="text-slate-400">LarviFort CRM</span>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 2: AÇÕES RÁPIDAS (SHORTCUTS & ACTIONS) */}
            {/* ================================================================= */}
            {activeTab === "actions" && (
              <div className="flex-1 flex flex-col min-h-0 p-4">
                {/* Search */}
                <div className="relative mb-3 shrink-0">
                  <MagnifyingGlass
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={actionSearch}
                    onChange={(e) => setActionSearch(e.target.value)}
                    placeholder="Buscar ação ou funcionalidade..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* Actions Grid */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {/* Highlight Action: Briefing */}
                  <button
                    type="button"
                    onClick={handleTriggerDailyBriefing}
                    className="group w-full flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/40 p-3 text-left hover:border-amber-300 hover:bg-amber-100/50 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold group-hover:scale-105 transition-transform">
                        <Sun size={19} weight="fill" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-bold text-amber-950 group-hover:text-amber-900 truncate">
                            Resumo do dia
                          </h3>
                        </div>
                        <p className="text-[11px] text-amber-800 truncate">
                          Ontem, hoje e próximos compromissos
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="shrink-0 text-amber-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </button>

                  {filteredQuickActions.map((action) => {
                    const IconComp = ACTION_ICONS[action.iconName] || Lightning;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => handleExecuteAction(action)}
                        className="group w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 text-left hover:border-brand-300 hover:bg-brand-50/40 hover:shadow-sm transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                            <IconComp size={18} weight="bold" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-brand-700 truncate">
                                {action.title}
                              </h3>
                              {action.badge && (
                                <span className="rounded-full bg-brand-100 px-1.5 py-0.2 text-[9px] font-bold text-brand-800">
                                  {action.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {action.description}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight
                          size={16}
                          className="shrink-0 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                        />
                      </button>
                    );
                  })}

                  {filteredQuickActions.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Nenhuma ação rápida encontrada para &quot;{actionSearch}
                      &quot;.
                    </div>
                  )}
                </div>

                {/* Footer hint */}
                <div className="mt-3 pt-2 border-t border-slate-100 text-center text-[11px] text-slate-400 shrink-0">
                  Clique em qualquer atalho para navegar diretamente.
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 3: DÚVIDAS FREQUENTES (FAQ) */}
            {/* ================================================================= */}
            {activeTab === "faq" && (
              <div className="flex-1 flex flex-col min-h-0 p-4">
                {/* Search */}
                <div className="relative mb-3 shrink-0">
                  <MagnifyingGlass
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="Buscar em dúvidas frequentes..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* Category filters */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 shrink-0 scrollbar-none">
                  {[
                    { id: "all", label: "Todas" },
                    { id: "kanban", label: "Kanban" },
                    { id: "agenda", label: "Agenda & GPS" },
                    { id: "clientes", label: "Clientes" },
                    { id: "metas", label: "Metas" },
                    { id: "equipe", label: "Equipe" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFaqCategory(cat.id)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        faqCategory === cat.id
                          ? "bg-brand-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* FAQ Accordion List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredFaqList.map((item: FAQItem) => {
                    const isExpanded = expandedFaqId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border transition-all ${
                          isExpanded
                            ? "border-brand-300 bg-brand-50/20 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedFaqId(isExpanded ? null : item.id)
                          }
                          className="w-full flex items-center justify-between p-3 text-left cursor-pointer gap-2"
                        >
                          <span className="text-xs font-semibold text-slate-800">
                            {item.question}
                          </span>
                          {isExpanded ? (
                            <CaretUp
                              size={14}
                              className="shrink-0 text-brand-600"
                            />
                          ) : (
                            <CaretDown
                              size={14}
                              className="shrink-0 text-slate-400"
                            />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-3 pb-3 pt-0 border-t border-brand-100/60 text-xs text-slate-600">
                            <div className="pt-2">
                              {renderFormattedText(item.answer)}
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              {item.actionLink && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (item.actionLink) {
                                      router.push(item.actionLink.href);
                                      setIsOpen(false);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-brand-700 transition-colors cursor-pointer"
                                >
                                  <span>{item.actionLink.label}</span>
                                  <ArrowUpRight size={11} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab("chat");
                                  handleSendMessage(item.question);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:underline cursor-pointer ml-auto"
                              >
                                Perguntar à Lia no chat →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredFaqList.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Nenhuma dúvida encontrada para os filtros selecionados.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
