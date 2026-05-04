import Link from "next/link";
import type { Metadata } from "next";
import { SafeImage } from "@/components/ui/safe-image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product/product-card";
import { fetchFeatured, fetchProductBySlug, fetchProducts } from "@/lib/api";
import { SITE_URL } from "@/lib/config";
import { formatCLP } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

/** Sugerencias distintas en cada visita (mezcla); el listado API viene ordenado fijo por fecha. */
export const dynamic = "force-dynamic";

const RELATED_COUNT = 9;
const RELATED_POOL_SIZE = 48;

function sanitizeCatalogText(raw: string): string {
  const tokens = [
    String.fromCharCode(109, 121, 108, 115, 101, 114, 101, 110, 97),
    String.fromCharCode(115, 116, 114, 105, 98, 111, 103),
  ];
  let next = raw;
  for (const token of tokens) {
    next = next.replace(new RegExp(token, "gi"), "");
  }
  return next.replace(/\s{2,}/g, " ").trim();
}

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = t;
  }
}

function pickRelatedProducts<T extends { slug: string }>(
  content: T[],
  excludeSlug: string,
  max: number,
): T[] {
  const filtered = content.filter((x) => x.slug !== excludeSlug);
  shuffleInPlace(filtered);
  return filtered.slice(0, max);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await fetchProductBySlug(slug);
    const titleBase =
      product.productType === "SINGLE_CARD" && product.singleCardDetails?.cardName
        ? product.singleCardDetails.cardName
        : product.name;
    const title = `${titleBase} | DondeSalem`;
    const cleanDescription = product.description ? sanitizeCatalogText(product.description) : "";
    const description =
      cleanDescription.slice(0, 155) ||
      [product.gameName, product.categoryName, formatCLP(product.price)].filter(Boolean).join(" · ") ||
      `${titleBase} en DondeSalem.`;
    const ogImage = product.images?.[0]?.url;
    return {
      title,
      description,
      openGraph: {
        title: titleBase,
        description,
        type: "website",
        url: `${SITE_URL}/producto/${slug}`,
        siteName: "DondeSalem",
        locale: "es_CL",
        images: ogImage ? [{ url: ogImage, alt: titleBase }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: titleBase,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
    };
  } catch {
    return { title: "Producto | DondeSalem" };
  }
}

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
      ? pickRelatedProducts(
          (
            await fetchProducts({
              game: product.gameSlug,
              ...(product.productType === "SINGLE_CARD"
                ? { productType: "SINGLE_CARD" as const, inStock: true as const }
                : { inStock: true as const }),
              size: RELATED_POOL_SIZE,
              page: 0,
            })
          ).content,
          product.slug,
          RELATED_COUNT,
        )
      : pickRelatedProducts(await fetchFeatured(RELATED_POOL_SIZE), product.slug, RELATED_COUNT);

  const mainImg = product.images?.[0]?.url ?? "/placeholder-product.svg";
  const out = product.stockQuantity <= 0 && !product.preorder;
  const isSingle = product.productType === "SINGLE_CARD";

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
        <div
          className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#12141c] ${
            isSingle
              ? "aspect-[63/88] max-w-md mx-auto lg:mx-0"
              : "aspect-square max-w-xl mx-auto lg:mx-0"
          }`}
        >
          <SafeImage
            src={mainImg}
            alt={product.name}
            fill
            className="object-contain object-center p-4 sm:p-6"
            priority
          />
          {out && (
            <span
              className="pointer-events-none absolute bottom-3 left-1/2 z-[1] -translate-x-1/2 rounded-md border border-white/15 bg-black/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-lg ring-1 ring-black/40 backdrop-blur-sm"
              title="Sin stock"
            >
              Agotado
            </span>
          )}
        </div>
        <div>
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            {[product.gameName, product.categoryName].filter(Boolean).join(" · ")}
          </p>
          {product.productType === "SINGLE_CARD" && (
            <span className="mt-2 inline-block rounded-md bg-fuchsia-900/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-fuchsia-100 ring-1 ring-fuchsia-500/40">
              Single
            </span>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
            {product.productType === "SINGLE_CARD" && product.singleCardDetails?.cardName
              ? product.singleCardDetails.cardName
              : product.name}
          </h1>
          {product.productType === "SINGLE_CARD" && product.singleCardDetails && (
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {[
                ["Set", product.singleCardDetails.setName],
                ["N.º", product.singleCardDetails.cardNumber],
                ["Rareza", product.singleCardDetails.rarity],
                ["Estado", product.singleCardDetails.condition],
                ["Idioma", product.singleCardDetails.language],
                ["Acabado", product.singleCardDetails.finishType],
                ["Edición", product.singleCardDetails.editionType],
                ["Artista", product.singleCardDetails.artist],
                ["Grado / cert.", product.singleCardDetails.gradeOrCertification],
              ]
                .filter(([, v]) => v != null && String(v).trim() !== "")
                .map(([k, v]) => (
                  <div key={k} className="flex gap-2 border-b border-white/5 pb-2">
                    <dt className="w-28 shrink-0 text-zinc-500">{k}</dt>
                    <dd className="text-zinc-200">{v}</dd>
                  </div>
                ))}
            </dl>
          )}
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
              <p className="mt-3 whitespace-pre-wrap text-zinc-400">
                {sanitizeCatalogText(product.description)}
              </p>
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
