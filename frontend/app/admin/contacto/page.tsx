"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { fetchAdminContactMessages } from "@/lib/api";
import type { ContactMessageRow } from "@/lib/types";

export default function AdminContactPage() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<ContactMessageRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token || user?.role !== "ADMIN") return;
    setLoading(true);
    try {
      setRows(await fetchAdminContactMessages(token));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => {
    load();
  }, [load]);

  const unread = rows.filter((r) => !r.read).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-100">Mensajes de contacto</h1>
      <p className="mt-1 text-sm text-slate-500">
        Consultas desde el formulario público. {unread > 0 && (
          <span className="text-violet-300">{unread} sin leer</span>
        )}
      </p>

      {err && (
        <p className="mt-6 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{err}</p>
      )}

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">De</th>
              <th className="px-4 py-3">Asunto</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Cargando…
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((m) => (
                <tr
                  key={m.id}
                  className={`hover:bg-slate-900/50 ${!m.read ? "bg-violet-950/20" : ""}`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {new Date(m.createdAt).toLocaleString("es-CL")}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.email}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[240px] truncate text-slate-300">{m.subject}</td>
                  <td className="px-4 py-3">
                    {m.read ? (
                      <span className="text-xs text-slate-500">Leído</span>
                    ) : (
                      <span className="text-xs font-medium text-violet-300">Nuevo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/contacto/${m.id}`} className="text-emerald-400 hover:underline">
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No hay mensajes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
