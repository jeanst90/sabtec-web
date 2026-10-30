"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Field } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("jeanst90@live.com");
  const [password, setPassword] = useState("Timao1910@");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data?.error || "Não foi possível entrar.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/auth/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/95 shadow-[0_20px_60px_rgba(249,86,16,0.4)]">
              <img src="/brand/logo-sabtec.png" alt="Sabtec" className="h-9 w-auto" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">SABTEC</h1>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Assistência Técnica</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-white/70">Sistema de Orçamentos e Garantias</p>
        </div>

        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/95 shadow-[0_40px_120px_rgba(0,0,0,0.6)] backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-orange-400 to-accent" />
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">Acesso ao Sistema</h2>
                  <p className="text-sm text-muted-foreground">Entre com suas credenciais</p>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <Field>
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      placeholder="seu@email.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </Field>
                <Field>
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-primary"
                      aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>

                {error && (
                  <p className="rounded-lg bg-destructive-soft px-3 py-2 text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}

                <Button type="submit" variant="accent" className="h-11 w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar no sistema"}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Sabtec. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
