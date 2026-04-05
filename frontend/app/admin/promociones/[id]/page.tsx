"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  fetchAdminProducts,
  fetchAdminPromotion,
  updateAdminPromotion,
  type PromotionBody,
} from "@/lib/api";
import type { ProductSummary, PromotionType } from "@/lib/types";

function localFromIso(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditPromotionPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const { token, user } = useAuth();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!token || user?.role !== "ADMIN" || !Number.isFinite(id)) return;
    fetchAdminPromotion(token, id)
      .then((p) => {
        setName(p.name);
        setPromoType(p.promoType);
        setValue(String(p.value));
        setStartsAt(localFromIso(p.startsAt));
        setEndsAt(localFromIso(p.endsAt));
        setActive(p.active);
        setProductId(p.productId != null ? String(p.productId) : "");
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [token, user?.role, id]);

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
      setErr("Revisá fechas.");
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
      await updateAdminPromotion(token, id, body);
      router.push("/admin/promociones");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Cargando…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-100">Editar promoción</h1>
      {err && (
        <p className="mt-4 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{err}</p>
      )}
      <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-lg space-y-4">
        <label className="block">
          <span className="text-xs text-slate-500">Nombre</span>
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
            <option value="MONTO_FIJO">Monto fijo</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Valor</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Producto (opcional)</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">— Ninguno —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-slate-500">Inicio</span>
            <input
              required
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Fin</span>
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
            {saving ? "Guardando…" : "Guardar"}
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
