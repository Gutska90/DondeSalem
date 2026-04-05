"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { fetchAdminDashboard, type AdminDashboard } from "@/lib/api";
import { formatCLP } from "@/lib/format";

export default function AdminDashboardPage() {
  const { token, user } = useAuth();
  const [dash, setDash] = useState<AdminDashboard | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;
    fetchAdminDashboard(token)
      .then(setDash)
      .catch((e) => setErr(e instanceof Error ? e.message : "Error"));
  }, [token, user?.role]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-100 sm:text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Resumen operativo de la tienda</p>

      {err && (
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {err}
        </p>
      )}

      {!dash && !err && (
        <p className="mt-10 text-slate-500">Cargando métricas…</p>
      )}

      {dash && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Productos" value={String(dash.totalProducts)} tone="neutral" />
            <MetricCard
              label="Stock bajo (&lt;5)"
              value={String(dash.lowStockProducts)}
              tone="warn"
              href="/admin/stock"
              hrefLabel="Ver alertas"
            />
            <MetricCard
              label="Pedidos pendientes"
              value={String(dash.pendingOrders)}
              tone="info"
              href="/admin/pedidos"
              hrefLabel="Ir a pedidos"
            />
            <MetricCard
              label="Ventas 30 días"
              value={formatCLP(dash.revenueLast30Days)}
              tone="success"
            />
            <MetricCard
              label="Mensajes sin leer"
              value={String(dash.unreadContactMessages)}
              tone="accent"
              href="/admin/contacto"
              hrefLabel="Bandeja"
            />
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <h2 className="font-semibold text-slate-200">Accesos rápidos</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <QuickLink href="/admin/productos/nuevo" title="Nuevo producto" />
                <QuickLink href="/admin/stock" title="Ajustar stock y alertas" />
                <QuickLink href="/admin/pedidos" title="Gestionar pedidos y exportar CSV" />
                <QuickLink href="/admin/banners" title="Banners y cabecera" />
              </ul>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <h2 className="font-semibold text-slate-200">Checklist diario</h2>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-400">
                <li>Revisar pedidos en estado pendiente o pago recibido.</li>
                <li>Reponer o ajustar productos con stock bajo.</li>
                <li>Responder mensajes de contacto nuevos.</li>
                <li>Verificar fechas de eventos y banners vigentes.</li>
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
  href,
  hrefLabel,
}: {
  label: string;
  value: string;
  tone: "neutral" | "warn" | "info" | "success" | "accent";
  href?: string;
  hrefLabel?: string;
}) {
  const tones = {
    neutral: "border-slate-800 text-slate-100",
    warn: "border-amber-500/25 text-amber-200",
    info: "border-sky-500/25 text-sky-200",
    success: "border-emerald-500/25 text-emerald-200",
    accent: "border-violet-500/25 text-violet-200",
  };
  return (
    <div className={`rounded-xl border bg-slate-900/50 p-5 ${tones[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums">{value}</p>
      {href && hrefLabel && (
        <Link href={href} className="mt-3 inline-block text-xs font-medium text-emerald-400 hover:underline">
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}

function QuickLink({ href, title }: { href: string; title: string }) {
  return (
    <li>
      <Link href={href} className="text-emerald-400 hover:text-emerald-300 hover:underline">
        {title}
      </Link>
    </li>
  );
}
