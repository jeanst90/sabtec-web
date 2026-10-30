import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createSession } from "@/lib/auth";
import crypto from "crypto";

function hash(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || !password) {
    return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
  }
  const { data: user } = await supabase.from("User").select("*").eq("email", email).maybeSingle();
  if (!user) {
    // seed if it's the known user
    if (email === "jeanst90@live.com" && password === "Timao1910@") {
      const { data: created } = await supabase
        .from("User")
        .insert({ name: "Jean", email: "jeanst90@live.com", role: "ADMIN" } as any)
        .select()
        .single();
      if (created) {
        await createSession({ id: created.id, email: created.email, name: created.name, role: created.role });
        return NextResponse.json({ ok: true });
      }
    }
    return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
  }
  // if no passwordHash stored, allow the known credentials
  if ((user as any).passwordHash) {
    if ((user as any).passwordHash !== hash(password)) {
      return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
    }
  } else {
    if (!(email === "jeanst90@live.com" && password === "Timao1910@")) {
      return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
    }
  }
  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  return NextResponse.json({ ok: true });
}
