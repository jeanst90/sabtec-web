import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { description } = body ?? {};
  if (!description) return NextResponse.json({ error: "Descrição obrigatória." }, { status: 400 });

  const { data: items } = await supabase.from("QuoteItem").select("unitPrice").ilike("description", `%${description}%`);
  const { data: catalog } = await supabase.from("CatalogItem").select("price").ilike("name", `%${description}%`);

  const prices = (items || []).map((i: { unitPrice: number }) => i.unitPrice).filter((p: number) => p > 0);
  const catPrices = (catalog || []).map((c: { price: number }) => c.price).filter((p: number) => p > 0);
  const all = [...prices, ...catPrices];
  const avg = all.length ? all.reduce((a: number, b: number) => a + b, 0) / all.length : 0;
  const min = all.length ? Math.min(...all) : 0;
  const max = all.length ? Math.max(...all) : 0;
  const suggested = avg > 0 ? avg * 1.3 : 0;

  return NextResponse.json({ description, samples: all.length, average: avg, min, max, suggested, margin: 0.3, source: all.length ? "historico" : "sem-dados" });
}