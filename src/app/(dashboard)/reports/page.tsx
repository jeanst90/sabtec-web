"use client";

import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Field } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function download() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    window.open(`/api/reports/quotes?${params.toString()}`, "_blank");
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Relatórios"
        description="Exporte dados para planilhas e contabilidade"
        icon={FileSpreadsheet}
      />

      <div className="sabtec-card mx-auto max-w-xl space-y-4 p-4 sm:p-5">
        <div>
          <h2 className="font-display text-lg font-bold">Orçamentos em CSV</h2>
          <p className="text-sm text-muted-foreground">
            Baixe a lista de orçamentos com cliente, aparelho, valor e status.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="r-from">De</Label>
            <Input
              id="r-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="r-to">Até</Label>
            <Input
              id="r-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </Field>
        </div>

        <Button variant="accent" onClick={download} className="w-full sm:w-auto">
          <Download size={16} /> Baixar CSV
        </Button>
      </div>
    </div>
  );
}
