"use client";

import React, { createContext, useContext } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Info,
  CheckCircle,
  Warning,
  XCircle,
  Bell,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type AlertStatus = "default" | "success" | "warning" | "error" | "info";

const AlertContext = createContext<{ status: AlertStatus }>({
  status: "default",
});

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] flex gap-3 items-start",
  {
    variants: {
      status: {
        default: "border-slate-200 bg-white text-slate-800",
        info: "border-sky-200 bg-sky-50 text-sky-900",
        success: "border-emerald-200 bg-emerald-50 text-emerald-900",
        warning: "border-amber-200 bg-amber-50 text-amber-900",
        error: "border-rose-200 bg-rose-50 text-rose-900",
      },
    },
    defaultVariants: {
      status: "default",
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  status?: AlertStatus;
}

export function Alert({
  className,
  status = "default",
  children,
  ...props
}: AlertProps) {
  return (
    <AlertContext.Provider value={{ status }}>
      <div
        role="alert"
        data-slot="alert"
        data-status={status}
        className={cn(alertVariants({ status }), className)}
        {...props}
      >
        {children}
      </div>
    </AlertContext.Provider>
  );
}

export function AlertIndicator({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { status } = useContext(AlertContext);

  const defaultIcon = {
    default: <Bell size={20} className="text-slate-500" />,
    info: <Info size={20} className="text-sky-500" />,
    success: <CheckCircle size={20} className="text-emerald-500" />,
    warning: <Warning size={20} className="text-amber-500" />,
    error: <XCircle size={20} className="text-rose-500" />,
  }[status];

  return (
    <div
      data-slot="alert-indicator"
      data-status={status}
      aria-hidden="true"
      role="presentation"
      className={cn("shrink-0 mt-0.5", className)}
      {...props}
    >
      {children || defaultIcon}
    </div>
  );
}

export function AlertContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-content"
      className={cn("flex-1 space-y-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { status } = useContext(AlertContext);
  return (
    <h4
      data-slot="alert-title"
      data-status={status}
      className={cn("text-sm font-semibold tracking-tight leading-none", className)}
      {...props}
    >
      {children}
    </h4>
  );
}

export function AlertDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { status } = useContext(AlertContext);
  return (
    <div
      data-slot="alert-description"
      data-status={status}
      className={cn("text-xs leading-relaxed opacity-90", className)}
      {...props}
    >
      {children}
    </div>
  );
}
