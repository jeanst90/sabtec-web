import * as React from "react";
import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  accent?: boolean;
  hint?: string;
  trend?: { value: string; positive?: boolean };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  hint,
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn("sabtec-card p-4", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">
          {label}
        </span>
        {Icon && (
          <Icon
            size={16}
            className={cn("shrink-0", accent ? "text-accent" : "text-primary/50")}
          />
        )}
      </div>
      <div
        className={cn(
          "font-display text-2xl font-bold leading-none",
          accent ? "text-accent" : "text-primary"
        )}
      >
        {value}
      </div>
      {(hint || trend) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          {trend &&
            (trend.positive ? (
              <TrendingUp size={13} className="text-success" />
            ) : (
              <TrendingDown size={13} className="text-destructive" />
            ))}
          {trend && <span>{trend.value}</span>}
          {hint && <span className="truncate">{hint}</span>}
        </div>
      )}
    </div>
  );
}
