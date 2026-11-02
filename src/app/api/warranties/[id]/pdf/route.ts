import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { COMPANY } from "@/lib/company";
import { loadPdfFonts } from "@/lib/pdf/theme";
import QRCode from "qrcode";
import React from "react";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ensurePdfkitFonts() {
  try {
    const srcDir = path.join(process.cwd(), "scripts", "pdfkit-standard-fonts");
    const dstDir = path.join(process.cwd(), "node_modules", "pdfkit", "js", "standard-fonts");
    if (!fs.existsSync(srcDir) || !fs.existsSync(dstDir)) return;
    const copyDir = (s, d) => {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
      for (const f of fs.readdirSync(s)) {
        const sp = path.join(s, f);
        const dp = path.join(d, f);
        if (fs.statSync(sp).isDirectory()) copyDir(sp, dp);
        else if (!fs.existsSync(dp)) fs.copyFileSync(sp, dp);
      }
    };
    copyDir(srcDir, dstDir);
  } catch (e) {
    console.error("ensurePdfkitFonts error:", (e as any)?.message);
  }
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    ensurePdfkitFonts();
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

    try {
      await loadPdfFonts();
    } catch (fontErr: any) {
      console.error("Font load error:", fontErr?.message);
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

    const ReactPDF: any = await import("@react-pdf/renderer");
    const { WarrantyPdf }: any = await import("@/lib/pdf/warranty");
    
    const pdfFn = ReactPDF.pdf || ReactPDF.default?.pdf;
    if (!pdfFn) {
      throw new Error("pdf function not found");
    }
    
    const instance = React.createElement(WarrantyPdf, { data });
    const doc = pdfFn(instance);
    
    const stream = await doc.toBuffer();
    const chunks: any[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${warranty.number || "garantia"}.pdf"`,
      },
    });
  } catch (e: any) {
    console.error("Warranty PDF error:", e?.message || e);
    return NextResponse.json({ error: "Erro ao gerar PDF da garantia.", detail: e?.message }, { status: 500 });
  }
}
