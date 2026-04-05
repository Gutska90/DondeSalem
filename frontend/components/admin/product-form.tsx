"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createAdminProduct, updateAdminProduct, type ProductCreateBody } from "@/lib/api";
import type { Category, Game, ProductDetail, AdminTag } from "@/lib/types";

type Props = {
  token: string;
  categories: Category[];
  games: Game[];
  tags: AdminTag[];
  mode: "create" | "edit";
  productId?: number;
  initial?: ProductDetail | null;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm({ token, categories, games, tags, mode, productId, initial }: Props) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const tagIdsFromSlugs = useMemo(() => {
    if (!initial?.tagSlugs?.length) return new Set<number>();
    const set = new Set<number>();
    for (const slug of initial.tagSlugs) {
      const t = tags.find((x) => x.slug === slug);
      if (t) set.add(t.id);
    }
    return set;
  }, [initial?.tagSlugs, tags]);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial != null ? String(initial.price) : "");
  const [compareAt, setCompareAt] = useState(
    initial?.compareAtPrice != null ? String(initial.compareAtPrice) : "",
  );
  const [stock, setStock] = useState(initial != null ? String(initial.stockQuantity) : "0");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId != null ? String(initial.categoryId) : "",
  );
  const [gameId, setGameId] = useState(initial?.gameId != null ? String(initial.gameId) : "");
  const [preorder, setPreorder] = useState(initial?.preorder ?? false);
  const [preorderDate, setPreorderDate] = useState(
    initial?.preorderReleaseDate ? initial.preorderReleaseDate.slice(0, 10) : "",
  );
  const [active, setActive] = useState(initial?.active ?? true);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [imageUrls, setImageUrls] = useState(
    initial?.images?.length
      ? initial.images.map((i) => i.url).join("\n")
      : "",
  );
  const [selectedTags, setSelectedTags] = useState<Set<number>>(() => tagIdsFromSlugs);

  function toggleTag(id: number) {
    setSelectedTags((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function onNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function onSlugChange(v: string) {
    setSlugTouched(true);
    setSlug(v);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const cid = parseInt(categoryId, 10);
    if (!cid) {
      setErr("Elegí una categoría.");
      return;
    }
    const p = parseFloat(price.replace(",", "."));
    if (Number.isNaN(p) || p < 0) {
      setErr("Precio inválido.");
      return;
    }
    let cap: number | null = null;
    if (compareAt.trim()) {
      cap = parseFloat(compareAt.replace(",", "."));
      if (Number.isNaN(cap)) {
        setErr("Precio tachado inválido.");
        return;
      }
    }
    const st = parseInt(stock, 10);
    if (Number.isNaN(st) || st < 0) {
      setErr("Stock inválido.");
      return;
    }
    const gid = gameId ? parseInt(gameId, 10) : null;
    const urls = imageUrls
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const body: ProductCreateBody = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim() || null,
      price: p,
      compareAtPrice: cap,
      stockQuantity: st,
      sku: sku.trim() || null,
      categoryId: cid,
      gameId: gid,
      preorder,
      preorderReleaseDate: preorder && preorderDate ? preorderDate : null,
      active,
      featured,
      imageUrls: urls,
      tagIds: Array.from(selectedTags),
    };
    setSaving(true);
    try {
      if (mode === "create") {
        await createAdminProduct(token, body);
      } else if (productId != null) {
        await updateAdminProduct(token, productId, body);
      }
      router.push("/admin/productos");
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      {err && (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {err}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Nombre</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-emerald-500/0 transition focus:ring-2"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Slug</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">SKU</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Descripción</span>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Precio (CLP)</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Precio tachado (opcional)
          </span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
            value={compareAt}
            onChange={(e) => setCompareAt(e.target.value)}
            placeholder="Oferta"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Stock</span>
          <input
            required
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Categoría</span>
          <select
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">— Elegir —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Juego (TCG)</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          >
            <option value="">— Ninguno —</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-6 border-y border-slate-800 py-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={preorder} onChange={(e) => setPreorder(e.target.checked)} />
          Preventa
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Activo en tienda
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Destacado en inicio
        </label>
      </div>

      {preorder && (
        <label className="block max-w-xs">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Fecha estimada lanzamiento
          </span>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
            value={preorderDate}
            onChange={(e) => setPreorderDate(e.target.value)}
          />
        </label>
      )}

      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          URLs de imágenes (una por línea)
        </span>
        <textarea
          rows={4}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
          value={imageUrls}
          onChange={(e) => setImageUrls(e.target.value)}
          placeholder="https://..."
        />
      </label>

      <div>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Etiquetas</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => toggleTag(t.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                selectedTags.has(t.id)
                  ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-200"
                  : "border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {saving ? "Guardando…" : mode === "create" ? "Crear producto" : "Guardar cambios"}
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
          onClick={() => router.push("/admin/productos")}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
