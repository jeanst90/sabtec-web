import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { data, error } = await supabase
    .from("Warranty")
    .select("*, customer:Customer(*), appliance:Appliance(*), technician:User(*), quote:Quote(*, items:QuoteItem(*))")
    .eq("id", id)
    .single();
  if (error || !data) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await request.json();
  const { data, error } = await supabase.from("Warranty").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { error } = await supabase.from("Warranty").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}