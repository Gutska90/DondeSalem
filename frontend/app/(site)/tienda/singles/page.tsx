import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { SearchAutocompleteInput } from "@/components/ui/search-autocomplete-input";
import { fetchCategories, fetchGames, fetchProducts } from "@/lib/api";
import { spStr } from "@/lib/search-params";
import type { ProductSummary } from "@/lib/types";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SinglesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = spStr(sp.q);
  const category = spStr(sp.category);
  const game = spStr(sp.game);
  const cardName = spStr(sp.cardName);
  const setName = spStr(sp.setName);
  const bloqueRaw = spStr(sp.bloque) ?? spStr(sp.era);
  const bloque = bloqueRaw === "PB" ? "PB" : "PE";
  const rarity = spStr(sp.rarity);
  const condition = spStr(sp.condition);
  const language = spStr(sp.language);
  const finishType = spStr(sp.finishType);
  const pageRaw = spStr(sp.page);
  const parsedPage = pageRaw != null ? parseInt(pageRaw, 10) : 0;
  const page = Number.isFinite(parsedPage) && parsedPage >= 0 ? parsedPage : 0;
  const sizeRaw = spStr(sp.size);
  const parsedSize = sizeRaw != null ? parseInt(sizeRaw, 10) : 12;
  const size = [12, 24, 48].includes(parsedSize) ? parsedSize : 12;
  /** Por defecto ocultar agotados; `showAll=1` lista también sin stock. */
  const showAll = spStr(sp.showAll) === "1";
  const inStock = showAll ? undefined : true;
  const minPriceRaw = (spStr(sp.minPrice) ?? "").trim();
  const maxPriceRaw = (spStr(sp.maxPrice) ?? "").trim();
  const minPrice = minPriceRaw !== "" ? Number(minPriceRaw) : undefined;
  const maxPrice = maxPriceRaw !== "" ? Number(maxPriceRaw) : undefined;

  const [data, categories, games] = await Promise.all([
    fetchProducts({
      q,
      category,
      game,
      productType: "SINGLE_CARD",
      cardName,
      setName,
      rarity,
      condition,
      language,
      finishType,
      bloque,
      page,
      size,
      inStock,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
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
  const hiddenCategoryTokens = [
    String.fromCharCode(115, 116, 114, 105, 98, 111, 103),
    String.fromCharCode(109, 121, 108, 115, 101, 114, 101, 110, 97),
  ];
  const visibleCategories = categories.filter((c) => {
    const haystack = `${c.name} ${c.slug}`.toLowerCase();
    return hiddenCategoryTokens.every((token) => !haystack.includes(token));
  });

  const qs = (extra: Record<string, string> = {}) =>
    new URLSearchParams({
      ...(q && { q }),
      ...(category && { category }),
      ...(game && { game }),
      ...(cardName && { cardName }),
      ...(setName && { setName }),
      ...(bloque && { bloque }),
      ...(rarity && { rarity }),
      ...(condition && { condition }),
      ...(language && { language }),
      ...(finishType && { finishType }),
      size: String(size),
      ...(showAll && { showAll: "1" }),
      ...(minPriceRaw !== "" && { minPrice: minPriceRaw }),
      ...(maxPriceRaw !== "" && { maxPrice: maxPriceRaw }),
      ...extra,
    }).toString();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-sm text-zinc-500">
        <Link href="/tienda" className="hover:text-white">
          Tienda
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-300">Singles</span>
      </nav>

      <h1 className="mt-6 font-display text-3xl font-bold text-white">Singles · cartas sueltas</h1>
      <p className="mt-2 text-zinc-500">
        Cada publicación es una variante exacta (estado, idioma, acabado).{" "}
        <Link href="/tienda" className="text-ds-mint hover:underline">
          Catálogo completo
        </Link>
      </p>
      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-ds-mint/35 bg-ds-mint/10 px-3 py-1.5 text-xs font-semibold text-ds-mint">
        <span className="inline-block h-2 w-2 rounded-full bg-ds-mint" />
        Mostrando Singles {bloque}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/tienda/singles?${qs({ bloque: "PE", page: "0" })}`}
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${
            bloque === "PE"
              ? "border-ds-mint bg-ds-mint/15 text-ds-mint"
              : "border-white/15 text-zinc-300 hover:bg-white/5"
          }`}
        >
          Singles PE
        </Link>
        <Link
          href={`/tienda/singles?${qs({ bloque: "PB", page: "0" })}`}
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${
            bloque === "PB"
              ? "border-ds-mint bg-ds-mint/15 text-ds-mint"
              : "border-white/15 text-zinc-300 hover:bg-white/5"
          }`}
        >
          Singles PB
        </Link>
      </div>

      <form
        method="get"
        action="/tienda/singles"
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0c0e14] p-4 md:flex-row md:flex-wrap md:items-end"
      >
        <input type="hidden" name="bloque" value={bloque} />
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-zinc-500">Buscar (nombre o listing)</span>
          <SearchAutocompleteInput
            name="q"
            defaultValue={q}
            placeholder="Nombre del producto"
            className="rounded-lg border border-white/10 bg-[#07080f] px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Nombre carta</span>
          <input
            name="cardName"
            defaultValue={cardName}
            placeholder="Ej. Charizard"
            className="rounded-lg border border-white/10 bg-[#07080f] px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Set</span>
          <input
            name="setName"
            defaultValue={setName}
            placeholder="Expansión"
            className="rounded-lg border border-white/10 bg-[#07080f] px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Rareza (contiene)</span>
          <input
            name="rarity"
            defaultValue={rarity}
            placeholder="Ej. MR, Legendaria…"
            className="rounded-lg border border-white/10 bg-[#07080f] px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Precio mín. (CLP)</span>
          <input
            name="minPrice"
            type="number"
            min={0}
            step={1}
            defaultValue={minPriceRaw}
            placeholder="0"
            className="rounded-lg border border-white/10 bg-[#07080f] px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Precio máx. (CLP)</span>
          <input
            name="maxPrice"
            type="number"
            min={0}
            step={1}
            defaultValue={maxPriceRaw}
            placeholder="Sin tope"
            className="rounded-lg border border-white/10 bg-[#07080f] px-3 py-2 text-zinc-100"
          />
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
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Estado</span>
          <input
            name="condition"
            defaultValue={condition}
            placeholder="NM, LP…"
            className="rounded-lg border border-white/10 bg-[#07080f] px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Idioma</span>
          <input
            name="language"
            defaultValue={language}
            className="rounded-lg border border-white/10 bg-[#07080f] px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Acabado</span>
          <input
            name="finishType"
            defaultValue={finishType}
            placeholder="Normal, Foil…"
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
            {games.map((g) => (
              <option key={g.id} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" name="showAll" value="1" defaultChecked={showAll} />
          Mostrar también agotados
        </label>
        <button type="submit" className="ds-btn-primary px-5 py-2 text-sm">
          Aplicar
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-500">
        {data.totalElements} resultado{data.totalElements === 1 ? "" : "s"}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.content.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      <div className="mt-10 flex justify-center gap-2">
        {page > 0 && (
          <Link
            href={`/tienda/singles?${qs({ page: String(page - 1) })}`}
            className="rounded-full border border-white/20 px-4 py-2 text-sm"
          >
            Anterior
          </Link>
        )}
        {page + 1 < data.totalPages && (
          <Link
            href={`/tienda/singles?${qs({ page: String(page + 1) })}`}
            className="rounded-full border border-white/20 px-4 py-2 text-sm"
          >
            Siguiente
          </Link>
        )}
      </div>
    </div>
  );
}
