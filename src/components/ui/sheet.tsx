"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Side = "left" | "right" | "bottom";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: Side;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  hideClose?: boolean;
}

const sideClasses: Record<Side, string> = {
  left: "left-0 top-0 h-full w-[85vw] max-w-xs",
  right: "right-0 top-0 h-full w-[85vw] max-w-xs",
  bottom: "left-0 right-0 bottom-0 max-h-[85vh] w-full rounded-t-2xl",
};

const sideAnimations: Record<Side, string> = {
  left: "animate-slide-in-left",
  right: "animate-slide-in-right",
  bottom: "animate-slide-up",
};

export function Sheet({
  open,
  onOpenChange,
  side = "left",
  title,
  description,
  children,
  className,
  hideClose,
}: SheetProps) {
  // Lock scroll + close on Escape
  React.useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/45 animate-fade-in"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      {/* Panel */}
      <div
        className={cn(
          "absolute bg-white shadow-lg flex flex-col",
          sideClasses[side],
          sideAnimations[side],
          className
        )}
        style={
          side === "bottom"
            ? { paddingBottom: "var(--safe-bottom)" }
            : undefined
        }
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0">
              {title && (
                <h2 className="font-display text-lg font-bold truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            {!hideClose && (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto sabtec-scroll">{children}</div>
      </div>
    </div>
  );
}
