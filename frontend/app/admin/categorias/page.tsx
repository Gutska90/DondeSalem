"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
  type CategoryBody,
} from "@/lib/api";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<Category[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [parentId, setParentId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token || user?.role !== "ADMIN") return;
    setLoading(true);
    try {
      const c = await fetchAdminCategories(token);
      setRows(c);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => {
    load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const auth = token;
    if (!auth) return;
    setSaving(true);
    setErr(null);
    const body: CategoryBody = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      parentId: parentId ? parseInt(parentId, 10) : null,
      sortOrder: parseInt(sortOrder, 10) || 0,
    };
    try {
      await createAdminCategory(auth, body);
      setName("");
      setSlug("");
      setSortOrder("0");
      setParentId("");
      load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!token || !confirm("¿Eliminar esta categoría?")) return;
    try {
      await deleteAdminCategory(token, id);
      load();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : "Error");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-100">Categorías</h1>
      <p className="mt-1 text-sm text-slate-500">Orden, jerarquía y slugs para el catálogo</p>

      <form
        onSubmit={onCreate}
        className="mt-8 grid gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="block sm:col-span-2">
          <span className="text-xs text-slate-500">Nombre</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs text-slate-500">Slug</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Orden</span>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs text-slate-500">Padre (opcional)</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">— Ninguna —</option>
            {rows.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? "Creando…" : "Agregar categoría"}
          </button>
        </div>
      </form>

      {err && (
        <p className="mt-4 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{err}</p>
      )}

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">Padre</th>
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
              rows.map((c) => (
                <CategoryRow
                  key={c.id}
                  c={c}
                  all={rows}
                  token={token!}
                  onSaved={load}
                  onDelete={() => remove(c.id)}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryRow({
  c,
  all,
  token,
  onSaved,
  onDelete,
}: {
  c: Category;
  all: Category[];
  token: string;
  onSaved: () => void;
  onDelete: () => void;
}) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(c.name);
  const [slug, setSlug] = useState(c.slug);
  const [sortOrder, setSortOrder] = useState(String(c.sortOrder));
  const [parentId, setParentId] = useState(c.parentId != null ? String(c.parentId) : "");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body: CategoryBody = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        parentId: parentId ? parseInt(parentId, 10) : null,
        sortOrder: parseInt(sortOrder, 10) || 0,
      };
      await updateAdminCategory(token, c.id, body);
      setEdit(false);
      onSaved();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  const parentName = c.parentId != null ? all.find((x) => x.id === c.parentId)?.name ?? "—" : "—";

  if (edit) {
    return (
      <tr className="bg-slate-900/80">
        <td colSpan={5} className="p-4">
          <form onSubmit={save} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              required
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              required
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <input
              type="number"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
            <select
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">— Sin padre —</option>
              {all
                .filter((x) => x.id !== c.id)
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
            </select>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white"
              >
                Guardar
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm"
                onClick={() => setEdit(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-slate-900/50">
      <td className="px-4 py-3 font-medium text-slate-200">{c.name}</td>
      <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.slug}</td>
      <td className="px-4 py-3 text-slate-400">{c.sortOrder}</td>
      <td className="px-4 py-3 text-slate-500">{parentName}</td>
      <td className="px-4 py-3 text-right">
        <button type="button" className="text-emerald-400 hover:underline" onClick={() => setEdit(true)}>
          Editar
        </button>
        <span className="mx-2 text-slate-700">|</span>
        <button type="button" className="text-red-400/90 hover:underline" onClick={onDelete}>
          Eliminar
        </button>
      </td>
    </tr>
  );
}
