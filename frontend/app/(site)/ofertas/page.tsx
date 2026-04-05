import { ProductCard } from "@/components/product/product-card";
import { fetchProducts } from "@/lib/api";
import type { ProductSummary } from "@/lib/types";

export default async function OfertasPage() {
  const data = await fetchProducts({ size: 48, page: 0 }).catch(() => ({
    content: [] as ProductSummary[],
    totalElements: 0,
    totalPages: 0,
    page: 0,
    size: 48,
  }));
  const onSale = data.content.filter(
    (p) => p.compareAtPrice != null && p.compareAtPrice > p.price,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Ofertas</h1>
      <p className="mt-2 text-zinc-500">Productos con precio rebajado.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {onSale.length === 0 && <p className="text-zinc-500">No hay ofertas activas ahora.</p>}
        {onSale.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}
