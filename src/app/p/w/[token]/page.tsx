"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PortalWarrantyPage() {
  const params = useParams();
  const token = params.token as string;
  const { data: warranty } = useSWR(`/api/public/warranty/${token}`, fetcher);

  if (!warranty) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;

  let services: string[] = [];
  let parts: string[] = [];
  try { services = JSON.parse(warranty.services); } catch {}
  try { parts = JSON.parse(warranty.parts); } catch {}

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <img src="/brand/logo-sabtec.png" alt="Sabtec" className="h-10 w-auto" />
          <h1 className="font-display font-bold text-2xl">Termo de Garantia {warranty.number}</h1>
        </div>
        <div className="sabtec-card p-4 space-y-2 text-sm">
          <div><span className="font-medium">Cliente:</span> {warranty.customer?.name}</div>
          <div><span className="font-medium">Aparelho:</span> {warranty.appliance?.type} — {warranty.appliance?.brand} {warranty.appliance?.model}</div>
          <div><span className="font-medium">Início:</span> {formatDate(warranty.startDate)}</div>
          <div><span className="font-medium">Término:</span> {formatDate(warranty.endDate)}</div>
          <div><span className="font-medium">Status:</span> {warranty.status}</div>
        </div>
        <div className="sabtec-card p-4 space-y-2 text-sm">
          <h2 className="font-display font-bold text-lg">Serviços</h2>
          {services.map((s, i) => <div key={i}>• {s}</div>)}
        </div>
        <div className="sabtec-card p-4 space-y-2 text-sm">
          <h2 className="font-display font-bold text-lg">Peças</h2>
          {parts.length ? parts.map((p, i) => <div key={i}>• {p}</div>) : <div>Nenhuma.</div>}
        </div>
        <a href={`/api/warranties/${warranty.id}/pdf`} target="_blank" className="inline-block text-accent font-medium">
          Baixar PDF →
        </a>
      </div>
    </div>
  );
}