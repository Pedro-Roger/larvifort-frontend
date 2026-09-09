"use client";

import React, { createContext, useContext, useState, useId } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (val: string) => void;
  variant: "default" | "minimal";
  direction: "vertical" | "horizontal";
  baseId: string;
};

const TabsContext = createContext<TabsContextType | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tab components must be used inside a <TabRoot />");
  }
  return ctx;
}

export type TabRootProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultValue: string;
  variant?: "default" | "minimal";
  direction?: "vertical" | "horizontal";
};

export function TabRoot({
  defaultValue,
  variant = "default",
  direction = "vertical",
  className,
  children,
  ...props
}: TabRootProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const baseId = useId();

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab, variant, direction, baseId }}
    >
      <div
        className={cn(
          "flex w-full",
          direction === "horizontal" ? "flex-col gap-4" : "flex-row gap-6",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export type TabListProps = React.HTMLAttributes<HTMLDivElement>;

export function TabList({ className, children, ...props }: TabListProps) {
  const { variant, direction } = useTabs();

  return (
    <div
      role="tablist"
      aria-orientation={direction === "horizontal" ? "horizontal" : "vertical"}
      className={cn(
        "flex",
        direction === "horizontal"
          ? "flex-row items-center border-b border-slate-200 overflow-x-auto gap-2"
          : "flex-col space-y-1 min-w-[200px]",
        variant === "default" &&
          direction === "horizontal" &&
          "p-1 bg-slate-100 rounded-xl border-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type TabTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
  icon?: React.ReactNode;
  badge?: string | number;
};

export function TabTrigger({
  value,
  icon,
  badge,
  className,
  children,
  ...props
}: TabTriggerProps) {
  const { activeTab, setActiveTab, variant, direction, baseId } = useTabs();
  const isActive = activeTab === value;

  const triggerId = `${baseId}-trigger-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <button
      type="button"
      role="tab"
      id={triggerId}
      aria-controls={panelId}
      aria-selected={isActive}
      data-active={isActive ? "true" : "false"}
      onClick={() => setActiveTab(value)}
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium transition-all outline-none rounded-lg cursor-pointer select-none",
        variant === "default" && [
          direction === "horizontal"
            ? isActive
              ? "bg-white text-slate-800 shadow-xs font-semibold"
              : "text-slate-600 hover:text-slate-900"
            : isActive
              ? "bg-slate-100 text-slate-900 font-semibold"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        ],
        variant === "minimal" && [
          direction === "horizontal"
            ? isActive
              ? "border-b-2 border-brand-600 text-brand-600 font-semibold rounded-none -mb-px pb-2"
              : "border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 rounded-none -mb-px pb-2"
            : isActive
              ? "border-l-2 border-brand-600 text-brand-600 font-semibold rounded-none pl-3"
              : "border-l-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 rounded-none pl-3",
        ],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0 [&>svg]:size-5">{icon}</span>}
      <span>{children}</span>
      {badge !== undefined && (
        <Badge variant={isActive ? "primary" : "secondary"} className="ml-auto text-[10px] px-1.5 py-0.2">
          {badge}
        </Badge>
      )}
    </button>
  );
}

export type TabContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function TabContent({
  value,
  className,
  children,
  ...props
}: TabContentProps) {
  const { activeTab, baseId } = useTabs();
  const isActive = activeTab === value;

  const triggerId = `${baseId}-trigger-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={triggerId}
      tabIndex={0}
      className={cn("flex-1 outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}
