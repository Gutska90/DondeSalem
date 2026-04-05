"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { resetPassword } from "@/lib/api";

function RestablecerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const a = String(fd.get("newPassword"));
    const b = String(fd.get("confirmPassword"));
    if (a !== b) {
      setErr("Las contraseñas no coinciden");
      return;
    }
    if (!token) {
      setErr("Falta el token del enlace");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      await resetPassword(token, a);
      router.push("/auth/login?restablecido=1");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/90">
        <p>Enlace inválido: abrí el link completo que te enviamos por correo.</p>
        <p className="mt-3">
          <Link href="/auth/recuperar" className="ds-link">
            Solicitar nuevo enlace
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {err && <p className="text-red-400">{err}</p>}
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-500">Nueva contraseña</span>
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-500">Repetir contraseña</span>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="ds-btn-primary w-full justify-center py-3 text-sm disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}

export default function RestablecerPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-white">Nueva contraseña</h1>
      <p className="mt-2 text-sm text-zinc-500">Elegí una contraseña de al menos 8 caracteres.</p>
      <Suspense fallback={<p className="mt-8 text-zinc-500">Cargando…</p>}>
        <RestablecerForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/auth/login" className="ds-link">
          Ir al login
        </Link>
      </p>
    </div>
  );
}
