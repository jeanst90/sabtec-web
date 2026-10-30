"use client";

import { useState } from "react";
import useSWR from "swr";
import { Package, Plus, Wrench, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Field } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type CatalogItem = {
  id: string;
  type: string;
  name: string;
  description?: string | null;
  price: number;
  unit: string;
};

const EMPTY_FORM = {
  type: "SERVICO",
  name: "",
  description: "",
  price: 0,
  unit: "un",
};

export default function CatalogPage() {
  const [type, setType] = useState("SERVICO");
  const { data, mutate, isLoading } = useSWR<CatalogItem[]>(
    `/api/catalog?type=${type}`,
    fetcher
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error || "Não foi possível salvar o item.");
      return;
    }
    setOpen(false);
    setForm(EMPTY_FORM);
    mutate();
  }

  function openNew() {
    setForm({ ...EMPTY_FORM, type });
    setError("");
    setOpen(true);
  }

  const items = data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Catálogo"
        description="Serviços e peças padronizados para agilizar orçamentos"
        icon={Package}
      >
        <Button variant="accent" onClick={openNew}>
          <Plus size={16} /> Novo item
        </Button>
      </PageHeader>

      {/* Segmented tabs */}
      <div className="inline-flex rounded-lg border border-border bg-muted/60 p-1">
        {[
          { value: "SERVICO", label: "Serviços", icon: Wrench },
          { value: "PECA", label: "Peças", icon: Cog },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = type === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setType(tab.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="sabtec-card p-4">
          <SkeletonList rows={4} />
        </div>
      ) : items.length === 0 ? (
        <div className="sabtec-card">
          <EmptyState
            icon={Package}
            title={type === "SERVICO" ? "Nenhum serviço cadastrado" : "Nenhuma peça cadastrada"}
            description="Cadastre itens para reutilizar em orçamentos com preço padrão."
          >
            <Button variant="accent" onClick={openNew}>
              <Plus size={16} /> Novo item
            </Button>
          </EmptyState>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-2 lg:hidden">
            {items.map((item) => (
              <li key={item.id} className="sabtec-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-display text-base font-bold text-accent">
                    {formatCurrency(item.price)}
                  </span>
                </div>
                <span className="mt-2 inline-block rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  {item.unit}
                </span>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="sabtec-card hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Descrição</th>
                  <th className="px-4 py-3 text-right font-semibold">Preço</th>
                  <th className="px-4 py-3 font-semibold">Unidade</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-border transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3">{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Novo item"
        description="Cadastre um serviço ou peça no catálogo."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="accent" type="submit" form="catalog-form" disabled={saving}>
              {saving ? "Salvando..." : "Salvar item"}
            </Button>
          </>
        }
      >
        <form id="catalog-form" onSubmit={create} className="space-y-3">
          <Field>
            <Label htmlFor="i-type">Tipo</Label>
            <Select
              id="i-type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="SERVICO">Serviço</option>
              <option value="PECA">Peça</option>
            </Select>
          </Field>
          <Field>
            <Label htmlFor="i-name">Nome *</Label>
            <Input
              id="i-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex.: Limpeza de ar-condicionado"
            />
          </Field>
          <Field>
            <Label htmlFor="i-desc">Descrição</Label>
            <Input
              id="i-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label htmlFor="i-price">Preço (R$)</Label>
              <Input
                id="i-price"
                type="number"
                step="0.01"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </Field>
            <Field>
              <Label htmlFor="i-unit">Unidade</Label>
              <Input
                id="i-unit"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="un"
              />
            </Field>
          </div>
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
