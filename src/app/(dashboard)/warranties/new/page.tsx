"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { PenLine, Plus, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Field, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

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

function NewWarrantyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("quoteId") ?? "";

  const { data: customers } = useSWR("/api/customers", fetcher);
  const { data: quote } = useSWR(quoteId ? `/api/quotes/${quoteId}` : null, fetcher);

  const [customerId, setCustomerId] = useState("");
  const [applianceId, setApplianceId] = useState("");
  const [services, setServices] = useState("");
  const [parts, setParts] = useState("");
  const [durationDays, setDurationDays] = useState(90);
  const [terms, setTerms] = useState(
    "A Sabtec garante os serviços realizados e as peças substituídas pelo período indicado, contra defeitos de fabricação e mão de obra, mediante apresentação deste termo."
  );
  const [exclusions, setExclusions] = useState(
    "Não cobre: mau uso, quedas, instalação inadequada, variação de tensão elétrica, intervenção de terceiros, desgaste natural, acessórios e consumíveis."
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const techCanvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [hasTechSignature, setHasTechSignature] = useState(false);

  const [applianceOpen, setApplianceOpen] = useState(false);
  const [applianceForm, setApplianceForm] = useState(EMPTY_APPLIANCE);
  const [savingAppliance, setSavingAppliance] = useState(false);
  const [applianceError, setApplianceError] = useState("");
  const [catalogSaving, setCatalogSaving] = useState(false);
  const [catalogMsg, setCatalogMsg] = useState("");

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }
  function startDraw(e: React.MouseEvent | React.TouchEvent, ref: React.RefObject<HTMLCanvasElement | null>) {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  }
  function draw(e: React.MouseEvent | React.TouchEvent, ref: React.RefObject<HTMLCanvasElement | null>, setHas: (v: boolean) => void) {
    if (!drawing) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHas(true);
  }
  function endDraw() {
    setDrawing(false);
  }
  function clearSig(ref: React.RefObject<HTMLCanvasElement | null>, setHas: (v: boolean) => void) {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHas(false);
    }
  }

  const { data: appliances, mutate: mutateAppliances } = useSWR(
    customerId ? `/api/appliances?customerId=${customerId}` : null,
    fetcher
  );
  const { data: applianceCatalog, mutate: mutateApplianceCatalog } = useSWR(
    applianceOpen ? "/api/appliance-catalog" : null,
    fetcher
  );

  useEffect(() => {
    for (const ref of [canvasRef, techCanvasRef]) {
      const ctx = ref.current?.getContext("2d");
      if (ctx) {
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#1f1f1f";
      }
    }
  }, []);

  useEffect(() => {
    if (quote) {
      setCustomerId(quote.customerId);
      setApplianceId(quote.applianceId);
      setServices((quote.items ?? []).map((i: { description: string }) => i.description).join("\n"));
    }
  }, [quote]);

  useEffect(() => {
    if (appliances?.length && !applianceId) setApplianceId(appliances[0].id);
  }, [appliances, applianceId]);

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!customerId || !applianceId) {
      setError("Selecione cliente e aparelho.");
      return;
    }
    setSaving(true);
    const customerSignatureUrl = hasSignature ? canvasRef.current?.toDataURL("image/png") : undefined;
    const technicianSignatureUrl = hasTechSignature ? techCanvasRef.current?.toDataURL("image/png") : undefined;
    const res = await fetch("/api/warranties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteId: quoteId || undefined,
        customerId,
        applianceId,
        services: services.split("\n").map((s) => s.trim()).filter(Boolean),
        parts: parts.split("\n").map((s) => s.trim()).filter(Boolean),
        durationDays,
        terms,
        exclusions,
        signatureUrl: technicianSignatureUrl,
        customerSignatureUrl,
      }),
    });
    const w = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok || !w?.id) {
      setError(w?.error || "Não foi possível criar a garantia.");
      return;
    }
    router.push(`/warranties/${w.id}`);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Nova garantia"
        description="Emita o termo de garantia do serviço realizado"
        icon={ShieldCheck}
        backHref="/warranties"
        backLabel="Garantias"
      />

      <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4">
        {quote && (
          <div className="rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-primary">
            Vinculada ao orçamento <strong>{quote.number}</strong> · total{" "}
            <strong>{formatCurrency(quote.total)}</strong>
          </div>
        )}

        {/* Customer & appliance */}
        <div className="sabtec-card space-y-3 p-4">
          <h2 className="font-display text-base font-bold">Cliente e aparelho</h2>
          <Field>
            <Label htmlFor="w-customer">Cliente *</Label>
            <Select
              id="w-customer"
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
            <Label htmlFor="w-appliance">Aparelho *</Label>
            <Select
              id="w-appliance"
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

        {/* Services */}
        <div className="sabtec-card space-y-3 p-4">
          <h2 className="font-display text-base font-bold">Serviços realizados</h2>
          <Textarea
            value={services}
            onChange={(e) => setServices(e.target.value)}
            rows={4}
            placeholder="Um serviço por linha..."
            aria-label="Serviços realizados"
          />
        </div>

        {/* Parts */}
        <div className="sabtec-card space-y-3 p-4">
          <h2 className="font-display text-base font-bold">Peças substituídas</h2>
          <Textarea
            value={parts}
            onChange={(e) => setParts(e.target.value)}
            rows={3}
            placeholder="Uma peça por linha..."
            aria-label="Peças substituídas"
          />
        </div>

        {/* Period & terms */}
        <div className="sabtec-card space-y-3 p-4">
          <h2 className="font-display text-base font-bold">Período e termos</h2>
          <Field className="max-w-[200px]">
            <Label htmlFor="w-duration">Duração (dias)</Label>
            <Input
              id="w-duration"
              type="number"
              min={1}
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
            />
          </Field>
          <Field>
            <Label htmlFor="w-terms">Condições</Label>
            <Textarea
              id="w-terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={3}
            />
          </Field>
          <Field>
            <Label htmlFor="w-exclusions">Exclusões</Label>
            <Textarea
              id="w-exclusions"
              value={exclusions}
              onChange={(e) => setExclusions(e.target.value)}
              rows={3}
            />
          </Field>
        </div>

        {/* Signatures */}
        <div className="sabtec-card space-y-3 p-4">
          <h2 className="font-display text-base font-bold">Assinaturas</h2>
          <p className="text-xs text-muted-foreground">
            Ambas são opcionais — se não assinar, o campo fica em branco no PDF.
          </p>

          {/* Technician signature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <PenLine size={14} className="text-accent" /> Assinatura do técnico
              </h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => clearSig(techCanvasRef, setHasTechSignature)}>
                Limpar
              </Button>
            </div>
            <canvas
              ref={techCanvasRef}
              width={600}
              height={200}
              className="aspect-[3/1] w-full touch-none rounded-lg border border-dashed border-border bg-muted/30"
              onMouseDown={(e) => startDraw(e, techCanvasRef)}
              onMouseMove={(e) => draw(e, techCanvasRef, setHasTechSignature)}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={(e) => startDraw(e, techCanvasRef)}
              onTouchMove={(e) => draw(e, techCanvasRef, setHasTechSignature)}
              onTouchEnd={endDraw}
            />
          </div>

          {/* Client signature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <PenLine size={14} className="text-accent" /> Assinatura do cliente
              </h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => clearSig(canvasRef, setHasSignature)}>
                Limpar
              </Button>
            </div>
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="aspect-[3/1] w-full touch-none rounded-lg border border-dashed border-border bg-muted/30"
              onMouseDown={(e) => startDraw(e, canvasRef)}
              onMouseMove={(e) => draw(e, canvasRef, setHasSignature)}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={(e) => startDraw(e, canvasRef)}
              onTouchMove={(e) => draw(e, canvasRef, setHasSignature)}
              onTouchEnd={endDraw}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-destructive-soft px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        {/* Sticky action bar */}
        <div className="sticky bottom-16 z-50 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-white/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:rounded-lg md:border md:p-4">
          <Link
            href="/warranties"
            className="hidden h-11 items-center rounded-md px-4 text-sm font-medium text-muted-foreground hover:bg-muted sm:inline-flex"
          >
            Cancelar
          </Link>
          <Button type="submit" variant="accent" disabled={saving}>
            {saving ? "Salvando..." : "Criar garantia"}
          </Button>
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
        description="Cadastre o equipamento do cliente para usar nesta garantia."
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
            <Button variant="accent" type="submit" form="quick-appliance-form-w" disabled={savingAppliance}>
              {savingAppliance ? "Salvando..." : "Salvar e selecionar"}
            </Button>
          </>
        }
      >
        <form id="quick-appliance-form-w" onSubmit={createAppliance} className="space-y-3">
          <Field>
            <Label htmlFor="qaw-type">Tipo *</Label>
            <Select
              id="qaw-type"
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
              <Label htmlFor="qaw-brand">Marca *</Label>
              <Input
                id="qaw-brand"
                required
                list="qaw-brands"
                value={applianceForm.brand}
                onChange={(e) => {
                  setApplianceForm({ ...applianceForm, brand: e.target.value });
                  setCatalogMsg("");
                }}
                placeholder="Digite ou selecione..."
                autoComplete="off"
              />
              <datalist id="qaw-brands">
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
              <Label htmlFor="qaw-model">Modelo</Label>
              <Input
                id="qaw-model"
                list="qaw-models"
                value={applianceForm.model}
                onChange={(e) => {
                  setApplianceForm({ ...applianceForm, model: e.target.value });
                  setCatalogMsg("");
                }}
                placeholder="Digite ou selecione..."
                autoComplete="off"
              />
              <datalist id="qaw-models">
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
              <Label htmlFor="qaw-serial">Nº de série</Label>
              <Input
                id="qaw-serial"
                value={applianceForm.serialNumber}
                onChange={(e) => setApplianceForm({ ...applianceForm, serialNumber: e.target.value })}
                placeholder="Opcional"
                autoComplete="off"
              />
            </Field>
            <Field>
              <Label htmlFor="qaw-voltage">Voltagem</Label>
              <Input
                id="qaw-voltage"
                value={applianceForm.voltage}
                onChange={(e) => setApplianceForm({ ...applianceForm, voltage: e.target.value })}
                placeholder="110V / 220V / Bivolt"
                autoComplete="off"
              />
            </Field>
          </div>
          <Field>
            <Label htmlFor="qaw-notes">Observações</Label>
            <Textarea
              id="qaw-notes"
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
      <NewWarrantyPage />
    </Suspense>
  );
}
