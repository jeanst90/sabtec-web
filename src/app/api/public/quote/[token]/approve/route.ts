import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Ctx = { params: Promise<{ token: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const action = body?.action === "REPROVAR" ? "REPROVADO" : "APROVADO";
  const { data: quote } = await supabase.from("Quote").select("id").eq("publicToken", token).single();
  if (!quote) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  const { data, error } = await supabase.from("Quote").update({ status: action, approvedAt: action === "APROVADO" ? new Date().toISOString() : null }).eq("id", quote.id).select("status").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ status: data.status });
}