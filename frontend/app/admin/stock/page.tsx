"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  downloadAdminInventoryMovementsCsv,
  fetchAdminInventoryMovements,
  fetchAdminProducts,
  postAdminInventoryAdjust,
} from "@/lib/api";
import { formatCLP } from "@/lib/format";
import type { InventoryMovementRow, ProductSummary } from "@/lib/types";

const THRESHOLD = 5;

export default function AdminStockPage() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<ProductSummary[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState("");
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState<string>("AJUSTE_MANUAL");
  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [movPage, setMovPage] = useState(0);
  /** null = todos los productos */
  const [movFilterProductId, setMovFilterProductId] = useState<number | null>(null);
  const [movFilterDraft, setMovFilterDraft] = useState("");
  const [movements, setMovements] = useState<{
    content: InventoryMovementRow[];
    totalPages: number;
    totalElements: number;
  } | null>(null);
  const [movLoading, setMovLoading] = useState(true);
  const [movErr, setMovErr] = useState<string | null>(null);
  const [exportingMovCsv, setExportingMovCsv] = useState(false);
  const [exportMovErr, setExportMovErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || user?.role !== "ADMIN") return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetchAdminProducts(token, {
        lowStockOnly: true,
        lowStockThreshold: THRESHOLD,
        size: 100,
        page: 0,
      });
      setRows(res.content);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  const loadMovements = useCallback(async () => {
    if (!token || user?.role !== "ADMIN") return;
    setMovLoading(true);
    setMovErr(null);
    try {
      const res = await fetchAdminInventoryMovements(
        token,
        movPage,
        20,
        movFilterProductId ?? undefined,
      );
      setMovements({
        content: res.content,
        totalPages: res.totalPages,
        totalElements: res.totalElements,
      });
    } catch (e) {
      setMovErr(e instanceof Error ? e.message : "Error");
    } finally {
      setMovLoading(false);
    }
  }, [token, user?.role, movPage, movFilterProductId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  function applyMovFilter() {
    const t = movFilterDraft.trim();
    if (!t) {
      setMovErr(null);
      setMovFilterProductId(null);
      setMovPage(0);
      return;
    }
    const n = parseInt(t, 10);
    if (!Number.isFinite(n) || n < 1) {
      setMovErr("Indicá un ID de producto válido o vaciá el campo para ver todos.");
      return;
    }
    setMovErr(null);
    setMovFilterDraft(String(n));
    setMovFilterProductId(n);
    setMovPage(0);
  }

  async function onAdjust(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const pid = parseInt(productId, 10);
    const d = parseInt(delta, 10);
    if (!pid || Number.isNaN(d) || d === 0) {
      setMsg("Indicá un producto y un delta distinto de cero.");
      return;
    }
    if (!token) return;
    setSubmitting(true);
    try {
      await postAdminInventoryAdjust(token, {
        productId: pid,
        delta: d,
        reason: reason as "VENTA" | "AJUSTE_MANUAL" | "DEVOLUCION" | "ENTRADA_INICIAL",
      });
      setMsg("Movimiento registrado.");
      setProductId("");
      setDelta("");
      await load();
      await loadMovements();
    } catch (ex) {
      setMsg(ex instanceof Error ? ex.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-100">Stock</h1>
      <p className="mt-1 text-sm text-slate-500">
        Alertas de bajo stock (menos de {THRESHOLD} unidades) y ajustes manuales.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="font-semibold text-slate-200">Ajuste rápido</h2>
          <p className="mt-1 text-xs text-slate-500">
            Sumá o restá unidades (positivo = entrada, negativo = salida). El stock no puede quedar
            negativo.
          </p>
          <form onSubmit={onAdjust} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs text-slate-500">ID de producto</span>
              <input
                required
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Ej. 42"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Delta (unidades)</span>
              <input
                required
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                placeholder="-2 o +10"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Motivo</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="AJUSTE_MANUAL">Ajuste manual</option>
                <option value="ENTRADA_INICIAL">Entrada / inicial</option>
                <option value="DEVOLUCION">Devolución</option>
                <option value="VENTA">Corrección venta</option>
              </select>
            </label>
            {msg && <p className="text-sm text-slate-400">{msg}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {submitting ? "Guardando…" : "Registrar movimiento"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-5">
          <h2 className="font-semibold text-amber-200">Productos con stock bajo</h2>
          <p className="mt-1 text-xs text-amber-200/60">
            Unidades disponibles &lt; {THRESHOLD}. Actualizá desde la lista o editá el producto.
          </p>
          <button
            type="button"
            className="mt-3 text-xs font-medium text-amber-400 hover:underline"
            onClick={() => load()}
          >
            Refrescar lista
          </button>
        </div>
      </div>

      {err && (
        <p className="mt-6 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{err}</p>
      )}

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Precio</th>
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
              rows.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-mono text-slate-500">{p.id}</td>
                  <td className="px-4 py-3 text-slate-200">{p.name}</td>
                  <td className="px-4 py-3 font-semibold text-amber-400">{p.stockQuantity}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-400">{formatCLP(p.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/productos/${p.id}`} className="text-emerald-400 hover:underline">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No hay productos por debajo del umbral. ¡Buen trabajo!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-100">Últimos movimientos</h2>
            <p className="mt-1 text-xs text-slate-500">Entradas y salidas de stock (más recientes primero)</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-2">
            <label className="block sm:w-36">
              <span className="text-xs text-slate-500">Filtrar por ID producto</span>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                value={movFilterDraft}
                onChange={(e) => setMovFilterDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyMovFilter();
                  }
                }}
                placeholder="Todos"
              />
            </label>
            <button
              type="button"
              className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
              onClick={() => applyMovFilter()}
            >
              Aplicar
            </button>
            {movFilterProductId != null && (
              <button
                type="button"
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:text-slate-200"
                onClick={() => {
                  setMovFilterDraft("");
                  setMovFilterProductId(null);
                  setMovPage(0);
                  setMovErr(null);
                }}
              >
                Quitar filtro
              </button>
            )}
            <button
              type="button"
              className="text-xs font-medium text-slate-400 hover:text-slate-200 sm:ml-1"
              onClick={() => void loadMovements()}
            >
              Refrescar
            </button>
            <button
              type="button"
              disabled={!token || exportingMovCsv}
              className="rounded-lg border border-violet-600/40 bg-violet-950/30 px-3 py-2 text-xs font-medium text-violet-200 hover:bg-violet-950/50 disabled:opacity-40"
              onClick={() => {
                if (!token) return;
                setExportMovErr(null);
                setExportingMovCsv(true);
                downloadAdminInventoryMovementsCsv(token, movFilterProductId ?? undefined)
                  .catch((e) =>
                    setExportMovErr(e instanceof Error ? e.message : "Error al exportar"),
                  )
                  .finally(() => setExportingMovCsv(false));
              }}
            >
              {exportingMovCsv ? "CSV…" : "Exportar CSV"}
            </button>
          </div>
        </div>

        {exportMovErr && (
          <p className="mt-4 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">
            {exportMovErr}
          </p>
        )}

        {movErr && (
          <p className="mt-4 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{movErr}</p>
        )}

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Cambio</th>
                <th className="px-4 py-3">Motivo</th>
                <th className="px-4 py-3">Referencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {movLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Cargando…
                  </td>
                </tr>
              )}
              {!movLoading &&
                movements?.content.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/50">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {new Date(m.createdAt).toLocaleString("es-CL")}
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      <span className="font-mono text-xs text-slate-500">{m.productId}</span>{" "}
                      {m.productName}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold tabular-nums ${
                        m.quantityChange >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {m.quantityChange >= 0 ? "+" : ""}
                      {m.quantityChange}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{m.reason}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {m.referenceType && m.referenceId != null
                        ? `${m.referenceType} #${m.referenceId}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              {!movLoading && movements && movements.content.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {movements && movements.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>
              Página {movPage + 1} de {movements.totalPages} ({movements.totalElements} movimientos)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={movPage <= 0}
                className="rounded-lg border border-slate-700 px-3 py-1 disabled:opacity-40"
                onClick={() => setMovPage((p) => Math.max(0, p - 1))}
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={movPage >= movements.totalPages - 1}
                className="rounded-lg border border-slate-700 px-3 py-1 disabled:opacity-40"
                onClick={() => setMovPage((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
