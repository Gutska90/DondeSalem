import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { fetchCategories, fetchGames, fetchProducts } from "@/lib/api";
import type { ProductSummary } from "@/lib/types";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TiendaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const game = typeof sp.game === "string" ? sp.game : undefined;
  const pageRaw = typeof sp.page === "string" ? parseInt(sp.page, 10) : 0;
  const page = Number.isFinite(pageRaw) && pageRaw >= 0 ? pageRaw : 0;
  const inStock = sp.inStock === "true" ? true : undefined;
  const preorder = sp.preorder === "true" ? true : undefined;

  const [data, categories, games] = await Promise.all([
    fetchProducts({
      q,
      category,
      game,
      page,
      size: 12,
      inStock,
      preorder,
    }).catch(() => ({
      content: [] as ProductSummary[],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 12,
    })),
    fetchCategories().catch(() => []),
    fetchGames().catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Tienda</h1>
      <p className="mt-2 text-zinc-500">Filtra por categoría, juego y disponibilidad.</p>

      <form
        method="get"
        action="/tienda"
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0c0e14] p-4 md:flex-row md:flex-wrap md:items-end"
      >
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-zinc-500">Buscar</span>
          <input
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
            {categories.map((c) => (
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
            href={`/tienda?${new URLSearchParams({
              ...(q && { q }),
              ...(category && { category }),
              ...(game && { game }),
              ...(inStock && { inStock: "true" }),
              ...(preorder && { preorder: "true" }),
              page: String(page - 1),
            }).toString()}`}
            className="rounded-full border border-white/20 px-4 py-2 text-sm"
          >
            Anterior
          </Link>
        )}
        {page + 1 < data.totalPages && (
          <Link
            href={`/tienda?${new URLSearchParams({
              ...(q && { q }),
              ...(category && { category }),
              ...(game && { game }),
              ...(inStock && { inStock: "true" }),
              ...(preorder && { preorder: "true" }),
              page: String(page + 1),
            }).toString()}`}
            className="rounded-full border border-white/20 px-4 py-2 text-sm"
          >
            Siguiente
          </Link>
        )}
      </div>
    </div>
  );
}
