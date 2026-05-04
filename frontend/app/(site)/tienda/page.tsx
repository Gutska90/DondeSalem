import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { SearchAutocompleteInput } from "@/components/ui/search-autocomplete-input";
import { fetchCategories, fetchGames, fetchProducts } from "@/lib/api";
import { spStr } from "@/lib/search-params";
import type { ProductSummary } from "@/lib/types";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TiendaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = spStr(sp.q);
  const category = spStr(sp.category);
  const game = spStr(sp.game);
  const bloque = spStr(sp.bloque) ?? spStr(sp.era);
  const pageRaw = spStr(sp.page);
  const parsedPage = pageRaw != null ? parseInt(pageRaw, 10) : 0;
  const page = Number.isFinite(parsedPage) && parsedPage >= 0 ? parsedPage : 0;
  const sizeRaw = spStr(sp.size);
  const parsedSize = sizeRaw != null ? parseInt(sizeRaw, 10) : 12;
  const size = [12, 24, 48].includes(parsedSize) ? parsedSize : 12;
  const inStock = sp.inStock === "true" ? true : undefined;
  const preorder = sp.preorder === "true" ? true : undefined;
  const productType = spStr(sp.productType);
  const effectiveProductType = productType ?? (bloque ? "SINGLE_CARD" : undefined);

  const [data, categories, games] = await Promise.all([
    fetchProducts({
      q,
      category,
      game,
      page,
      size,
      inStock,
      preorder,
      ...(effectiveProductType ? { productType: effectiveProductType } : {}),
      ...(bloque ? { bloque } : {}),
      ...(!effectiveProductType ? { excludeSingles: true } : {}),
    }).catch(() => ({
      content: [] as ProductSummary[],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size,
    })),
    fetchCategories().catch(() => []),
    fetchGames().catch(() => []),
  ]);

  /**
   * Config de accesos rápidos por juego.
   * Para agregar nuevos botones (ej. Yu-Gi-Oh), suma un slug aquí.
   */
  const quickGameOrder = ["pokemon", "magic-the-gathering", "mitos-y-leyendas"];

  /**
   * Mostramos solo categorías/juegos que actualmente tienen productos visibles en tienda.
   * Esto evita filtros vacíos para el cliente.
   */
  const [usedCategorySlugs, usedGameSlugs] = await Promise.all([
    Promise.all(
      categories.map(async (c) => {
        try {
          const r = await fetchProducts({
            category: c.slug,
            size: 1,
            page: 0,
            ...(effectiveProductType ? { productType: effectiveProductType } : {}),
            ...(bloque ? { bloque } : {}),
            ...(!effectiveProductType ? { excludeSingles: true } : {}),
          });
          return r.totalElements > 0 ? c.slug : null;
        } catch {
          return null;
        }
      }),
    ).then((rows) => new Set(rows.filter(Boolean) as string[])),
    Promise.all(
      games.map(async (g) => {
        try {
          const r = await fetchProducts({
            game: g.slug,
            size: 1,
            page: 0,
            ...(effectiveProductType ? { productType: effectiveProductType } : {}),
            ...(bloque ? { bloque } : {}),
            ...(!effectiveProductType ? { excludeSingles: true } : {}),
          });
          return r.totalElements > 0 ? g.slug : null;
        } catch {
          return null;
        }
      }),
    ).then((rows) => new Set(rows.filter(Boolean) as string[])),
  ]);

  const visibleCategories = categories.filter((c) => usedCategorySlugs.has(c.slug));
  const visibleGames = games.filter((g) => usedGameSlugs.has(g.slug));
  const quickGames = quickGameOrder
    .map((slug) => visibleGames.find((g) => g.slug === slug))
    .filter(Boolean);

  const qs = (extra: Record<string, string> = {}) =>
    new URLSearchParams({
      ...(q && { q }),
      ...(category && { category }),
      ...(game && { game }),
      ...(productType && { productType }),
      ...(bloque && { bloque }),
      ...(inStock && { inStock: "true" }),
      ...(preorder && { preorder: "true" }),
      size: String(size),
      ...extra,
    }).toString();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Tienda</h1>
      <p className="mt-2 text-zinc-500">
        Filtra por categoría, juego y disponibilidad.{" "}
        <Link href="/tienda/singles" className="text-ds-mint hover:underline">
          Ver solo singles
        </Link>
      </p>
      {quickGames.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500">Acceso rápido:</span>
          {quickGames.map((g) => (
            <Link
              key={g!.slug}
              href={`/tienda?${qs({ game: g!.slug, page: "0" })}`}
              className={`rounded-full border px-3 py-1.5 ${
                game === g!.slug
                  ? "border-ds-mint bg-ds-mint/15 text-ds-mint"
                  : "border-white/15 text-zinc-300 hover:bg-white/5"
              }`}
            >
              {g!.name}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-zinc-500">Filtro rápido cartas:</span>
        <Link
          href={`/tienda?${qs({ bloque: "PE", page: "0" })}`}
          className={`rounded-full border px-3 py-1.5 ${
            bloque === "PE"
              ? "border-ds-mint bg-ds-mint/15 text-ds-mint"
              : "border-white/15 text-zinc-300 hover:bg-white/5"
          }`}
        >
          PE
        </Link>
        <Link
          href={`/tienda?${qs({ bloque: "PB", page: "0" })}`}
          className={`rounded-full border px-3 py-1.5 ${
            bloque === "PB"
              ? "border-ds-mint bg-ds-mint/15 text-ds-mint"
              : "border-white/15 text-zinc-300 hover:bg-white/5"
          }`}
        >
          PB
        </Link>
        <Link
          href={`/tienda?${qs({ bloque: "", page: "0" })}`}
          className={`rounded-full border px-3 py-1.5 ${
            !bloque
              ? "border-ds-mint bg-ds-mint/15 text-ds-mint"
              : "border-white/15 text-zinc-300 hover:bg-white/5"
          }`}
        >
          Todos
        </Link>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-zinc-500">Tipo rápido:</span>
        <Link
          href={`/tienda?${qs({ productType: "SINGLE_CARD", page: "0" })}`}
          className={`rounded-full border px-3 py-1.5 ${
            productType === "SINGLE_CARD"
              ? "border-ds-mint bg-ds-mint/15 text-ds-mint"
              : "border-white/15 text-zinc-300 hover:bg-white/5"
          }`}
        >
          Solo singles
        </Link>
        <Link
          href={`/tienda?${qs({ productType: "", page: "0" })}`}
          className={`rounded-full border px-3 py-1.5 ${
            !productType
              ? "border-ds-mint bg-ds-mint/15 text-ds-mint"
              : "border-white/15 text-zinc-300 hover:bg-white/5"
          }`}
        >
          Sin singles
        </Link>
      </div>

      <form
        method="get"
        action="/tienda"
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0c0e14] p-4 md:flex-row md:flex-wrap md:items-end"
      >
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-zinc-500">Buscar</span>
          <SearchAutocompleteInput
            name="q"
            defaultValue={q}
            placeholder="Nombre del producto"
            className="rounded-lg border border-white/10 bg-[#07080f] px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Categoría</span>
          <select
            name="category"
            defaultValue={category ?? ""}
            className="rounded-lg border border-white/10 bg-[#07080f] px-3 py-2 text-zinc-100"
          >
            <option value="">Todas</option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Juego</span>
          <select
            name="game"
            defaultValue={game ?? ""}
            className="rounded-lg border border-white/10 bg-[#07080f] px-3 py-2 text-zinc-100"
          >
            <option value="">Todos</option>
            {visibleGames.map((g) => (
              <option key={g.id} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Tipo</span>
          <select
            name="productType"
            defaultValue={productType ?? ""}
            className="rounded-lg border border-white/10 bg-[#07080f] px-3 py-2 text-zinc-100"
          >
            <option value="">Todos</option>
            <option value="SEALED_TCG">TCG sellado</option>
            <option value="SINGLE_CARD">Singles</option>
            <option value="ACCESSORY">Accesorios</option>
            <option value="BOARD_GAME">Juegos de mesa</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Bloque carta</span>
          <select
            name="bloque"
            defaultValue={bloque ?? ""}
            className="rounded-lg border border-white/10 bg-[#07080f] px-3 py-2 text-zinc-100"
          >
            <option value="">Todos</option>
            <option value="PE">PE · Primera Era</option>
            <option value="PB">PB · Primer Bloque</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Mostrar</span>
          <select
            name="size"
            defaultValue={String(size)}
            className="rounded-lg border border-white/10 bg-[#07080f] px-3 py-2 text-zinc-100"
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" name="inStock" value="true" defaultChecked={inStock === true} />
          Solo con stock
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            name="preorder"
            value="true"
            defaultChecked={preorder === true}
          />
          Solo preventas
        </label>
        <button
          type="submit"
          className="ds-btn-primary px-5 py-2 text-sm"
        >
          Aplicar
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-500">
        {data.totalElements} producto{data.totalElements === 1 ? "" : "s"}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.content.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      <div className="mt-10 flex justify-center gap-2">
        {page > 0 && (
          <Link
            href={`/tienda?${qs({ page: String(page - 1) })}`}
            className="rounded-full border border-white/20 px-4 py-2 text-sm"
          >
            Anterior
          </Link>
        )}
        {page + 1 < data.totalPages && (
          <Link
            href={`/tienda?${qs({ page: String(page + 1) })}`}
            className="rounded-full border border-white/20 px-4 py-2 text-sm"
          >
            Siguiente
          </Link>
        )}
      </div>
    </div>
  );
}
