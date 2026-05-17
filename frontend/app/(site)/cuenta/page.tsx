"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { TwoFaSettings } from "@/components/two-fa-settings";
import { useAuth } from "@/components/auth-provider";
import { changePassword, fetchMyOrders, type OrderSummary } from "@/lib/api";
import { formatCLP } from "@/lib/format";
import { formatOrderStatus } from "@/lib/order-labels";
import type { User } from "@/lib/types";

export default function CuentaPage() {
  const { user, token, loading: authLoading, refreshUser, logout } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const [pwdOk, setPwdOk] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchMyOrders(token).then(setOrders).catch(() => setOrders([]));
  }, [token]);

  if (authLoading) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-zinc-500">Cargando…</p>;
  }

  if (!user || !token) {
    return <LoginPrompt />;
  }

  const currentUser = user;
  const accessToken = token;
  const showPasswordSection =
    currentUser.authProvider === "LOCAL" || currentUser.passwordConfigured === true;

  async function onPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const curRaw = fd.get("currentPassword");
    const cur = curRaw != null ? String(curRaw) : "";
    const next = String(fd.get("newPassword"));
    const again = String(fd.get("confirmPassword"));
    if (next !== again) {
      setPwdErr("Las contraseñas nuevas no coinciden");
      return;
    }
    setPwdLoading(true);
    setPwdErr(null);
    setPwdOk(false);
    try {
      const body =
        currentUser.passwordConfigured === false
          ? { newPassword: next }
          : { currentPassword: cur, newPassword: next };
      await changePassword(accessToken, body);
      setPwdOk(true);
      e.currentTarget.reset();
      await refreshUser();
    } catch (ex) {
      setPwdErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setPwdLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Mi cuenta</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Gestioná tus pedidos y la seguridad de tu acceso.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,15rem)_1fr]">
        <AccountNav user={currentUser} onLogout={logout} />

        <div className="space-y-12">
          <ResumenSection user={currentUser} />
          <PedidosSection orders={orders} />
          <SeguridadSection
            user={currentUser}
            token={accessToken}
            showPasswordSection={showPasswordSection}
            pwdErr={pwdErr}
            pwdOk={pwdOk}
            pwdLoading={pwdLoading}
            onPasswordSubmit={onPasswordSubmit}
            refreshUser={refreshUser}
          />
        </div>
      </div>
    </div>
  );
}

function LoginPrompt() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center">
      <Link href="/auth/login" className="ds-link">
        Inicia sesión
      </Link>
    </div>
  );
}

function ResumenSection({ user }: { user: User }) {
  return (
    <section id="resumen" className="scroll-mt-24">
      <h2 className="font-display text-xl font-semibold text-white">Resumen</h2>
      <div>
        <p>
          Entrás con{" "}
          <span className="text-zinc-200">
            {user.authProvider === "GOOGLE" ? "tu cuenta de Google" : "email y contraseña"}
          </span>
          . Tu rol en la tienda es <span className="text-zinc-200">{user.role}</span>.
        </p>
        {user.totpEnabled ? (
          <p className="mt-2 text-emerald-300/90">
            Tenés verificación en dos pasos activa: al iniciar sesión te pediremos un código de la
            app autenticador.
          </p>
        ) : (
          <p className="mt-2">
            Podés activar{" "}
            <Link href="/cuenta#seguridad" className="ds-link">
              autenticación en dos pasos
            </Link>{" "}
            para proteger aún más tu cuenta.
          </p>
        )}
        <p className="mt-3">
          <Link href="/pedido/consulta" className="ds-link">
            Consultar un pedido sin iniciar sesión
          </Link>{" "}
          (número de pedido + email).
        </p>
      </div>
    </section>
  );
}

function PedidosSection({ orders }: { orders: OrderSummary[] | null }) {
  return (
    <section id="pedidos" className="scroll-mt-24">
      <h2 className="font-display text-xl font-semibold text-white">Mis pedidos</h2>
      {!orders ? (
        <p className="mt-4 text-zinc-500">Cargando…</p>
      ) : orders.length === 0 ? (
        <p className="mt-4 text-zinc-500">
          Aún no tienes pedidos.{" "}
          <Link href="/tienda" className="ds-link">
            Ir a la tienda
          </Link>
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-white/10 bg-[#0c0e14] px-4 py-3"
            >
              <span className="font-mono text-sm text-zinc-400">{o.orderNumber}</span>
              <span className="text-sm text-zinc-300">{formatOrderStatus(o.status)}</span>
              <span className="font-medium text-white">{formatCLP(o.total)}</span>
              <span className="text-xs text-zinc-600">
                {new Date(o.createdAt).toLocaleString("es-CL")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SeguridadSection({
  user,
  token,
  showPasswordSection,
  pwdErr,
  pwdOk,
  pwdLoading,
  onPasswordSubmit,
  refreshUser,
}: {
  user: User;
  token: string;
  showPasswordSection: boolean;
  pwdErr: string | null;
  pwdOk: boolean;
  pwdLoading: boolean;
  onPasswordSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  refreshUser: () => Promise<void>;
}) {
  return (
    <section id="seguridad" className="scroll-mt-24">
      <h2 className="font-display text-xl font-semibold text-white">Seguridad</h2>
      {showPasswordSection && (
        <div className="mt-4 max-w-md">
          <h3 className="text-sm font-medium text-zinc-300">Contraseña local</h3>
          <form onSubmit={onPasswordSubmit} className="mt-3 space-y-3">
            {pwdOk && (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100/95">
                Contraseña actualizada.
              </p>
            )}
            {pwdErr && <p className="text-sm text-red-400">{pwdErr}</p>}
            {user.passwordConfigured !== false && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-zinc-500">Contraseña actual</span>
                <input
                  name="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
                />
              </label>
            )}
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-500">Nueva contraseña</span>
              <input
                name="newPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-500">Confirmar nueva</span>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
              />
            </label>
            <button
              type="submit"
              disabled={pwdLoading}
              className="ds-btn-primary justify-center px-4 py-2 text-sm disabled:opacity-50"
            >
              {pwdLoading ? "Guardando…" : "Cambiar contraseña"}
            </button>
          </form>
        </div>
      )}
      <TwoFaSettings token={token} user={user} onUserRefresh={refreshUser} />
    </section>
  );
}
