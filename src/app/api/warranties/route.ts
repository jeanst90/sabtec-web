import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { nextWarrantyNumber } from "@/lib/numbers";
import { nanoid } from "nanoid";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();
  let query = supabase.from("Warranty").select("*, customer:Customer(id, name, phone), appliance:Appliance(id, type, brand, model), quote:Quote(id, number)").order("createdAt", { ascending: false });
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`number.ilike.%${q}%,customer.name.ilike.%${q}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { quoteId, customerId, applianceId, technicianId, services = [], parts = [], durationDays = 90, terms, exclusions, signatureUrl, customerSignatureUrl } = body ?? {};
  if (!customerId || !applianceId) {
    return NextResponse.json({ error: "Cliente e aparelho são obrigatórios." }, { status: 400 });
  }
  const number = await nextWarrantyNumber();
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + (durationDays || 90));
  const defaultTerms = terms || "A Sabtec garante os serviços realizados e as peças substituídas pelo período indicado, contra defeitos de fabricação e mão de obra, mediante apresentação deste termo.";
  const defaultExclusions = exclusions || "Não cobre: mau uso, quedas, instalação inadequada, variação de tensão elétrica, intervenção de terceiros, desgaste natural, acessórios e consumíveis.";

  const { data: warranty, error } = await supabase.from("Warranty").insert({
    number, publicToken: nanoid(16), quoteId: quoteId || null, customerId, applianceId,
    technicianId: technicianId || null, services: JSON.stringify(services), parts: JSON.stringify(parts),
    startDate: startDate.toISOString(), endDate: endDate.toISOString(), durationDays: durationDays || 90,
    terms: defaultTerms, exclusions: defaultExclusions, signatureUrl: signatureUrl || null, customerSignatureUrl: customerSignatureUrl || null, status: "ATIVA",
  }).select("*, customer:Customer(*), appliance:Appliance(*), quote:Quote(*)").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (quoteId) {
    await supabase.from("Quote").update({ status: "CONVERTIDO" }).eq("id", quoteId);
  }
  return NextResponse.json(warranty, { status: 201 });
}