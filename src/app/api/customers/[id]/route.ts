import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { data: customer, error } = await supabase.from("Customer").select("*").eq("id", id).single();
  if (error || !customer) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  const { data: appliances } = await supabase.from("Appliance").select("*").eq("customerId", id);
  const { data: quotes } = await supabase.from("Quote").select("*").eq("customerId", id).order("createdAt", { ascending: false });
  return NextResponse.json({ ...customer, appliances: appliances || [], quotes: quotes || [] });
}

export async function PUT(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await request.json();
  const { data, error } = await supabase.from("Customer").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { error } = await supabase.from("Customer").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}