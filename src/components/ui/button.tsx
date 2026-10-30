"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "accent"
  | "outline"
  | "ghost"
  | "destructive"
  | "success"
  | "link";

type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-black active:bg-black disabled:bg-primary/50",
  accent:
    "bg-accent text-white shadow-[var(--sabtec-shadow-accent)] hover:bg-accent-hover active:bg-accent-hover disabled:bg-accent/50",
  outline:
    "border border-border bg-white text-primary shadow-xs hover:bg-muted hover:border-primary/20 active:bg-muted",
  ghost:
    "bg-transparent text-primary hover:bg-muted active:bg-muted/80",
  destructive:
    "bg-destructive text-white shadow-sm hover:brightness-95 active:brightness-90",
  success:
    "bg-success text-white shadow-sm hover:brightness-95 active:brightness-90",
  link: "bg-transparent text-accent underline-offset-4 hover:underline p-0 h-auto",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "h-11 w-11 p-0",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-60",
    "active:scale-[0.985]",
    variants[variant],
    sizes[size],
    className
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
