"use client";

import React from "react";
import {
  MenuTrigger as AriaMenuTrigger,
  Button as AriaButton,
  Popover as AriaPopover,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  Section as AriaSection,
  Header as AriaHeader,
  Separator as AriaSeparator,
  type MenuTriggerProps,
  type ButtonProps,
  type PopoverProps,
  type MenuItemProps,
  type SectionProps,
  type SeparatorProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";

export const DropdownMenu = (props: MenuTriggerProps) => {
  return <AriaMenuTrigger {...props} />;
};

export const DropdownMenuTrigger = ({
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <AriaButton
      className={cn(
        "inline-flex items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </AriaButton>
  );
};

export const DropdownMenuContent = ({
  className,
  children,
  ...props
}: PopoverProps & { children: React.ReactNode }) => {
  return (
    <AriaPopover
      className={({ isEntering, isExiting }) =>
        cn(
          "z-50 min-w-[10rem] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 text-slate-700 shadow-xl outline-none data-[placement=bottom]:slide-in-from-top-2 data-[placement=top]:slide-in-from-bottom-2",
          isEntering && "animate-in fade-in-0 zoom-in-95",
          isExiting && "animate-out fade-out-0 zoom-out-95",
          className
        )
      }
      {...props}
    >
      <AriaMenu className="outline-none flex flex-col gap-0.5">
        {children}
      </AriaMenu>
    </AriaPopover>
  );
};

export const DropdownMenuItem = ({
  className,
  children,
  ...props
}: MenuItemProps) => {
  return (
    <AriaMenuItem
      className={({ isFocused, isDisabled }) =>
        cn(
          "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none transition-colors",
          isFocused && "bg-slate-100 text-slate-900",
          isDisabled && "pointer-events-none opacity-50",
          className
        )
      }
      {...props}
    >
      {children}
    </AriaMenuItem>
  );
};

export const DropdownMenuSection = ({
  className,
  children,
  ...props
}: SectionProps<object>) => {
  return (
    <AriaSection className={cn("py-1", className)} {...props}>
      {children}
    </AriaSection>
  );
};

export const DropdownMenuHeader = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AriaHeader>) => {
  return (
    <AriaHeader
      className={cn(
        "px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider",
        className
      )}
      {...props}
    >
      {children}
    </AriaHeader>
  );
};

export const DropdownMenuSeparator = ({
  className,
  ...props
}: SeparatorProps) => {
  return (
    <AriaSeparator
      className={cn("-mx-1 my-1 h-px bg-slate-100", className)}
      {...props}
    />
  );
};
