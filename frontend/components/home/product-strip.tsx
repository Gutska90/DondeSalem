import { ProductCard } from "@/components/product/product-card";
import type { ProductSummary } from "@/lib/types";

export function ProductStrip({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ds-border bg-ds-surface/30 py-14 text-center">
        <p className="text-sm text-ds-muted">No hay productos para mostrar en este bloque.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
