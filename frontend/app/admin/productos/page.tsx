"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  bulkUpdateAdminProducts,
  fetchAdminCategories,
  fetchAdminProductIds,
  fetchAdminProducts,
} from "@/lib/api";
import { formatCLP } from "@/lib/format";
import type { Category, ProductSummary, ProductType } from "@/lib/types";

const TYPE_LABEL: Record<ProductType, string> = {
  SEALED_TCG: "Sellado",
  SINGLE_CARD: "Single",
  ACCESSORY: "Acc.",
  BOARD_GAME: "Mesa",
};

export default function AdminProductsPage() {
  const { token, user } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [productType, setProductType] = useState<string>("");
  const [filterSet, setFilterSet] = useState("");
  const [filterRarity, setFilterRarity] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [filterFinish, setFilterFinish] = useState("");
  const [filterBloque, setFilterBloque] = useState<"" | "PE" | "PB">("");
  const [lowOnly, setLowOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{
    content: ProductSummary[];
    totalPages: number;
    totalElements: number;
  } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkActive, setBulkActive] = useState<string>("");
  const [bulkDelta, setBulkDelta] = useState<string>("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [autoSelectFiltered, setAutoSelectFiltered] = useState(false);
  const [idBatchSize, setIdBatchSize] = useState("1000");
  const [idProgress, setIdProgress] = useState<{
    running: boolean;
    page: number;
    totalPages: number;
    loaded: number;
  }>({ running: false, page: 0, totalPages: 0, loaded: 0 });
  const autoSelectReqRef = useRef(0);

  const load = useCallback(async () => {
    if (!token || user?.role !== "ADMIN") return;
    setLoading(true);
    setErr(null);
    setOk(null);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetchAdminCategories(token),
        fetchAdminProducts(token, {
          search: search || undefined,
          categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
          productType: productType ? (productType as ProductType) : undefined,
          setName: filterSet.trim() || undefined,
          rarity: filterRarity.trim() || undefined,
          condition: filterCondition.trim() || undefined,
          language: filterLanguage.trim() || undefined,
          finishType: filterFinish.trim() || undefined,
          bloque: filterBloque || undefined,
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
  }, [
    token,
    user?.role,
    search,
    categoryId,
    productType,
    filterSet,
    filterRarity,
    filterCondition,
    filterLanguage,
    filterFinish,
    filterBloque,
    lowOnly,
    page,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  const allSelectedOnPage =
    !!data?.content.length && data.content.every((p) => selected.has(p.id));

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectPage() {
    if (!data?.content?.length) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelectedOnPage) {
        data.content.forEach((p) => next.delete(p.id));
      } else {
        data.content.forEach((p) => next.add(p.id));
      }
      return next;
    });
  }

  const selectAllFiltered = useCallback(
    async (silent = false, requestId?: number) => {
      if (!token || user?.role !== "ADMIN") return;
      setErr(null);
      try {
        const parsedBatch = parseInt(idBatchSize, 10);
        const batchSize = Number.isNaN(parsedBatch) ? 1000 : Math.min(Math.max(parsedBatch, 100), 2000);
        setIdProgress({ running: true, page: 0, totalPages: 0, loaded: 0 });
        const baseFilters = {
          search: search || undefined,
          categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
          productType: productType ? (productType as ProductType) : undefined,
          setName: filterSet.trim() || undefined,
          rarity: filterRarity.trim() || undefined,
          condition: filterCondition.trim() || undefined,
          language: filterLanguage.trim() || undefined,
          finishType: filterFinish.trim() || undefined,
          bloque: filterBloque || undefined,
          lowStockOnly: lowOnly || undefined,
          lowStockThreshold: 5,
        };
        const first = await fetchAdminProductIds(token, { ...baseFilters, page: 0, size: batchSize });
        if (requestId != null && requestId !== autoSelectReqRef.current) return;
        let ids = [...first.content];
        setIdProgress({
          running: true,
          page: 1,
          totalPages: Math.max(1, first.totalPages),
          loaded: ids.length,
        });
        for (let p = 1; p < first.totalPages; p++) {
          const next = await fetchAdminProductIds(token, { ...baseFilters, page: p, size: batchSize });
          if (requestId != null && requestId !== autoSelectReqRef.current) return;
          ids = ids.concat(next.content);
          setIdProgress({
            running: true,
            page: p + 1,
            totalPages: Math.max(1, first.totalPages),
            loaded: ids.length,
          });
        }
        setSelected(new Set(ids));
        if (!silent) setOk(`Seleccionados ${ids.length} productos filtrados.`);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "No se pudo seleccionar los filtrados.");
      } finally {
        setIdProgress((prev) => ({ ...prev, running: false }));
      }
    },
    [
      token,
      user?.role,
      search,
      categoryId,
      productType,
      filterSet,
      filterRarity,
      filterCondition,
      filterLanguage,
      filterFinish,
      filterBloque,
      lowOnly,
      idBatchSize,
    ],
  );

  useEffect(() => {
    if (!autoSelectFiltered) return;
    if (!token || user?.role !== "ADMIN") return;
    autoSelectReqRef.current += 1;
    const reqId = autoSelectReqRef.current;
    const t = setTimeout(() => {
      void selectAllFiltered(true, reqId);
    }, 500);
    return () => clearTimeout(t);
  }, [
    autoSelectFiltered,
    selectAllFiltered,
    token,
    user?.role,
    search,
    categoryId,
    productType,
    filterSet,
    filterRarity,
    filterCondition,
    filterLanguage,
    filterFinish,
    filterBloque,
    lowOnly,
  ]);

  async function applyBulk() {
    if (!token || selected.size === 0) {
      setErr("Seleccioná al menos un producto.");
      return;
    }
    const body: { productIds: number[]; active?: boolean; stockDelta?: number } = {
      productIds: Array.from(selected),
    };
    if (bulkActive === "true") body.active = true;
    if (bulkActive === "false") body.active = false;
    if (bulkDelta.trim()) {
      const n = parseInt(bulkDelta, 10);
      if (Number.isNaN(n)) {
        setErr("El ajuste de stock debe ser un número entero.");
        return;
      }
      body.stockDelta = n;
    }
    if (body.active == null && body.stockDelta == null) {
      setErr("Elegí al menos una acción masiva (estado o stock).");
      return;
    }
    setConfirmOpen(true);
  }

  async function confirmApplyBulk() {
    if (!token || selected.size === 0) {
      setErr("Seleccioná al menos un producto.");
      setConfirmOpen(false);
      return;
    }
    const body: { productIds: number[]; active?: boolean; stockDelta?: number } = {
      productIds: Array.from(selected),
    };
    if (bulkActive === "true") body.active = true;
    if (bulkActive === "false") body.active = false;
    if (bulkDelta.trim()) {
      const n = parseInt(bulkDelta, 10);
      if (Number.isNaN(n)) {
        setErr("El ajuste de stock debe ser un número entero.");
        setConfirmOpen(false);
        return;
      }
      body.stockDelta = n;
    }
    if (body.active == null && body.stockDelta == null) {
      setErr("Elegí al menos una acción masiva (estado o stock).");
      setConfirmOpen(false);
      return;
    }
    setBulkBusy(true);
    setErr(null);
    setOk(null);
    try {
      const res = await bulkUpdateAdminProducts(token, body);
      setOk(`Acción masiva aplicada: ${res.updated}/${res.requested} producto(s).`);
      setSelected(new Set());
      setBulkDelta("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error en acción masiva");
    } finally {
      setBulkBusy(false);
      setConfirmOpen(false);
    }
  }

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
        <label className="block w-full sm:w-40">
          <span className="text-xs text-slate-500">Tipo</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={productType}
            onChange={(e) => {
              setPage(0);
              setProductType(e.target.value);
            }}
          >
            <option value="">Todos</option>
            <option value="SEALED_TCG">Sellado</option>
            <option value="SINGLE_CARD">Single</option>
            <option value="ACCESSORY">Accesorio</option>
            <option value="BOARD_GAME">Juego mesa</option>
          </select>
        </label>
        <p className="w-full text-[11px] text-slate-600 sm:col-span-full">
          Filtros sobre singles: set (contiene texto); rareza, estado, idioma y acabado (igualdad, sin
          distinguir mayúsculas).
        </p>
        <label className="block w-full sm:w-36">
          <span className="text-xs text-slate-500">Set</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={filterSet}
            onChange={(e) => {
              setPage(0);
              setFilterSet(e.target.value);
            }}
            placeholder="Contiene…"
          />
        </label>
        <label className="block w-full sm:w-32">
          <span className="text-xs text-slate-500">Rareza</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={filterRarity}
            onChange={(e) => {
              setPage(0);
              setFilterRarity(e.target.value);
            }}
          />
        </label>
        <label className="block w-full sm:w-32">
          <span className="text-xs text-slate-500">Estado</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={filterCondition}
            onChange={(e) => {
              setPage(0);
              setFilterCondition(e.target.value);
            }}
          />
        </label>
        <label className="block w-full sm:w-32">
          <span className="text-xs text-slate-500">Idioma</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={filterLanguage}
            onChange={(e) => {
              setPage(0);
              setFilterLanguage(e.target.value);
            }}
          />
        </label>
        <label className="block w-full sm:w-32">
          <span className="text-xs text-slate-500">Acabado</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={filterFinish}
            onChange={(e) => {
              setPage(0);
              setFilterFinish(e.target.value);
            }}
          />
        </label>
        <label className="block w-full sm:w-32">
          <span className="text-xs text-slate-500">Bloque</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={filterBloque}
            onChange={(e) => {
              setPage(0);
              setFilterBloque(e.target.value as "" | "PE" | "PB");
            }}
          >
            <option value="">Todos</option>
            <option value="PE">PE</option>
            <option value="PB">PB</option>
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
        <div className="w-full border-t border-slate-800 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Acciones masivas ({selected.size} seleccionados)
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="block w-full sm:w-44">
              <span className="text-xs text-slate-500">Estado</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                value={bulkActive}
                onChange={(e) => setBulkActive(e.target.value)}
              >
                <option value="">Sin cambio</option>
                <option value="true">Activar</option>
                <option value="false">Desactivar</option>
              </select>
            </label>
            <label className="block w-full sm:w-44">
              <span className="text-xs text-slate-500">Ajuste stock (+/-)</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                value={bulkDelta}
                onChange={(e) => setBulkDelta(e.target.value)}
                placeholder="Ej: 5 o -2"
              />
            </label>
            <button
              type="button"
              disabled={bulkBusy}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
              onClick={() => void applyBulk()}
            >
              {bulkBusy ? "Aplicando…" : "Aplicar masivo"}
            </button>
            <button
              type="button"
              disabled={idProgress.running}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              onClick={() => void selectAllFiltered()}
            >
              Seleccionar filtrados
            </button>
            <label className="block w-full sm:w-40">
              <span className="text-xs text-slate-500">Lote IDs</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                value={idBatchSize}
                onChange={(e) => setIdBatchSize(e.target.value)}
                placeholder="1000"
              />
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={autoSelectFiltered}
                onChange={(e) => setAutoSelectFiltered(e.target.checked)}
              />
              Auto-seleccionar filtrados
            </label>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                autoSelectFiltered
                  ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40"
                  : "bg-slate-800 text-slate-400 ring-1 ring-slate-700"
              }`}
            >
              Auto {autoSelectFiltered ? "ON" : "OFF"}
            </span>
            <button
              type="button"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800"
              onClick={() => setSelected(new Set())}
            >
              Limpiar selección
            </button>
            {idProgress.running && (
              <span className="rounded-lg border border-sky-500/40 bg-sky-950/30 px-3 py-2 text-xs text-sky-200">
                Cargando IDs {idProgress.page}/{idProgress.totalPages || "?"} · {idProgress.loaded} ítems
              </span>
            )}
          </div>
        </div>
      </div>

      {err && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {err}
        </p>
      )}
      {ok && (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
          {ok}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">
                <input type="checkbox" checked={allSelectedOnPage} onChange={toggleSelectPage} />
              </th>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Bloque</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  Cargando…
                </td>
              </tr>
            )}
            {!loading &&
              data?.content.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.categoryName}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {TYPE_LABEL[p.productType ?? "SEALED_TCG"]}
                  </td>
                  <td className="px-4 py-3">
                    {p.productType === "SINGLE_CARD" ? (
                      <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs font-medium text-indigo-300">
                        {p.singleCard?.bloque ?? "—"}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
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
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
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

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-slate-100">Confirmar acción masiva</h2>
            <p className="mt-2 text-sm text-slate-400">
              Vas a modificar <span className="font-semibold text-slate-200">{selected.size}</span>{" "}
              producto(s).
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Estado:{" "}
              {bulkActive === ""
                ? "sin cambio"
                : bulkActive === "true"
                  ? "activar"
                  : "desactivar"}
              {" · "}Stock: {bulkDelta.trim() ? `${bulkDelta} (delta)` : "sin cambio"}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                onClick={() => void confirmApplyBulk()}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
