import { CategoryGrid } from "@/components/home/category-grid";
import { HeroBanner } from "@/components/home/hero-banner";
import { HomeEventCard } from "@/components/home/home-event-card";
import { ProductStrip } from "@/components/home/product-strip";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  fetchBanners,
  fetchCategories,
  fetchFeatured,
  fetchFeaturedEvents,
  fetchGames,
  fetchProducts,
} from "@/lib/api";

export default async function HomePage() {
  const [featured, banners, events, categories, games, launchesRes, catalogRes] = await Promise.all([
    fetchFeatured(8).catch(() => []),
    fetchBanners().catch(() => []),
    fetchFeaturedEvents().catch(() => []),
    fetchCategories().catch(() => []),
    fetchGames().catch(() => []),
    fetchProducts({ preorder: true, size: 4, page: 0 }).catch(() => ({
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 0,
    })),
    fetchProducts({ size: 60, page: 0 }).catch(() => ({
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 0,
    })),
  ]);

  const heroBanner = banners[0];
  const launches = launchesRes.content ?? [];
  const offerProducts = (catalogRes.content ?? [])
    .filter((p) => p.compareAtPrice != null && p.compareAtPrice > p.price)
    .slice(0, 4);

  return (
    <>
      <HeroBanner
        imageUrl={heroBanner?.imageUrl ?? null}
        imageAlt={heroBanner?.title ?? undefined}
      />

      <Container as="section" className="py-14 md:py-16">
        <SectionHeading
          eyebrow="Catálogo"
          title="Categorías"
          subtitle="Boosters, accesorios, juegos de mesa y más. Filtra por lo que jugás."
          action={{ href: "/tienda", label: "Ver todo el catálogo" }}
        />
        <div className="mt-10">
          <CategoryGrid categories={categories} />
        </div>
      </Container>

      <section className="ds-section-muted py-14 md:py-16">
        <Container>
          <SectionHeading
            eyebrow="Selección"
            title="Productos destacados"
            subtitle="Lo más buscado y novedades que vale la pena tener en la mochila."
            action={{ href: "/tienda", label: "Ir a la tienda" }}
          />
          <div className="mt-10">
            <ProductStrip products={featured} />
          </div>
        </Container>
      </section>

      <Container as="section" className="py-14 md:py-16">
        <SectionHeading
          eyebrow="Agenda"
          title="Próximos eventos"
          subtitle="Torneos, leagues y jornadas en la tienda. Cupos limitados."
          action={{ href: "/eventos", label: "Calendario completo" }}
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-ds-border bg-ds-surface/30 py-12 text-center text-sm text-ds-muted">
              Pronto publicaremos nuevas fechas. ¡Seguinos en redes!
            </p>
          )}
          {events.map((e) => (
            <HomeEventCard key={e.id} event={e} />
          ))}
        </div>
      </Container>

      <section className="ds-section-elevated py-14 md:py-16">
        <Container>
          <SectionHeading
            eyebrow="Lanzamientos"
            title="Preventas y próximos lanzamientos"
            subtitle="Reservá antes que llegue a mesa. Fechas y stock sujetos a distribuidor."
            action={{ href: "/preventas", label: "Todas las preventas" }}
          />
          <div className="mt-10">
            <ProductStrip products={launches} />
          </div>
        </Container>
      </section>

      <Container as="section" className="py-14 md:py-16">
        <SectionHeading
          eyebrow="Promos"
          title="Ofertas del momento"
          subtitle="Precios rebajados en accesorios y productos seleccionados."
          action={{ href: "/ofertas", label: "Ver todas las ofertas" }}
        />
        <div className="mt-10">
          <ProductStrip products={offerProducts} />
        </div>
      </Container>

      <section className="border-t border-ds-border bg-ds-page py-14 md:py-16">
        <Container>
          <SectionHeading
            eyebrow="Franquicias"
            title="Jugá tu TCG favorito"
            subtitle="Filtrá el catálogo por juego: Pokémon, Magic, Yu-Gi-Oh!, One Piece y más."
          />
          <div className="mt-8 flex flex-wrap gap-2.5">
            {games.map((g) => (
              <a
                key={g.id}
                href={`/tienda?game=${encodeURIComponent(g.slug)}`}
                className="rounded-full border border-ds-border-strong bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-ds-ink/90 shadow-ds-inner transition duration-300 ease-ds-out hover:border-ds-accent/35 hover:bg-ds-accent-muted/40 hover:text-ds-ink"
              >
                {g.name}
              </a>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
