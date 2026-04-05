"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { fetchAdminBanner, updateAdminBanner, type BannerBody } from "@/lib/api";

function localFromIso(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditBannerPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const { token, user } = useAuth();
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN" || !Number.isFinite(id)) return;
    fetchAdminBanner(token, id)
      .then((b) => {
        setTitle(b.title ?? "");
        setImageUrl(b.imageUrl);
        setLinkUrl(b.linkUrl ?? "");
        setSortOrder(String(b.sortOrder));
        setActive(b.active);
        setStartsAt(localFromIso(b.startsAt));
        setEndsAt(localFromIso(b.endsAt));
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [token, user?.role, id]);

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
      await updateAdminBanner(token, id, body);
      router.push("/admin/banners");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Cargando…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-100">Editar banner</h1>
      {err && (
        <p className="mt-4 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{err}</p>
      )}
      <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-lg space-y-4">
        <label className="block">
          <span className="text-xs text-slate-500">Título</span>
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
          <span className="text-xs text-slate-500">Enlace</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Orden</span>
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
            <span className="text-xs text-slate-500">Desde</span>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Hasta</span>
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
            {saving ? "Guardando…" : "Guardar"}
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
