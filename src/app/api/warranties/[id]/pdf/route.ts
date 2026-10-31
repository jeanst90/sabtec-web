import React from "react";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { COMPANY } from "@/lib/company";
import { WarrantyPdf } from "@/lib/pdf/warranty";
import { loadPdfFonts } from "@/lib/pdf/theme";
import QRCode from "qrcode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    const portalUrl = warranty.publicToken ? `${baseUrl}/p/w/${warranty.publicToken}` : baseUrl;
    let qrDataUrl: string | undefined;
    if (warranty.publicToken) {
      try {
        qrDataUrl = await QRCode.toDataURL(portalUrl);
      } catch {
        qrDataUrl = undefined;
      }
    }

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

    try {
      await loadPdfFonts();
    } catch (e) {
      console.error("PDF font load error:", e);
    }

    const element = React.createElement(WarrantyPdf, { data }) as any;
    const instance = React.createElement(require("@react-pdf/renderer").Document, null, element);
    // @ts-ignore
    const { pdf } = require("@react-pdf/renderer");
    const doc = pdf(instance);
    const buffer = await doc.toBuffer();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${warranty.number || "garantia"}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("Warranty PDF error:", e?.message || e);
    return NextResponse.json({ error: "Erro ao gerar PDF da garantia." }, { status: 500 });
  }
}