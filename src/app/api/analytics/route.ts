import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: quotes } = await supabase.from("Quote").select("*, items:QuoteItem(*), technician:User(name), appliance:Appliance(type, brand)");
  const { data: warranties } = await supabase.from("Warranty").select("*, appliance:Appliance(type, brand)");
  const Q = quotes || [];
  const W = warranties || [];

  const now = new Date();
  const revenueByMonth: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    revenueByMonth[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`] = 0;
  }
  Q.forEach((q: { status: string; createdAt: string; total: number }) => {
    if (q.status === "APROVADO" || q.status === "CONVERTIDO") {
      const d = new Date(q.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (revenueByMonth[key] !== undefined) revenueByMonth[key] += q.total || 0;
    }
  });

  const partMap: Record<string, { count: number; total: number }> = {};
  Q.forEach((q: { items?: { description: string; quantity: number; total: number }[] }) => {
    (q.items || []).forEach((it) => {
      if (!partMap[it.description]) partMap[it.description] = { count: 0, total: 0 };
      partMap[it.description].count += it.quantity;
      partMap[it.description].total += it.total;
    });
  });
  const topParts = Object.entries(partMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total).slice(0, 8);

  const techMap: Record<string, { total: number; approved: number }> = {};
  Q.forEach((q: { technician?: { name: string } | null; status: string }) => {
    const name = q.technician?.name || "Sem técnico";
    if (!techMap[name]) techMap[name] = { total: 0, approved: 0 };
    techMap[name].total += 1;
    if (q.status === "APROVADO" || q.status === "CONVERTIDO") techMap[name].approved += 1;
  });
  const conversionByTech = Object.entries(techMap).map(([name, v]) => ({ name, total: v.total, approved: v.approved, rate: v.total > 0 ? v.approved / v.total : 0 }));

  const typeMap: Record<string, number> = {};
  Q.forEach((q: { appliance?: { type: string } | null }) => {
    const t = q.appliance?.type || "OUTRO";
    typeMap[t] = (typeMap[t] || 0) + 1;
  });
  const applianceTypes = Object.entries(typeMap).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);

  const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const expiring = W.filter((w: { status: string; endDate: string }) => w.status === "ATIVA" && new Date(w.endDate) <= soon).length;

  const last3 = Object.values(revenueByMonth).slice(-3);
  const avg = last3.reduce((a, b) => a + b, 0) / (last3.length || 1);

  const totalRevenue = Q.filter((q: { status: string }) => q.status === "APROVADO" || q.status === "CONVERTIDO").reduce((s: number, q: { total: number }) => s + (q.total || 0), 0);
  const totalQuotes = Q.length;
  const approvedQuotes = Q.filter((q: { status: string }) => q.status === "APROVADO" || q.status === "CONVERTIDO").length;

  return NextResponse.json({
    revenueByMonth: Object.entries(revenueByMonth).map(([month, value]) => ({ month, value })),
    topParts, conversionByTech, applianceTypes, expiringWarranties: expiring, forecast: avg,
    totalRevenue, totalQuotes, approvedQuotes, conversionRate: totalQuotes > 0 ? approvedQuotes / totalQuotes : 0,
  });
}