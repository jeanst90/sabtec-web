"use client";

import useSWR from "swr";
import { Wrench, CalendarClock, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type MaintenanceItem = {
  applianceId: string;
  customer: string;
  phone: string;
  type: string;
  brand: string;
  model?: string | null;
  lastService: string;
  monthsSince: number;
  interval: number;
  recommended: string;
};

export default function MaintenancePage() {
  const { data, isLoading } = useSWR<MaintenanceItem[]>("/api/maintenance", fetcher);
  const items = data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Manutenção preventiva"
        description="Aparelhos com revisão recomendada pelo histórico"
        icon={Wrench}
      />

      {isLoading ? (
        <div className="sabtec-card p-4">
          <SkeletonList rows={4} />
        </div>
      ) : items.length === 0 ? (
        <div className="sabtec-card">
          <EmptyState
            icon={Wrench}
            title="Nenhuma manutenção pendente"
            description="Quando um aparelho estiver no intervalo de revisão, ele aparece aqui."
          />
        </div>
      ) : (
        <>
          <ul className="space-y-2 lg:hidden">
            {items.map((m) => (
              <li key={m.applianceId} className="sabtec-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{m.customer}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.type} · {m.brand} {m.model ?? ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning">
                    {m.monthsSince}m
                  </span>
                </div>
                <p className="mt-2 rounded-md bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground">
                  {m.recommended}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <CalendarClock size={12} className="text-accent" />
                  Último serviço: {formatDate(m.lastService)}
                </div>
              </li>
            ))}
          </ul>

          <div className="sabtec-card hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Aparelho</th>
                  <th className="px-4 py-3 font-semibold">Último serviço</th>
                  <th className="px-4 py-3 font-semibold">Meses</th>
                  <th className="px-4 py-3 font-semibold">Recomendação</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.applianceId} className="border-t border-border hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{m.customer}</td>
                    <td className="px-4 py-3">
                      {m.type} — {m.brand} {m.model ?? ""}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(m.lastService)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">
                        {m.monthsSince}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{m.recommended}</td>
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
