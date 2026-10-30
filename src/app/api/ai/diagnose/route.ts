import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { symptom, applianceType, brand } = body ?? {};
  if (!symptom) return NextResponse.json({ error: "Sintoma obrigatório." }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    const prompt = `Você é um técnico experiente em assistência técnica de eletrodomésticos.
Aparelho: ${applianceType || "desconhecido"} ${brand || ""}.
Sintoma relatado: ${symptom}.

Responda em JSON com os campos:
- causes: array de strings com causas prováveis (máx 5)
- parts: array de strings com peças prováveis (máx 6)
- laborEstimate: número (horas de mão de obra estimadas)
- notes: string com observações técnicas curtas`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.4,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      try {
        const parsed = JSON.parse(content);
        return NextResponse.json({ source: "openai", ...parsed });
      } catch {
        // fall through
      }
    }
  }

  // Heuristic fallback
  const lower = String(symptom).toLowerCase();
  const causes: string[] = [];
  const parts: string[] = [];
  let labor = 1;
  if (lower.includes("não gela") || lower.includes("nao gela")) {
    causes.push("Falta de gás refrigerante", "Compressor com defeito", "Termostato queimado");
    parts.push("Gás R134a", "Compressor", "Termostato");
    labor = 2;
  }
  if (lower.includes("barulho") || lower.includes("ruído")) {
    causes.push("Mancais desgastados", "Ventilador com defeito");
    parts.push("Mancais", "Ventilador");
    labor = 1.5;
  }
  if (lower.includes("não liga") || lower.includes("nao liga")) {
    causes.push("Placa eletrônica queimada", "Cabo de força", "Tomada sem energia");
    parts.push("Placa eletrônica", "Cabo de força");
    labor = 1;
  }
  if (causes.length === 0) {
    causes.push("Diagnóstico manual necessário");
    parts.push("A definir");
    labor = 1;
  }
  return NextResponse.json({ source: "heuristic", causes, parts, laborEstimate: labor, notes: "Sugestão automática. Confirmar com diagnóstico técnico." });
}