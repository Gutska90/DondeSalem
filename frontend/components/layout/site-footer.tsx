import Link from "next/link";
import { BrandLogoLink } from "@/components/layout/brand-logo";
import { WHATSAPP_URL } from "@/lib/config";
import { FOOTER_NAV, LEGAL_LINKS } from "@/lib/navigation";

const FOOTER_WHATSAPP = WHATSAPP_URL ?? "https://wa.me/56900000000";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ds-border bg-ds-page">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="lg:col-span-2">
            <BrandLogoLink size="footer" />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ds-muted">
              Cartas coleccionables y juegos de mesa con stock real. Preventas, torneos y todo lo que
              necesitás para jugar en serio.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-lg border border-ds-border bg-ds-gold-soft px-3 py-1.5 text-xs font-medium text-ds-gold">
                Pokémon · MTG · Yu-Gi-Oh!
              </span>
              <span className="rounded-lg border border-ds-border bg-white/[0.03] px-3 py-1.5 text-xs text-ds-muted">
                One Piece TCG
              </span>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ds-subtle">
              Navegación
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {FOOTER_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ds-muted transition hover:text-ds-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ds-subtle">
              Contacto
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  className="text-ds-muted transition hover:text-ds-holo"
                  href={FOOTER_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  className="text-ds-muted transition hover:text-ds-ink"
                  href="mailto:hola@dondesalem.cl"
                >
                  hola@dondesalem.cl
                </a>
              </li>
              <li className="text-ds-subtle">Santiago, Chile</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-ds-border px-4 py-6 text-center text-xs text-ds-subtle">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {LEGAL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ds-muted transition hover:text-ds-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mt-4">
          © {new Date().getFullYear()} DondeSalem. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
