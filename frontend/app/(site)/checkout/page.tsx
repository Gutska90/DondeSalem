"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { checkout, fetchCart, fetchStorefrontConfig } from "@/lib/api";
import { WHATSAPP_URL } from "@/lib/config";
import { formatCLP } from "@/lib/format";

type CheckoutPaymentMethod = "TRANSFERENCIA" | "WEB_PAY_MOCK" | "MERCADOPAGO_CHECKOUT";

const PAYMENT_OPTIONS: {
  value: CheckoutPaymentMethod;
  title: string;
  subtitle: string;
}[] = [
  {
    value: "TRANSFERENCIA",
    title: "Transferencia bancaria",
    subtitle: "Datos de cuenta y comprobante por correo o WhatsApp",
  },
  {
    value: "WEB_PAY_MOCK",
    title: "Webpay / Transbank",
    subtitle: "Demo — integración real en siguiente fase",
  },
  {
    value: "MERCADOPAGO_CHECKOUT",
    title: "Mercado Pago",
    subtitle: "Demo — redirección a pasarela simulada",
  },
];

export default function CheckoutPage() {
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("TRANSFERENCIA");
  const [cart, setCart] = useState<{
    subtotal: number;
    merchandiseSubtotal: number;
    promotionDiscount: number;
  } | null>(null);
  const [transferBankInstructions, setTransferBankInstructions] = useState<string>("");

  useEffect(() => {
    fetchStorefrontConfig()
      .then((c) => setTransferBankInstructions(c.transferBankInstructions?.trim() ?? ""))
      .catch(() => setTransferBankInstructions(""));
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchCart(token)
      .then((c) =>
        setCart({
          subtotal: c.subtotal,
          merchandiseSubtotal: c.merchandiseSubtotal ?? c.subtotal,
          promotionDiscount: c.promotionDiscount ?? 0,
        }),
      )
      .catch(() => setCart({ subtotal: 0, merchandiseSubtotal: 0, promotionDiscount: 0 }));
  }, [token]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setErr(null);
    try {
      const pm = String(fd.get("paymentMethod") || "TRANSFERENCIA");
      const resolved: CheckoutPaymentMethod =
        pm === "MERCADOPAGO_CHECKOUT"
          ? "MERCADOPAGO_CHECKOUT"
          : pm === "WEB_PAY_MOCK"
            ? "WEB_PAY_MOCK"
            : "TRANSFERENCIA";

      const detail = await checkout(token, {
        recipientName: String(fd.get("recipientName")),
        recipientPhone: String(fd.get("recipientPhone")),
        shippingStreet: String(fd.get("shippingStreet")),
        shippingCity: String(fd.get("shippingCity")),
        shippingRegion: String(fd.get("shippingRegion") || ""),
        shippingPostalCode: String(fd.get("shippingPostalCode") || ""),
        shippingCountry: String(fd.get("shippingCountry") || "CL"),
        deliveryMethod:
          fd.get("deliveryMethod") === "RETIRO_TIENDA" ? "RETIRO_TIENDA" : "ENVIO_DOMICILIO",
        paymentMethod: resolved,
        notes: String(fd.get("notes") || ""),
      });

      if (detail.paymentRedirectUrl) {
        window.location.assign(detail.paymentRedirectUrl);
        return;
      }
      router.push("/cuenta");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-zinc-500">Cargando…</p>;
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-zinc-400">Debes iniciar sesión.</p>
        <Link href="/auth/login" className="ds-link mt-4 inline-block">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Checkout</h1>
      <p className="mt-2 text-sm text-zinc-500">
        {cart != null && (
          <>
            {cart.promotionDiscount > 0 && (
              <span className="block text-emerald-400/90">
                Ahorro estimado en productos: −{formatCLP(cart.promotionDiscount)} (catálogo{" "}
                {formatCLP(cart.merchandiseSubtotal)} → neto {formatCLP(cart.subtotal)})
              </span>
            )}
            <span className="mt-1 block">
              Neto productos: {formatCLP(cart.subtotal)} · Envío estándar {formatCLP(3990)} (si aplica). Los
              totales se confirman al crear el pedido.
            </span>
          </>
        )}
      </p>
      {err && <p className="mt-4 text-red-400">{err}</p>}
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-500">Nombre</span>
            <input
              name="recipientName"
              required
              className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-500">Teléfono</span>
            <input
              name="recipientPhone"
              required
              className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Dirección</span>
          <input
            name="shippingStreet"
            required
            className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-500">Ciudad</span>
            <input
              name="shippingCity"
              required
              className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-500">Región</span>
            <input
              name="shippingRegion"
              className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-500">Código postal</span>
            <input
              name="shippingPostalCode"
              className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-500">País</span>
            <input
              name="shippingCountry"
              defaultValue="CL"
              className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Entrega</span>
          <select
            name="deliveryMethod"
            className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
          >
            <option value="ENVIO_DOMICILIO">Envío a domicilio (+{formatCLP(3990)})</option>
            <option value="RETIRO_TIENDA">Retiro en tienda</option>
          </select>
        </label>
        <div className="space-y-2">
          <span className="text-sm text-zinc-500">Medio de pago</span>
          <div className="space-y-2" role="radiogroup" aria-label="Medio de pago">
            {PAYMENT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer flex-col gap-0.5 rounded-xl border px-4 py-3 transition sm:flex-row sm:items-center sm:justify-between ${
                  paymentMethod === opt.value
                    ? "border-emerald-500/50 bg-emerald-500/[0.07]"
                    : "border-white/10 bg-[#0c0e14] hover:border-white/20"
                }`}
              >
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value)}
                    className="mt-1 accent-emerald-500"
                  />
                  <span>
                    <span className="block font-medium text-zinc-100">{opt.title}</span>
                    <span className="block text-xs text-zinc-500">{opt.subtitle}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {paymentMethod === "TRANSFERENCIA" && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs leading-relaxed text-amber-100/90">
            {transferBankInstructions ? (
              <div className="mb-4 rounded-lg border border-white/10 bg-[#0a0c12] px-4 py-3 text-sm leading-relaxed text-zinc-200">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400/90">
                  Datos para transferir
                </p>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-[13px] text-zinc-100">
                  {transferBankInstructions}
                </pre>
                <p className="mt-2 text-[11px] text-zinc-500">
                  Recibirás estos mismos datos por correo al confirmar el pedido (si el envío de mails está
                  activo).
                </p>
              </div>
            ) : null}
            <p className="font-medium text-amber-200/95">Después de crear el pedido</p>
            <p className="mt-1 text-amber-100/80">
              Te recomendamos <strong className="font-semibold text-amber-100">correo</strong> para el
              comprobante: queda registro claro, podés adjuntar PDF o imagen y es fácil de archivar. Si
              configurás SMTP en el servidor, el cliente recibe automáticamente el número de pedido y
              estas instrucciones en el mismo mail.
            </p>
            <p className="mt-2 text-amber-100/80">
              <strong className="font-semibold text-amber-100">WhatsApp</strong> sirve para avisar rápido o
              mandar la captura; un flujo 100 % automático por WhatsApp exige API de negocio (Meta) o
              procesos manuales. Podés combinar: mail como canal principal y WhatsApp como respaldo.
            </p>
            {WHATSAPP_URL && (
              <p className="mt-2">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-300 underline decoration-emerald-500/50 underline-offset-2 hover:text-emerald-200"
                >
                  Abrir WhatsApp de la tienda
                </a>{" "}
                para enviar el comprobante (configurá{" "}
                <code className="rounded bg-black/30 px-1 text-[0.7rem]">NEXT_PUBLIC_WHATSAPP_URL</code> en
                el front).
              </p>
            )}
          </div>
        )}

        {paymentMethod === "WEB_PAY_MOCK" && (
          <p className="rounded-xl border border-sky-500/20 bg-sky-500/[0.06] px-4 py-3 text-xs leading-relaxed text-sky-100/85">
            El pedido queda <strong className="text-sky-100">pendiente de pago</strong> como con transferencia.
            La integración real con <strong className="text-sky-100">Webpay Plus / Transbank</strong> (redirect
            + confirmación en servidor) se conecta en una fase posterior; este valor solo etiqueta el medio
            elegido.
          </p>
        )}

        {paymentMethod === "MERCADOPAGO_CHECKOUT" && (
          <p className="rounded-xl border border-[#009ee3]/25 bg-[#009ee3]/[0.08] px-4 py-3 text-xs leading-relaxed text-zinc-200">
            Serás redirigido a una <strong className="text-white">pasarela simulada</strong> (sin cobro real).
            En producción aquí iría el checkout de Mercado Pago o el SDK correspondiente.
          </p>
        )}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-500">Notas</span>
          <textarea
            name="notes"
            rows={3}
            className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
          />
        </label>
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-zinc-400">
          Transferencia y Webpay (demo) dejan el pedido pendiente hasta confirmación manual o integración
          bancaria. Mercado Pago (demo) redirige a la pantalla simulada para cerrar el flujo de prueba.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="ds-btn-primary w-full justify-center py-3 text-sm disabled:opacity-50"
        >
          {loading ? "Confirmando…" : "Confirmar pedido"}
        </button>
      </form>
    </div>
  );
}
