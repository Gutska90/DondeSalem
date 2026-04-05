"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

export default function ContactoPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      await apiPost("/api/contact", {
        name: String(fd.get("name")),
        email: String(fd.get("email")),
        phone: String(fd.get("phone") || ""),
        subject: String(fd.get("subject")),
        body: String(fd.get("body")),
      });
      setMsg("¡Mensaje enviado! Te responderemos pronto.");
      e.currentTarget.reset();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Contacto</h1>
      <p className="mt-2 text-zinc-500">¿Dudas sobre stock, torneos o envíos? Escríbenos.</p>
      {msg && <p className="mt-4 text-emerald-400">{msg}</p>}
      {err && <p className="mt-4 text-red-400">{err}</p>}
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Nombre</span>
          <input name="name" required className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Email</span>
          <input name="email" type="email" required className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Teléfono</span>
          <input name="phone" className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Asunto</span>
          <input name="subject" required className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Mensaje</span>
          <textarea name="body" required rows={5} className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100" />
        </label>
        <button type="submit" disabled={loading} className="ds-btn-primary w-full justify-center py-3 text-sm disabled:opacity-50">
          {loading ? "Enviando…" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
