import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  let query = supabase.from("Appliance").select("*, customer:Customer(id, name)").order("createdAt", { ascending: false });
  if (customerId) query = query.eq("customerId", customerId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { customerId, type, brand, model, serialNumber, voltage, notes } = body ?? {};
  if (!customerId || !type || !brand) {
    return NextResponse.json({ error: "Cliente, tipo e marca são obrigatórios." }, { status: 400 });
  }
  const { data, error } = await supabase.from("Appliance").insert({
    customerId, type, brand, model, serialNumber, voltage, notes,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}