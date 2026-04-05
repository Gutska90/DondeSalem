"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ProductForm } from "@/components/admin/product-form";
import { fetchAdminCategories, fetchAdminProduct, fetchAdminTags } from "@/lib/api";
import { fetchGames } from "@/lib/api";
import type { Category, Game, ProductDetail, AdminTag } from "@/lib/types";

export default function EditProductPage() {
  const params = useParams();
  const id = Number(params.id);
  const { token, user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN" || !Number.isFinite(id)) return;
    Promise.all([
      fetchAdminCategories(token),
      fetchGames(),
      fetchAdminTags(token),
      fetchAdminProduct(token, id),
    ])
      .then(([c, g, t, p]) => {
        setCategories(c);
        setGames(g);
        setTags(t);
        setProduct(p);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Error"));
  }, [token, user?.role, id]);

  if (!token || user?.role !== "ADMIN") return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-100">Editar producto</h1>
      {err && (
        <p className="mt-4 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-200">{err}</p>
      )}
      {!product && !err ? (
        <p className="mt-8 text-slate-500">Cargando…</p>
      ) : product ? (
        <div className="mt-8">
          <ProductForm
            token={token}
            categories={categories}
            games={games}
            tags={tags}
            mode="edit"
            productId={id}
            initial={product}
          />
        </div>
      ) : null}
    </div>
  );
}
