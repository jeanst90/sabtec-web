import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "accent"
  | "outline"
  | "success"
  | "warning"
  | "destructive"
  | "info";

const variants: Record<Variant, string> = {
  default: "bg-muted text-primary",
  accent: "bg-accent-soft text-accent",
  outline: "border border-border text-primary bg-white",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  destructive: "bg-destructive-soft text-destructive",
  info: "bg-info-soft text-info",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "destructive" && "bg-destructive",
            variant === "accent" && "bg-accent",
            variant === "info" && "bg-info",
            (variant === "default" || variant === "outline") && "bg-primary/60"
          )}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
