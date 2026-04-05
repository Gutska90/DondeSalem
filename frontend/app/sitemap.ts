import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

/** Rutas estáticas principales; ampliar con productos vía fetch si se requiere SEO por SKU. */
const PATHS = [
  "",
  "/tienda",
  "/eventos",
  "/preventas",
  "/ofertas",
  "/contacto",
  "/pedido/consulta",
  "/legal/terminos",
  "/legal/privacidad",
  "/legal/devoluciones",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/$/, "");
  const lastModified = new Date();
  return PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/tienda" ? 0.9 : 0.6,
  }));
}
