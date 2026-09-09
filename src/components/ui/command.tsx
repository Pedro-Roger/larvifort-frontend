"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  Dialog as AriaDialog,
} from "react-aria-components";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type CommandContextType = {
  search: string;
  setSearch: (value: string) => void;
  filteredCount: number;
  setFilteredCount: React.Dispatch<React.SetStateAction<number>>;
};

const CommandContext = createContext<CommandContextType | null>(null);

function useCommand() {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error("Command components must be used within a <Command />");
  }
  return context;
}

export type CommandProps = React.HTMLAttributes<HTMLDivElement> & {
  shouldFilter?: boolean;
};

export function Command({ className, children, ...props }: CommandProps) {
  const [search, setSearch] = useState("");
  const [filteredCount, setFilteredCount] = useState(0);

  return (
    <CommandContext.Provider
      value={{ search, setSearch, filteredCount, setFilteredCount }}
    >
      <div
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-xl bg-white text-slate-800 shadow-lg border border-slate-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  );
}

export interface CommandDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function CommandDialog({
  isOpen,
  onOpenChange,
  children,
  className,
}: CommandDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!isOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onOpenChange]);

  return (
    <AriaModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className={({ isEntering, isExiting }) =>
        cn(
          "fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-[15vh] backdrop-blur-[2px]",
          isEntering && "animate-in fade-in-0",
          isExiting && "animate-out fade-out-0"
        )
      }
    >
      <AriaModal
        className={({ isEntering, isExiting }) =>
          cn(
            "w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none",
            isEntering && "animate-in zoom-in-95 ease-out duration-150",
            isExiting && "animate-out zoom-out-95 ease-in duration-100",
            className
          )
        }
      >
        <AriaDialog className="outline-none">{children}</AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );
}

export type CommandInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function CommandInput({ className, ...props }: CommandInputProps) {
  const { search, setSearch } = useCommand();

  return (
    <div className="flex items-center border-b border-slate-100 px-3.5">
      <MagnifyingGlass size={18} className="mr-2 text-slate-400 shrink-0" />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}

export type CommandListProps = React.HTMLAttributes<HTMLDivElement>;

export function CommandList({ className, children, ...props }: CommandListProps) {
  return (
    <div
      className={cn(
        "max-h-[300px] overflow-y-auto overflow-x-hidden p-1.5 scrollbar-thin",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CommandEmptyProps = React.HTMLAttributes<HTMLDivElement>;

export function CommandEmpty({ className, children, ...props }: CommandEmptyProps) {
  const { search } = useCommand();

  // If there is no search, don't show empty
  if (!search) return null;

  return (
    <div
      className={cn(
        "py-6 text-center text-xs text-slate-500",
        className
      )}
      {...props}
    >
      {children || "Nenhum resultado encontrado."}
    </div>
  );
}

export type CommandGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  heading?: React.ReactNode;
};

export function CommandGroup({
  heading,
  className,
  children,
  ...props
}: CommandGroupProps) {
  return (
    <div className={cn("overflow-hidden p-1 text-slate-700", className)} {...props}>
      {heading && (
        <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {heading}
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export type CommandItemProps = React.HTMLAttributes<HTMLDivElement> & {
  disabled?: boolean;
  onSelect?: () => void;
  value?: string;
  textValue?: string;
};

export function CommandItem({
  className,
  children,
  disabled,
  onSelect,
  textValue,
  value,
  ...props
}: CommandItemProps) {
  const { search } = useCommand();

  const searchTarget = (textValue || value || "").toLowerCase();
  const searchNormalized = search.trim().toLowerCase();

  const isVisible =
    !searchNormalized || searchTarget.includes(searchNormalized);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="button"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => {
        if (!disabled && onSelect) onSelect();
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          if (onSelect) onSelect();
        }
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CommandShortcutProps = React.HTMLAttributes<HTMLSpanElement>;

export function CommandShortcut({
  className,
  children,
  ...props
}: CommandShortcutProps) {
  return (
    <span
      className={cn(
        "ml-auto text-[10px] tracking-widest text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export type CommandSeparatorProps = React.HTMLAttributes<HTMLHRElement>;

export function CommandSeparator({
  className,
  ...props
}: CommandSeparatorProps) {
  return (
    <hr className={cn("-mx-1 my-1 border-t border-slate-100", className)} {...props} />
  );
}
