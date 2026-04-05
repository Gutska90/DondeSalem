"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { fetchAdminCategories, fetchAdminProducts } from "@/lib/api";
import { formatCLP } from "@/lib/format";
import type { Category, ProductSummary } from "@/lib/types";

export default function AdminProductsPage() {
  const { token, user } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [lowOnly, setLowOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{
    content: ProductSummary[];
    totalPages: number;
    totalElements: number;
  } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token || user?.role !== "ADMIN") return;
    setLoading(true);
    setErr(null);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetchAdminCategories(token),
        fetchAdminProducts(token, {
          search: search || undefined,
          categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
          lowStockOnly: lowOnly || undefined,
          lowStockThreshold: 5,
          page,
          size: 15,
        }),
      ]);
      setCategories(catRes);
      setData({
        content: prodRes.content,
        totalPages: prodRes.totalPages,
        totalElements: prodRes.totalElements,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [token, user?.role, search, categoryId, lowOnly, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Productos</h1>
          <p className="mt-1 text-sm text-slate-500">Catálogo completo, incluye inactivos</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="block min-w-[200px] flex-1">
          <span className="text-xs text-slate-500">Buscar</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            placeholder="Nombre…"
          />
        </label>
        <label className="block w-full sm:w-48">
          <span className="text-xs text-slate-500">Categoría</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={categoryId}
            onChange={(e) => {
              setPage(0);
              setCategoryId(e.target.value);
            }}
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => {
              setPage(0);
              setLowOnly(e.target.checked);
            }}
          />
          Solo stock bajo (&lt;5)
        </label>
        <button
          type="button"
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          onClick={() => load()}
        >
          Actualizar
        </button>
      </div>

      {err && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {err}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium" />
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
              data?.content.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.categoryName}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-300">{formatCLP(p.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.stockQuantity < 5 ? "font-semibold text-amber-400" : "text-slate-300"
                      }
                    >
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                        p.active !== false
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-slate-700/50 text-slate-400"
                      }`}
                    >
                      {p.active !== false ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/productos/${p.id}`}
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            {!loading && data && data.content.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No hay resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Página {page + 1} de {data.totalPages} ({data.totalElements} ítems)
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
