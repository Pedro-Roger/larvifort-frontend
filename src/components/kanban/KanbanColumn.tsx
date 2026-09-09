"use client";

import { useState, useRef } from "react";
import { Plus, Trash, DotsThree } from "@phosphor-icons/react";
import KanbanCard, { type ProjectCard } from "./KanbanCard";

interface KanbanColumnProps {
  title: string;
  count: number;
  color: string;
  cards: ProjectCard[];
  highlighted?: boolean;
  onCardClick?: (card: ProjectCard) => void;
  onCardMove?: (cardId: string, toColumn: string, toIndex: number) => void;
  draggedCardId?: string | null;
  onDragStart?: (cardId: string) => void;
  onDragEnd?: () => void;
  onAddColumn?: () => void;
  onDeleteColumn?: (toColumnTitle?: string) => void;
}

const dotColors: Record<string, string> = {
  slate: "bg-slate-400",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
};

export default function KanbanColumn({
  title,
  count,
  color,
  cards,
  highlighted = false,
  onCardClick,
  onCardMove,
  draggedCardId,
  onDragStart,
  onDragEnd,
  onAddColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);

    if (!listRef.current) return;

    const cardElements = listRef.current.querySelectorAll("[data-card-wrapper]");
    let closestIndex = cards.length;

    cardElements.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        closestIndex = i;
      }
    });

    setDropIndex(closestIndex);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
      setDropIndex(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");
    if (cardId && onCardMove) {
      onCardMove(cardId, title, dropIndex ?? cards.length);
    }
    setIsDragOver(false);
    setDropIndex(null);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-[320px] shrink-0 flex flex-col rounded-xl flex-none h-[calc(100vh-250px)] transition-all ${
        highlighted
          ? "bg-sky-50/80 border-2 border-sky-300 shadow-sm"
          : isDragOver
            ? "bg-sky-50/60 border-2 border-dashed border-sky-400 shadow-inner"
            : "bg-slate-50/80 border border-slate-200/80"
      }`}
    >
      {/* Stage Header */}
      <div
        className={`p-4 border-b flex items-center justify-between ${
          highlighted
            ? "border-sky-200 bg-sky-100/40 rounded-t-xl"
            : "border-slate-200/60"
        }`}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${dotColors[color] || "bg-slate-400"}`}
            />
            <h3
              className={`font-bold text-sm tracking-tight ${
                highlighted ? "text-sky-700" : "text-slate-800"
              }`}
            >
              {title}
            </h3>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded-full">
              {count}
            </span>
          </div>
        </div>
        <button 
          type="button"
          onClick={() => { setShowMenu(!showMenu); }}
          className="w-7 h-7 rounded-md hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors relative cursor-pointer"
          aria-label="Opções da coluna"
        >
          <DotsThree size={16} />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-10 w-40 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1 overflow-hidden text-xs font-medium text-slate-700">
              <button type="button" onClick={() => { setShowMenu(false); onAddColumn?.(); }} className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2">+ Criar Coluna</button>
              <button type="button" onClick={() => { setShowMenu(false); onDeleteColumn?.(); }} className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 transition-colors cursor-pointer flex items-center gap-2"><Trash size={12}/> Excluir Coluna</button>
            </div>
          </>
        )}
        <button 
          type="button"
          onClick={() => onAddColumn?.()}
          className="w-7 h-7 rounded-md hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors ml-1 cursor-pointer"
          aria-label="Nova coluna"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Cards List */}
      <div ref={listRef} className="flex-1 p-3 space-y-3 overflow-y-auto">
        {cards.map((card, index) => (
          <div key={card.id} data-card-wrapper>
            {/* Drop placeholder BEFORE this card */}
            {isDragOver && dropIndex === index && (
              <div className="h-2 mb-3 rounded-lg border-2 border-dashed border-sky-400 bg-sky-100/50 transition-all animate-pulse" />
            )}
            <KanbanCard
              card={card}
              onClick={() => onCardClick?.(card)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggedCardId === card.id}
            />
          </div>
        ))}

        {/* Drop placeholder at END of list */}
        {isDragOver && dropIndex === cards.length && (
          <div className="h-2 rounded-lg border-2 border-dashed border-sky-400 bg-sky-100/50 transition-all animate-pulse" />
        )}

        {/* Empty state with drop zone */}
        {cards.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed transition-all ${
              isDragOver
                ? "border-sky-400 bg-sky-100/50"
                : "border-slate-200 bg-white/50"
            }`}
          >
            <span className="text-xs text-slate-400 font-medium">
              {isDragOver ? "Solte aqui" : "Arraste tarefas para cá"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
