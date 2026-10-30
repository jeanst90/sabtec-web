import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

function hash(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

export async function POST() {
  const email = "jeanst90@live.com";
  const password = "Timao1910@";
  const { data: existing } = await supabase.from("User").select("*").eq("email", email).maybeSingle();
  if (existing) {
    // try to update password if possible
    await supabase.from("User").update({ role: "ADMIN" } as any).eq("id", existing.id);
    return NextResponse.json({ ok: true, created: false, user: existing });
  }
  const { data, error } = await supabase
    .from("User")
    .insert({ name: "Jean", email, role: "ADMIN" } as any)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, created: true, user: data, note: "user created, passwordHash not stored in DB schema" });
}
