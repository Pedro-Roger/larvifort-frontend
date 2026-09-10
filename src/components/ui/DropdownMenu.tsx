"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export type DropdownItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger" | "success";
  disabled?: boolean;
};

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  width?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const alignClasses = {
  left: "left-0",
  right: "right-0",
};

const widthClasses = {
  sm: "w-40",
  md: "w-48",
  lg: "w-56",
};

export function DropdownMenu({ trigger, items, align = "right", width = "md", disabled = false }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (disabled) {
    return <>{trigger}</>;
  }

  const variantColors = {
    default: "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
    danger: "text-red-600 hover:bg-red-50 hover:text-red-700",
    success: "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700",
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={cn("absolute z-50 mt-1 origin-top-right rounded-xl border border-slate-200 bg-white shadow-xl py-1 focus:outline-none", alignClasses[align], widthClasses[width])}>
            {items.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                disabled={item.disabled}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors",
                  variantColors[item.variant || "default"],
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Reusable trigger button with consistent styling
interface DropdownTriggerProps {
  icon?: React.ReactNode;
  className?: string;
}

export function DropdownTrigger({ icon, className }: DropdownTriggerProps) {
  return (
    <button
      type="button"
      className={cn(
        "w-7 h-7 rounded-md hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer",
        className
      )}
    >
      {icon || <span className="text-slate-400">⋮</span>}
    </button>
  );
}