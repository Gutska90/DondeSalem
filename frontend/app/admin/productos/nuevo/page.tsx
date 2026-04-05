"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ProductForm } from "@/components/admin/product-form";
import { fetchAdminCategories, fetchAdminTags, fetchGames } from "@/lib/api";
import type { Category, Game, AdminTag } from "@/lib/types";

export default function NewProductPage() {
  const { token, user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;
    Promise.all([fetchAdminCategories(token), fetchGames(), fetchAdminTags(token)])
      .then(([c, g, t]) => {
        setCategories(c);
        setGames(g);
        setTags(t);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Error"));
  }, [token, user?.role]);

  if (!token || user?.role !== "ADMIN") return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-100">Nuevo producto</h1>
      {err && (
        <p className="mt-4 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{err}</p>
      )}
      {categories.length === 0 && !err ? (
        <p className="mt-8 text-slate-500">Cargando datos…</p>
      ) : (
        <div className="mt-8">
          <ProductForm
            token={token}
            categories={categories}
            games={games}
            tags={tags}
            mode="create"
          />
        </div>
      )}
    </div>
  );
}
