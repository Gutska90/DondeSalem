import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import type { ProductSummary } from "@/lib/types";
import { formatCLP } from "@/lib/format";

export function ProductCard({ p }: { p: ProductSummary }) {
  const href = `/producto/${p.slug}`;
  const img = p.primaryImageUrl ?? "/placeholder-product.svg";
  const out = p.stockQuantity <= 0 && !p.preorder;
  const onSale = p.compareAtPrice != null && p.compareAtPrice > p.price;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-ds-border bg-gradient-to-b from-ds-elevated/90 to-ds-surface/95 shadow-ds-card transition duration-300 ease-ds-out hover:-translate-y-0.5 hover:border-ds-accent/25 hover:shadow-ds-card-hover"
    >
      <Link
        href={href}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ds-page"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ds-page">
          <SafeImage
            src={img}
            alt={p.name}
            fill
            className="object-cover transition duration-500 ease-ds-out group-hover:scale-[1.045]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ds-page/90 via-transparent to-transparent opacity-80" />
          {p.preorder && (
            <span className="absolute left-3 top-3 rounded-md bg-indigo-600/95 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg ring-1 ring-white/10">
              Preventa
            </span>
          )}
          {onSale && !p.preorder && (
            <span className="absolute right-3 top-3 rounded-md bg-ds-mint px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-ds-page shadow-md ring-1 ring-ds-mint/40">
              Oferta
            </span>
          )}
          {out && (
            <span className="absolute inset-0 flex items-center justify-center bg-ds-page/75 text-xs font-bold uppercase tracking-[0.15em] text-ds-ink backdrop-blur-[3px]">
              Agotado
            </span>
          )}
        </div>
        <div className="border-t border-ds-border/80 p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ds-subtle">
            {[p.gameName, p.categoryName].filter(Boolean).join(" · ")}
          </p>
          <h3 className="mt-2 line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug text-ds-ink">
            {p.name}
          </h3>
          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold tabular-nums text-ds-mint">{formatCLP(p.price)}</span>
            {onSale && (
              <span className="text-sm tabular-nums text-ds-muted line-through">
                {formatCLP(p.compareAtPrice!)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
