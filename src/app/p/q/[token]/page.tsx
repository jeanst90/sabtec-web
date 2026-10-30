"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PortalQuotePage() {
  const params = useParams();
  const token = params.token as string;
  const { data: quote, mutate } = useSWR(`/api/public/quote/${token}`, fetcher);
  const [acting, setActing] = useState(false);

  async function act(action: "APROVAR" | "REPROVAR") {
    setActing(true);
    await fetch(`/api/public/quote/${token}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setActing(false);
    mutate();
  }

  if (!quote) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <img src="/brand/logo-sabtec.png" alt="Sabtec" className="h-10 w-auto" />
          <h1 className="font-display font-bold text-2xl">Orçamento {quote.number}</h1>
        </div>
        <div className="sabtec-card p-4 space-y-2 text-sm">
          <div><span className="font-medium">Cliente:</span> {quote.customer?.name}</div>
          <div><span className="font-medium">Aparelho:</span> {quote.appliance?.type} — {quote.appliance?.brand} {quote.appliance?.model}</div>
          <div><span className="font-medium">Diagnóstico:</span> {quote.diagnosis}</div>
          <div><span className="font-medium">Validade:</span> {formatDate(quote.validUntil)}</div>
        </div>
        <div className="sabtec-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2">Descrição</th>
                <th className="text-center px-4 py-2">Qtd</th>
                <th className="text-right px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {(quote.items ?? []).map((it: { id: string; description: string; quantity: number; total: number }) => (
                <tr key={it.id} className="border-t border-border">
                  <td className="px-4 py-2">{it.description}</td>
                  <td className="text-center px-4 py-2">{it.quantity}</td>
                  <td className="text-right px-4 py-2">R$ {it.total.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="border-t border-border">
                <td className="px-4 py-2 font-medium">Mão de obra</td>
                <td></td>
                <td className="text-right px-4 py-2">R$ {quote.laborCost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div className="p-4 border-t border-border font-bold text-lg text-accent text-right">
            Total: {formatCurrency(quote.total)}
          </div>
        </div>

        <div className="sabtec-card p-4">
          <p className="text-sm mb-3">
            Status atual: <span className="font-bold">{quote.status}</span>
          </p>
          {quote.status === "ENVIADO" || quote.status === "RASCUNHO" ? (
            <div className="flex gap-2">
              <button
                disabled={acting}
                onClick={() => act("APROVAR")}
                className="bg-success text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                Aprovar orçamento
              </button>
              <button
                disabled={acting}
                onClick={() => act("REPROVAR")}
                className="bg-destructive text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                Reprovar
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Este orçamento já foi respondido.</p>
          )}
        </div>

        <a
          href={`/api/quotes/${quote.id}/pdf`}
          target="_blank"
          className="inline-block text-accent font-medium"
        >
          Baixar PDF →
        </a>
      </div>
    </div>
  );
}