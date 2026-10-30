import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            "flex h-11 w-full appearance-none rounded-md border border-border bg-white px-3 pr-9 py-2 text-sm text-primary shadow-xs",
            "transition-colors duration-150 cursor-pointer",
            "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25",
            "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
            invalid && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/25",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
    );
  }
);
Select.displayName = "Select";
