import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "RESEND_API_KEY não configurada." }, { status: 500 });

  const { data: warranty } = await supabase.from("Warranty").select("*, customer:Customer(name, email)").eq("id", id).single();
  if (!warranty) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  if (!warranty.customer?.email) return NextResponse.json({ error: "Cliente sem e-mail." }, { status: 400 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const pdfRes = await fetch(`${baseUrl}/api/warranties/${id}/pdf`);
  const buf = await pdfRes.arrayBuffer();
  const base64 = Buffer.from(buf).toString("base64");

  const from = process.env.RESEND_FROM || "Sabtec <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to: [warranty.customer.email], subject: `Termo de Garantia ${warranty.number} — Sabtec`,
      html: `<p>Olá ${warranty.customer.name},</p><p>Segue em anexo seu termo de garantia <strong>${warranty.number}</strong>.</p><p>Válido até ${new Date(warranty.endDate).toLocaleDateString("pt-BR")}.</p><p>Atenciosamente,<br/>Sabtec Assistência Técnica</p>`,
      attachments: [{ filename: `${warranty.number}.pdf`, content: base64 }],
    }),
  });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
  return NextResponse.json({ ok: true });
}