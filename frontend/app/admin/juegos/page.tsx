"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  createAdminGame,
  deleteAdminGame,
  fetchAdminGames,
  updateAdminGame,
  type GameBody,
} from "@/lib/api";
import type { Game } from "@/lib/types";

export default function AdminGamesPage() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<Game[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token || user?.role !== "ADMIN") return;
    setLoading(true);
    try {
      const g = await fetchAdminGames(token);
      setRows(g);
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
    if (!token) return;
    setSaving(true);
    setErr(null);
    const body: GameBody = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      logoUrl: logoUrl.trim() || null,
    };
    try {
      await createAdminGame(token, body);
      setName("");
      setSlug("");
      setLogoUrl("");
      load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!token || !confirm("¿Eliminar este juego TCG? (solo si no hay productos asociados)")) return;
    try {
      await deleteAdminGame(token, id);
      load();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : "Error");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-100">Juegos TCG</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pokémon, Magic, MYL, etc. Los productos eligen un juego para filtros y fichas. Las líneas PE/PB de
        Mitos y Leyendas         están en{" "}
        <Link href="/admin/categorias" className="text-emerald-400 hover:underline">
          Categorías
        </Link>{" "}
        (Mitos y Leyendas → PE / PB).
      </p>

      <form
        onSubmit={onCreate}
        className="mt-8 grid gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="block sm:col-span-2">
          <span className="text-xs text-slate-500">Nombre</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mitos y Leyendas"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs text-slate-500">Slug (URL)</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="mitos-y-leyendas"
          />
        </label>
        <label className="block sm:col-span-2 lg:col-span-4">
          <span className="text-xs text-slate-500">Logo (URL opcional)</span>
          <input
            type="url"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://…"
          />
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? "Creando…" : "Agregar juego"}
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
              <th className="px-4 py-3">Logo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Cargando…
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((g) => (
                <GameRow key={g.id} g={g} token={token!} onSaved={load} onDelete={() => remove(g.id)} />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GameRow({
  g,
  token,
  onSaved,
  onDelete,
}: {
  g: Game;
  token: string;
  onSaved: () => void;
  onDelete: () => void;
}) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(g.name);
  const [slug, setSlug] = useState(g.slug);
  const [logoUrl, setLogoUrl] = useState(g.logoUrl ?? "");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body: GameBody = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        logoUrl: logoUrl.trim() || null,
      };
      await updateAdminGame(token, g.id, body);
      setEdit(false);
      onSaved();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  if (edit) {
    return (
      <tr className="bg-slate-900/80">
        <td colSpan={4} className="p-4">
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
              type="url"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm sm:col-span-2"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="Logo URL"
            />
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
      <td className="px-4 py-3 font-medium text-slate-200">{g.name}</td>
      <td className="px-4 py-3 font-mono text-xs text-slate-500">{g.slug}</td>
      <td className="max-w-[200px] truncate px-4 py-3 text-xs text-slate-500">{g.logoUrl ?? "—"}</td>
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
