import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  const { data, error } = await supabase.from("Quote").select("*, customer:Customer(name), appliance:Appliance(type, brand, model), items:QuoteItem(*)").eq("publicToken", token).single();
  if (error || !data) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json(data);
}