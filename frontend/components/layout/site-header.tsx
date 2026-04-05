"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { BrandLogoLink } from "@/components/layout/brand-logo";
import { MAIN_NAV } from "@/lib/navigation";
import { MobileMenu } from "@/components/layout/mobile-menu";

export function SiteHeader() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-ds-border bg-ds-page/90 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4 md:py-6 lg:px-8 lg:py-7">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-initial md:gap-3">
          <MobileMenu />
          <BrandLogoLink priority className="shrink" />
        </div>

        <nav className="hidden items-center gap-0.5 md:flex lg:gap-1" aria-label="Principal">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ds-muted transition hover:bg-white/[0.05] hover:text-ds-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Link href="/carrito" className="ds-btn-ghost hidden sm:inline-flex">
            Carrito
          </Link>
          {!loading && user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden rounded-lg bg-ds-elevated-2 px-3 py-2 text-xs font-semibold text-ds-ink ring-1 ring-ds-border sm:inline-flex"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/cuenta"
                className="hidden text-sm font-medium text-ds-muted transition hover:text-ds-ink sm:inline"
              >
                Cuenta
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="hidden text-sm text-ds-subtle transition hover:text-ds-muted sm:inline"
              >
                Salir
              </button>
            </>
          ) : (
            !loading && (
              <Link href="/auth/login" className="ds-btn-primary px-5 py-2.5 text-[13px]">
                Entrar
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
