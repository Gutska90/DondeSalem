"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { deleteAdminEvent, fetchAdminEvents } from "@/lib/api";
import { formatCLP } from "@/lib/format";
import type { EventItem } from "@/lib/types";

export default function AdminEventsPage() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<EventItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token || user?.role !== "ADMIN") return;
    setLoading(true);
    try {
      const e = await fetchAdminEvents(token);
      setRows(e);
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
    if (!token || !confirm("¿Eliminar este evento?")) return;
    try {
      await deleteAdminEvent(token, id);
      load();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : "Error");
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Eventos</h1>
          <p className="mt-1 text-sm text-slate-500">Torneos, drafts y actividades en tienda</p>
        </div>
        <Link
          href="/admin/eventos/nuevo"
          className="inline-flex rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          + Nuevo evento
        </Link>
      </div>

      {err && (
        <p className="mt-6 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{err}</p>
      )}

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="w-16 px-4 py-3">Img</th>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Inicio</th>
              <th className="px-4 py-3">Cupo</th>
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
              rows.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3">
                    {ev.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ev.imageUrl}
                        alt={ev.title}
                        className="h-12 w-14 rounded-md object-cover ring-1 ring-slate-700"
                      />
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">{ev.title}</p>
                    {ev.featuredOnHome && (
                      <span className="text-[10px] font-semibold uppercase text-violet-400">Home</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(ev.startsAt).toLocaleString("es-CL")}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {ev.capacity != null ? ev.capacity : "—"}
                    {ev.entryFee != null && (
                      <span className="block text-xs text-slate-500">{formatCLP(ev.entryFee)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs ${
                        ev.active ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700/50 text-slate-500"
                      }`}
                    >
                      {ev.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/eventos/${ev.id}`} className="text-emerald-400 hover:underline">
                      Editar
                    </Link>
                    <span className="mx-2 text-slate-700">|</span>
                    <button
                      type="button"
                      className="text-red-400/90 hover:underline"
                      onClick={() => remove(ev.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No hay eventos cargados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
