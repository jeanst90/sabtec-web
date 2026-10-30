import React from "react";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { supabase } from "@/lib/supabase";
import { COMPANY } from "@/lib/company";
import { QuotePdf } from "@/lib/pdf/quote";
import { loadPdfFonts } from "@/lib/pdf/theme";
import QRCode from "qrcode";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { data: quote, error } = await supabase.from("Quote").select("*, customer:Customer(*), appliance:Appliance(*), technician:User(*), items:QuoteItem(*)").eq("id", id).single();
  if (error || !quote) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const portalUrl = `${baseUrl}/p/q/${quote.publicToken}`;
  const qrDataUrl = quote.publicToken ? await QRCode.toDataURL(portalUrl) : undefined;

  const data = {
    number: quote.number,
    createdAt: new Date(quote.createdAt).toLocaleDateString("pt-BR"),
    status: quote.status,
    validUntil: new Date(quote.validUntil).toLocaleDateString("pt-BR"),
    customer: {
      name: quote.customer.name, phone: quote.customer.phone, email: quote.customer.email,
      cpfCnpj: quote.customer.cpfCnpj, address: quote.customer.address, city: quote.customer.city,
    },
    appliance: {
      type: quote.appliance.type, brand: quote.appliance.brand, model: quote.appliance.model,
      serialNumber: quote.appliance.serialNumber, voltage: quote.appliance.voltage,
    },
    diagnosis: quote.diagnosis,
    items: (quote.items || []).map((it: { description: string; quantity: number; unitPrice: number; total: number }) => ({
      description: it.description, quantity: it.quantity, unitPrice: it.unitPrice, total: it.total,
    })),
    laborCost: quote.laborCost, partsCost: quote.partsCost, discount: quote.discount, total: quote.total,
    technicianName: quote.technician?.name, qrDataUrl, company: COMPANY,
  };

  await loadPdfFonts();
  const buffer = await renderToBuffer(React.createElement(QuotePdf, { data }) as any);
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${quote.number}.pdf"` },
  });
}