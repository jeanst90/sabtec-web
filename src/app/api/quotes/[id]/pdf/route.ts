import React from "react";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { COMPANY } from "@/lib/company";
import { QuotePdf } from "@/lib/pdf/quote";
import { loadPdfFonts } from "@/lib/pdf/theme";
import QRCode from "qrcode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { data: quote, error } = await supabase
      .from("Quote")
      .select("*, customer:Customer(*), appliance:Appliance(*), technician:User(*), items:QuoteItem(*)")
      .eq("id", id)
      .single();
    if (error || !quote) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jeanst90.tech";
    const portalUrl = quote.publicToken ? `${baseUrl}/p/q/${quote.publicToken}` : baseUrl;
    let qrDataUrl: string | undefined;
    if (quote.publicToken) {
      try {
        qrDataUrl = await QRCode.toDataURL(portalUrl);
      } catch {
        qrDataUrl = undefined;
      }
    }

    const data = {
      number: quote.number || "",
      createdAt: quote.createdAt ? new Date(quote.createdAt).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR"),
      status: quote.status || "",
      validUntil: quote.validUntil ? new Date(quote.validUntil).toLocaleDateString("pt-BR") : "",
      customer: {
        name: quote.customer?.name || "",
        phone: quote.customer?.phone || "",
        email: quote.customer?.email || "",
        cpfCnpj: quote.customer?.cpfCnpj || "",
        address: quote.customer?.address || "",
        city: quote.customer?.city || "",
      },
      appliance: {
        type: quote.appliance?.type || "",
        brand: quote.appliance?.brand || "",
        model: quote.appliance?.model || "",
        serialNumber: quote.appliance?.serialNumber || "",
        voltage: quote.appliance?.voltage || "",
      },
      diagnosis: quote.diagnosis || "",
      items: (quote.items || []).map((it: any) => ({
        description: it.description || "",
        quantity: Number(it.quantity) || 0,
        unitPrice: Number(it.unitPrice) || 0,
        total: Number(it.total) || 0,
      })),
      laborCost: Number(quote.laborCost) || 0,
      partsCost: Number(quote.partsCost) || 0,
      discount: Number(quote.discount) || 0,
      total: Number(quote.total) || 0,
      technicianName: quote.technician?.name || "",
      qrDataUrl,
      company: COMPANY,
    };

    try {
      await loadPdfFonts();
    } catch (e) {
      console.error("PDF font load error:", e);
    }

    const element = React.createElement(QuotePdf, { data }) as any;
    const mod: any = await (0, eval)("import('@react-pdf/renderer')");
    const R = mod.default || mod;
    const instance = React.createElement(R.Document, null, element);
    let buffer: Buffer;
    if (typeof R.renderToBuffer === "function") {
      buffer = await R.renderToBuffer(instance);
    } else if (typeof R.pdf === "function") {
      const doc = R.pdf(instance);
      buffer = doc.toBuffer ? await doc.toBuffer() : await doc;
    } else {
      throw new Error("PDF renderer not available");
    }
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${quote.number || "orcamento"}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("Quote PDF error:", e?.message || e);
    return NextResponse.json({ error: "Erro ao gerar PDF do orçamento." }, { status: 500 });
  }
}