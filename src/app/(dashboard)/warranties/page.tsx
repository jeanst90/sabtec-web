"use client";

import useSWR from "swr";
import Link from "next/link";
import { ShieldCheck, Plus, ChevronRight, CalendarClock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Warranty = {
  id: string;
  number: string;
  status: string;
  startDate: string;
  endDate: string;
  customer?: { name: string } | null;
  appliance?: { brand: string; type: string } | null;
};

export default function WarrantiesPage() {
  const { data, isLoading } = useSWR<Warranty[]>("/api/warranties", fetcher);
  const warranties = data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Garantias"
        description="Termos emitidos e validade dos serviços"
        icon={ShieldCheck}
      >
        <Link href="/warranties/new" className={buttonVariants({ variant: "accent" })}>
          <Plus size={16} /> Nova garantia
        </Link>
      </PageHeader>

      {isLoading ? (
        <div className="sabtec-card p-4">
          <SkeletonList rows={5} />
        </div>
      ) : warranties.length === 0 ? (
        <div className="sabtec-card">
          <EmptyState
            icon={ShieldCheck}
            title="Nenhuma garantia cadastrada"
            description="Emita o termo de garantia após concluir um serviço."
          >
            <Link href="/warranties/new" className={buttonVariants({ variant: "accent" })}>
              <Plus size={16} /> Nova garantia
            </Link>
          </EmptyState>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-2 lg:hidden">
            {warranties.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/warranties/${w.id}`}
                  className="sabtec-card sabtec-card-interactive block p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold">{w.number}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {w.customer?.name ?? "Cliente"}
                      </p>
                    </div>
                    <StatusBadge status={w.status} />
                  </div>
                  <p className="mt-2 truncate text-xs text-muted-foreground">
                    {w.appliance?.type} · {w.appliance?.brand}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 border-t border-border pt-2 text-xs text-muted-foreground">
                    <CalendarClock size={13} className="text-accent" />
                    <span>
                      {formatDate(w.startDate)} → {formatDate(w.endDate)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="sabtec-card hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Número</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Aparelho</th>
                  <th className="px-4 py-3 font-semibold">Início</th>
                  <th className="px-4 py-3 font-semibold">Término</th>
                  <th className="px-4 py-3 font-semibold">Situação</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {warranties.map((w) => (
                  <tr
                    key={w.id}
                    className="border-t border-border transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/warranties/${w.id}`}
                        className="font-display font-semibold hover:text-accent"
                      >
                        {w.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{w.customer?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      {w.appliance?.brand} {w.appliance?.type}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(w.startDate)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(w.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/warranties/${w.id}`}
                        className="text-muted-foreground hover:text-accent"
                        aria-label={`Abrir ${w.number}`}
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
