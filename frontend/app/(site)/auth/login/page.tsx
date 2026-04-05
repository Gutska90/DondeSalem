"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { login } from "@/lib/api";

function LoginForm() {
  const { setSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ok = searchParams.get("restablecido") === "1";
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setErr(null);
    try {
      const res = await login({
        email: String(fd.get("email")),
        password: String(fd.get("password")),
      });
      setSession(res.accessToken, res.user);
      router.push("/cuenta");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-white">Iniciar sesión</h1>
      {ok && (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100/95">
          Contraseña actualizada. Iniciá sesión con la nueva.
        </p>
      )}
      {err && <p className="mt-4 text-red-400">{err}</p>}
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Email</span>
          <input
            name="email"
            type="email"
            required
            className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Contraseña</span>
          <input
            name="password"
            type="password"
            required
            className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="ds-btn-primary w-full justify-center py-3 text-sm"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link href="/auth/recuperar" className="ds-link">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
      <p className="mt-6 text-center text-sm text-zinc-500">
        ¿No tienes cuenta?{" "}
        <Link href="/auth/registro" className="ds-link">
          Regístrate
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-md px-4 py-16 text-zinc-500">Cargando…</p>}>
      <LoginForm />
    </Suspense>
  );
}
