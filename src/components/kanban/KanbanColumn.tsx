"use client";

import { useState, useRef } from "react";
import { Plus, Trash, DotsThree, Palette } from "@phosphor-icons/react";
import KanbanCard, { type ProjectCard } from "./KanbanCard";
import { DropdownMenu, DropdownTrigger } from "@/components/ui/DropdownMenu";

interface KanbanColumnProps {
  title: string;
  count: number;
  color: string;
  cards: ProjectCard[];
  highlighted?: boolean;
  columnId?: string;
  onCardClick?: (card: ProjectCard) => void;
  draggedCardId?: string | null;
  onDragStart?: (cardId: string) => void;
  onDragEnd?: () => void;
  onAddColumn?: () => void;
  onAddTask?: (status: string) => void;
  onDeleteColumn?: (toColumnTitle?: string) => void;
  onEditColumn?: () => void;
  // Column reordering
  onColumnDragStart?: (columnId: string) => void;
  onColumnDragEnd?: () => void;
  onColumnDragOver?: (columnId: string) => void;
  onColumnDrop?: (fromColumnId: string, toColumnId: string) => void;
  draggedColumnId?: string | null;
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
  columnId,
  onCardClick,
  draggedCardId,
  onDragStart,
  onDragEnd,
  onAddColumn,
  onAddTask,
  onDeleteColumn,
  onEditColumn,
  onColumnDragStart,
  onColumnDragEnd,
  onColumnDragOver,
  onColumnDrop,
  draggedColumnId,
}: KanbanColumnProps) {
  const [isDragOver] = useState(false);
  const [dropIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Column reordering handlers
  function handleColumnDragStart(e: React.DragEvent) {
    if (!columnId) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", columnId);
    onColumnDragStart?.(columnId);
  }

  function handleColumnDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (columnId) {
      onColumnDragOver?.(columnId);
    }
  }

  function handleColumnDragLeave(e: React.DragEvent) {
    if (e.currentTarget === e.target) {
      // Optional: handle drag leave
    }
  }

  function handleColumnDrop(e: React.DragEvent) {
    e.preventDefault();
    const fromColumnId = e.dataTransfer.getData("text/plain");
    if (fromColumnId && columnId && fromColumnId !== columnId) {
      onColumnDrop?.(fromColumnId, columnId);
    }
    onColumnDragEnd?.();
  }

  function handleColumnDragEnd() {
    onColumnDragEnd?.();
  }

  const isColumnDragging = draggedColumnId === columnId;

  return (
    <div
      ref={headerRef}
      draggable={!!columnId}
      onDragStart={handleColumnDragStart}
      onDragOver={handleColumnDragOver}
      onDragLeave={handleColumnDragLeave}
      onDrop={handleColumnDrop}
      onDragEnd={handleColumnDragEnd}
      className={`w-[320px] shrink-0 flex flex-col rounded-xl flex-none h-[calc(100vh-250px)] transition-all ${
        highlighted
          ? "bg-sky-50/80 border-2 border-sky-300 shadow-sm"
          : isDragOver
          ? "bg-sky-50/60 border-2 border-dashed border-sky-400 shadow-inner"
          : isColumnDragging
          ? "bg-sky-50/60 border-2 border-dashed border-sky-400 opacity-75"
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
            {columnId && (
              <button
                type="button"
                className="w-7 h-7 rounded-md hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-grab active:cursor-grabbing"
                aria-label="Reordenar coluna"
              >
                <DotsThree size={16} />
              </button>
            )}
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
         <div className="flex items-center gap-1">
           <DropdownMenu
             trigger={<DropdownTrigger />}
             align="left"
              items={[
                { label: "+ Criar Coluna", onClick: () => onAddColumn?.() },
                { label: "+ Criar Tarefa", onClick: () => onAddTask?.(title) },
                ...(onEditColumn ? [{ label: "Editar Coluna", icon: <Palette size={12} />, onClick: () => onEditColumn() }] : []),
                { label: "Excluir Coluna", icon: <Trash size={12} />, onClick: () => onDeleteColumn?.(), variant: "danger" as const },
              ]}
           />
            <button
              type="button"
              onClick={() => onAddColumn?.()}
              className="w-7 h-7 rounded-md hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors ml-1 cursor-pointer"
              aria-label="Nova coluna"
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              onClick={() => onAddTask?.(title)}
              className="w-7 h-7 rounded-md hover:bg-sky-200/60 flex items-center justify-center text-sky-400 hover:text-sky-600 transition-colors ml-1 cursor-pointer"
              aria-label="Nova tarefa"
              title="Nova tarefa"
            >
              <Plus size={14} weight="bold" />
            </button>
        </div>
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
