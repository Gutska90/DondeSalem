import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import type { ProductSummary } from "@/lib/types";
import { formatCLP } from "@/lib/format";

function typeLabel(pt: ProductSummary["productType"]) {
  const t = pt ?? "SEALED_TCG";
  switch (t) {
    case "SINGLE_CARD":
      return "Single";
    case "ACCESSORY":
      return "Accesorio";
    case "BOARD_GAME":
      return "Juego de mesa";
    default:
      return null;
  }
}

export function ProductCard({ p }: { p: ProductSummary }) {
  const href = `/producto/${p.slug}`;
  const img = p.primaryImageUrl ?? "/placeholder-product.svg";
  const out = p.stockQuantity <= 0 && !p.preorder;
  const onSale = p.compareAtPrice != null && p.compareAtPrice > p.price;
  const pt = p.productType ?? "SEALED_TCG";
  const isSingle = pt === "SINGLE_CARD";
  const typeBadge = typeLabel(p.productType);
  const sc = p.singleCard;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-ds-border bg-gradient-to-b from-ds-elevated/90 to-ds-surface/95 shadow-ds-card transition duration-300 ease-ds-out hover:-translate-y-0.5 hover:border-ds-accent/25 hover:shadow-ds-card-hover"
    >
      <Link
        href={href}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ds-page"
      >
        <div
          className={`relative w-full overflow-hidden bg-ds-page ${
            isSingle ? "aspect-[63/88]" : "aspect-[4/3]"
          }`}
        >
          <SafeImage
            src={img}
            alt={p.name}
            fill
            className="object-contain object-center p-2 transition duration-500 ease-ds-out group-hover:brightness-[1.06] sm:p-3"
            sizes="(max-width:768px) 50vw, 33vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ds-page/90 via-transparent to-transparent opacity-80" />
          <div className="pointer-events-none absolute left-3 top-3 flex max-w-[70%] flex-col gap-1">
            {typeBadge && (
              <span className="w-fit rounded-md bg-fuchsia-700/95 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg ring-1 ring-white/10">
                {typeBadge}
              </span>
            )}
            {p.preorder && (
              <span className="w-fit rounded-md bg-indigo-600/95 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg ring-1 ring-white/10">
                Preventa
              </span>
            )}
          </div>
          {onSale && !p.preorder && (
            <span className="absolute right-3 top-3 rounded-md bg-ds-mint px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-ds-page shadow-md ring-1 ring-ds-mint/40">
              Oferta
            </span>
          )}
          {out && (
            <span
              className="pointer-events-none absolute bottom-2 left-1/2 z-[1] -translate-x-1/2 rounded-md border border-white/15 bg-zinc-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-lg ring-1 ring-black/30 backdrop-blur-[2px]"
              title="Sin stock"
            >
              Agotado
            </span>
          )}
        </div>
        <div className="border-t border-ds-border/80 p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ds-subtle">
            {[p.gameName, p.categoryName].filter(Boolean).join(" · ")}
          </p>
          {pt === "SINGLE_CARD" && sc && (
            <p className="mt-1 line-clamp-1 text-xs text-ds-muted">
              {[sc.setName, sc.cardNumber].filter(Boolean).join(" · ")}
              {sc.rarity ? ` · ${sc.rarity}` : ""}
              {sc.finishType ? ` · ${sc.finishType}` : ""}
            </p>
          )}
          <h3 className="mt-2 line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug text-ds-ink">
            {pt === "SINGLE_CARD" && sc?.cardName ? sc.cardName : p.name}
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
