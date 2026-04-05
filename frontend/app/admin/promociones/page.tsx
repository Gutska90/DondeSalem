"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { deleteAdminPromotion, fetchAdminPromotions } from "@/lib/api";
import type { PromotionAdmin } from "@/lib/types";

export default function AdminPromotionsPage() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<PromotionAdmin[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token || user?.role !== "ADMIN") return;
    setLoading(true);
    try {
      setRows(await fetchAdminPromotions(token));
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
    if (!token || !confirm("¿Eliminar esta promoción?")) return;
    try {
      await deleteAdminPromotion(token, id);
      load();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : "Error");
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Promociones</h1>
          <p className="mt-1 text-sm text-slate-500">
            Reglas de descuento (porcentaje o monto) con vigencia
          </p>
        </div>
        <Link
          href="/admin/promociones/nuevo"
          className="inline-flex rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          + Nueva promoción
        </Link>
      </div>

      {err && (
        <p className="mt-6 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{err}</p>
      )}

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Vigencia</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Cargando…
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-medium text-slate-200">{p.name}</td>
                  <td className="px-4 py-3 text-slate-400">{p.promoType}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-300">{p.value}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(p.startsAt).toLocaleDateString("es-CL")} —{" "}
                    {new Date(p.endsAt).toLocaleDateString("es-CL")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.active ? "text-emerald-400" : "text-slate-500"
                      }
                    >
                      {p.active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/promociones/${p.id}`} className="text-emerald-400 hover:underline">
                      Editar
                    </Link>
                    <span className="mx-2 text-slate-700">|</span>
                    <button
                      type="button"
                      className="text-red-400/90 hover:underline"
                      onClick={() => remove(p.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No hay promociones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
