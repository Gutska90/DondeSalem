"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createAdminEvent, type EventBody } from "@/lib/api";

export default function NewEventPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [capacity, setCapacity] = useState("");
  const [entryFee, setEntryFee] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [featuredOnHome, setFeaturedOnHome] = useState(false);
  const [active, setActive] = useState(true);

  if (!token || user?.role !== "ADMIN") return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setErr(null);
    const s = new Date(startsAt);
    const en = new Date(endsAt);
    if (Number.isNaN(s.getTime()) || Number.isNaN(en.getTime())) {
      setErr("Revisá las fechas.");
      return;
    }
    const body: EventBody = {
      title: title.trim(),
      description: description.trim() || null,
      imageUrl: imageUrl.trim() || null,
      startsAt: s.toISOString(),
      endsAt: en.toISOString(),
      capacity: capacity.trim() !== "" ? parseInt(capacity, 10) : null,
      entryFee: entryFee.trim() !== "" ? parseFloat(entryFee.replace(",", ".")) : null,
      externalUrl: externalUrl.trim() || null,
      featuredOnHome,
      active,
    };
    setSaving(true);
    try {
      await createAdminEvent(token, body);
      router.push("/admin/eventos");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-100">Nuevo evento</h1>
      {err && (
        <p className="mt-4 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{err}</p>
      )}
      <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-xl space-y-4">
        <label className="block">
          <span className="text-xs text-slate-500">Título</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Descripción</span>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Imagen del evento (URL, opcional)</span>
          <input
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder="https://… (cartel o flyer)"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Inicio (local)</span>
          <input
            required
            type="datetime-local"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Fin (local)</span>
          <input
            required
            type="datetime-local"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-slate-500">Cupo (opcional)</span>
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Inscripción CLP</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs text-slate-500">URL externa (Meetup, etc.)</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
          />
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featuredOnHome}
              onChange={(e) => setFeaturedOnHome(e.target.checked)}
            />
            Destacar en inicio
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Activo
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Crear evento"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm text-slate-300"
            onClick={() => router.push("/admin/eventos")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
