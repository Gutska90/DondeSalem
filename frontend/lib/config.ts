export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** URL pública del sitio (SEO, robots, sitemap). En producción: https://tudominio.cl */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * WhatsApp de la tienda (comprobantes de transferencia, consultas). Ej. https://wa.me/56912345678
 * Opcional; si no está, el checkout no muestra el acceso directo.
 */
export const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() || null;
