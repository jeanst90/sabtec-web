import React from "react";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { supabase } from "@/lib/supabase";
import { COMPANY } from "@/lib/company";
import { WarrantyPdf } from "@/lib/pdf/warranty";
import { loadPdfFonts } from "@/lib/pdf/theme";
import QRCode from "qrcode";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { data: warranty, error } = await supabase.from("Warranty").select("*, customer:Customer(*), appliance:Appliance(*), technician:User(*)").eq("id", id).single();
  if (error || !warranty) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  let services: string[] = [];
  let parts: string[] = [];
  try { services = JSON.parse(warranty.services); } catch {}
  try { parts = JSON.parse(warranty.parts); } catch {}

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const portalUrl = `${baseUrl}/p/w/${warranty.publicToken}`;
  const qrDataUrl = warranty.publicToken ? await QRCode.toDataURL(portalUrl) : undefined;

  const data = {
    number: warranty.number, createdAt: new Date(warranty.createdAt).toLocaleDateString("pt-BR"),
    status: warranty.status,
    customer: { name: warranty.customer.name, phone: warranty.customer.phone, email: warranty.customer.email, cpfCnpj: warranty.customer.cpfCnpj },
    appliance: { type: warranty.appliance.type, brand: warranty.appliance.brand, model: warranty.appliance.model, serialNumber: warranty.appliance.serialNumber },
    services, parts,
    startDate: new Date(warranty.startDate).toLocaleDateString("pt-BR"),
    endDate: new Date(warranty.endDate).toLocaleDateString("pt-BR"),
    durationDays: warranty.durationDays, terms: warranty.terms, exclusions: warranty.exclusions,
    technicianName: warranty.technician?.name, signatureUrl: warranty.signatureUrl || undefined, customerSignatureUrl: warranty.customerSignatureUrl || undefined, qrDataUrl, company: COMPANY,
  };

  await loadPdfFonts();
  const buffer = await renderToBuffer(React.createElement(WarrantyPdf, { data }) as any);
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${warranty.number}.pdf"` },
  });
}