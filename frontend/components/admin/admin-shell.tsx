"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/juegos", label: "Juegos TCG" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/stock", label: "Stock" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/promociones", label: "Promociones" },
  { href: "/admin/contacto", label: "Contacto" },
] as const;

function NavLink({
  href,
  label,
  exact,
  onNavigate,
}: {
  href: string;
  label: string;
  exact?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
          : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
      }`}
    >
      {label}
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-500">
        Cargando sesión…
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
        <p className="text-lg text-slate-300">Necesitás una cuenta de administrador.</p>
        <Link
          href="/auth/login"
          className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Ir a iniciar sesión
        </Link>
        <Link href="/" className="mt-4 text-sm text-slate-500 hover:text-slate-300">
          Volver al sitio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md lg:hidden">
        <div className="flex min-h-[3.75rem] items-center justify-between gap-2 px-4 py-2">
          <Link href="/" className="flex shrink-0 items-center rounded-xl bg-white/95 px-2 py-1.5 ring-1 ring-white/10">
            <Image
              src="/logo-dondesalem.png"
              alt="Donde Salem"
              width={200}
              height={80}
              className="h-12 w-auto object-contain"
            />
          </Link>
          <span className="truncate text-xs font-semibold text-emerald-400/90">Admin</span>
          <button
            type="button"
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            Menú
          </button>
        </div>
        {open && (
          <nav className="border-t border-slate-800 px-2 py-3 space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                onNavigate={() => setOpen(false)}
              />
            ))}
            <Link
              href="/"
              className="mt-2 block rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-300"
              onClick={() => setOpen(false)}
            >
              ← Sitio público
            </Link>
          </nav>
        )}
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden w-56 shrink-0 border-r border-slate-800 bg-slate-900/30 lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto">
          <div className="p-5">
            <Link
              href="/"
              className="inline-flex rounded-2xl bg-white/95 p-2 ring-1 ring-white/10 transition hover:bg-white"
            >
              <Image
                src="/logo-dondesalem.png"
                alt="Donde Salem — TCG Store"
                width={320}
                height={128}
                className="h-20 w-auto max-w-[min(100%,240px)] object-contain"
              />
            </Link>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-emerald-500/90">Panel</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <nav className="space-y-0.5 px-3 pb-8">
            {NAV.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
            <Link
              href="/"
              className="mt-6 block rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-800/60 hover:text-slate-300"
            >
              ← Volver al sitio público
            </Link>
          </nav>
        </aside>

        <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
