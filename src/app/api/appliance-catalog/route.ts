import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const brand = searchParams.get("brand");
  let query = supabase.from("ApplianceCatalog").select("*").order("brand", { ascending: true }).order("model", { ascending: true });
  if (type) query = query.eq("type", type);
  if (brand) query = query.eq("brand", brand);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type, brand, model } = body ?? {};
  if (!type || !brand) {
    return NextResponse.json({ error: "Tipo e marca são obrigatórios." }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("ApplianceCatalog")
    .insert({ type, brand, model: model || null })
    .select()
    .single();
  if (error) {
    // ignore duplicate (unique constraint) - return existing
    const { data: existing } = await supabase
      .from("ApplianceCatalog")
      .select("*")
      .eq("type", type)
      .eq("brand", brand)
      .eq("model", model || null)
      .maybeSingle();
    if (existing) return NextResponse.json(existing, { status: 200 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
