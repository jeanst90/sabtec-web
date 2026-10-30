import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { type, score, message, page } = body ?? {};
  if (!message) return NextResponse.json({ error: "Mensagem obrigatória." }, { status: 400 });
  const { data, error } = await supabase.from("Feedback").insert({
    type: type || "SUGESTAO", score: typeof score === "number" ? score : null, message,
    page: page || null, userAgent: request.headers.get("user-agent") || null,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function GET() {
  const { data, error } = await supabase.from("Feedback").select("*").order("createdAt", { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}