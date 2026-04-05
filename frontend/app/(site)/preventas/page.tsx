import { ProductCard } from "@/components/product/product-card";
import { fetchProducts } from "@/lib/api";
import type { ProductSummary } from "@/lib/types";

export default async function PreventasPage() {
  const data = await fetchProducts({ preorder: true, size: 24, page: 0 }).catch(() => ({
    content: [] as ProductSummary[],
    totalElements: 0,
    totalPages: 0,
    page: 0,
    size: 24,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Preventas</h1>
      <p className="mt-2 text-zinc-500">Reservas y próximos lanzamientos.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.content.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}
