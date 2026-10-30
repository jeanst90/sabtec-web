import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: appliances } = await supabase.from("Appliance").select("*, customer:Customer(name, phone), warranties:Warranty(endDate)").order("createdAt", { ascending: false });
  const now = new Date();
  const suggestions = (appliances || []).map((a: { id: string; customer: { name: string; phone: string }; type: string; brand: string; model?: string; createdAt: string; warranties?: { endDate: string }[] }) => {
    const last = a.warranties?.[0];
    const lastDate = last ? new Date(last.endDate) : new Date(a.createdAt ?? now);
    const monthsSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const interval = a.type === "AR_CONDICIONADO" ? 6 : 12;
    const due = monthsSince >= interval;
    const recommended = a.type === "AR_CONDICIONADO" ? "Limpeza de filtros e revisão do sistema" : a.type === "GELADEIRA" || a.type === "REFRIGERADOR" ? "Revisão preventiva e verificação de gás" : "Revisão geral e lubrificação";
    return { applianceId: a.id, customer: a.customer.name, phone: a.customer.phone, type: a.type, brand: a.brand, model: a.model, lastService: lastDate, monthsSince: Math.round(monthsSince), interval, due, recommended };
  });
  return NextResponse.json(suggestions.filter((s: { due: boolean }) => s.due));
}