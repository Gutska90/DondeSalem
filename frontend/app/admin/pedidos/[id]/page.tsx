"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { fetchAdminOrder, patchAdminOrderStatus } from "@/lib/api";
import { formatCLP } from "@/lib/format";
import type { OrderDetailAdmin } from "@/lib/types";

const STATUSES = [
  "PENDIENTE",
  "PAGADO",
  "PREPARANDO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
] as const;

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { token, user } = useAuth();
  const [order, setOrder] = useState<OrderDetailAdmin | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN" || !Number.isFinite(id)) return;
    fetchAdminOrder(token, id)
      .then((o) => {
        setOrder(o);
        setStatus(o.status);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Error"));
  }, [token, user?.role, id]);

  async function updateStatus(e: React.FormEvent) {
    e.preventDefault();
    const auth = token;
    if (!auth || !order) return;
    setSaving(true);
    try {
      const updated = await patchAdminOrderStatus(auth, id, status);
      setOrder(updated);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  if (!order && !err) {
    return <p className="text-slate-500">Cargando pedido…</p>;
  }

  if (err || !order) {
    return (
      <div>
        <p className="text-red-300">{err ?? "No encontrado"}</p>
        <Link href="/admin/pedidos" className="mt-4 inline-block text-emerald-400 hover:underline">
          ← Volver
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/pedidos" className="text-sm text-emerald-400 hover:underline">
        ← Pedidos
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold text-slate-100">
        Pedido {order.orderNumber}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {new Date(order.createdAt).toLocaleString("es-CL")}
      </p>

      <form onSubmit={updateStatus} className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <label className="block">
          <span className="text-xs text-slate-500">Estado</span>
          <select
            className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={saving || status === order.status}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Actualizar estado"}
        </button>
      </form>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="font-semibold text-slate-200">Totales</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {(order.discountTotal ?? 0) > 0 && (
              <div className="flex justify-between text-emerald-400/90">
                <dt>Descuentos (promos)</dt>
                <dd className="tabular-nums">−{formatCLP(order.discountTotal ?? 0)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal productos</dt>
              <dd className="tabular-nums">{formatCLP(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Envío</dt>
              <dd className="tabular-nums">{formatCLP(order.shippingCost)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums text-emerald-300">{formatCLP(order.total)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">
            {order.deliveryMethod} · {order.paymentMethod}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="font-semibold text-slate-200">Envío / retiro</h2>
          <p className="mt-2 text-sm text-slate-300">{order.recipientName}</p>
          <p className="text-sm text-slate-400">{order.recipientPhone}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {order.shippingStreet}
            <br />
            {order.shippingCity}
            {order.shippingRegion ? `, ${order.shippingRegion}` : ""}
            {order.shippingPostalCode ? ` · ${order.shippingPostalCode}` : ""}
            <br />
            {order.shippingCountry}
          </p>
          {order.notes && (
            <p className="mt-3 rounded-lg bg-slate-950/50 p-3 text-sm text-slate-400">
              <span className="text-slate-500">Notas:</span> {order.notes}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Cant.</th>
              <th className="px-4 py-3">P. unit.</th>
              <th className="px-4 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {order.lines.map((line, i) => (
              <tr key={`${line.productId}-${i}`}>
                <td className="px-4 py-3 text-slate-200">{line.productName}</td>
                <td className="px-4 py-3 tabular-nums">{line.quantity}</td>
                <td className="px-4 py-3 tabular-nums text-slate-400">{formatCLP(line.unitPrice)}</td>
                <td className="px-4 py-3 tabular-nums text-slate-300">
                  {formatCLP(line.quantity * line.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
