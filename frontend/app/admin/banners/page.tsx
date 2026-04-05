"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { deleteAdminBanner, fetchAdminBanners } from "@/lib/api";
import type { BannerAdmin } from "@/lib/types";

export default function AdminBannersPage() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<BannerAdmin[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token || user?.role !== "ADMIN") return;
    setLoading(true);
    try {
      setRows(await fetchAdminBanners(token));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: number) {
    if (!token || !confirm("¿Eliminar este banner?")) return;
    try {
      await deleteAdminBanner(token, id);
      load();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : "Error");
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Banners</h1>
          <p className="mt-1 text-sm text-slate-500">
            Carrusel del home: orden, vigencia y enlaces
          </p>
        </div>
        <Link
          href="/admin/banners/nuevo"
          className="inline-flex rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          + Nuevo banner
        </Link>
      </div>

      {err && (
        <p className="mt-6 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{err}</p>
      )}

      <div className="mt-8 space-y-4">
        {loading && <p className="text-slate-500">Cargando…</p>}
        {!loading &&
          rows.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:flex-row sm:items-center"
            >
              <div className="h-24 w-40 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-200">{b.title ?? "Sin título"}</p>
                <p className="truncate text-xs text-slate-500">Orden {b.sortOrder}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {b.active ? (
                    <span className="text-emerald-400">Activo</span>
                  ) : (
                    <span className="text-slate-500">Inactivo</span>
                  )}
                  {b.startsAt && (
                    <span className="ml-2">
                      Desde {new Date(b.startsAt).toLocaleString("es-CL")}
                    </span>
                  )}
                  {b.endsAt && (
                    <span className="ml-2">Hasta {new Date(b.endsAt).toLocaleString("es-CL")}</span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <Link href={`/admin/banners/${b.id}`} className="text-emerald-400 hover:underline">
                  Editar
                </Link>
                <button type="button" className="text-red-400/90 hover:underline" onClick={() => remove(b.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        {!loading && rows.length === 0 && (
          <p className="text-slate-500">No hay banners. Creá uno para el home.</p>
        )}
      </div>
    </div>
  );
}
