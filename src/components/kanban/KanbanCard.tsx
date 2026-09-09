"use client";

import { useRef } from "react";
import { ArrowRight } from "@phosphor-icons/react";

export interface ProjectCard {
  id: string;
  title: string;
  client: string;
  progress: number;
  tags: string[];
  assignee: { initials: string; name: string; color: string };
  dueDate: string;
  priority?: "alta" | "media" | "baixa";
}

const avatarColors: Record<string, string> = {
  blue: "bg-sky-100 text-sky-700",
  violet: "bg-violet-100 text-violet-700",
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  primary: "bg-sky-600 text-white",
};

const priorityStyles = {
  alta: "bg-red-50 text-red-600 border-red-200",
  media: "bg-amber-50 text-amber-600 border-amber-200",
  baixa: "bg-slate-100 text-slate-500 border-slate-200",
};

interface KanbanCardProps {
  card: ProjectCard;
  onClick?: () => void;
  onDragStart?: (cardId: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

export default function KanbanCard({
  card,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
}: KanbanCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", card.id);
    onDragStart?.(card.id);
    if (ref.current) {
      requestAnimationFrame(() => {
        ref.current?.classList.add("opacity-40");
      });
    }
  }

  function handleDragEnd() {
    ref.current?.classList.remove("opacity-40");
    onDragEnd?.();
  }

  return (
    <div
      ref={ref}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className={`p-3.5 rounded-xl bg-white border transition-all cursor-grab active:cursor-grabbing group ${
        isDragging
          ? "border-sky-400 shadow-lg shadow-sky-500/10 scale-[1.02]"
          : "border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Drag handle indicator */}
      <div className="flex items-center gap-1 mb-2 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="w-1 h-1 rounded-full bg-slate-300" />
        </div>
        <div className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="w-1 h-1 rounded-full bg-slate-300" />
        </div>
      </div>

      {/* Top row: Priority + Tags */}
      <div className="flex items-start justify-between gap-2">
        {card.priority && (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityStyles[card.priority]}`}
          >
            {card.priority.toUpperCase()}
          </span>
        )}
        <div className="flex flex-wrap gap-1 ml-auto">
          {card.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Title + Parent indicator */}
      <h4 className="font-semibold text-sm text-slate-900 mt-2 group-hover:text-sky-600 transition-colors truncate">
        {card.title}
      </h4>
      {("parentId" in (card as unknown as Record<string, unknown>) && (card as unknown as Record<string, unknown>).parentId) ? (
        <div className="text-[10px] text-amber-600 font-medium mt-0.5 flex items-center gap-1">
          <ArrowRight size={10} /> Subtarefa de #TK-{String((card as unknown as Record<string, unknown>).parentId).slice(-4)}
        </div>
      ) : null}

      {/* Client */}
      <p className="text-[11px] text-slate-400 mt-0.5">{card.client}</p>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-slate-500">Progresso</span>
          <span className="text-[10px] font-bold text-sky-600">{card.progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full transition-all"
            style={{ width: `${card.progress}%` }}
          />
        </div>
      </div>

      {/* Footer: Assignee + Due date */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${avatarColors[card.assignee.color] || avatarColors.blue}`}
          >
            {card.assignee.initials}
          </div>
          <span className="text-[11px] text-slate-500">{card.assignee.name}</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {card.dueDate}
        </span>
      </div>
    </div>
  );
}
