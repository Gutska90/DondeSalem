import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product/product-card";
import { fetchFeatured, fetchProductBySlug, fetchProducts } from "@/lib/api";
import { formatCLP } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  let product;
  try {
    product = await fetchProductBySlug(slug);
  } catch {
    notFound();
  }

  const related =
    product.gameSlug != null
      ? (await fetchProducts({ game: product.gameSlug, size: 8, page: 0 }))
          .content.filter((x) => x.slug !== product.slug)
          .slice(0, 3)
      : (await fetchFeatured(8)).filter((x) => x.slug !== product.slug).slice(0, 3);

  const mainImg = product.images?.[0]?.url ?? "/placeholder-product.svg";
  const out = product.stockQuantity <= 0 && !product.preorder;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-sm text-zinc-500">
        <Link href="/tienda" className="hover:text-white">
          Tienda
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-300">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[#12141c]">
          <SafeImage src={mainImg} alt={product.name} fill className="object-contain p-6" priority />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            {[product.gameName, product.categoryName].filter(Boolean).join(" · ")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-semibold tabular-nums text-ds-mint">{formatCLP(product.price)}</span>
            {product.compareAtPrice != null && product.compareAtPrice > product.price && (
              <span className="text-xl text-zinc-500 line-through">
                {formatCLP(product.compareAtPrice)}
              </span>
            )}
          </div>
          {product.preorder && (
            <p className="mt-3 rounded-lg border border-ds-accent/35 bg-ds-accent-muted/40 px-3 py-2 text-sm text-ds-ink">
              Preventa
              {product.preorderReleaseDate
                ? ` — salida estimada: ${product.preorderReleaseDate}`
                : ""}
            </p>
          )}
          <p className="mt-2 text-sm text-zinc-400">
            Stock: {out ? <span className="text-red-400">Agotado</span> : product.stockQuantity} unidades
          </p>
          <div className="mt-8 border-t border-white/10 pt-6">
            <AddToCartButton productId={product.id} maxQty={product.stockQuantity} disabled={out} />
          </div>
          {product.description && (
            <div className="mt-10">
              <h2 className="font-display text-lg font-semibold text-white">Descripción</h2>
              <p className="mt-3 whitespace-pre-wrap text-zinc-400">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-bold text-white">Relacionados</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
