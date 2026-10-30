"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  Users,
  Refrigerator,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Field } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { SearchInput } from "@/components/ui/search-input";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  _count: { appliances: number; quotes: number };
};

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  cpfCnpj: "",
  address: "",
  city: "",
  consent: false,
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CustomersPage() {
  const [q, setQ] = useState("");
  const { data, mutate, isLoading } = useSWR<Customer[]>(
    `/api/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    fetcher
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function createCustomer(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error || "Não foi possível salvar o cliente.");
      return;
    }
    setOpen(false);
    setForm(EMPTY_FORM);
    mutate();
  }

  function openNew() {
    setForm(EMPTY_FORM);
    setError("");
    setOpen(true);
  }

  const customers = data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clientes"
        description="Sua base de clientes e histórico de atendimentos"
        icon={Users}
      >
        <Button variant="accent" onClick={openNew}>
          <Plus size={16} /> Novo cliente
        </Button>
      </PageHeader>

      <SearchInput
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nome, telefone ou e-mail..."
        wrapperClassName="sm:max-w-sm"
        aria-label="Buscar clientes"
      />

      {isLoading ? (
        <div className="sabtec-card p-4">
          <SkeletonList rows={5} />
        </div>
      ) : customers.length === 0 ? (
        <div className="sabtec-card">
          <EmptyState
            icon={Users}
            title={q ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
            description={
              q
                ? "Tente buscar por outro nome, telefone ou e-mail."
                : "Cadastre seu primeiro cliente para começar a criar orçamentos."
            }
          >
            {!q && (
              <Button variant="accent" onClick={openNew}>
                <Plus size={16} /> Novo cliente
              </Button>
            )}
          </EmptyState>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <ul className="space-y-2 lg:hidden">
            {customers.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/customers/${c.id}`}
                  className="sabtec-card sabtec-card-interactive flex items-center gap-3 p-3"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-bold text-accent">
                    {initials(c.name) || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.phone}
                      {c.city ? ` · ${c.city}` : ""}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Refrigerator size={12} /> {c._count?.appliances ?? 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FileText size={12} /> {c._count?.quotes ?? 0}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="sabtec-card hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Telefone</th>
                  <th className="px-4 py-3 font-semibold">Cidade</th>
                  <th className="px-4 py-3 text-center font-semibold">Aparelhos</th>
                  <th className="px-4 py-3 text-center font-semibold">Orçamentos</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-border transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/customers/${c.id}`}
                        className="flex items-center gap-3 font-medium hover:text-accent"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                          {initials(c.name) || "?"}
                        </span>
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{c.phone}</td>
                    <td className="px-4 py-3">{c.city || "—"}</td>
                    <td className="px-4 py-3 text-center">{c._count?.appliances ?? 0}</td>
                    <td className="px-4 py-3 text-center">{c._count?.quotes ?? 0}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/customers/${c.id}`}
                        className="text-muted-foreground hover:text-accent"
                        aria-label={`Abrir ${c.name}`}
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

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Novo cliente"
        description="Preencha os dados básicos para começar."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="accent" type="submit" form="customer-form" disabled={saving}>
              {saving ? "Salvando..." : "Salvar cliente"}
            </Button>
          </>
        }
      >
        <form id="customer-form" onSubmit={createCustomer} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <Label htmlFor="c-name">Nome *</Label>
              <Input
                id="c-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome completo"
              />
            </Field>
            <Field>
              <Label htmlFor="c-phone">Telefone *</Label>
              <Input
                id="c-phone"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </Field>
            <Field>
              <Label htmlFor="c-email">E-mail</Label>
              <Input
                id="c-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="cliente@email.com"
              />
            </Field>
            <Field>
              <Label htmlFor="c-cpf">CPF/CNPJ</Label>
              <Input
                id="c-cpf"
                value={form.cpfCnpj}
                onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
              />
            </Field>
            <Field>
              <Label htmlFor="c-city">Cidade</Label>
              <Input
                id="c-city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </Field>
            <Field className="sm:col-span-2">
              <Label htmlFor="c-address">Endereço</Label>
              <Input
                id="c-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
          </div>
          <label className="flex items-start gap-2 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-[var(--sabtec-accent)]"
            />
            O cliente autoriza o tratamento de dados para fins de atendimento (LGPD).
          </label>
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
