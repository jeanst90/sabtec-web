"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { FileText, Plus, ChevronRight, Wrench } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { StatusBadge, QUOTE_STATUSES, statusLabel } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Quote = {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
  customer?: { name: string } | null;
  appliance?: { brand: string; type: string } | null;
};

export default function QuotesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading } = useSWR<Quote[]>(
    `/api/quotes${
      q || status
        ? `?${new URLSearchParams({
            ...(q ? { q } : {}),
            ...(status ? { status } : {}),
          }).toString()}`
        : ""
    }`,
    fetcher
  );

  const quotes = data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Orçamentos"
        description="Acompanhe propostas, aprovações e faturamento"
        icon={FileText}
      >
        <Link href="/quotes/new" className={buttonVariants({ variant: "accent" })}>
          <Plus size={16} /> Novo orçamento
        </Link>
      </PageHeader>

      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por número ou cliente..."
          wrapperClassName="sm:max-w-sm"
          aria-label="Buscar orçamentos"
        />
        <div className="sm:w-48">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filtrar por status"
          >
            <option value="">Todas as situações</option>
            {QUOTE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="sabtec-card p-4">
          <SkeletonList rows={5} />
        </div>
      ) : quotes.length === 0 ? (
        <div className="sabtec-card">
          <EmptyState
            icon={FileText}
            title={q || status ? "Nenhum orçamento encontrado" : "Nenhum orçamento ainda"}
            description={
              q || status
                ? "Ajuste a busca ou o filtro de status."
                : "Crie seu primeiro orçamento e envie para o cliente aprovar."
            }
          >
            {!q && !status && (
              <Link href="/quotes/new" className={buttonVariants({ variant: "accent" })}>
                <Plus size={16} /> Novo orçamento
              </Link>
            )}
          </EmptyState>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-2 lg:hidden">
            {quotes.map((quote) => (
              <li key={quote.id}>
                <Link
                  href={`/quotes/${quote.id}`}
                  className="sabtec-card sabtec-card-interactive block p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold">{quote.number}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {quote.customer?.name ?? "Cliente"}
                      </p>
                    </div>
                    <StatusBadge status={quote.status} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <Wrench size={12} />
                      <span className="truncate">
                        {quote.appliance?.type} · {quote.appliance?.brand}
                      </span>
                    </span>
                    <span>{formatDate(quote.createdAt)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Total
                    </span>
                    <span className="font-display text-base font-bold text-accent">
                      {formatCurrency(quote.total)}
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
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Situação</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr
                    key={quote.id}
                    className="border-t border-border transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/quotes/${quote.id}`}
                        className="font-display font-semibold hover:text-accent"
                      >
                        {quote.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{quote.customer?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      {quote.appliance?.brand} {quote.appliance?.type}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(quote.total)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={quote.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(quote.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/quotes/${quote.id}`}
                        className="text-muted-foreground hover:text-accent"
                        aria-label={`Abrir ${quote.number}`}
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
