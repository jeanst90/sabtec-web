"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import {
  CalendarClock,
  Copy,
  ExternalLink,
  Mail,
  MessageCircle,
  Pencil,
  RefreshCw,
  Save,
  ShieldCheck,
  ShieldX,
  Trash2,
  User,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Field, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton, SkeletonList } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Warranty = {
  id: string;
  number: string;
  status: string;
  publicToken: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  services: string;
  parts: string;
  terms: string;
  exclusions: string;
  customer?: { name: string; phone: string } | null;
  appliance?: { type: string; brand: string; model?: string | null } | null;
};

const WARRANTY_STATUSES = ["ATIVA", "VENCIDA", "CANCELADA", "ESTENDIDA"];

export default function WarrantyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: warranty, mutate } = useSWR<Warranty>(`/api/warranties/${id}`, fetcher);
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actioning, setActioning] = useState(false);
  const [form, setForm] = useState({
    status: "ATIVA",
    durationDays: 90,
    startDate: "",
    endDate: "",
    terms: "",
    exclusions: "",
    servicesText: "",
    partsText: "",
  });

  async function setStatus(status: string) {
    setActioning(true);
    await fetch(`/api/warranties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setActioning(false);
    setStatusOpen(false);
    mutate();
  }

  function openEdit() {
    if (!warranty) return;
    let services: string[] = [];
    let parts: string[] = [];
    try { services = JSON.parse(warranty.services); } catch {}
    try { parts = JSON.parse(warranty.parts); } catch {}
    setForm({
      status: warranty.status,
      durationDays: warranty.durationDays || 90,
      startDate: warranty.startDate ? warranty.startDate.slice(0, 10) : "",
      endDate: warranty.endDate ? warranty.endDate.slice(0, 10) : "",
      terms: warranty.terms || "",
      exclusions: warranty.exclusions || "",
      servicesText: services.join("\n"),
      partsText: parts.join("\n"),
    });
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!warranty) return;
    setSaving(true);
    const services = form.servicesText.split("\n").map((s) => s.trim()).filter(Boolean);
    const parts = form.partsText.split("\n").map((s) => s.trim()).filter(Boolean);
    let endDate = form.endDate;
    if (form.startDate && form.durationDays) {
      const d = new Date(form.startDate);
      d.setDate(d.getDate() + Number(form.durationDays));
      endDate = d.toISOString().slice(0, 10);
    }
    const res = await fetch(`/api/warranties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: form.status,
        durationDays: Number(form.durationDays) || 90,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : warranty.startDate,
        endDate: endDate ? new Date(endDate).toISOString() : warranty.endDate,
        terms: form.terms,
        exclusions: form.exclusions,
        services: JSON.stringify(services),
        parts: JSON.stringify(parts),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setEditOpen(false);
      mutate();
    }
  }

  async function deleteWarranty() {
    setActioning(true);
    const res = await fetch(`/api/warranties/${id}`, { method: "DELETE" });
    setActioning(false);
    setDeleteOpen(false);
    if (res.ok) router.push("/warranties");
  }

  if (!warranty) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="sabtec-card p-4">
          <SkeletonList rows={4} />
        </div>
      </div>
    );
  }

  let services: string[] = [];
  let parts: string[] = [];
  try {
    services = JSON.parse(warranty.services);
  } catch {}
  try {
    parts = JSON.parse(warranty.parts);
  } catch {}

  const portalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/w/${warranty.publicToken}`
      : `/p/w/${warranty.publicToken}`;

  function copyPortal() {
    navigator.clipboard?.writeText(portalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function whatsapp(current: Warranty) {
    const phone = (current.customer?.phone || "").replace(/\D/g, "");
    const full = phone.startsWith("55") ? phone : "55" + phone;
    const msg = encodeURIComponent(
      `Olá ${current.customer?.name}, seu termo de garantia ${current.number} está disponível: ${portalUrl}`
    );
    window.open(`https://wa.me/${full}?text=${msg}`, "_blank");
  }

  async function sendEmail() {
    const r = await fetch(`/api/warranties/${id}/email`, { method: "POST" });
    alert(r.ok ? "E-mail enviado!" : "Falha ao enviar e-mail (verifique RESEND_API_KEY).");
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={warranty.number}
        description={`Termo de garantia · ${warranty.customer?.name ?? "cliente"}`}
        icon={ShieldCheck}
        backHref="/warranties"
        backLabel="Garantias"
      >
        <StatusBadge status={warranty.status} />
      </PageHeader>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <a
          href={`/api/warranties/${id}/pdf`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-black"
        >
          <ExternalLink size={16} /> Ver PDF
        </a>
        <Button variant="outline" onClick={sendEmail}>
          <Mail size={16} /> E-mail
        </Button>
        <Button variant="outline" onClick={() => whatsapp(warranty)}>
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
        {warranty.status === "ATIVA" && (
          <Button variant="destructive" onClick={() => setStatus("CANCELADA")}>
            <ShieldX size={16} /> Cancelar garantia
          </Button>
        )}
      </div>

      {/* Period highlight */}
      <div className="sabtec-card border-l-4 border-l-accent p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
          <CalendarClock size={14} /> Período de garantia
        </h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Início</p>
            <p className="font-display font-bold">{formatDate(warranty.startDate)}</p>
          </div>
          <div className="border-x border-border">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Término</p>
            <p className="font-display font-bold">{formatDate(warranty.endDate)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Duração</p>
            <p className="font-display font-bold">{warranty.durationDays} dias</p>
          </div>
        </div>
      </div>

      {/* Customer / appliance */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sabtec-card p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <User size={13} /> Cliente
          </h2>
          <p className="font-medium">{warranty.customer?.name ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{warranty.customer?.phone ?? "—"}</p>
        </div>
        <div className="sabtec-card p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Wrench size={13} /> Aparelho
          </h2>
          <p className="font-medium">
            {warranty.appliance?.brand} {warranty.appliance?.model ?? ""}
          </p>
          <p className="text-sm text-muted-foreground">{warranty.appliance?.type}</p>
        </div>
      </div>

      {/* Services & parts */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sabtec-card p-4">
          <h2 className="mb-2 font-display text-sm font-bold">Serviços realizados</h2>
          {services.length ? (
            <ul className="space-y-1.5 text-sm">
              {services.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </div>
        <div className="sabtec-card p-4">
          <h2 className="mb-2 font-display text-sm font-bold">Peças substituídas</h2>
          {parts.length ? (
            <ul className="space-y-1.5 text-sm">
              {parts.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {p}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma.</p>
          )}
        </div>
      </div>

      {/* Terms */}
      <div className="sabtec-card space-y-3 p-4">
        <div>
          <h2 className="mb-1 font-display text-sm font-bold">Condições</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{warranty.terms}</p>
        </div>
        <div>
          <h2 className="mb-1 font-display text-sm font-bold">Exclusões</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{warranty.exclusions}</p>
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
        title="Editar garantia"
        description="Altere período, serviços, peças, condições e status."
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field>
              <Label htmlFor="wg-status">Situação</Label>
              <Select
                id="wg-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {WARRANTY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label htmlFor="wg-dur">Duração (dias)</Label>
              <Input
                id="wg-dur"
                type="number"
                min={1}
                value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
              />
            </Field>
            <Field>
              <Label htmlFor="wg-start">Início</Label>
              <Input
                id="wg-start"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </Field>
            <Field>
              <Label htmlFor="wg-end">Término</Label>
              <Input
                id="wg-end"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </Field>
          </div>
          <Field>
            <Label htmlFor="wg-services">Serviços realizados (um por linha)</Label>
            <Textarea id="wg-services" rows={3} value={form.servicesText} onChange={(e) => setForm({ ...form, servicesText: e.target.value })} />
          </Field>
          <Field>
            <Label htmlFor="wg-parts">Peças substituídas (um por linha)</Label>
            <Textarea id="wg-parts" rows={2} value={form.partsText} onChange={(e) => setForm({ ...form, partsText: e.target.value })} />
          </Field>
          <Field>
            <Label htmlFor="wg-terms">Condições</Label>
            <Textarea id="wg-terms" rows={3} value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} />
          </Field>
          <Field>
            <Label htmlFor="wg-excl">Exclusões</Label>
            <Textarea id="wg-excl" rows={3} value={form.exclusions} onChange={(e) => setForm({ ...form, exclusions: e.target.value })} />
          </Field>
        </div>
      </Dialog>

      {/* Status Dialog */}
      <Dialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        title="Alterar situação"
        description="Mude o status da garantia."
        footer={
          <>
            <Button variant="ghost" onClick={() => setStatusOpen(false)}>
              Cancelar
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          {WARRANTY_STATUSES.map((s) => (
            <Button key={s} variant={warranty.status === s ? "accent" : "outline"} size="sm" onClick={() => setStatus(s)} disabled={actioning}>
              {s}
            </Button>
          ))}
        </div>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir garantia"
        description="Esta ação não pode ser desfeita."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={deleteWarranty} disabled={actioning}>
              <Trash2 size={16} /> {actioning ? "Excluindo..." : "Excluir"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir a garantia <strong>{warranty.number}</strong>?
        </p>
      </Dialog>
    </div>
  );
}
