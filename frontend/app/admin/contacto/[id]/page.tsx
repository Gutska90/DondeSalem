"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { fetchAdminContactMessage, patchAdminContactRead } from "@/lib/api";
import type { ContactMessageDetail } from "@/lib/types";

export default function AdminContactDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { token, user } = useAuth();
  const [msg, setMsg] = useState<ContactMessageDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN" || !Number.isFinite(id)) return;
    fetchAdminContactMessage(token, id)
      .then((m) => {
        setMsg(m);
        if (!m.read) {
          patchAdminContactRead(token, id, true).then(setMsg).catch(() => {});
        }
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Error"));
  }, [token, user?.role, id]);

  async function toggleRead() {
    const auth = token;
    if (!auth || !msg) return;
    setUpdating(true);
    try {
      const next = await patchAdminContactRead(auth, id, !msg.read);
      setMsg(next);
    } finally {
      setUpdating(false);
    }
  }

  if (!msg && !err) {
    return <p className="text-slate-500">Cargando…</p>;
  }

  if (err || !msg) {
    return (
      <div>
        <p className="text-red-300">{err}</p>
        <Link href="/admin/contacto" className="mt-4 inline-block text-emerald-400 hover:underline">
          ← Volver
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/contacto" className="text-sm text-emerald-400 hover:underline">
        ← Bandeja
      </Link>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-100">{msg.subject}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {new Date(msg.createdAt).toLocaleString("es-CL")}
          </p>
        </div>
        <button
          type="button"
          disabled={updating}
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          onClick={() => toggleRead()}
        >
          {msg.read ? "Marcar como no leído" : "Marcar como leído"}
        </button>
      </div>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <p className="text-sm font-medium text-slate-200">{msg.name}</p>
        <p className="text-sm text-slate-400">{msg.email}</p>
        {msg.phone && <p className="mt-1 text-sm text-slate-500">{msg.phone}</p>}
        <div className="mt-6 whitespace-pre-wrap border-t border-slate-800 pt-6 text-sm leading-relaxed text-slate-300">
          {msg.body}
        </div>
      </div>
    </div>
  );
}
