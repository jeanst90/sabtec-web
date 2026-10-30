"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Hash,
  Mail,
  MapPin,
  Phone,
  Plus,
  Refrigerator,
  Search,
  User,
  Zap,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label, Field, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonList } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const APPLIANCE_TYPES = [
  "GELADEIRA",
  "REFRIGERADOR",
  "FREEZER",
  "LAVADORA",
  "LAVA_E_SECA",
  "SECADORA",
  "LAVA_LOUCA",
  "AR_CONDICIONADO",
  "MICROONDAS",
  "FORNO_ELETRICO",
  "CAFETEIRA",
  "LIQUIDIFICADOR",
  "BATEDEIRA",
  "TORRADEIRA",
  "FERRO_DE_PASSAR",
  "VENTILADOR",
  "ASPIRADOR",
  "PURIFICADOR_AGUA",
  "AQUECEDOR",
  "LAVADORA_ALTA_PRESSAO",
  "OUTRO",
];

type Appliance = {
  id: string;
  type: string;
  brand: string;
  model?: string | null;
  serialNumber?: string | null;
  voltage?: string | null;
  notes?: string | null;
};

type Quote = {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
};

const EMPTY_APPLIANCE = {
  type: "GELADEIRA",
  brand: "",
  model: "",
  serialNumber: "",
  voltage: "",
  notes: "",
};

const APPLIANCE_TYPE_LABELS: Record<string, string> = {
  GELADEIRA: "Geladeira",
  REFRIGERADOR: "Refrigerador",
  FREEZER: "Freezer",
  LAVADORA: "Lavadora",
  LAVA_E_SECA: "Lava e Seca",
  SECADORA: "Secadora",
  LAVA_LOUCA: "Lava Louças",
  AR_CONDICIONADO: "Ar Condicionado",
  MICROONDAS: "Micro-ondas",
  FORNO_ELETRICO: "Forno Elétrico",
  CAFETEIRA: "Cafeteira",
  LIQUIDIFICADOR: "Liquidificador",
  BATEDEIRA: "Batedeira",
  TORRADEIRA: "Torradeira",
  FERRO_DE_PASSAR: "Ferro de Passar",
  VENTILADOR: "Ventilador",
  ASPIRADOR: "Aspirador",
  PURIFICADOR_AGUA: "Purificador de Água",
  AQUECEDOR: "Aquecedor",
  LAVADORA_ALTA_PRESSAO: "Lavadora de Alta Pressão",
  OUTRO: "Outro",
};

function formatApplianceType(type: string) {
  return APPLIANCE_TYPE_LABELS[type] || type;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: customer, mutate } = useSWR(`/api/customers/${id}`, fetcher);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_APPLIANCE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [applianceSearch, setApplianceSearch] = useState("");
  const [catalogSaving, setCatalogSaving] = useState(false);
  const [catalogMsg, setCatalogMsg] = useState("");
  const { data: applianceCatalog, mutate: mutateCatalog } = useSWR(
    open ? "/api/appliance-catalog" : null,
    fetcher
  );

  async function addAppliance(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/appliances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: id, ...form }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error || "Não foi possível salvar o aparelho.");
      return;
    }
    setOpen(false);
    setForm(EMPTY_APPLIANCE);
    setCatalogMsg("");
    mutate();
  }

  function openApplianceModal() {
    setForm(EMPTY_APPLIANCE);
    setError("");
    setCatalogMsg("");
    setOpen(true);
  }

  if (!customer) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="sabtec-card p-4">
          <SkeletonList rows={4} />
        </div>
      </div>
    );
  }

  const appliances: Appliance[] = customer.appliances ?? [];
  const quotes: Quote[] = customer.quotes ?? [];

  const filteredAppliances = useMemo(() => {
    if (!applianceSearch.trim()) return appliances;
    const q = applianceSearch.toLowerCase();
    return appliances.filter((a) => {
      const type = formatApplianceType(a.type).toLowerCase();
      return (
        type.includes(q) ||
        (a.brand || "").toLowerCase().includes(q) ||
        (a.model || "").toLowerCase().includes(q) ||
        (a.serialNumber || "").toLowerCase().includes(q)
      );
    });
  }, [appliances, applianceSearch]);

  const info = [
    { icon: Phone, label: "Telefone", value: customer.phone },
    { icon: Mail, label: "E-mail", value: customer.email },
    { icon: User, label: "CPF/CNPJ", value: customer.cpfCnpj },
    { icon: MapPin, label: "Cidade", value: customer.city },
    { icon: MapPin, label: "Endereço", value: customer.address, full: true },
  ].filter((i) => i.value);

  return (
    <div className="space-y-5">
      <PageHeader
        title={customer.name}
        description={customer.city ? `Cliente · ${customer.city}` : "Cliente"}
        icon={User}
        backHref="/customers"
        backLabel="Clientes"
      >
        <Button variant="outline" onClick={openApplianceModal}>
          <Plus size={16} /> Novo aparelho
        </Button>
        <Link
          href={`/quotes/new?customerId=${id}`}
          className={buttonVariants({ variant: "accent" })}
        >
          <FileText size={16} /> Novo orçamento
        </Link>
      </PageHeader>

      {/* Contact card */}
      <div className="sabtec-card p-4">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Contato
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {info.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-start gap-2.5 ${item.full ? "sm:col-span-2" : ""}`}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon size={15} />
                </span>
                <div className="min-w-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="truncate text-sm">{item.value}</dd>
                </div>
              </div>
            );
          })}
          {info.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum dado de contato.</p>
          )}
        </dl>
      </div>

      {/* Appliances */}
      <section className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-bold">Aparelhos</h2>
          <div className="flex items-center gap-2">
            {appliances.length > 0 && (
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={applianceSearch}
                  onChange={(e) => setApplianceSearch(e.target.value)}
                  placeholder="Buscar aparelho..."
                  className="h-9 pl-8 text-sm"
                />
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={openApplianceModal}>
              <Plus size={14} /> Adicionar
            </Button>
          </div>
        </div>

        {appliances.length === 0 ? (
          <div className="sabtec-card">
            <EmptyState
              icon={Refrigerator}
              title="Nenhum aparelho cadastrado"
              description="Cadastre o aparelho do cliente para criar orçamentos."
            >
              <Button variant="accent" size="sm" onClick={openApplianceModal}>
                <Plus size={14} /> Adicionar aparelho
              </Button>
            </EmptyState>
          </div>
        ) : filteredAppliances.length === 0 ? (
          <div className="sabtec-card">
            <EmptyState
              icon={Search}
              title="Nenhum aparelho encontrado"
              description="Tente buscar por tipo, marca, modelo ou nº de série."
            >
              <Button variant="ghost" size="sm" onClick={() => setApplianceSearch("")}>
                Limpar busca
              </Button>
            </EmptyState>
          </div>
        ) : (
          <>
            <ul className="space-y-2 lg:hidden">
              {filteredAppliances.map((a) => (
                <li key={a.id} className="sabtec-card p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                      <Refrigerator size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {a.brand} {a.model ? `· ${a.model}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatApplianceType(a.type)}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                        {a.serialNumber && (
                          <span className="inline-flex items-center gap-1">
                            <Hash size={11} /> {a.serialNumber}
                          </span>
                        )}
                        {a.voltage && (
                          <span className="inline-flex items-center gap-1">
                            <Zap size={11} /> {a.voltage}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="sabtec-card hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead className="bg-muted/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Marca</th>
                    <th className="px-4 py-3 font-semibold">Modelo</th>
                    <th className="px-4 py-3 font-semibold">Série</th>
                    <th className="px-4 py-3 font-semibold">Voltagem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppliances.map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="px-4 py-3">{formatApplianceType(a.type)}</td>
                      <td className="px-4 py-3">{a.brand}</td>
                      <td className="px-4 py-3">{a.model || "—"}</td>
                      <td className="px-4 py-3">{a.serialNumber || "—"}</td>
                      <td className="px-4 py-3">{a.voltage || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Quotes */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Orçamentos</h2>
          <Link
            href={`/quotes/new?customerId=${id}`}
            className="inline-flex items-center text-xs font-medium text-accent"
          >
            Novo <ChevronRight size={14} />
          </Link>
        </div>

        {quotes.length === 0 ? (
          <div className="sabtec-card">
            <EmptyState
              icon={FileText}
              title="Nenhum orçamento"
              description="Crie um orçamento para este cliente."
            />
          </div>
        ) : (
          <>
            <ul className="space-y-2 lg:hidden">
              {quotes.map((q) => (
                <li key={q.id}>
                  <Link
                    href={`/quotes/${q.id}`}
                    className="sabtec-card sabtec-card-interactive flex items-center justify-between gap-3 p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold">{q.number}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(q.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-accent">
                        {formatCurrency(q.total)}
                      </span>
                      <StatusBadge status={q.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="sabtec-card hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead className="bg-muted/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Número</th>
                    <th className="px-4 py-3 font-semibold">Situação</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr key={q.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <Link href={`/quotes/${q.id}`} className="font-medium hover:text-accent">
                          {q.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="px-4 py-3 text-right">{formatCurrency(q.total)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(q.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setError("");
            setCatalogMsg("");
          }
        }}
        title="Novo aparelho"
        description="Cadastre o equipamento do cliente para agilizar orçamentos e garantias."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setError("");
                setCatalogMsg("");
              }}
            >
              Cancelar
            </Button>
            <Button variant="accent" type="submit" form="appliance-form" disabled={saving}>
              {saving ? "Salvando..." : "Salvar aparelho"}
            </Button>
          </>
        }
      >
        <form id="appliance-form" onSubmit={addAppliance} className="space-y-3">
          <Field>
            <Label htmlFor="a-type">Tipo *</Label>
            <Select
              id="a-type"
              value={form.type}
              onChange={(e) => {
                setForm({ ...form, type: e.target.value, brand: "", model: "" });
                setCatalogMsg("");
              }}
            >
              {APPLIANCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {formatApplianceType(t)}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field>
              <Label htmlFor="a-brand">Marca *</Label>
              <Input
                id="a-brand"
                required
                list="appliance-brands"
                value={form.brand}
                onChange={(e) => {
                  setForm({ ...form, brand: e.target.value });
                  setCatalogMsg("");
                }}
                placeholder="Digite ou selecione..."
                autoComplete="off"
              />
              <datalist id="appliance-brands">
                {(Array.from(
                  new Set(
                    (applianceCatalog ?? [])
                      .filter((c: { type: string }) => c.type === form.type)
                      .map((c: { brand: string }) => c.brand)
                      .filter(Boolean)
                  )
                ) as string[]).map((b: string) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </Field>
            <Field>
              <Label htmlFor="a-model">Modelo</Label>
              <Input
                id="a-model"
                list="appliance-models"
                value={form.model}
                onChange={(e) => {
                  setForm({ ...form, model: e.target.value });
                  setCatalogMsg("");
                }}
                placeholder="Digite ou selecione..."
                autoComplete="off"
              />
              <datalist id="appliance-models">
                {(applianceCatalog ?? [])
                  .filter((c: { type: string; brand: string; model?: string | null }) => {
                    if (c.type !== form.type) return false;
                    if (form.brand) return c.brand === form.brand;
                    return true;
                  })
                  .map((c: { model?: string | null }) => c.model)
                  .filter(Boolean)
                  .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
                  .map((m: string) => (
                    <option key={m} value={m} />
                  ))}
              </datalist>
            </Field>
            <div className="sm:col-span-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={catalogSaving || !form.type || !form.brand}
                onClick={async () => {
                  if (!form.type || !form.brand) return;
                  setCatalogSaving(true);
                  setCatalogMsg("");
                  try {
                    const res = await fetch("/api/appliance-catalog", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: form.type,
                        brand: form.brand,
                        model: form.model || null,
                      }),
                    });
                    if (res.ok) {
                      setCatalogMsg("Marca/modelo salvo no catálogo com sucesso.");
                    } else {
                      const body = await res.json().catch(() => ({}));
                      setCatalogMsg(body?.error || "Não foi possível salvar no catálogo.");
                    }
                    await mutateCatalog();
                  } catch {
                    setCatalogMsg("Não foi possível salvar no catálogo.");
                  } finally {
                    setCatalogSaving(false);
                  }
                }}
              >
                {catalogSaving ? "Salvando..." : "Salvar marca/modelo no catálogo"}
              </Button>
              {catalogMsg && <p className="mt-1 text-xs text-muted-foreground">{catalogMsg}</p>}
            </div>
            <Field>
              <Label htmlFor="a-serial">Nº de série</Label>
              <Input
                id="a-serial"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                placeholder="Opcional"
                autoComplete="off"
              />
            </Field>
            <Field>
              <Label htmlFor="a-voltage">Voltagem</Label>
              <Input
                id="a-voltage"
                value={form.voltage}
                onChange={(e) => setForm({ ...form, voltage: e.target.value })}
                placeholder="110V / 220V / Bivolt"
                autoComplete="off"
              />
            </Field>
          </div>
          <Field>
            <Label htmlFor="a-notes">Observações</Label>
            <Textarea
              id="a-notes"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Opcional"
            />
          </Field>
          {error && (
            <p className="rounded-md bg-destructive-soft px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </p>
          )}
        </form>
      </Dialog>
    </div>
  );
}
