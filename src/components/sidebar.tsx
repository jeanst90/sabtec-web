"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/nav-items";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-border bg-white">
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <img src="/brand/logo-sabtec.png" alt="Sabtec" className="h-9 w-auto" />
        <div className="leading-none">
          <span className="font-display text-lg font-bold">Sabtec</span>
          <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
            Assistência técnica
          </span>
        </div>
      </div>

      <nav className="sabtec-scroll flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((it) => {
          const active =
            pathname === it.href || pathname.startsWith(it.href + "/");
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-primary/75 hover:bg-muted hover:text-primary"
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "transition-colors",
                  active ? "text-accent" : "text-muted-foreground group-hover:text-primary"
                )}
              />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-6 py-4 text-xs text-muted-foreground">
        © 2026 Sabtec
      </div>
    </aside>
  );
}
