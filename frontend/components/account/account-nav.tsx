"use client";

import Link from "next/link";
import type { User } from "@/lib/types";

const LINKS = [
  { href: "/cuenta#resumen", label: "Resumen" },
  { href: "/cuenta#pedidos", label: "Mis pedidos" },
  { href: "/cuenta#seguridad", label: "Seguridad" },
] as const;

type Props = {
  user: User;
  onLogout: () => void;
};

export function AccountNav({ user, onLogout }: Props) {
  return (
    <nav
      className="rounded-2xl border border-white/10 bg-[#0c0e14]/80 p-4"
      aria-label="Menú de cuenta"
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        {user.profilePictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profilePictureUrl}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-full border border-white/10 object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ds-elevated-2 text-lg font-semibold text-ds-ink">
            {user.firstName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
          <AccountBadges user={user} />
        </div>
      </div>
      <ul className="mt-4 space-y-0.5">
        {LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/carrito"
            className="block rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
          >
            Carrito
          </Link>
        </li>
        <li>
          <Link
            href="/tienda"
            className="block rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
          >
            Seguir comprando
          </Link>
        </li>
        {user.role === "ADMIN" && (
          <li>
            <Link
              href="/admin"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ds-accent transition hover:bg-white/[0.06]"
            >
              Panel admin
            </Link>
          </li>
        )}
      </ul>
      <button
        type="button"
        onClick={onLogout}
        className="mt-4 w-full rounded-lg border border-white/10 px-3 py-2.5 text-left text-sm text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-200"
      >
        Cerrar sesión
      </button>
    </nav>
  );
}

function AccountBadges({ user }: { user: User }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {user.authProvider === "GOOGLE" && (
        <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
          Google
        </span>
      )}
      {user.totpEnabled && (
        <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
          2FA activo
        </span>
      )}
    </div>
  );
}
