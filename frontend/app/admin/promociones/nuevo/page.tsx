"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createAdminPromotion, fetchAdminProducts, type PromotionBody } from "@/lib/api";
import type { ProductSummary, PromotionType } from "@/lib/types";

export default function NewPromotionPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [promoType, setPromoType] = useState<PromotionType>("PORCENTAJE");
  const [value, setValue] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [active, setActive] = useState(true);
  const [productId, setProductId] = useState<string>("");

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;
    fetchAdminProducts(token, { page: 0, size: 80 })
      .then((r) => setProducts(r.content))
      .catch(() => {});
  }, [token, user?.role]);

  if (!token || user?.role !== "ADMIN") return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setErr(null);
    const v = parseFloat(value.replace(",", "."));
    if (Number.isNaN(v)) {
      setErr("Valor inválido.");
      return;
    }
    const s = new Date(startsAt);
    const en = new Date(endsAt);
    if (Number.isNaN(s.getTime()) || Number.isNaN(en.getTime())) {
      setErr("Revisá fechas de vigencia.");
      return;
    }
    const body: PromotionBody = {
      name: name.trim(),
      promoType,
      value: v,
      startsAt: s.toISOString(),
      endsAt: en.toISOString(),
      active,
      productId: productId ? parseInt(productId, 10) : null,
    };
    setSaving(true);
    try {
      await createAdminPromotion(token, body);
      router.push("/admin/promociones");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-100">Nueva promoción</h1>
      {err && (
        <p className="mt-4 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{err}</p>
      )}
      <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-lg space-y-4">
        <label className="block">
          <span className="text-xs text-slate-500">Nombre interno</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Tipo</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={promoType}
            onChange={(e) => setPromoType(e.target.value as PromotionType)}
          >
            <option value="PORCENTAJE">Porcentaje</option>
            <option value="MONTO_FIJO">Monto fijo (CLP)</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">
            Valor {promoType === "PORCENTAJE" ? "(ej. 10 = 10%)" : "(CLP)"}
          </span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Producto específico (opcional)</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">— Todos / catálogo —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-slate-500">Inicio vigencia</span>
            <input
              required
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Fin vigencia</span>
            <input
              required
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Activa
        </label>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Crear"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm text-slate-300"
            onClick={() => router.push("/admin/promociones")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
