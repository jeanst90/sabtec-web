import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { customerId } = body ?? {};
  if (!customerId) return NextResponse.json({ error: "customerId obrigatório." }, { status: 400 });
  const { error } = await supabase.from("Customer").update({
    name: "Cliente anonimizado", phone: "0000000000", email: null, cpfCnpj: null, address: null, city: null,
  }).eq("id", customerId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}