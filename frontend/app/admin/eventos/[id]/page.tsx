"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { fetchAdminEvent, updateAdminEvent, type EventBody } from "@/lib/api";

function toLocalDatetimeValue(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditEventPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const { token, user } = useAuth();
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN" || !Number.isFinite(id)) return;
    fetchAdminEvent(token, id)
      .then((ev) => {
        setTitle(ev.title);
        setDescription(ev.description ?? "");
        setImageUrl(ev.imageUrl ?? "");
        setStartsAt(toLocalDatetimeValue(ev.startsAt));
        setEndsAt(toLocalDatetimeValue(ev.endsAt));
        setCapacity(ev.capacity != null ? String(ev.capacity) : "");
        setEntryFee(ev.entryFee != null ? String(ev.entryFee) : "");
        setExternalUrl(ev.externalUrl ?? "");
        setFeaturedOnHome(ev.featuredOnHome);
        setActive(ev.active);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [token, user?.role, id]);

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
      capacity: capacity ? parseInt(capacity, 10) : null,
      entryFee: entryFee ? parseFloat(entryFee.replace(",", ".")) : null,
      externalUrl: externalUrl.trim() || null,
      featuredOnHome,
      active,
    };
    setSaving(true);
    try {
      await updateAdminEvent(token, id, body);
      router.push("/admin/eventos");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Cargando…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-100">Editar evento</h1>
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
            type="url"
            placeholder="https://…"
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
            <span className="text-xs text-slate-500">Cupo</span>
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
          <span className="text-xs text-slate-500">URL externa</span>
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
            {saving ? "Guardando…" : "Guardar"}
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
