import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { nextQuoteNumber } from "@/lib/numbers";
import { nanoid } from "nanoid";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();
  let query = supabase.from("Quote").select("*, customer:Customer(id, name, phone), appliance:Appliance(id, type, brand, model), items:QuoteItem(*)").order("createdAt", { ascending: false });
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`number.ilike.%${q}%,customer.name.ilike.%${q}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { customerId, applianceId, technicianId, diagnosis, items, laborCost = 0, discount = 0, validDays = 7 } = body ?? {};
  if (!customerId || !applianceId || !diagnosis) {
    return NextResponse.json({ error: "Cliente, aparelho e diagnóstico são obrigatórios." }, { status: 400 });
  }
  const number = await nextQuoteNumber();
  const partsCost = (items ?? []).reduce((sum: number, it: { quantity: number; unitPrice: number }) => sum + (it.quantity || 0) * (it.unitPrice || 0), 0);
  const total = partsCost + (laborCost || 0) - (discount || 0);
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + validDays);

  const { data: quote, error } = await supabase.from("Quote").insert({
    number, publicToken: nanoid(16), customerId, applianceId, technicianId: technicianId || null,
    diagnosis, laborCost, partsCost, discount, total, validUntil: validUntil.toISOString(), status: "RASCUNHO",
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (items?.length) {
    const quoteItems = items.map((it: { description: string; quantity: number; unitPrice: number }) => ({
      quoteId: quote.id, description: it.description, quantity: it.quantity || 1,
      unitPrice: it.unitPrice || 0, total: (it.quantity || 1) * (it.unitPrice || 0),
    }));
    await supabase.from("QuoteItem").insert(quoteItems);
  }

  const { data: full } = await supabase.from("Quote").select("*, customer:Customer(*), appliance:Appliance(*), items:QuoteItem(*)").eq("id", quote.id).single();
  return NextResponse.json(full, { status: 201 });
}