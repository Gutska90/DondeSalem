"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createAdminProduct, updateAdminProduct, type ProductCreateBody } from "@/lib/api";
import { ProductCard } from "@/components/product/product-card";
import type { Category, Game, ProductDetail, AdminTag, ProductSummary, ProductType } from "@/lib/types";

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "SEALED_TCG", label: "TCG sellado (sobres, cajas)" },
  { value: "SINGLE_CARD", label: "Single / carta suelta" },
  { value: "ACCESSORY", label: "Accesorio" },
  { value: "BOARD_GAME", label: "Juego de mesa" },
];

function emptySingleCardForm() {
  return {
    cardName: "",
    setName: "",
    cardNumber: "",
    rarity: "",
    condition: "",
    language: "",
    finishType: "",
    bloque: "",
    editionType: "",
    artist: "",
    manaCostOrCost: "",
    attributeOrColor: "",
    gradeOrCertification: "",
    metadataJson: "",
  };
}

function hydrateSingleCardFromDetail(initial: ProductDetail | null | undefined) {
  const d = initial?.singleCardDetails;
  if (!d) return emptySingleCardForm();
  return {
    cardName: d.cardName ?? "",
    setName: d.setName ?? "",
    cardNumber: d.cardNumber ?? "",
    rarity: d.rarity ?? "",
    condition: d.condition ?? "",
    language: d.language ?? "",
    finishType: d.finishType ?? "",
    bloque: d.bloque ?? "",
    editionType: d.editionType ?? "",
    artist: d.artist ?? "",
    manaCostOrCost: d.manaCostOrCost ?? "",
    attributeOrColor: d.attributeOrColor ?? "",
    gradeOrCertification: d.gradeOrCertification ?? "",
    metadataJson: d.metadataJson ?? "",
  };
}

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

function ImagePreviewTile({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-28 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-950/20 px-2 text-center text-[11px] text-amber-300">
        No se pudo cargar
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Previsualizacion de producto"
      className="h-28 w-full rounded-lg border border-slate-700 object-cover"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function PreviewImage({ url, alt, className }: { url: string; alt: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-amber-500/40 bg-amber-950/20 px-2 text-center text-xs text-amber-300">
        No se pudo cargar esta imagen
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />
  );
}

export function ProductForm({ token, categories, games, tags, mode, productId, initial }: Props) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
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
  const [productType, setProductType] = useState<ProductType>(
    initial?.productType ?? "SEALED_TCG",
  );
  const [singleCard, setSingleCard] = useState(hydrateSingleCardFromDetail(initial));
  const [imageUrls, setImageUrls] = useState(
    initial?.images?.length
      ? initial.images.map((i) => i.url).join("\n")
      : "",
  );
  const previewImageUrls = useMemo(
    () =>
      Array.from(
        new Set(
          imageUrls
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      ),
    [imageUrls],
  );
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectedTags, setSelectedTags] = useState<Set<number>>(() => tagIdsFromSlugs);
  const activePreviewUrl = previewImageUrls[previewIndex] ?? null;
  const categoryNamePreview =
    categories.find((c) => String(c.id) === categoryId)?.name ?? initial?.categoryName ?? null;
  const categorySlugPreview =
    categories.find((c) => String(c.id) === categoryId)?.slug ?? initial?.categorySlug ?? null;
  const gameNamePreview =
    games.find((g) => String(g.id) === gameId)?.name ?? initial?.gameName ?? null;
  const gameSlugPreview =
    games.find((g) => String(g.id) === gameId)?.slug ?? initial?.gameSlug ?? null;
  const previewCard = useMemo((): ProductSummary => ({
      id: productId ?? initial?.id ?? 0,
      name: name || "Producto de ejemplo",
      slug: slug || "preview-producto",
      productType,
      price: Number.parseFloat(price.replace(",", ".")) || 0,
      compareAtPrice: compareAt.trim() ? Number.parseFloat(compareAt.replace(",", ".")) || null : null,
      stockQuantity: Number.parseInt(stock, 10) || 0,
      categoryName: categoryNamePreview,
      categorySlug: categorySlugPreview,
      gameName: gameNamePreview,
      gameSlug: gameSlugPreview,
      primaryImageUrl: activePreviewUrl,
      preorder,
      preorderReleaseDate: preorder && preorderDate ? preorderDate : null,
      featured,
      active,
      singleCard:
        productType === "SINGLE_CARD"
          ? {
              cardName: singleCard.cardName || null,
              setName: singleCard.setName || null,
              cardNumber: singleCard.cardNumber || null,
              rarity: singleCard.rarity || null,
              condition: singleCard.condition || null,
              language: singleCard.language || null,
              finishType: singleCard.finishType || null,
              bloque:
                singleCard.bloque === "PE" || singleCard.bloque === "PB"
                  ? singleCard.bloque
                  : null,
            }
          : null,
    }),
    [
      productId,
      initial?.id,
      name,
      slug,
      productType,
      price,
      compareAt,
      stock,
      categoryNamePreview,
      categorySlugPreview,
      gameNamePreview,
      gameSlugPreview,
      activePreviewUrl,
      preorder,
      preorderDate,
      featured,
      active,
      singleCard,
    ],
  );

  useEffect(() => {
    if (previewIndex >= previewImageUrls.length) {
      setPreviewIndex(0);
    }
  }, [previewImageUrls.length, previewIndex]);

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
    setOk(null);
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
    for (const url of urls) {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          setErr("Todas las imágenes deben ser URL http(s).");
          return;
        }
      } catch {
        setErr("Hay una URL de imagen inválida.");
        return;
      }
    }

    if (productType === "SINGLE_CARD") {
      if (!singleCard.cardName.trim()) {
        setErr("Los singles requieren nombre de carta.");
        return;
      }
    }

    const singleCardDetails: ProductCreateBody["singleCardDetails"] =
      productType === "SINGLE_CARD"
        ? {
            cardName: singleCard.cardName.trim() || null,
            setName: singleCard.setName.trim() || null,
            cardNumber: singleCard.cardNumber.trim() || null,
            rarity: singleCard.rarity.trim() || null,
            condition: singleCard.condition.trim() || null,
            language: singleCard.language.trim() || null,
            finishType: singleCard.finishType.trim() || null,
            bloque: inferBloque(singleCard.bloque, singleCard.setName),
            editionType: singleCard.editionType.trim() || null,
            artist: singleCard.artist.trim() || null,
            manaCostOrCost: singleCard.manaCostOrCost.trim() || null,
            attributeOrColor: singleCard.attributeOrColor.trim() || null,
            gradeOrCertification: singleCard.gradeOrCertification.trim() || null,
            metadataJson: singleCard.metadataJson.trim() || null,
          }
        : null;

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
      productType,
      singleCardDetails,
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
      setOk(mode === "create" ? "Producto creado correctamente." : "Cambios guardados.");
      await new Promise((r) => setTimeout(r, 450));
      router.push("/admin/productos");
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-7xl space-y-6">
      {err && (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {err}
        </p>
      )}
      {ok && (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
          {ok}
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-6">
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
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Tipo de producto
          </span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
            value={productType}
            onChange={(e) => setProductType(e.target.value as ProductType)}
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
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

      {productType === "SINGLE_CARD" && (
        <div className="rounded-xl border border-violet-500/25 bg-violet-950/20 p-4">
          <p className="text-sm font-semibold text-violet-200">Datos del single</p>
          <p className="mt-1 text-xs text-slate-500">
            Cada variante (idioma, estado, foil, etc.) debe ser un producto aparte.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs text-slate-500">Nombre de carta *</span>
              <input
                required={productType === "SINGLE_CARD"}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-violet-500/40"
                value={singleCard.cardName}
                onChange={(e) => setSingleCard((s) => ({ ...s, cardName: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Set / expansión</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                value={singleCard.setName}
                onChange={(e) => setSingleCard((s) => ({ ...s, setName: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Número de carta</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                value={singleCard.cardNumber}
                onChange={(e) => setSingleCard((s) => ({ ...s, cardNumber: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Rareza</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                value={singleCard.rarity}
                onChange={(e) => setSingleCard((s) => ({ ...s, rarity: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Estado (NM, LP…)</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                value={singleCard.condition}
                onChange={(e) => setSingleCard((s) => ({ ...s, condition: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Idioma</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                value={singleCard.language}
                onChange={(e) => setSingleCard((s) => ({ ...s, language: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Acabado (Normal, Foil…)</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                value={singleCard.finishType}
                onChange={(e) => setSingleCard((s) => ({ ...s, finishType: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Edición (1st, unlimited…)</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                value={singleCard.editionType}
                onChange={(e) => setSingleCard((s) => ({ ...s, editionType: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Artista</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                value={singleCard.artist}
                onChange={(e) => setSingleCard((s) => ({ ...s, artist: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Coste / maná (texto libre)</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                value={singleCard.manaCostOrCost}
                onChange={(e) => setSingleCard((s) => ({ ...s, manaCostOrCost: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Atributo / color</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                value={singleCard.attributeOrColor}
                onChange={(e) => setSingleCard((s) => ({ ...s, attributeOrColor: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Grado / certificación</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                value={singleCard.gradeOrCertification}
                onChange={(e) =>
                  setSingleCard((s) => ({ ...s, gradeOrCertification: e.target.value }))
                }
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs text-slate-500">Metadata JSON (opcional, avanzado)</span>
              <textarea
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-xs text-slate-100"
                value={singleCard.metadataJson}
                onChange={(e) => setSingleCard((s) => ({ ...s, metadataJson: e.target.value }))}
                placeholder="{}"
              />
            </label>
          </div>
        </div>
      )}

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
        <p className="mt-2 text-xs text-slate-500">
          La previsualización completa está en el panel derecho.
        </p>
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
        </div>

        <aside className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Previsualización en vivo
          </p>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-800 bg-slate-950/70">
            {activePreviewUrl ? (
              <PreviewImage
                url={activePreviewUrl}
                alt={name || "Producto"}
                className="h-80 w-full object-contain bg-slate-950"
              />
            ) : (
              <div className="flex h-80 items-center justify-center px-3 text-center text-sm text-slate-500">
                Sin imagen cargada todavía.
              </div>
            )}
          </div>

          {previewImageUrls.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {previewImageUrls.map((url, idx) => (
                <button
                  key={url}
                  type="button"
                  className={`rounded-lg p-0.5 ${
                    idx === previewIndex ? "ring-2 ring-emerald-500" : "ring-1 ring-slate-700"
                  }`}
                  onClick={() => setPreviewIndex(idx)}
                >
                  <ImagePreviewTile url={url} />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm">
            <p className="font-medium text-slate-100">{name || "Nombre del producto"}</p>
            <p className="text-slate-400">{description || "Descripción del producto..."}</p>
            <p className="text-slate-300">
              Precio: <span className="font-semibold text-emerald-300">{price || "0"} CLP</span>
            </p>
            <p className="text-slate-400">
              Stock: <span className="font-medium text-slate-200">{stock || "0"}</span>
            </p>
            <p className="text-slate-400">
              Tipo: <span className="font-medium text-slate-200">{productType}</span>
            </p>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Vista real en tienda
            </p>
            <div className="pointer-events-none opacity-95">
              <ProductCard p={previewCard} />
            </div>
            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {previewCard.preorder ? "Producto en preventa" : "Disponible para compra inmediata"}
                </span>
                <span
                  className={
                    previewCard.stockQuantity > 0
                      ? "font-medium text-emerald-300"
                      : "font-medium text-amber-300"
                  }
                >
                  {previewCard.stockQuantity > 0
                    ? `Stock: ${previewCard.stockQuantity}`
                    : "Sin stock (agotado)"}
                </span>
              </div>
              <button
                type="button"
                disabled
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${
                  previewCard.stockQuantity <= 0 && !previewCard.preorder
                    ? "bg-slate-600/90 opacity-85"
                    : previewCard.preorder
                      ? "bg-indigo-600/90 opacity-90"
                      : "bg-emerald-600/90 opacity-90"
                }`}
              >
                {previewCard.stockQuantity <= 0 && !previewCard.preorder
                  ? "Agotado (vista previa)"
                  : previewCard.preorder
                    ? "Reservar en preventa (vista previa)"
                    : "Agregar al carrito (vista previa)"}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

function inferBloque(rawBloque: string, setName: string): "PE" | "PB" | null {
  const explicit = rawBloque.trim().toUpperCase();
  if (explicit === "PE" || explicit === "PB") return explicit;
  const set = setName.trim().toLowerCase();
  if (set.includes("primer bloque") || set.includes("(lbpb")) return "PB";
  if (set.includes("primera era") || set.includes("(lpe")) return "PE";
  return null;
}
