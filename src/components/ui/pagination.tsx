"use client";

import React from "react";
import { CaretLeft, CaretRight, DotsThree } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: "default" | "compact";
  sideLayout?: "full" | "label" | "icon";
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = "default",
  sideLayout = "full",
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isPrevDisabled}
        aria-label="Página anterior"
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
          sideLayout === "icon" && "p-2 px-2"
        )}
      >
        <CaretLeft size={14} weight="bold" />
        {sideLayout !== "icon" && (
          <span className={cn(sideLayout === "label" && "hidden sm:inline")}>
            Anterior
          </span>
        )}
      </button>

      {/* Page Numbers */}
      {variant !== "compact" && (
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-8 w-8 items-center justify-center text-slate-400"
                >
                  <DotsThree size={16} weight="bold" />
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`Ir para a página ${page}`}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer",
                  isCurrent
                    ? "bg-brand-600 font-semibold text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}

      {/* Compact text info */}
      {variant === "compact" && (
        <span className="px-3 text-xs text-slate-500">
          Página <span className="font-semibold text-slate-800">{currentPage}</span> de{" "}
          <span className="font-semibold text-slate-800">{totalPages}</span>
        </span>
      )}

      {/* Next Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isNextDisabled}
        aria-label="Próxima página"
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
          sideLayout === "icon" && "p-2 px-2"
        )}
      >
        {sideLayout !== "icon" && (
          <span className={cn(sideLayout === "label" && "hidden sm:inline")}>
            Próxima
          </span>
        )}
        <CaretRight size={14} weight="bold" />
      </button>
    </nav>
  );
}
