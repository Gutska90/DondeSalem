"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { changePassword, fetchMyOrders, type OrderSummary } from "@/lib/api";
import { formatCLP } from "@/lib/format";

export default function CuentaPage() {
  const { user, token, loading: authLoading } = useAuth();
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

  async function onPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const fd = new FormData(e.currentTarget);
    const cur = String(fd.get("currentPassword"));
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
      await changePassword(token, { currentPassword: cur, newPassword: next });
      setPwdOk(true);
      e.currentTarget.reset();
    } catch (ex) {
      setPwdErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setPwdLoading(false);
    }
  }

  if (!user || !token) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <Link href="/auth/login" className="ds-link">
          Inicia sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Mi cuenta</h1>
      <p className="mt-2 text-zinc-400">
        {user.firstName} {user.lastName} · {user.email}
      </p>

      <p className="mt-6 text-sm text-zinc-500">
        <Link href="/pedido/consulta" className="ds-link">
          Consultar estado con número de pedido y email
        </Link>{" "}
        (sin iniciar sesión)
      </p>

      <h2 className="mt-10 font-display text-xl font-semibold text-white">Contraseña</h2>
      <form onSubmit={onPasswordSubmit} className="mt-4 max-w-md space-y-3">
        {pwdOk && (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100/95">
            Contraseña actualizada.
          </p>
        )}
        {pwdErr && <p className="text-sm text-red-400">{pwdErr}</p>}
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

      <h2 className="mt-10 font-display text-xl font-semibold text-white">Pedidos</h2>
      {!orders ? (
        <p className="mt-4 text-zinc-500">Cargando…</p>
      ) : orders.length === 0 ? (
        <p className="mt-4 text-zinc-500">Aún no tienes pedidos.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-xl border border-white/10 bg-[#0c0e14] px-4 py-3">
              <span className="font-mono text-sm text-zinc-500">{o.orderNumber}</span>
              <span className="ml-3 text-sm text-zinc-400">{o.status}</span>
              <span className="ml-3 font-medium text-white">{formatCLP(o.total)}</span>
              <span className="ml-3 text-xs text-zinc-600">
                {new Date(o.createdAt).toLocaleString("es-CL")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
