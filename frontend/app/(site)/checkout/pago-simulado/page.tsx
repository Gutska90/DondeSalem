"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { confirmPaymentDemo } from "@/lib/api";
import { formatCLP } from "@/lib/format";

function PagoSimuladoContent() {
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber")?.trim() ?? "";
  const sessionToken = searchParams.get("token")?.trim() ?? "";

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [total, setTotal] = useState<number | null>(null);

  async function onPay() {
    if (!token || !orderNumber || !sessionToken) return;
    setLoading(true);
    setErr(null);
    try {
      const detail = await confirmPaymentDemo(token, { orderNumber, sessionToken });
      setTotal(detail.total);
      setOk(true);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "No se pudo confirmar el pago");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return <p className="mx-auto max-w-lg px-4 py-16 text-zinc-500">Cargando…</p>;
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-zinc-400">Debés iniciar sesión para completar el pago simulado.</p>
        <Link href="/auth/login" className="ds-link mt-4 inline-block">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (!orderNumber || !sessionToken) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-red-400">Enlace inválido: faltan número de pedido o token.</p>
        <Link href="/cuenta" className="ds-link mt-4 inline-block">
          Ir a mi cuenta
        </Link>
      </div>
    );
  }

  if (ok) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-8 text-center">
          <p className="font-display text-xl font-semibold text-emerald-200">Pago confirmado (demo)</p>
          <p className="mt-2 text-sm text-zinc-400">
            Pedido <span className="font-mono text-zinc-200">{orderNumber}</span>
            {total != null && <> · Total {formatCLP(total)}</>}
          </p>
          <p className="mt-4 text-xs text-zinc-500">
            En producción aquí iría el retorno real de Mercado Pago (webhook + estado en servidor).
          </p>
          <button
            type="button"
            className="ds-btn-primary mt-6 justify-center px-6 py-2.5 text-sm"
            onClick={() => router.push("/cuenta")}
          >
            Ver mis pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Pasarela simulada</p>
      <h1 className="font-display mt-2 text-2xl font-bold text-white">Mercado Pago (demo)</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Vista previa del flujo: no se cobra nada ni se llama a la API de Mercado Pago. Al confirmar, el
        backend marca el pedido como pagado.
      </p>

      <div
        className="mt-8 overflow-hidden rounded-2xl border border-white/10 shadow-xl"
        style={{
          background: "linear-gradient(145deg, #009ee3 0%, #0077c8 45%, #0a2540 100%)",
        }}
      >
        <div className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-bold text-[#009ee3]">
              MP
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Pagar con Mercado Pago</p>
              <p className="text-xs text-white/75">Sandbox visual · Pedido {orderNumber}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 rounded-xl bg-white/10 p-4 text-sm text-white/90 backdrop-blur">
            <div className="flex justify-between">
              <span className="text-white/70">Estado</span>
              <span>Listo para autorizar (demo)</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-white/70">Token</span>
              <span className="max-w-[180px] truncate font-mono text-xs opacity-90">{sessionToken}</span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 bg-black/20 px-6 py-4">
          {err && <p className="mb-3 text-center text-sm text-amber-200">{err}</p>}
          <button
            type="button"
            disabled={loading}
            onClick={onPay}
            className="w-full rounded-xl bg-[#00b1ea] py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#33c4ef] disabled:opacity-50"
          >
            {loading ? "Procesando…" : "Confirmar pago (demo)"}
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-zinc-500">
        <button type="button" className="ds-link" onClick={() => router.back()}>
          Volver
        </button>
        {" · "}
        <Link href="/cuenta" className="ds-link">
          Mi cuenta
        </Link>
      </p>
    </div>
  );
}

export default function PagoSimuladoPage() {
  return (
    <Suspense
      fallback={<p className="mx-auto max-w-lg px-4 py-16 text-zinc-500">Cargando pasarela…</p>}
    >
      <PagoSimuladoContent />
    </Suspense>
  );
}
