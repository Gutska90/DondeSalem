"use client";

import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { fetchCart, removeCartLine, updateCartLine } from "@/lib/api";
import type { CartResponse } from "@/lib/types";
import { formatCLP } from "@/lib/format";

export default function CarritoPage() {
  const { token, loading: authLoading } = useAuth();
  const [data, setData] = useState<CartResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const c = await fetchCart(token);
      setData(c);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && token) load();
  }, [authLoading, token, load]);

  if (authLoading) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-zinc-500">Cargando…</p>;
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-zinc-400">Inicia sesión para ver tu carrito.</p>
        <Link href="/auth/login" className="ds-link mt-4 inline-block">
          Ir a login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Carrito</h1>
      {err && <p className="mt-4 text-red-400">{err}</p>}
      {!data ? (
        <p className="mt-8 text-zinc-500">Cargando carrito…</p>
      ) : data.lines.length === 0 ? (
        <p className="mt-8 text-zinc-500">Tu carrito está vacío.</p>
      ) : (
        <div className="mt-8 space-y-6">
          {data.lines.map((line) => (
            <div
              key={line.lineId}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0c0e14] p-4 sm:flex-row"
            >
              <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-[#12141c] sm:h-28 sm:w-40">
                <SafeImage
                  src={line.imageUrl ?? "/placeholder-product.svg"}
                  alt={line.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/producto/${line.slug}`} className="font-medium text-white hover:underline">
                    {line.name}
                  </Link>
                  <p className="text-sm text-zinc-500">{formatCLP(line.unitPrice)} c/u</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={line.maxQuantity}
                    defaultValue={line.quantity}
                    className="w-20 rounded border border-white/10 bg-[#07080f] px-2 py-1 text-sm"
                    onBlur={async (e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!token || !v) return;
                      try {
                        const c = await updateCartLine(token, line.lineId, v);
                        setData(c);
                      } catch (ex) {
                        setErr(ex instanceof Error ? ex.message : "Error");
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="text-sm text-red-400 hover:underline"
                    onClick={async () => {
                      if (!token) return;
                      const c = await removeCartLine(token, line.lineId);
                      setData(c);
                    }}
                  >
                    Quitar
                  </button>
                  <span className="ml-auto font-semibold tabular-nums text-ds-mint">{formatCLP(line.lineTotal)}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="flex flex-col items-end gap-2 border-t border-white/10 pt-6 text-right">
            {(data.promotionDiscount ?? 0) > 0 && (
              <>
                <p className="text-sm text-zinc-500">
                  Catálogo:{" "}
                  <span className="text-zinc-400">{formatCLP(data.merchandiseSubtotal ?? data.subtotal)}</span>
                </p>
                <p className="text-sm text-emerald-400/90">
                  Promociones: −{formatCLP(data.promotionDiscount ?? 0)}
                </p>
              </>
            )}
            <p className="text-lg text-zinc-300">
              Subtotal: <span className="font-bold text-white">{formatCLP(data.subtotal)}</span>
            </p>
            <Link
              href="/checkout"
              className="ds-btn-primary px-8 py-3 text-sm"
            >
              Ir a checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
