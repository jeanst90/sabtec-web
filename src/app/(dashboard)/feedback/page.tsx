"use client";

import { useState } from "react";
import useSWR from "swr";
import { MessageSquare, Send, Gauge, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Field, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Feedback = {
  id: string;
  type: string;
  score: number | null;
  message: string;
  createdAt: string;
};

const TYPE_LABEL: Record<string, string> = {
  NPS: "NPS",
  BUG: "Bug",
  SUGESTAO: "Sugestão",
};

export default function FeedbackPage() {
  const { data, mutate, isLoading } = useSWR<Feedback[]>("/api/feedback", fetcher);
  const [type, setType] = useState("SUGESTAO");
  const [score, setScore] = useState(10);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, score, message, page }),
    });
    setSaving(false);
    setMessage("");
    setSent(true);
    mutate();
  }

  const feedback = data ?? [];
  const npsScores = feedback.filter(
    (f) => f.type === "NPS" && f.score !== null
  ) as (Feedback & { score: number })[];
  const promoted = npsScores.filter((f) => f.score >= 9).length;
  const detractors = npsScores.filter((f) => f.score <= 6).length;
  const nps = npsScores.length
    ? ((promoted - detractors) / npsScores.length) * 100
    : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Avaliações & NPS"
        description="Ouvir o time e os clientes para melhorar continuamente"
        icon={MessageSquare}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="NPS atual"
          value={nps.toFixed(0)}
          icon={Gauge}
          accent
          hint={`${npsScores.length} respostas`}
        />
        <StatCard label="Promotores" value={promoted} icon={MessageSquare} />
        <StatCard
          label="Total de feedbacks"
          value={feedback.length}
          icon={Inbox}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Form */}
        <form onSubmit={submit} className="sabtec-card space-y-3 p-4 sm:p-5">
          <h2 className="font-display text-lg font-bold">Enviar avaliação</h2>

          <Field>
            <Label htmlFor="f-type">Tipo</Label>
            <Select id="f-type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="SUGESTAO">Sugestão</option>
              <option value="NPS">NPS</option>
              <option value="BUG">Bug</option>
            </Select>
          </Field>

          {type === "NPS" && (
            <Field>
              <Label>Nota (0-10)</Label>
              <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-11">
                {Array.from({ length: 11 }).map((_, n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setScore(n)}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-md border text-xs font-semibold transition-colors",
                      score === n
                        ? "border-accent bg-accent text-white"
                        : "border-border bg-white text-muted-foreground hover:border-accent/40"
                    )}
                    aria-label={`Nota ${n}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </Field>
          )}

          <Field>
            <Label htmlFor="f-message">Mensagem</Label>
            <Textarea
              id="f-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              placeholder="Conte o que podemos melhorar..."
            />
          </Field>

          <Field>
            <Label htmlFor="f-page">Página (opcional)</Label>
            <Input
              id="f-page"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              placeholder="Ex.: /quotes"
            />
          </Field>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="accent" disabled={saving}>
              <Send size={16} /> {saving ? "Enviando..." : "Enviar"}
            </Button>
            {sent && (
              <span className="text-xs font-medium text-success">
                Feedback enviado. Obrigado!
              </span>
            )}
          </div>
        </form>

        {/* Recent list */}
        <div className="sabtec-card overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-display text-lg font-bold">Recentes</h2>
          </div>
          {isLoading ? (
            <div className="p-4">
              <SkeletonList rows={4} />
            </div>
          ) : feedback.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Nenhum feedback ainda"
              description="Os feedbacks enviados aparecerão aqui."
            />
          ) : (
            <ul className="divide-y divide-border">
              {feedback.slice(0, 12).map((f) => (
                <li key={f.id} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
                      {TYPE_LABEL[f.type] ?? f.type}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(f.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm">{f.message}</p>
                  {f.score !== null && (
                    <p className="mt-1 text-xs text-muted-foreground">Nota: {f.score}/10</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
