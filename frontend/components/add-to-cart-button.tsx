"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { addToCart } from "@/lib/api";
import Link from "next/link";

export function AddToCartButton({
  productId,
  maxQty,
  disabled,
}: {
  productId: number;
  maxQty: number;
  disabled?: boolean;
}) {
  const { token } = useAuth();
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onAdd() {
    if (!token) {
      setMsg("Inicia sesión para agregar al carrito");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await addToCart(token, productId, qty);
      setMsg("¡Agregado al carrito!");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  if (disabled || maxQty <= 0) {
    return (
      <p className="text-sm font-medium text-ds-muted">
        No disponible para compra online en este momento.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      <label className="flex items-center gap-2 text-sm text-ds-muted">
        Cantidad
        <input
          type="number"
          min={1}
          max={maxQty}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Math.min(maxQty, parseInt(e.target.value, 10) || 1)))}
          className="w-20 rounded-xl border border-ds-border-strong bg-ds-surface px-2.5 py-2 text-sm tabular-nums text-ds-ink outline-none transition focus:border-ds-accent/40 focus:ring-2 focus:ring-ds-accent/20"
        />
      </label>
      <button
        type="button"
        onClick={onAdd}
        disabled={loading}
        className="ds-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Agregando…" : "Agregar al carrito"}
      </button>
      {!token && (
        <Link href="/auth/login" className="text-sm font-medium text-ds-holo transition hover:text-sky-200 hover:underline">
          Iniciar sesión
        </Link>
      )}
      {msg && <p className="text-sm text-ds-muted">{msg}</p>}
    </div>
  );
}
