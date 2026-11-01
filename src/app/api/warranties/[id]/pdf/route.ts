import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { COMPANY } from "@/lib/company";
import { loadPdfFonts } from "@/lib/pdf/theme";
import QRCode from "qrcode";
import React from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { data: warranty, error } = await supabase
      .from("Warranty")
      .select("*, customer:Customer(*), appliance:Appliance(*), technician:User(*)")
      .eq("id", id)
      .single();
    if (error || !warranty) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

    let services: string[] = [];
    let parts: string[] = [];
    try {
      if (warranty.services) services = typeof warranty.services === "string" ? JSON.parse(warranty.services) : warranty.services;
    } catch {}
    try {
      if (warranty.parts) parts = typeof warranty.parts === "string" ? JSON.parse(warranty.parts) : warranty.parts;
    } catch {}

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jeanst90.tech";
    let qrDataUrl: string | undefined;
    if (warranty.publicToken) {
      try {
        qrDataUrl = await QRCode.toDataURL(`${baseUrl}/p/w/${warranty.publicToken}`);
      } catch {}
    }

    await loadPdfFonts().catch(() => {});

    const r: any = await import("@react-pdf/renderer");
    const pdf = r.pdf || r.default?.pdf;
    const { WarrantyPdf }: any = await import("@/lib/pdf/warranty");

    const data = {
      number: warranty.number || "",
      createdAt: warranty.createdAt ? new Date(warranty.createdAt).toLocaleDateString("pt-BR") : "",
      status: warranty.status || "",
      customer: {
        name: warranty.customer?.name || "",
        phone: warranty.customer?.phone || "",
        email: warranty.customer?.email || "",
        cpfCnpj: warranty.customer?.cpfCnpj || "",
      },
      appliance: {
        type: warranty.appliance?.type || "",
        brand: warranty.appliance?.brand || "",
        model: warranty.appliance?.model || "",
        serialNumber: warranty.appliance?.serialNumber || "",
      },
      services,
      parts,
      startDate: warranty.startDate ? new Date(warranty.startDate).toLocaleDateString("pt-BR") : "",
      endDate: warranty.endDate ? new Date(warranty.endDate).toLocaleDateString("pt-BR") : "",
      durationDays: warranty.durationDays,
      terms: warranty.terms || "",
      exclusions: warranty.exclusions || "",
      technicianName: warranty.technician?.name || "",
      signatureUrl: warranty.signatureUrl || undefined,
      customerSignatureUrl: warranty.customerSignatureUrl || undefined,
      qrDataUrl,
      company: COMPANY,
    };

    const instance = React.createElement(WarrantyPdf, { data });
    const doc = pdf(instance);
    const buffer = await doc.toBuffer();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${warranty.number || "garantia"}.pdf"`,
      },
    });
  } catch (e: any) {
    console.error("Warranty PDF error:", e?.message);
    return NextResponse.json({ error: "Erro ao gerar PDF da garantia." }, { status: 500 });
  }
}
