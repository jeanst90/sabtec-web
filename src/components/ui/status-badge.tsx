import * as React from "react";
import { Badge } from "./badge";
import type { BadgeProps } from "./badge";

type Variant = NonNullable<BadgeProps["variant"]>;

const MAP: Record<string, { label: string; variant: Variant }> = {
  // Quotes
  RASCUNHO: { label: "Rascunho", variant: "default" },
  ENVIADO: { label: "Enviado", variant: "info" },
  APROVADO: { label: "Aprovado", variant: "success" },
  REPROVADO: { label: "Reprovado", variant: "destructive" },
  EXPIRADO: { label: "Expirado", variant: "default" },
  CONVERTIDO: { label: "Convertido", variant: "accent" },
  // Warranties
  ATIVA: { label: "Ativa", variant: "success" },
  VENCIDA: { label: "Vencida", variant: "default" },
  CANCELADA: { label: "Cancelada", variant: "destructive" },
  ESTENDIDA: { label: "Estendida", variant: "info" },
};

export function StatusBadge({
  status,
  dot = true,
  className,
}: {
  status: string;
  dot?: boolean;
  className?: string;
}) {
  const item = MAP[status] ?? { label: status, variant: "default" as Variant };
  return (
    <Badge variant={item.variant} dot={dot} className={className}>
      {item.label}
    </Badge>
  );
}

export const QUOTE_STATUSES = [
  "RASCUNHO",
  "ENVIADO",
  "APROVADO",
  "REPROVADO",
  "EXPIRADO",
  "CONVERTIDO",
] as const;

export const WARRANTY_STATUSES = [
  "ATIVA",
  "VENCIDA",
  "CANCELADA",
  "ESTENDIDA",
] as const;

export function statusLabel(status: string) {
  return MAP[status]?.label ?? status;
}
