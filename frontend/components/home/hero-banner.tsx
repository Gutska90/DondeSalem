import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SafeImage } from "@/components/ui/safe-image";

type Props = {
  imageUrl: string | null;
  imageAlt?: string | null;
};

export function HeroBanner({ imageUrl, imageAlt }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-ds-border bg-ds-page">
      <div className="pointer-events-none absolute inset-0 bg-ds-radial-hero" />
      <div className="ds-bg-grid ds-noise absolute inset-0 opacity-[0.55]" />
      <Container as="div" className="relative py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 space-y-6 lg:order-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-ds-border bg-ds-surface/60 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-ds-muted backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-ds-accent shadow-[0_0_10px_rgba(139,61,255,0.9)]" />
              TCG · Mesa · Comunidad
            </p>
            <h1 className="font-display text-display-sm font-extrabold text-balance text-ds-ink sm:text-display lg:text-display-lg">
              Tu próxima partida empieza{" "}
              <span className="bg-gradient-to-r from-ds-accent via-ds-accent-hover to-ds-mint bg-clip-text text-transparent">
                aquí
              </span>
            </h1>
            <p className="max-w-lg text-[15px] leading-relaxed text-ds-muted sm:text-base">
              Stock real, preventas y torneos. Fundas, deck boxes, playmats y los juegos que
              seguís coleccionando.
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href="/tienda" className="ds-btn-gradient text-center sm:text-left">
                Explorar tienda
              </Link>
              <Link href="/eventos" className="ds-btn-secondary px-8 text-center sm:text-left">
                Ver eventos
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="rounded-2xl bg-gradient-to-br from-ds-accent/45 via-ds-accent/15 to-ds-mint/35 p-[1px] shadow-ds-glow sm:rounded-3xl">
              <div className="relative overflow-hidden rounded-[15px] border border-ds-border/80 bg-ds-surface sm:rounded-[23px]">
                <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:min-h-[300px] lg:aspect-auto">
                {imageUrl ? (
                  <>
                    <SafeImage
                      src={imageUrl}
                      alt={imageAlt ?? "Promoción DondeSalem"}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width:1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-ds-page via-transparent to-ds-mint/5" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
                  </>
                ) : (
                  <div className="flex h-full min-h-[220px] flex-col items-center justify-center bg-ds-mesh p-10 text-center sm:min-h-[280px]">
                    <span className="font-display text-xl font-bold text-ds-subtle sm:text-2xl">
                      DondeSalem
                    </span>
                    <span className="mt-2 text-sm text-ds-muted">Promo banner</span>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
