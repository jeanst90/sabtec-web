"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BottomNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export interface BottomNavProps {
  items: BottomNavItem[];
  centerHref: string;
  centerLabel: string;
  centerIcon: LucideIcon;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function BottomNav({
  items,
  centerHref,
  centerLabel,
  centerIcon: CenterIcon,
}: BottomNavProps) {
  const pathname = usePathname();

  // 2 items on each side of the FAB
  const left = items.slice(0, 2);
  const right = items.slice(2, 4);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="Navegação principal"
    >
      <div className="grid grid-cols-5 items-end h-16">
        {left.map((item) => (
          <NavButton key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}

        {/* Center FAB */}
        <div className="flex justify-center">
          <Link
            href={centerHref}
            aria-label={centerLabel}
            className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-[var(--sabtec-shadow-accent)] transition-transform active:scale-95"
          >
            <CenterIcon size={26} strokeWidth={2.5} />
          </Link>
        </div>

        {right.map((item) => (
          <NavButton key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </div>
    </nav>
  );
}

function NavButton({ item, active }: { item: BottomNavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors",
        active ? "text-accent" : "text-muted-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={20} strokeWidth={active ? 2.4 : 2} />
      <span className="truncate max-w-full px-0.5">{item.label}</span>
      {active && (
        <span className="absolute top-1 h-1 w-1 rounded-full bg-accent" aria-hidden />
      )}
    </Link>
  );
}
