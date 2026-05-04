"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { fetchAdminCatalogBloqueStats, type CatalogBloqueStats } from "@/lib/api";

export default function AdminSeedPage() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<CatalogBloqueStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function loadEraStats() {
    if (!token || user?.role !== "ADMIN") return;
    setLoading(true);
    setErr(null);
    try {
      const next = await fetchAdminCatalogBloqueStats(token);
      setStats(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error consultando estadísticas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-100">Validación de catálogo</h1>
      <p className="mt-1 text-sm text-slate-500">
        Consulta rápida para validar cuántos singles hay por bloque detectado en la base de datos.
      </p>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadEraStats}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Consultando…" : "Ver conteo PE/PB"}
          </button>
          {err && <p className="text-sm text-red-300">{err}</p>}
        </div>

        {stats && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="PE" value={stats.pe} />
            <StatCard label="PB" value={stats.pb} />
            <StatCard label="Otros" value={stats.other} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}
