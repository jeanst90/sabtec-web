"use client";

import { useState } from "react";
import {
  ImageUp,
  ScanLine,
  Sparkles,
  Stethoscope,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Field, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency } from "@/lib/utils";

type Diagnosis = {
  source: string;
  causes: string[];
  parts: string[];
  laborEstimate: number;
  notes: string;
};

type Pricing = {
  samples: number;
  average: number;
  min: number;
  max: number;
  suggested: number;
  source: string;
};

export default function AIPage() {
  // Diagnosis
  const [symptom, setSymptom] = useState("");
  const [applianceType, setApplianceType] = useState("GELADEIRA");
  const [brand, setBrand] = useState("");
  const [diagResult, setDiagResult] = useState<Diagnosis | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  async function runDiagnosis() {
    setDiagLoading(true);
    const res = await fetch("/api/ai/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptom, applianceType, brand }),
    });
    const data = await res.json();
    setDiagResult(data);
    setDiagLoading(false);
  }

  // Pricing
  const [priceDesc, setPriceDesc] = useState("");
  const [priceResult, setPriceResult] = useState<Pricing | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  async function runPricing() {
    setPriceLoading(true);
    const res = await fetch("/api/ai/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: priceDesc }),
    });
    const data = await res.json();
    setPriceResult(data);
    setPriceLoading(false);
  }

  // OCR
  const [ocrImage, setOcrImage] = useState("");
  const [ocrResult, setOcrResult] = useState<Record<string, unknown> | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setOcrImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function runOcr() {
    setOcrLoading(true);
    const res = await fetch("/api/ai/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: ocrImage }),
    });
    const data = await res.json();
    setOcrResult(data);
    setOcrLoading(false);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Assistente IA"
        description="Diagnóstico, precificação e leitura de notas com IA"
        icon={Sparkles}
      />

      {/* Diagnosis */}
      <div className="sabtec-card space-y-3 p-4 sm:p-5">
        <h2 className="flex items-center gap-1.5 font-display text-base font-bold">
          <Stethoscope size={17} className="text-accent" /> Diagnóstico inteligente
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field>
            <Label htmlFor="ai-type">Tipo de aparelho</Label>
            <Select
              id="ai-type"
              value={applianceType}
              onChange={(e) => setApplianceType(e.target.value)}
            >
              {[
                "GELADEIRA",
                "REFRIGERADOR",
                "FREEZER",
                "LAVADORA",
                "LAVA_E_SECA",
                "AR_CONDICIONADO",
                "MICROONDAS",
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="ai-brand">Marca</Label>
            <Input
              id="ai-brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ex.: Brastemp"
            />
          </Field>
          <Field className="sm:col-span-2">
            <Label htmlFor="ai-symptom">Sintoma</Label>
            <Textarea
              id="ai-symptom"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              rows={3}
              placeholder="Ex.: geladeira não gela e faz ruído no compressor"
            />
          </Field>
        </div>
        <Button variant="accent" onClick={runDiagnosis} disabled={diagLoading}>
          <Sparkles size={16} /> {diagLoading ? "Analisando..." : "Sugerir diagnóstico"}
        </Button>
        {diagResult && (
          <div className="space-y-2 rounded-lg bg-muted/60 p-3 text-sm">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Fonte: {diagResult.source}
            </p>
            <p>
              <span className="font-semibold">Causas:</span>{" "}
              {diagResult.causes?.join(", ")}
            </p>
            <p>
              <span className="font-semibold">Peças:</span>{" "}
              {diagResult.parts?.join(", ")}
            </p>
            <p>
              <span className="font-semibold">Mão de obra estimada:</span>{" "}
              {diagResult.laborEstimate}h
            </p>
            <p className="text-muted-foreground">{diagResult.notes}</p>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="sabtec-card space-y-3 p-4 sm:p-5">
        <h2 className="flex items-center gap-1.5 font-display text-base font-bold">
          <Tag size={17} className="text-accent" /> Precificação inteligente
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={priceDesc}
            onChange={(e) => setPriceDesc(e.target.value)}
            placeholder="Descrição da peça/serviço"
            aria-label="Descrição da peça ou serviço"
          />
          <Button variant="accent" onClick={runPricing} disabled={priceLoading}>
            {priceLoading ? "Calculando..." : "Sugerir preço"}
          </Button>
        </div>
        {priceResult && (
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/60 p-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">Amostras</p>
              <p className="font-semibold">{priceResult.samples}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">Média</p>
              <p className="font-semibold">{formatCurrency(priceResult.average)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">Faixa</p>
              <p className="font-semibold">
                {formatCurrency(priceResult.min)} — {formatCurrency(priceResult.max)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">Sugerido</p>
              <p className="font-display text-base font-bold text-accent">
                {formatCurrency(priceResult.suggested)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* OCR */}
      <div className="sabtec-card space-y-3 p-4 sm:p-5">
        <h2 className="flex items-center gap-1.5 font-display text-base font-bold">
          <ScanLine size={17} className="text-accent" /> OCR de nota fiscal
        </h2>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground transition-colors hover:border-accent/40">
          <ImageUp size={22} className="text-accent" />
          <span>Selecionar imagem da nota</span>
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
        {ocrImage && (
          <img
            src={ocrImage}
            alt="Prévia da nota"
            className="max-h-48 rounded-lg border border-border object-contain"
          />
        )}
        <Button
          variant="accent"
          onClick={runOcr}
          disabled={ocrLoading || !ocrImage}
        >
          <ScanLine size={16} /> {ocrLoading ? "Extraindo..." : "Extrair dados"}
        </Button>
        {ocrResult && (
          <pre className="sabtec-scroll max-h-64 overflow-auto rounded-lg bg-muted/60 p-3 text-xs">
            {JSON.stringify(ocrResult, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
