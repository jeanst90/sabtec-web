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
    const { data: quote, error } = await supabase
      .from("Quote")
      .select("*, customer:Customer(*), appliance:Appliance(*), technician:User(*), items:QuoteItem(*)")
      .eq("id", id)
      .single();
    if (error || !quote) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jeanst90.tech";
    let qrDataUrl: string | undefined;
    if (quote.publicToken) {
      try {
        qrDataUrl = await QRCode.toDataURL(`${baseUrl}/p/q/${quote.publicToken}`);
      } catch {}
    }

    try {
      await loadPdfFonts();
    } catch (fontErr: any) {
      console.error("Font load error:", fontErr?.message);
    }

    const data = {
      number: quote.number || "",
      createdAt: quote.createdAt ? new Date(quote.createdAt).toLocaleDateString("pt-BR") : "",
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

    const ReactPDF: any = await import("@react-pdf/renderer");
    const { QuotePdf }: any = await import("@/lib/pdf/quote");
    
    const pdfFn = ReactPDF.pdf || ReactPDF.default?.pdf;
    if (!pdfFn) {
      throw new Error("pdf function not found");
    }
    
    const instance = React.createElement(QuotePdf, { data });
    const doc = pdfFn(instance);
    
    let buffer: Buffer;
    if (typeof doc.toBuffer === "function") {
      const result = await doc.toBuffer();
      buffer = Buffer.isBuffer(result) ? result : Buffer.from(result);
    } else if (typeof ReactPDF.renderToBuffer === "function") {
      const result = await ReactPDF.renderToBuffer(instance);
      buffer = Buffer.isBuffer(result) ? result : Buffer.from(result);
    } else if (typeof ReactPDF.renderToStream === "function") {
      const stream = await ReactPDF.renderToStream(instance);
      const chunks: any[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      buffer = Buffer.concat(chunks);
    } else {
      throw new Error("No PDF generation method found");
    }
    
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${quote.number || "orcamento"}.pdf"`,
      },
    });
  } catch (e: any) {
    console.error("Quote PDF error:", e?.message || e);
    return NextResponse.json({ error: "Erro ao gerar PDF do orçamento.", detail: e?.message }, { status: 500 });
  }
}
