import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  let query = supabase.from("Quote").select("*, customer:Customer(name, phone), appliance:Appliance(type, brand)").order("createdAt", { ascending: false });
  if (from) query = query.gte("createdAt", from);
  if (to) query = query.lte("createdAt", to);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const header = ["Número", "Cliente", "Telefone", "Aparelho", "Marca", "Total", "Status", "Data"].join(";");
  const rows = (data || []).map((q: { number: string; customer: { name: string; phone: string }; appliance: { type: string; brand: string }; total: number; status: string; createdAt: string }) =>
    [q.number, q.customer?.name, q.customer?.phone, q.appliance?.type, q.appliance?.brand, q.total.toFixed(2).replace(".", ","), q.status, new Date(q.createdAt).toLocaleDateString("pt-BR")].join(";")
  );
  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="relatorio-orcamentos.csv"` } });
}