"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createAdminBanner, type BannerBody } from "@/lib/api";

export default function NewBannerPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  if (!token || user?.role !== "ADMIN") return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setErr(null);
    const body: BannerBody = {
      title: title.trim() || null,
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl.trim() || null,
      sortOrder: parseInt(sortOrder, 10) || 0,
      active,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
    };
    setSaving(true);
    try {
      await createAdminBanner(token, body);
      router.push("/admin/banners");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-100">Nuevo banner</h1>
      {err && (
        <p className="mt-4 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{err}</p>
      )}
      <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-lg space-y-4">
        <label className="block">
          <span className="text-xs text-slate-500">Título (opcional)</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">URL de imagen *</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Enlace al hacer clic</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Orden (menor = primero)</span>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Activo
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-slate-500">Visible desde (opcional)</span>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Visible hasta (opcional)</span>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Crear"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm text-slate-300"
            onClick={() => router.push("/admin/banners")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
