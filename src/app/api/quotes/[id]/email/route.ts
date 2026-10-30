import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "RESEND_API_KEY não configurada." }, { status: 500 });

  const { data: quote } = await supabase.from("Quote").select("*, customer:Customer(name, email)").eq("id", id).single();
  if (!quote) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  if (!quote.customer?.email) return NextResponse.json({ error: "Cliente sem e-mail." }, { status: 400 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const pdfRes = await fetch(`${baseUrl}/api/quotes/${id}/pdf`);
  const buf = await pdfRes.arrayBuffer();
  const base64 = Buffer.from(buf).toString("base64");

  const from = process.env.RESEND_FROM || "Sabtec <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to: [quote.customer.email], subject: `Orçamento ${quote.number} — Sabtec`,
      html: `<p>Olá ${quote.customer.name},</p><p>Segue em anexo o orçamento <strong>${quote.number}</strong>.</p><p>Validade: ${new Date(quote.validUntil).toLocaleDateString("pt-BR")}.</p><p>Atenciosamente,<br/>Sabtec Assistência Técnica</p>`,
      attachments: [{ filename: `${quote.number}.pdf`, content: base64 }],
    }),
  });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
  await supabase.from("Quote").update({ status: "ENVIADO" }).eq("id", id);
  return NextResponse.json({ ok: true });
}