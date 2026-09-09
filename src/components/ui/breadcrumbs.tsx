"use client";

import React from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  dividerType?: "slash" | "chevron" | "dot";
  className?: string;
}

export function Breadcrumbs({
  items,
  dividerType = "slash",
  className,
}: BreadcrumbsProps) {
  const renderDivider = () => {
    switch (dividerType) {
      case "chevron":
        return <CaretRight size={14} className="text-slate-400 shrink-0" />;
      case "dot":
        return <span className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />;
      case "slash":
      default:
        return <span className="text-slate-300 select-none">/</span>;
    }
  };

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href + index} className="flex items-center gap-2">
              {isLast ? (
                <span
                  aria-current="page"
                  className="flex items-center gap-1.5 font-semibold text-slate-800 [&>svg]:size-4"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 font-medium hover:text-slate-800 transition-colors [&>svg]:size-4"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}
              {!isLast && renderDivider()}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
