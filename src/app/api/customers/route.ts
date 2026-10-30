import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  let query = supabase.from("Customer").select("*, appliances:Appliance(count), quotes:Quote(count)").order("createdAt", { ascending: false });
  if (q) {
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Flatten count
  const result = (data || []).map((c: Record<string, unknown>) => ({
    ...c,
    _count: {
      appliances: Array.isArray(c.appliances) ? (c.appliances as { count: number }[])[0]?.count ?? 0 : 0,
      quotes: Array.isArray(c.quotes) ? (c.quotes as { count: number }[])[0]?.count ?? 0 : 0,
    },
  }));
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, phone, email, cpfCnpj, address, city, consent } = body ?? {};
  if (!name || !phone) {
    return NextResponse.json({ error: "Nome e telefone são obrigatórios." }, { status: 400 });
  }
  const { data, error } = await supabase.from("Customer").insert({
    name, phone, email, cpfCnpj, address, city,
    consentAt: consent ? new Date().toISOString() : null,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}