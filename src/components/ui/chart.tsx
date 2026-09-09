"use client";

import React from "react";
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from "recharts";
import { cn } from "@/lib/utils";

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  initialDimension?: { width: number; height: number };
  children: React.ReactNode;
}

export function ChartContainer({
  className,
  children,
  initialDimension,
  ...props
}: ChartContainerProps) {
  return (
    <div
      className={cn("w-full h-full min-h-[160px] text-xs", className)}
      {...props}
    >
      <ResponsiveContainer
        width={initialDimension?.width ? "100%" : "100%"}
        height={initialDimension?.height ? "100%" : "100%"}
        initialDimension={initialDimension}
      >
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

export const ChartTooltip = RechartsTooltip;
export const ChartLegend = RechartsLegend;

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string | number;
  indicator?: "dot" | "line" | "square";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  labelClassName?: string;
  className?: string;
  formatter?: (
    value: unknown,
    name: unknown,
    item: unknown,
    index: number
  ) => React.ReactNode;
  labelFormatter?: (label: unknown, payload: unknown[]) => React.ReactNode;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  labelClassName,
  className,
  formatter,
  labelFormatter,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white/95 p-2.5 text-xs shadow-xl backdrop-blur-md min-w-[8rem] text-slate-800",
        className
      )}
    >
      {!hideLabel && (
        <div className={cn("font-medium text-slate-500 mb-1.5 pb-1 border-b border-slate-100", labelClassName)}>
          {labelFormatter ? labelFormatter(label, payload) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const itemColor = item.color || "#3b82f6";
          const formattedValue = formatter
            ? formatter(item.value, item.name, item, index)
            : item.value;

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-3 font-medium"
            >
              <div className="flex items-center gap-1.5 text-slate-600">
                {!hideIndicator && (
                  <span
                    className={cn(
                      "shrink-0",
                      indicator === "dot" && "h-2 w-2 rounded-full",
                      indicator === "square" && "h-2 w-2 rounded-xs",
                      indicator === "line" && "h-0.5 w-3 rounded-full"
                    )}
                    style={{ backgroundColor: itemColor }}
                  />
                )}
                <span>{item.name}</span>
              </div>
              <span className="font-semibold text-slate-900">{formattedValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface ChartLegendContentProps {
  payload?: Array<{
    value?: string;
    color?: string;
    dataKey?: string;
  }>;
  hideIndicator?: boolean;
  className?: string;
}

export function ChartLegendContent({
  payload,
  hideIndicator = false,
  className,
}: ChartLegendContentProps) {
  if (!payload?.length) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-600 pt-3",
        className
      )}
    >
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          {!hideIndicator && (
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
          )}
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
