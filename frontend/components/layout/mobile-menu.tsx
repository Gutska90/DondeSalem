"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogoLink } from "@/components/layout/brand-logo";
import { MAIN_NAV } from "@/lib/navigation";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-xl border border-ds-border bg-ds-surface/80 md:hidden"
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`h-0.5 w-[22px] rounded-full bg-ds-ink transition duration-300 ease-ds-out ${open ? "translate-y-[7px] rotate-45" : ""}`}
        />
        <span
          className={`h-0.5 w-[22px] rounded-full bg-ds-ink transition duration-300 ${open ? "scale-x-0 opacity-0" : ""}`}
        />
        <span
          className={`h-0.5 w-[22px] rounded-full bg-ds-ink transition duration-300 ease-ds-out ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-ds-page/80 backdrop-blur-md md:hidden"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <nav
            className="fixed inset-y-0 right-0 z-50 flex w-[min(100vw-2.5rem,20rem)] flex-col border-l border-ds-border bg-ds-surface shadow-2xl shadow-black/40 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navegación móvil"
          >
            <div className="border-b border-ds-border px-4 py-4">
              <BrandLogoLink
                size="drawer"
                className="w-full justify-center"
                onClick={() => setOpen(false)}
              />
              <p className="mt-3 text-center font-display text-sm font-semibold text-ds-ink">Menú</p>
            </div>
            <ul className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-[48px] items-center rounded-xl px-4 text-[15px] font-medium text-ds-ink transition hover:bg-ds-elevated"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-ds-border p-4">
              <Link
                href="/carrito"
                className="ds-btn-secondary w-full"
                onClick={() => setOpen(false)}
              >
                Ver carrito
              </Link>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
