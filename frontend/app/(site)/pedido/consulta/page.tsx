"use client";

import { useState } from "react";
import { fetchOrderTrack } from "@/lib/api";
import { formatCLP } from "@/lib/format";
import type { OrderTrackPublic } from "@/lib/types";

export default function ConsultaPedidoPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<OrderTrackPublic | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setData(null);
    try {
      const res = await fetchOrderTrack(orderNumber, email);
      setData(res);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "No se pudo consultar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Estado de tu pedido</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Ingresá el número de pedido (ej. ORD-…) y el email de la cuenta con la que compraste. No
        necesitás iniciar sesión.
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Número de pedido</span>
          <input
            required
            className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 font-mono text-zinc-100"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="ORD-…"
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Email de la cuenta</span>
          <input
            required
            type="email"
            className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ds-accent/20 px-4 py-2 text-sm font-medium text-ds-mint hover:bg-ds-accent/30 disabled:opacity-50"
        >
          {loading ? "Buscando…" : "Consultar"}
        </button>
      </form>

      {err && (
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          {err}
        </p>
      )}

      {data && (
        <div className="mt-10 rounded-xl border border-white/10 bg-[#0c0e14] p-5">
          <p className="font-mono text-sm text-zinc-500">{data.orderNumber}</p>
          <p className="mt-1 text-lg font-semibold text-white">{data.status}</p>
          <p className="mt-2 text-xs text-zinc-500">
            {new Date(data.createdAt).toLocaleString("es-CL")}
          </p>
          <dl className="mt-4 space-y-1 text-sm text-zinc-400">
            <div className="flex justify-between">
              <dt>Productos (neto)</dt>
              <dd className="tabular-nums text-zinc-200">{formatCLP(data.subtotal)}</dd>
            </div>
            {data.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-400/90">
                <dt>Descuentos</dt>
                <dd className="tabular-nums">−{formatCLP(data.discountTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Envío</dt>
              <dd className="tabular-nums text-zinc-200">{formatCLP(data.shippingCost)}</dd>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 font-medium text-ds-mint">
              <dt className="text-zinc-300">Total</dt>
              <dd className="tabular-nums">{formatCLP(data.total)}</dd>
            </div>
          </dl>
          <ul className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm text-zinc-400">
            {data.lines.map((line, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span>
                  {line.quantity}× {line.productName}
                </span>
                <span className="shrink-0 tabular-nums text-zinc-300">
                  {formatCLP(line.unitPrice * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
