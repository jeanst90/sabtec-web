import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ error: "customerId obrigatório." }, { status: 400 });
  const { data: customer } = await supabase.from("Customer").select("*").eq("id", customerId).single();
  if (!customer) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  const { data: appliances } = await supabase.from("Appliance").select("*").eq("customerId", customerId);
  const { data: quotes } = await supabase.from("Quote").select("*, items:QuoteItem(*)").eq("customerId", customerId);
  const { data: warranties } = await supabase.from("Warranty").select("*").eq("customerId", customerId);
  return NextResponse.json({ ...customer, appliances: appliances || [], quotes: quotes || [], warranties: warranties || [] });
}