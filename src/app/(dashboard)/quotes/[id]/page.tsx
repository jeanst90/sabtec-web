"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Send,
  Trash2,
  User,
  Wrench,
  XCircle,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label, Field, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge, statusLabel, QUOTE_STATUSES } from "@/components/ui/status-badge";
import { Skeleton, SkeletonList } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Item = { id?: string; description: string; quantity: number; unitPrice: number; total?: number };

type Quote = {
  id: string;
  number: string;
  status: string;
  publicToken: string;
  total: number;
  laborCost: number;
  partsCost: number;
  discount: number;
  validUntil: string;
  diagnosis: string;
  customer?: { name: string; phone: string } | null;
  appliance?: { type: string; brand: string; model?: string | null } | null;
  items?: { id: string; description: string; quantity: number; unitPrice: number; total: number }[];
};

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: quote, mutate } = useSWR<Quote>(`/api/quotes/${id}`, fetcher);
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actioning, setActioning] = useState(false);
  const [form, setForm] = useState({
    diagnosis: "",
    laborCost: 0,
    discount: 0,
    validUntil: "",
    status: "RASCUNHO",
  });
  const [items, setItems] = useState<Item[]>([]);

  async function setStatus(status: string) {
    setActioning(true);
    await fetch(`/api/quotes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setActioning(false);
    setStatusOpen(false);
    mutate();
  }

  function openEdit() {
    if (!quote) return;
    setForm({
      diagnosis: quote.diagnosis || "",
      laborCost: quote.laborCost || 0,
      discount: quote.discount || 0,
      validUntil: quote.validUntil ? quote.validUntil.slice(0, 10) : "",
      status: quote.status,
    });
    setItems((quote.items ?? []).map((it) => ({ ...it })));
    setEditOpen(true);
  }

  function updateItem(i: number, field: keyof Item, value: string | number) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function saveEdit() {
    if (!quote) return;
    setSaving(true);
    const payloadItems = items
      .filter((it) => it.description.trim())
      .map((it) => ({ description: it.description, quantity: Number(it.quantity) || 1, unitPrice: Number(it.unitPrice) || 0 }));
    const res = await fetch(`/api/quotes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        diagnosis: form.diagnosis,
        laborCost: Number(form.laborCost) || 0,
        discount: Number(form.discount) || 0,
        validUntil: form.validUntil || quote.validUntil,
        status: form.status,
        items: payloadItems,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setEditOpen(false);
      mutate();
    }
  }

  async function deleteQuote() {
    setActioning(true);
    const res = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
    setActioning(false);
    setDeleteOpen(false);
    if (res.ok) router.push("/quotes");
  }

  if (!quote) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="sabtec-card p-4">
          <SkeletonList rows={4} />
        </div>
      </div>
    );
  }

  const portalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/q/${quote.publicToken}`
      : `/p/q/${quote.publicToken}`;

  function copyPortal() {
    navigator.clipboard?.writeText(portalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function whatsapp(current: Quote) {
    const phone = (current.customer?.phone || "").replace(/\D/g, "");
    const full = phone.startsWith("55") ? phone : "55" + phone;
    const msg = encodeURIComponent(
      `Olá ${current.customer?.name}, seu orçamento ${current.number} está disponível: ${portalUrl}`
    );
    window.open(`https://wa.me/${full}?text=${msg}`, "_blank");
  }

  async function sendEmail() {
    const r = await fetch(`/api/quotes/${id}/email`, { method: "POST" });
    alert(r.ok ? "E-mail enviado!" : "Falha ao enviar e-mail (verifique RESEND_API_KEY).");
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={quote.number}
        description={`Emitido para ${quote.customer?.name ?? "cliente"}`}
        icon={FileText}
        backHref="/quotes"
        backLabel="Orçamentos"
      >
        <StatusBadge status={quote.status} />
      </PageHeader>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <a
          href={`/api/quotes/${id}/pdf`}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "primary" })}
        >
          <ExternalLink size={16} /> Ver PDF
        </a>
        <Button variant="outline" onClick={sendEmail}>
          <Mail size={16} /> E-mail
        </Button>
        <Button variant="outline" onClick={() => whatsapp(quote)}>
          <MessageCircle size={16} /> WhatsApp
        </Button>
        <Button variant="outline" onClick={openEdit}>
          <Pencil size={16} /> Editar
        </Button>
        <Button variant="outline" onClick={() => setStatusOpen(true)}>
          <RefreshCw size={16} /> Alterar status
        </Button>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 size={16} /> Excluir
        </Button>
        {quote.status === "APROVADO" && (
          <Link
            href={`/warranties/new?quoteId=${id}`}
            className={buttonVariants({ variant: "accent" })}
          >
            <ShieldCheck size={16} /> Gerar garantia
          </Link>
        )}
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sabtec-card p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <User size={13} /> Cliente
          </h2>
          <p className="font-medium">{quote.customer?.name ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{quote.customer?.phone ?? "—"}</p>
        </div>
        <div className="sabtec-card p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Wrench size={13} /> Aparelho
          </h2>
          <p className="font-medium">
            {quote.appliance?.brand} {quote.appliance?.model ?? ""}
          </p>
          <p className="text-sm text-muted-foreground">{quote.appliance?.type}</p>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="sabtec-card p-4">
        <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Diagnóstico
        </h2>
        <p className="text-sm leading-relaxed">{quote.diagnosis}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Validade: {formatDate(quote.validUntil)} · Status: {statusLabel(quote.status)}
        </p>
      </div>

      {/* Items */}
      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold">Itens</h2>

        <ul className="space-y-2 lg:hidden">
          {(quote.items ?? []).map((it) => (
            <li key={it.id} className="sabtec-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{it.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {it.quantity} × {formatCurrency(it.unitPrice)}
                  </p>
                </div>
                <span className="shrink-0 font-display font-bold">
                  {formatCurrency(it.total)}
                </span>
              </div>
            </li>
          ))}
          {(quote.items ?? []).length === 0 && (
            <li className="sabtec-card p-4 text-sm text-muted-foreground">
              Nenhum item adicionado.
            </li>
          )}
        </ul>

        <div className="sabtec-card hidden overflow-x-auto lg:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Descrição</th>
                <th className="px-4 py-3 text-center font-semibold">Qtd</th>
                <th className="px-4 py-3 text-right font-semibold">Unit.</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {(quote.items ?? []).map((it) => (
                <tr key={it.id} className="border-t border-border">
                  <td className="px-4 py-3">{it.description}</td>
                  <td className="px-4 py-3 text-center">{it.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(it.unitPrice)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(it.total)}</td>
                </tr>
              ))}
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">Mão de obra</td>
                <td />
                <td />
                <td className="px-4 py-3 text-right">{formatCurrency(quote.laborCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Totals */}
      <div className="sabtec-card overflow-hidden">
        <div className="space-y-1.5 p-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Peças</span>
            <span>{formatCurrency(quote.partsCost)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Mão de obra</span>
            <span>{formatCurrency(quote.laborCost)}</span>
          </div>
          {quote.discount > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Desconto</span>
              <span>- {formatCurrency(quote.discount)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between bg-primary px-4 py-3">
          <span className="font-display text-sm font-bold uppercase tracking-wide text-white">
            Total
          </span>
          <span className="font-display text-2xl font-bold text-accent">
            {formatCurrency(quote.total)}
          </span>
        </div>
      </div>

      {/* Public link */}
      <div className="sabtec-card flex items-center gap-2 p-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Link do cliente
          </p>
          <p className="truncate text-xs text-muted-foreground">{portalUrl}</p>
        </div>
        <Button variant="outline" size="sm" onClick={copyPortal}>
          <Copy size={14} /> {copied ? "Copiado!" : "Copiar"}
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Editar orçamento"
        description="Altere diagnóstico, itens, valores e status."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button variant="accent" onClick={saveEdit} disabled={saving}>
              <Save size={16} /> {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field>
            <Label htmlFor="eq-diag">Diagnóstico</Label>
            <Textarea
              id="eq-diag"
              rows={3}
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field>
              <Label htmlFor="eq-labor">Mão de obra (R$)</Label>
              <Input
                id="eq-labor"
                type="number"
                step="0.01"
                value={form.laborCost}
                onChange={(e) => setForm({ ...form, laborCost: Number(e.target.value) })}
              />
            </Field>
            <Field>
              <Label htmlFor="eq-discount">Desconto (R$)</Label>
              <Input
                id="eq-discount"
                type="number"
                step="0.01"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
              />
            </Field>
            <Field>
              <Label htmlFor="eq-valid">Validade</Label>
              <Input
                id="eq-valid"
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              />
            </Field>
            <Field>
              <Label htmlFor="eq-status">Situação</Label>
              <Select
                id="eq-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {QUOTE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Itens</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addItem}>
                <Plus size={14} /> Adicionar item
              </Button>
            </div>
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 items-end gap-2 rounded-lg border border-border p-2">
                <Field className="col-span-12 sm:col-span-6">
                  <Label className="text-[10px]">Descrição</Label>
                  <Input value={it.description} onChange={(e) => updateItem(i, "description", e.target.value)} />
                </Field>
                <Field className="col-span-4 sm:col-span-2">
                  <Label className="text-[10px]">Qtd</Label>
                  <Input type="number" min={1} value={it.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))} />
                </Field>
                <Field className="col-span-4 sm:col-span-3">
                  <Label className="text-[10px]">Unit. (R$)</Label>
                  <Input type="number" step="0.01" value={it.unitPrice} onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))} />
                </Field>
                <div className="col-span-4 flex justify-end sm:col-span-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} aria-label="Remover">
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Dialog>

      {/* Status Dialog */}
      <Dialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        title="Alterar situação"
        description="Mude o status do orçamento."
        footer={
          <>
            <Button variant="ghost" onClick={() => setStatusOpen(false)}>
              Cancelar
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          {QUOTE_STATUSES.map((s) => (
            <Button key={s} variant={quote.status === s ? "accent" : "outline"} size="sm" onClick={() => setStatus(s)} disabled={actioning}>
              {statusLabel(s)}
            </Button>
          ))}
        </div>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir orçamento"
        description="Esta ação não pode ser desfeita. O orçamento e seus itens serão removidos."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={deleteQuote} disabled={actioning}>
              <Trash2 size={16} /> {actioning ? "Excluindo..." : "Excluir"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir o orçamento <strong>{quote.number}</strong>?
        </p>
      </Dialog>
    </div>
  );
}
