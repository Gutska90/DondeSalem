"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotPassword } from "@/lib/api";

export default function RecuperarPage() {
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setErr(null);
    try {
      await forgotPassword(String(fd.get("email")).trim().toLowerCase());
      setSent(true);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-white">Recuperar contraseña</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Si el correo está registrado, recibirás un enlace para elegir una nueva contraseña.
      </p>
      {sent ? (
        <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100/95">
          <p>Si existe una cuenta con ese email, te enviamos las instrucciones. Revisá también spam.</p>
          <p className="mt-3">
            <Link href="/auth/login" className="ds-link">
              Volver al login
            </Link>
          </p>
        </div>
      ) : (
        <>
          {err && <p className="mt-4 text-red-400">{err}</p>}
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-500">Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="ds-btn-primary w-full justify-center py-3 text-sm disabled:opacity-50"
            >
              {loading ? "Enviando…" : "Enviar enlace"}
            </button>
          </form>
        </>
      )}
      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/auth/login" className="ds-link">
          Volver al login
        </Link>
      </p>
    </div>
  );
}
