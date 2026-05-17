"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";

export function UserAccountMenu() {
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (loading || !user) return null;

  const initial = user.firstName?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-ds-border bg-ds-surface/60 px-2 py-1.5 text-sm transition hover:bg-white/[0.05]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {user.profilePictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profilePictureUrl}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ds-elevated-2 text-xs font-semibold">
            {initial}
          </span>
        )}
        <span className="max-w-[8rem] truncate font-medium text-ds-ink">{user.firstName}</span>
        <span className="text-ds-subtle" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-ds-border bg-ds-surface py-1 shadow-xl shadow-black/40"
        >
          <p className="border-b border-ds-border px-3 py-2 text-xs text-ds-muted truncate">
            {user.email}
          </p>
          <MenuLink href="/cuenta" onClose={() => setOpen(false)}>
            Mi cuenta
          </MenuLink>
          <MenuLink href="/cuenta#pedidos" onClose={() => setOpen(false)}>
            Mis pedidos
          </MenuLink>
          <MenuLink href="/cuenta#seguridad" onClose={() => setOpen(false)}>
            Seguridad {user.totpEnabled ? "· 2FA" : ""}
          </MenuLink>
          <MenuLink href="/carrito" onClose={() => setOpen(false)}>
            Carrito
          </MenuLink>
          {user.role === "ADMIN" && (
            <MenuLink href="/admin" onClose={() => setOpen(false)}>
              Panel admin
            </MenuLink>
          )}
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2.5 text-left text-sm text-ds-muted transition hover:bg-white/[0.05] hover:text-red-300"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  children,
  onClose,
}: {
  href: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="block px-3 py-2.5 text-sm text-ds-ink transition hover:bg-white/[0.05]"
      onClick={onClose}
    >
      {children}
    </Link>
  );
}
