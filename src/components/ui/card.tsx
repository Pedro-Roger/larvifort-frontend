import React from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all",
        className
      )}
      {...props}
    />
  );
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("flex items-start justify-between p-5 pb-3", className)}
      {...props}
    />
  );
}

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
};

export function CardTitle({ className, level = 3, ...props }: CardTitleProps) {
  const HeadingTag = `h${level}` as const;
  return (
    <HeadingTag
      className={cn("text-base font-semibold text-slate-800 tracking-tight", className)}
      {...props}
    />
  );
}

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn("text-xs text-slate-500 mt-1 leading-relaxed", className)}
      {...props}
    />
  );
}

export type CardActionProps = React.HTMLAttributes<HTMLDivElement>;

export function CardAction({ className, ...props }: CardActionProps) {
  return (
    <div
      className={cn("flex items-center gap-2 shrink-0 ml-4", className)}
      {...props}
    />
  );
}

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center p-5 pt-0 border-t border-slate-100 mt-4",
        className
      )}
      {...props}
    />
  );
}
