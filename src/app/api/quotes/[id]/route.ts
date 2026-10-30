import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { data: quote, error } = await supabase.from("Quote").select("*, customer:Customer(*), appliance:Appliance(*), technician:User(*), items:QuoteItem(*), warranty:Warranty(*)").eq("id", id).single();
  if (error || !quote) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PUT(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await request.json();
  const { items, ...rest } = body ?? {};
  if (Array.isArray(items)) {
    await supabase.from("QuoteItem").delete().eq("quoteId", id);
    const partsCost = items.reduce((s: number, it: { quantity: number; unitPrice: number }) => s + (it.quantity || 0) * (it.unitPrice || 0), 0);
    const { data: existing } = await supabase.from("Quote").select("laborCost, discount").eq("id", id).single();
    const laborCost = rest.laborCost ?? existing?.laborCost ?? 0;
    const discount = rest.discount ?? existing?.discount ?? 0;
    rest.partsCost = partsCost;
    rest.total = partsCost + laborCost - discount;
    if (items.length) {
      await supabase.from("QuoteItem").insert(items.map((it: { description: string; quantity: number; unitPrice: number }) => ({
        quoteId: id, description: it.description, quantity: it.quantity || 1, unitPrice: it.unitPrice || 0,
        total: (it.quantity || 1) * (it.unitPrice || 0),
      })));
    }
  }
  const { data, error } = await supabase.from("Quote").update(rest).eq("id", id).select("*, customer:Customer(*), appliance:Appliance(*), items:QuoteItem(*)").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  await supabase.from("Quote").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}