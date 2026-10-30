"use client";

import useSWR from "swr";
import {
  BarChart3,
  TrendingUp,
  FileText,
  Target,
  Wallet,
  Package,
  Users,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function monthLabel(month: string) {
  const idx = Number(month.slice(5, 7)) - 1;
  return MONTHS[idx] ?? month;
}

function compactCurrency(value: number) {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace(".", ",")}k`;
  }
  return `R$ ${value.toFixed(0)}`;
}

export default function AnalyticsPage() {
  const { data, isLoading } = useSWR("/api/analytics", fetcher);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  const maxRev = Math.max(
    ...(data?.revenueByMonth?.map((r: { value: number }) => r.value) ?? [1]),
    1
  );
  const hasRevenue =
    data?.revenueByMonth?.some((r: { value: number }) => r.value > 0) ?? false;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Análises & BI"
        description="Indicadores de faturamento, conversão e produtividade"
        icon={BarChart3}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Faturamento"
          value={formatCurrency(data?.totalRevenue ?? 0)}
          icon={Wallet}
          accent
        />
        <StatCard label="Orçamentos" value={data?.totalQuotes ?? 0} icon={FileText} />
        <StatCard
          label="Conversão"
          value={`${((data?.conversionRate ?? 0) * 100).toFixed(0)}%`}
          icon={Target}
        />
        <StatCard
          label="Previsão mês"
          value={formatCurrency(data?.forecast ?? 0)}
          icon={TrendingUp}
        />
      </div>

      {/* Revenue chart */}
      <div className="sabtec-card p-4">
        <h2 className="mb-4 font-display text-base font-bold">Faturamento por mês</h2>
        {hasRevenue ? (
          <div className="flex h-44 items-end gap-2">
            {(data?.revenueByMonth ?? []).map((r: { month: string; value: number }) => (
              <div key={r.month} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[9px] font-medium text-muted-foreground sm:text-[10px]">
                  {r.value > 0 ? compactCurrency(r.value) : "—"}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-accent to-[#ff8a5b] transition-all"
                    style={{
                      height: `${Math.max((r.value / maxRev) * 100, r.value > 0 ? 4 : 0)}%`,
                    }}
                    title={`${monthLabel(r.month)}: ${formatCurrency(r.value)}`}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {monthLabel(r.month)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-44 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <BarChart3 size={28} className="text-muted-foreground/40" />
            <p>Nenhum faturamento aprovado nos últimos 6 meses.</p>
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="sabtec-card p-4">
          <h2 className="mb-3 flex items-center gap-1.5 font-display text-base font-bold">
            <Package size={16} className="text-accent" /> Top peças/serviços
          </h2>
          <ul className="space-y-2">
            {(data?.topParts ?? []).map((p: { name: string; count: number; total: number }) => (
              <li key={p.name} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{p.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {p.count}x · {formatCurrency(p.total)}
                </span>
              </li>
            ))}
            {(data?.topParts ?? []).length === 0 && (
              <li className="text-sm text-muted-foreground">Sem dados ainda.</li>
            )}
          </ul>
        </div>

        <div className="sabtec-card p-4">
          <h2 className="mb-3 flex items-center gap-1.5 font-display text-base font-bold">
            <Users size={16} className="text-accent" /> Conversão por técnico
          </h2>
          <ul className="space-y-3">
            {(data?.conversionByTech ?? []).map(
              (t: { name: string; total: number; approved: number; rate: number }) => (
                <li key={t.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="truncate">{t.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {t.approved}/{t.total} ({(t.rate * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${t.rate * 100}%` }}
                    />
                  </div>
                </li>
              )
            )}
            {(data?.conversionByTech ?? []).length === 0 && (
              <li className="text-sm text-muted-foreground">Sem dados ainda.</li>
            )}
          </ul>
        </div>

        <div className="sabtec-card p-4">
          <h2 className="mb-3 flex items-center gap-1.5 font-display text-base font-bold">
            <BarChart3 size={16} className="text-accent" /> Aparelhos mais atendidos
          </h2>
          <ul className="space-y-2">
            {(data?.applianceTypes ?? []).map((a: { type: string; count: number }) => (
              <li key={a.type} className="flex items-center justify-between text-sm">
                <span>{a.type}</span>
                <span className="text-xs text-muted-foreground">{a.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="sabtec-card flex flex-col justify-between p-4">
          <h2 className="flex items-center gap-1.5 font-display text-base font-bold">
            <ShieldAlert size={16} className="text-warning" /> Garantias vencendo
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">Próximos 30 dias</p>
          <p className="mt-1 font-display text-4xl font-bold text-warning">
            {data?.expiringWarranties ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
