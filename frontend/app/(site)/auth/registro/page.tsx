"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { register } from "@/lib/api";

export default function RegistroPage() {
  const { setSession } = useAuth();
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setErr(null);
    try {
      const res = await register({
        email: String(fd.get("email")),
        password: String(fd.get("password")),
        firstName: String(fd.get("firstName")),
        lastName: String(fd.get("lastName")),
        phone: String(fd.get("phone") || ""),
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
      <h1 className="font-display text-3xl font-bold text-white">Crear cuenta</h1>
      {err && <p className="mt-4 text-red-400">{err}</p>}
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-500">Nombre</span>
            <input name="firstName" required className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-500">Apellido</span>
            <input name="lastName" required className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100" />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Email</span>
          <input name="email" type="email" required className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Teléfono (opcional)</span>
          <input name="phone" className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Contraseña (mín. 8)</span>
          <input name="password" type="password" required minLength={8} className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100" />
        </label>
        <button type="submit" disabled={loading} className="ds-btn-primary w-full justify-center py-3 text-sm disabled:opacity-50">
          {loading ? "Creando…" : "Registrarme"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="ds-link">
          Entrar
        </Link>
      </p>
    </div>
  );
}
