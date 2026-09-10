"use client";

import React, { createContext, useContext } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

type AvatarColor = "slate" | "gray" | "zinc" | "neutral" | "stone" | "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose";

interface AvatarContextValue {
  size: AvatarSize;
}

const AvatarContext = createContext<AvatarContextValue>({ size: "md" });

const avatarSizes = cva(
  "relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-slate-700 select-none overflow-hidden",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-14 w-14 text-lg",
        xxl: "h-16 w-16 text-xl",
      },
      color: {
        slate: "bg-slate-100",
        gray: "bg-gray-100",
        zinc: "bg-zinc-100",
        neutral: "bg-neutral-100",
        stone: "bg-stone-100",
        red: "bg-red-100",
        orange: "bg-orange-100",
        amber: "bg-amber-100",
        yellow: "bg-yellow-100",
        lime: "bg-lime-100",
        green: "bg-green-100",
        emerald: "bg-emerald-100",
        teal: "bg-teal-100",
        cyan: "bg-cyan-100",
        sky: "bg-sky-100",
        blue: "bg-blue-100",
        indigo: "bg-indigo-100",
        violet: "bg-violet-100",
        purple: "bg-purple-100",
        fuchsia: "bg-fuchsia-100",
        pink: "bg-pink-100",
        rose: "bg-rose-100",
      },
    },
    defaultVariants: {
      size: "md",
      color: "slate",
    },
  }
);

export type AvatarProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof avatarSizes> & {
    size?: AvatarSize;
    color?: AvatarColor;
  };

export function Avatar({
  size = "md",
  color = "slate",
  className,
  children,
  ...props
}: AvatarProps) {
  return (
    <AvatarContext.Provider value={{ size }}>
      <div
        data-slot="avatar"
        data-size={size}
        className={cn(avatarSizes({ size, color }), className)}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  );
}

export type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export function AvatarImage({
  src,
  alt = "",
  className,
  ...props
}: AvatarImageProps) {
  const [hasError, setHasError] = React.useState(false);

  if (!src || hasError) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      data-slot="avatar-image"
      onError={() => setHasError(true)}
      className={cn("h-full w-full object-cover", className)}
      {...props}
    />
  );
}

export type AvatarFallbackProps = React.HTMLAttributes<HTMLSpanElement>;

export function AvatarFallback({
  className,
  children,
  ...props
}: AvatarFallbackProps) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

const badgeSizes = cva(
  "absolute bottom-0 right-0 rounded-full ring-2 ring-white",
  {
    variants: {
      size: {
        xs: "h-1.5 w-1.5",
        sm: "h-2 w-2",
        md: "h-2.5 w-2.5",
        lg: "h-3 w-3",
        xl: "h-3.5 w-3.5",
        xxl: "h-4 w-4",
      },
      status: {
        online: "bg-emerald-500",
        offline: "bg-slate-400",
        busy: "bg-rose-500",
      },
    },
    defaultVariants: {
      size: "md",
      status: "online",
    },
  }
);

export type AvatarBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  status?: "online" | "offline" | "busy";
  size?: AvatarSize;
  live?: boolean;
  ping?: boolean;
};

export function AvatarBadge({
  status = "online",
  size: customSize,
  live = false,
  ping = false,
  className,
  ...props
}: AvatarBadgeProps) {
  const { size: parentSize } = useContext(AvatarContext);
  const size = customSize || parentSize;

  return (
    <span
      data-slot="avatar-badge"
      data-status={status}
      role="img"
      aria-label={status}
      aria-live={live ? "polite" : undefined}
      className={cn(badgeSizes({ size, status }), className)}
      {...props}
    >
      {ping && (
        <span
          className={cn(
            "absolute inset-0 rounded-full animate-ping opacity-75",
            status === "online" && "bg-emerald-400",
            status === "offline" && "bg-slate-300",
            status === "busy" && "bg-rose-400"
          )}
        />
      )}
    </span>
  );
}

export type AvatarGroupProps = React.HTMLAttributes<HTMLDivElement>;

export function AvatarGroup({ className, children, ...props }: AvatarGroupProps) {
  return (
    <div
      role="group"
      data-slot="avatar-group"
      className={cn(
        "flex items-center -space-x-2 [&>[data-slot=avatar]]:ring-2 [&>[data-slot=avatar]]:ring-white",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type AvatarGroupCountProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "xs" | "sm" | "md";
};

export function AvatarGroupCount({
  size = "md",
  className,
  children,
  ...props
}: AvatarGroupCountProps) {
  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-9 w-9 text-xs",
  }[size];

  return (
    <div
      data-slot="avatar-group-count"
      data-size={size}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600 ring-2 ring-white select-none",
        sizeClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
