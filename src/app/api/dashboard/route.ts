import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const in7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [{ count: customers }, { count: quotes }, { count: warranties }] = await Promise.all([
    supabase.from("Customer").select("*", { count: "exact", head: true }),
    supabase.from("Quote").select("*", { count: "exact", head: true }),
    supabase.from("Warranty").select("*", { count: "exact", head: true }),
  ]);

  const { data: quotesMonth } = await supabase.from("Quote").select("id, status").gte("createdAt", startOfMonth.toISOString());
  const quotesThisMonth = quotesMonth?.length || 0;
  const approvedThisMonth = quotesMonth?.filter((q: { status: string }) => q.status === "APROVADO" || q.status === "CONVERTIDO").length || 0;

  const { data: approvedQuotes } = await supabase.from("Quote").select("total").gte("createdAt", startOfMonth.toISOString()).in("status", ["APROVADO", "CONVERTIDO"]);
  const revenueThisMonth = (approvedQuotes || []).reduce((s: number, q: { total: number }) => s + (q.total || 0), 0);

  const { data: pendingQuotes } = await supabase.from("Quote").select("id, number, status, customer:Customer(name)").in("status", ["RASCUNHO", "ENVIADO"]).order("createdAt", { ascending: false }).limit(5);
  const { data: expiringWarranties } = await supabase.from("Warranty").select("id, number, endDate, customer:Customer(name), appliance:Appliance(brand, type)").eq("status", "ATIVA").lte("endDate", in7days.toISOString()).order("endDate", { ascending: true }).limit(5);

  return NextResponse.json({
    customers: customers || 0, quotes: quotes || 0, warranties: warranties || 0,
    quotesThisMonth, approvedThisMonth, revenueThisMonth,
    conversionRate: quotesThisMonth > 0 ? approvedThisMonth / quotesThisMonth : 0,
    pendingQuotes: pendingQuotes || [], expiringWarranties: expiringWarranties || [],
  });
}