"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { FileText, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Field, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Item = { description: string; quantity: number; unitPrice: number };

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

const EMPTY_APPLIANCE = {
  type: "GELADEIRA",
  brand: "",
  model: "",
  serialNumber: "",
  voltage: "",
  notes: "",
};

function NewQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preCustomer = searchParams.get("customerId") ?? "";

  const { data: customers } = useSWR("/api/customers", fetcher);
  const { data: catalog } = useSWR("/api/catalog?type=SERVICO", fetcher);

  const [customerId, setCustomerId] = useState(preCustomer);
  const [applianceId, setApplianceId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [laborCost, setLaborCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [validDays, setValidDays] = useState(7);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [applianceOpen, setApplianceOpen] = useState(false);
  const [applianceForm, setApplianceForm] = useState(EMPTY_APPLIANCE);
  const [savingAppliance, setSavingAppliance] = useState(false);
  const [applianceError, setApplianceError] = useState("");
  const [catalogSaving, setCatalogSaving] = useState(false);
  const [catalogMsg, setCatalogMsg] = useState("");

  const { data: appliances, mutate: mutateAppliances } = useSWR(
    customerId ? `/api/appliances?customerId=${customerId}` : null,
    fetcher
  );
  const { data: applianceCatalog, mutate: mutateApplianceCatalog } = useSWR(
    applianceOpen ? "/api/appliance-catalog" : null,
    fetcher
  );

  useEffect(() => {
    if (appliances?.length && !applianceId) setApplianceId(appliances[0].id);
  }, [appliances, applianceId]);

  function updateItem(i: number, field: keyof Item, value: string | number) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function createAppliance(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) {
      setApplianceError("Selecione o cliente primeiro.");
      return;
    }
    setSavingAppliance(true);
    setApplianceError("");
    const res = await fetch("/api/appliances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, ...applianceForm }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingAppliance(false);
    if (!res.ok || !data?.id) {
      setApplianceError(data?.error || "Não foi possível cadastrar o aparelho.");
      return;
    }
    setApplianceOpen(false);
    setApplianceForm(EMPTY_APPLIANCE);
    setCatalogMsg("");
    await mutateAppliances();
    setApplianceId(data.id);
  }

  function openApplianceModal() {
    if (!customerId) {
      setError("Selecione o cliente primeiro para cadastrar o aparelho.");
      return;
    }
    setApplianceForm(EMPTY_APPLIANCE);
    setApplianceError("");
    setCatalogMsg("");
    setApplianceOpen(true);
  }

  const partsCost = items.reduce(
    (s, it) => s + (it.quantity || 0) * (it.unitPrice || 0),
    0
  );
  const total = partsCost + (laborCost || 0) - (discount || 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!customerId || !applianceId || !diagnosis) {
      setError("Preencha cliente, aparelho e diagnóstico.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        applianceId,
        diagnosis,
        items,
        laborCost,
        discount,
        validDays,
      }),
    });
    const quote = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok || !quote?.id) {
      setError(quote?.error || "Não foi possível criar o orçamento.");
      return;
    }
    router.push(`/quotes/${quote.id}`);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Novo orçamento"
        description="Preencha os dados e envie para aprovação"
        icon={FileText}
        backHref="/quotes"
        backLabel="Orçamentos"
      />

      <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4">
        {/* Customer & appliance */}
        <div className="sabtec-card space-y-3 p-4">
          <h2 className="font-display text-base font-bold">Cliente e aparelho</h2>
          <Field>
            <Label htmlFor="q-customer">Cliente *</Label>
            <Select
              id="q-customer"
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setApplianceId("");
              }}
              required
            >
              <option value="">Selecione...</option>
              {(customers ?? []).map((c: { id: string; name: string }) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          {!customerId && (
            <Link
              href="/customers"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent"
            >
              <Users size={13} /> Cadastrar novo cliente
            </Link>
          )}
          <Field>
            <Label htmlFor="q-appliance">Aparelho *</Label>
            <Select
              id="q-appliance"
              value={applianceId}
              onChange={(e) => setApplianceId(e.target.value)}
              required
              disabled={!customerId}
            >
              <option value="">Selecione...</option>
              {(appliances ?? []).map((a: { id: string; type: string; brand: string; model?: string }) => (
                <option key={a.id} value={a.id}>
                  {formatApplianceType(a.type)} — {a.brand} {a.model ? `· ${a.model}` : ""}
                </option>
              ))}
            </Select>
            {customerId && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {appliances?.length
                    ? "Selecione um aparelho ou cadastre um novo."
                    : "Este cliente ainda não tem aparelhos cadastrados."}
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={openApplianceModal}>
                  <Plus size={14} /> Cadastrar novo aparelho
                </Button>
              </div>
            )}
          </Field>
        </div>

        {/* Diagnosis */}
        <div className="sabtec-card space-y-3 p-4">
          <h2 className="font-display text-base font-bold">Diagnóstico</h2>
          <Textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
            rows={4}
            placeholder="Descreva o problema encontrado..."
            aria-label="Diagnóstico"
          />
        </div>

        {/* Items */}
        <div className="sabtec-card space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Itens</h2>
            <Button type="button" variant="ghost" size="sm" onClick={addItem}>
              <Plus size={14} /> Adicionar
            </Button>
          </div>

          {items.map((it, i) => (
            <div
              key={i}
              className="grid grid-cols-2 items-end gap-2 rounded-lg border border-border p-3 sm:grid-cols-12 sm:border-0 sm:p-0"
            >
              <Field className="col-span-2 sm:col-span-6">
                <Label htmlFor={`item-desc-${i}`} className="text-[10px]">
                  Descrição
                </Label>
                <Input
                  id={`item-desc-${i}`}
                  list="catalog-servicos"
                  value={it.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                />
              </Field>
              <Field className="col-span-1 sm:col-span-2">
                <Label htmlFor={`item-qty-${i}`} className="text-[10px]">
                  Qtd
                </Label>
                <Input
                  id={`item-qty-${i}`}
                  type="number"
                  min={1}
                  value={it.quantity}
                  onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                />
              </Field>
              <Field className="col-span-1 sm:col-span-3">
                <Label htmlFor={`item-price-${i}`} className="text-[10px]">
                  Unit. (R$)
                </Label>
                <Input
                  id={`item-price-${i}`}
                  type="number"
                  step="0.01"
                  value={it.unitPrice}
                  onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))}
                />
              </Field>
              <div className="col-span-2 flex justify-end sm:col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(i)}
                  aria-label="Remover item"
                  disabled={items.length === 1}
                >
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}

          <datalist id="catalog-servicos">
            {(catalog ?? []).map((c: { id: string; name: string }) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </div>

        {/* Values */}
        <div className="sabtec-card space-y-3 p-4">
          <h2 className="font-display text-base font-bold">Valores</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field>
              <Label htmlFor="q-labor">Mão de obra (R$)</Label>
              <Input
                id="q-labor"
                type="number"
                step="0.01"
                value={laborCost}
                onChange={(e) => setLaborCost(Number(e.target.value))}
              />
            </Field>
            <Field>
              <Label htmlFor="q-discount">Desconto (R$)</Label>
              <Input
                id="q-discount"
                type="number"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </Field>
            <Field>
              <Label htmlFor="q-valid">Validade (dias)</Label>
              <Input
                id="q-valid"
                type="number"
                min={1}
                value={validDays}
                onChange={(e) => setValidDays(Number(e.target.value))}
              />
            </Field>
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-destructive-soft px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        {/* Sticky action bar */}
        <div className="sticky bottom-16 z-50 -mx-4 flex items-center justify-between gap-3 border-t border-border bg-white/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:rounded-lg md:border md:p-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Total
            </p>
            <p className="font-display text-xl font-bold text-accent">
              {formatCurrency(total)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/quotes"
              className="hidden h-11 items-center rounded-md px-4 text-sm font-medium text-muted-foreground hover:bg-muted sm:inline-flex"
            >
              Cancelar
            </Link>
            <Button type="submit" variant="accent" disabled={saving}>
              {saving ? "Salvando..." : "Criar orçamento"}
            </Button>
          </div>
        </div>
      </form>

      <Dialog
        open={applianceOpen}
        onOpenChange={(v) => {
          setApplianceOpen(v);
          if (!v) {
            setApplianceError("");
            setCatalogMsg("");
          }
        }}
        title="Cadastrar aparelho"
        description="Cadastre o equipamento do cliente para usar neste orçamento."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setApplianceOpen(false);
                setApplianceError("");
                setCatalogMsg("");
              }}
            >
              Cancelar
            </Button>
            <Button variant="accent" type="submit" form="quick-appliance-form" disabled={savingAppliance}>
              {savingAppliance ? "Salvando..." : "Salvar e selecionar"}
            </Button>
          </>
        }
      >
        <form id="quick-appliance-form" onSubmit={createAppliance} className="space-y-3">
          <Field>
            <Label htmlFor="qa-type">Tipo *</Label>
            <Select
              id="qa-type"
              value={applianceForm.type}
              onChange={(e) => {
                setApplianceForm({ ...applianceForm, type: e.target.value, brand: "", model: "" });
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
              <Label htmlFor="qa-brand">Marca *</Label>
              <Input
                id="qa-brand"
                required
                list="qa-brands"
                value={applianceForm.brand}
                onChange={(e) => {
                  setApplianceForm({ ...applianceForm, brand: e.target.value });
                  setCatalogMsg("");
                }}
                placeholder="Digite ou selecione..."
                autoComplete="off"
              />
              <datalist id="qa-brands">
                {(Array.from(
                  new Set(
                    (applianceCatalog ?? [])
                      .filter((c: { type: string }) => c.type === applianceForm.type)
                      .map((c: { brand: string }) => c.brand)
                      .filter(Boolean)
                  )
                ) as string[]).map((b: string) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </Field>
            <Field>
              <Label htmlFor="qa-model">Modelo</Label>
              <Input
                id="qa-model"
                list="qa-models"
                value={applianceForm.model}
                onChange={(e) => {
                  setApplianceForm({ ...applianceForm, model: e.target.value });
                  setCatalogMsg("");
                }}
                placeholder="Digite ou selecione..."
                autoComplete="off"
              />
              <datalist id="qa-models">
                {(applianceCatalog ?? [])
                  .filter((c: { type: string; brand: string; model?: string | null }) => {
                    if (c.type !== applianceForm.type) return false;
                    if (applianceForm.brand) return c.brand === applianceForm.brand;
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
                disabled={catalogSaving || !applianceForm.type || !applianceForm.brand}
                onClick={async () => {
                  if (!applianceForm.type || !applianceForm.brand) return;
                  setCatalogSaving(true);
                  setCatalogMsg("");
                  try {
                    const res = await fetch("/api/appliance-catalog", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: applianceForm.type,
                        brand: applianceForm.brand,
                        model: applianceForm.model || null,
                      }),
                    });
                    if (res.ok) {
                      setCatalogMsg("Marca/modelo salvo no catálogo com sucesso.");
                    } else {
                      const body = await res.json().catch(() => ({}));
                      setCatalogMsg(body?.error || "Não foi possível salvar no catálogo.");
                    }
                    await mutateApplianceCatalog();
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
              <Label htmlFor="qa-serial">Nº de série</Label>
              <Input
                id="qa-serial"
                value={applianceForm.serialNumber}
                onChange={(e) => setApplianceForm({ ...applianceForm, serialNumber: e.target.value })}
                placeholder="Opcional"
                autoComplete="off"
              />
            </Field>
            <Field>
              <Label htmlFor="qa-voltage">Voltagem</Label>
              <Input
                id="qa-voltage"
                value={applianceForm.voltage}
                onChange={(e) => setApplianceForm({ ...applianceForm, voltage: e.target.value })}
                placeholder="110V / 220V / Bivolt"
                autoComplete="off"
              />
            </Field>
          </div>
          <Field>
            <Label htmlFor="qa-notes">Observações</Label>
            <Textarea
              id="qa-notes"
              rows={2}
              value={applianceForm.notes}
              onChange={(e) => setApplianceForm({ ...applianceForm, notes: e.target.value })}
              placeholder="Opcional"
            />
          </Field>
          {applianceError && (
            <p className="rounded-md bg-destructive-soft px-3 py-2 text-xs font-medium text-destructive">
              {applianceError}
            </p>
          )}
        </form>
      </Dialog>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      }
    >
      <NewQuotePage />
    </Suspense>
  );
}
