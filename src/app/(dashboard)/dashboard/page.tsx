"use client";

import useSWR from "swr";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  FileText,
  LayoutDashboard,
  Package,
  Plus,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const { data, isLoading } = useSWR("/api/dashboard", fetcher);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-52" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const pending: {
    id: string;
    number: string;
    status: string;
    customer?: { name: string } | null;
  }[] = data?.pendingQuotes ?? [];

  const expiring: {
    id: string;
    number: string;
    customer?: { name: string } | null;
    appliance?: { brand: string; type: string } | null;
  }[] = data?.expiringWarranties ?? [];

  const conversion = (data?.conversionRate ?? 0) * 100;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Olá 👋"
        description="Resumo de hoje da Sabtec"
        icon={LayoutDashboard}
      >
        <Link href="/quotes/new" className={buttonVariants({ variant: "accent" })}>
          <Plus size={16} /> Novo orçamento
        </Link>
        <Link href="/warranties/new" className={buttonVariants({ variant: "outline" })}>
          <ShieldCheck size={16} /> Nova garantia
        </Link>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Clientes" value={data?.customers ?? 0} icon={Users} />
        <StatCard label="Orçamentos" value={data?.quotes ?? 0} icon={FileText} />
        <StatCard label="Garantias" value={data?.warranties ?? 0} icon={ShieldCheck} />
        <StatCard
          label="Receita (mês)"
          value={formatCurrency(data?.revenueThisMonth ?? 0)}
          icon={TrendingUp}
          accent
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          { href: "/quotes/new", label: "Orçamento", icon: FileText },
          { href: "/warranties/new", label: "Garantia", icon: ShieldCheck },
          { href: "/customers", label: "Cliente", icon: Users },
          { href: "/catalog", label: "Catálogo", icon: Package },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="sabtec-card sabtec-card-interactive flex items-center gap-2.5 p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Icon size={17} />
              </span>
              <span className="truncate text-sm font-medium">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Conversion */}
      <div className="sabtec-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Conversão do mês</span>
          <TrendingUp size={16} className="text-accent" />
        </div>
        <div className="flex items-end gap-3">
          <div className="font-display text-3xl font-bold text-accent">
            {conversion.toFixed(0)}%
          </div>
          <div className="pb-1 text-xs text-muted-foreground">
            {data?.approvedThisMonth ?? 0} de {data?.quotesThisMonth ?? 0} aprovados
          </div>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${Math.min(conversion, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Pending quotes */}
        <div className="sabtec-card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display text-base font-bold">
              <Clock size={16} className="text-accent" /> Orçamentos pendentes
            </h2>
            <Link
              href="/quotes"
              className="flex shrink-0 items-center text-xs font-medium text-accent"
            >
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>
          {pending.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Tudo em dia"
              description="Nenhum orçamento pendente no momento."
              className="py-6"
            />
          ) : (
            <ul className="divide-y divide-border">
              {pending.map((q) => (
                <li key={q.id}>
                  <Link
                    href={`/quotes/${q.id}`}
                    className="flex items-center justify-between gap-2 py-2.5 transition-colors hover:text-accent"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold">{q.number}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {q.customer?.name ?? "Cliente"}
                      </p>
                    </div>
                    <StatusBadge status={q.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Expiring warranties */}
        <div className="sabtec-card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display text-base font-bold">
              <Wrench size={16} className="text-warning" /> Garantias vencendo
            </h2>
            <Link
              href="/warranties"
              className="flex shrink-0 items-center text-xs font-medium text-accent"
            >
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>
          {expiring.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="Nenhuma garantia vencendo"
              description="Tudo certo com as garantias ativas."
              className="py-6"
            />
          ) : (
            <ul className="divide-y divide-border">
              {expiring.map((w) => (
                <li key={w.id}>
                  <Link
                    href={`/warranties/${w.id}`}
                    className="flex items-center justify-between gap-2 py-2.5 transition-colors hover:text-accent"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold">{w.number}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {w.customer?.name} · {w.appliance?.brand}
                      </p>
                    </div>
                    <ChevronRight size={14} className="shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
