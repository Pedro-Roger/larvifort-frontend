"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card" | "table-row" | "avatar";
  lines?: number;
  className?: string;
}

export function Skeleton({
  variant = "text",
  lines = 1,
  className,
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = {
    background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
    backgroundSize: "200% 100%",
    animation: "skeleton-loading 1.5s infinite",
    borderRadius: "0.375rem",
  } as React.CSSProperties;

  const variantStyles: Record<string, React.CSSProperties> = {
    text: { height: "1rem", width: "100%" },
    circular: { borderRadius: "9999px" },
    rectangular: { borderRadius: "0.5rem" },
    card: { borderRadius: "0.75rem", minHeight: "120px" },
    "table-row": { height: "2.5rem" },
    avatar: { borderRadius: "9999px" },
  };

  const mergedStyle = {
    ...baseStyles,
    ...variantStyles[variant],
    ...style,
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={cn("space-y-2", className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={{
              ...mergedStyle,
              width: i === lines - 1 ? "60%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={cn(className)} style={mergedStyle} {...props} />;
}

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-4 animate-pulse", className)}>
      <Skeleton variant="text" lines={1} style={{ width: "40%" }} />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} variant="text" style={{ width: i === lines - 1 ? "70%" : "100%" }} />
        ))}
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ rows = 4, columns = 6, className }: SkeletonTableProps) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white overflow-hidden animate-pulse", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton variant="text" style={{ width: "80px" }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, row) => (
              <tr key={row} className="hover:bg-slate-50">
                {Array.from({ length: columns }).map((_, col) => (
                  <td key={col} className="px-4 py-3">
                    <Skeleton variant="text" style={{ width: col === 0 ? "120px" : "80px" }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SkeletonModalProps {
  className?: string;
  sections?: number;
}

export function SkeletonModal({ className, sections = 4 }: SkeletonModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />
      <div className={cn("relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden", className)}>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <Skeleton variant="text" style={{ width: "180px", height: "1.25rem" }} />
        </div>
        <form className="flex-1 overflow-y-auto p-6 space-y-4">
          {Array.from({ length: sections }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" style={{ height: "72px" }} />
          ))}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Skeleton variant="rectangular" style={{ width: "80px", height: "36px" }} />
            <Skeleton variant="rectangular" style={{ width: "100px", height: "36px" }} />
          </div>
        </form>
      </div>
    </div>
  );
}

interface SkeletonListItemProps {
  className?: string;
  hasAvatar?: boolean;
}

export function SkeletonListItem({ className, hasAvatar = true }: SkeletonListItemProps) {
  return (
    <div className={cn("flex items-center gap-3 py-3 animate-pulse", className)}>
      {hasAvatar && <Skeleton variant="avatar" style={{ width: "40px", height: "40px" }} />}
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton variant="text" style={{ width: "120px" }} />
        <Skeleton variant="text" style={{ width: "160px" }} />
      </div>
    </div>
  );
}

interface SkeletonKanbanColumnProps {
  cardCount?: number;
  className?: string;
}

export function SkeletonKanbanColumn({ cardCount = 3, className }: SkeletonKanbanColumnProps) {
  return (
    <div className={cn("flex-1 bg-slate-100 rounded-xl p-4 min-w-[260px] animate-pulse", className)}>
      <Skeleton variant="text" style={{ width: "100px", height: "1.25rem" }} className="mb-4" />
      {Array.from({ length: cardCount }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 mb-3">
          <Skeleton variant="text" style={{ width: "80%", height: "1rem" }} className="mb-2" />
          <Skeleton variant="text" style={{ width: "60%", height: "0.75rem" }} />
        </div>
      ))}
    </div>
  );
}

interface SkeletonStatsProps {
  count?: number;
  className?: string;
}

export function SkeletonStats({ count = 4, className }: SkeletonStatsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Skeleton variant="circular" style={{ width: "8px", height: "8px" }} />
          <Skeleton variant="text" style={{ width: i === 0 ? "80px" : "60px" }} />
        </div>
      ))}
    </div>
  );
}