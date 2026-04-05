"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { downloadAdminOrdersCsv, fetchAdminOrders } from "@/lib/api";
import { formatCLP } from "@/lib/format";
import type { OrderSummary } from "@/lib/api";

export default function AdminOrdersPage() {
  const { token, user } = useAuth();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [data, setData] = useState<{
    content: OrderSummary[];
    totalPages: number;
    totalElements: number;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportErr, setExportErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || user?.role !== "ADMIN") return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetchAdminOrders(token, page, 20, statusFilter || undefined);
      setData({
        content: res.content,
        totalPages: res.totalPages,
        totalElements: res.totalElements,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [token, user?.role, page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setExportErr(null);
  }, [page]);

  async function onExportCsv() {
    if (!token) return;
    setExporting(true);
    setExportErr(null);
    try {
      await downloadAdminOrdersCsv(token, statusFilter || undefined);
    } catch (e) {
      setExportErr(e instanceof Error ? e.message : "Error al exportar");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Pedidos</h1>
          <p className="mt-1 text-sm text-slate-500">Listado paginado, más recientes primero</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end sm:gap-3">
          <label className="block w-full sm:w-52">
            <span className="text-xs text-slate-500">Estado</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              value={statusFilter}
              onChange={(e) => {
                setPage(0);
                setExportErr(null);
                setStatusFilter(e.target.value);
              }}
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PAGADO">Pagado</option>
              <option value="PREPARANDO">Preparando</option>
              <option value="ENVIADO">Enviado</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </label>
          <button
            type="button"
            disabled={!token || exporting}
            className="rounded-lg border border-emerald-600/50 bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-950/60 disabled:opacity-40"
            onClick={() => void onExportCsv()}
          >
            {exporting ? "Descargando…" : "Exportar CSV"}
          </button>
        </div>
      </div>

      {exportErr && (
        <p className="mt-4 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">
          {exportErr}
        </p>
      )}

      {err && (
        <p className="mt-6 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{err}</p>
      )}

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nº</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Cargando…
                </td>
              </tr>
            )}
            {!loading &&
              data?.content.map((o) => (
                <tr key={o.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-mono text-slate-200">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-300">{formatCLP(o.total)}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(o.createdAt).toLocaleString("es-CL")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/pedidos/${o.id}`} className="text-emerald-400 hover:underline">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            {!loading && data && data.content.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No hay pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Página {page + 1} de {data.totalPages} ({data.totalElements} pedidos)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 0}
              className="rounded-lg border border-slate-700 px-3 py-1 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= data.totalPages - 1}
              className="rounded-lg border border-slate-700 px-3 py-1 disabled:opacity-40"
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
