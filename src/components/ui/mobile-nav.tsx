"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import { Sheet } from "./sheet";
import { BottomNav } from "./bottom-nav";
import { NAV_ITEMS, MOBILE_NAV_ITEMS } from "@/components/nav-items";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Topbar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-white/95 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/brand/logo-sabtec.png" alt="Sabtec" className="h-8 w-auto" />
          <span className="font-display text-lg font-bold">Sabtec</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-primary hover:bg-muted transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Drawer */}
      <Sheet
        open={open}
        onOpenChange={setOpen}
        side="left"
        title="Sabtec"
        description="Assistência técnica"
      >
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV_ITEMS.map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + "/");
            const Icon = it.icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-white"
                    : "text-primary/80 hover:bg-muted hover:text-primary"
                )}
              >
                <Icon size={18} />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <Link
            href="/quotes/new"
            onClick={() => setOpen(false)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-semibold text-white shadow-[var(--sabtec-shadow-accent)]"
          >
            <Plus size={18} /> Novo orçamento
          </Link>
        </div>
        <div className="px-6 py-4 text-xs text-muted-foreground">
          © 2026 Sabtec
        </div>
      </Sheet>

      {/* Bottom bar */}
      <BottomNav
        items={MOBILE_NAV_ITEMS}
        centerHref="/quotes/new"
        centerLabel="Novo orçamento"
        centerIcon={Plus}
      />
    </>
  );
}
