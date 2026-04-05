import { API_URL } from "./config";
import type {
  AdminTag,
  Banner,
  BannerAdmin,
  CartResponse,
  Category,
  ContactMessageDetail,
  ContactMessageRow,
  EventItem,
  Game,
  InventoryMovementRow,
  OrderDetailAdmin,
  OrderTrackPublic,
  PageResponse,
  ProductDetail,
  ProductSummary,
  PromotionAdmin,
  PromotionType,
  User,
} from "./types";

async function parseError(res: Response): Promise<string> {
  try {
    const j = await res.json();
    if (j && typeof j.error === "string") return j.error;
  } catch {
    /* ignore */
  }
  return res.statusText || "Error";
}

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(await parseError(res));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiPost<T, B = unknown>(
  path: string,
  body: B,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function apiPut<T, B = unknown>(
  path: string,
  body: B,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function apiPatch<T, B = unknown>(
  path: string,
  body: B,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function apiDelete(path: string, token?: string | null): Promise<void> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { method: "DELETE", headers });
  if (!res.ok) throw new Error(await parseError(res));
}

export function fetchProducts(params: Record<string, string | number | boolean | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") q.set(k, String(v));
  });
  return apiGet<PageResponse<ProductSummary>>(`/api/products?${q.toString()}`);
}

export function fetchProductBySlug(slug: string) {
  return apiGet<ProductDetail>(`/api/products/slug/${encodeURIComponent(slug)}`);
}

export function fetchFeatured(limit = 8) {
  return apiGet<ProductSummary[]>(`/api/products/featured?limit=${limit}`);
}

export interface PublicStorefrontConfig {
  /** Texto multilínea: datos de cuenta para transferencia (misma fuente que el mail). */
  transferBankInstructions: string;
}

export function fetchStorefrontConfig() {
  return apiGet<PublicStorefrontConfig>("/api/config/public");
}

export function fetchCategories() {
  return apiGet<Category[]>("/api/categories");
}

export function fetchGames() {
  return apiGet<Game[]>("/api/games");
}

export function fetchBanners() {
  return apiGet<Banner[]>("/api/banners");
}

export function fetchEvents() {
  return apiGet<EventItem[]>("/api/events");
}

export function fetchFeaturedEvents() {
  return apiGet<EventItem[]>("/api/events/featured-home");
}

export function fetchMe(token: string) {
  return apiGet<User>("/api/me", token);
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface TokenResponse {
  accessToken: string;
  user: User;
}

export function login(body: LoginRequest) {
  return apiPost<TokenResponse, LoginRequest>("/api/auth/login", body);
}

export function register(body: RegisterRequest) {
  return apiPost<TokenResponse, RegisterRequest>("/api/auth/register", body);
}

export type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

export function changePassword(token: string, body: ChangePasswordBody) {
  return apiPut<void, ChangePasswordBody>("/api/me/password", body, token);
}

export function forgotPassword(email: string) {
  return apiPost<void, { email: string }>("/api/auth/forgot-password", { email });
}

export function resetPassword(token: string, newPassword: string) {
  return apiPost<void, { token: string; newPassword: string }>("/api/auth/reset-password", {
    token,
    newPassword,
  });
}

export function fetchCart(token: string) {
  return apiGet<CartResponse>("/api/cart", token);
}

export function addToCart(token: string, productId: number, quantity: number) {
  return apiPost<CartResponse, { productId: number; quantity: number }>(
    "/api/cart/items",
    { productId, quantity },
    token,
  );
}

export function updateCartLine(token: string, lineId: number, quantity: number) {
  return apiPatch<CartResponse, { quantity: number }>(
    `/api/cart/items/${lineId}`,
    { quantity },
    token,
  );
}

export async function removeCartLine(token: string, lineId: number) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/api/cart/items/${lineId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<CartResponse>;
}

export type CheckoutBody = {
  recipientName: string;
  recipientPhone: string;
  shippingStreet: string;
  shippingCity: string;
  shippingRegion?: string;
  shippingPostalCode?: string;
  shippingCountry: string;
  deliveryMethod: "ENVIO_DOMICILIO" | "RETIRO_TIENDA";
  paymentMethod:
    | "TRANSFERENCIA"
    | "EFECTIVO_RETIRO"
    | "WEB_PAY_MOCK"
    | "MERCADOPAGO_CHECKOUT";
  notes?: string;
};

export function checkout(token: string, body: CheckoutBody) {
  return apiPost<OrderDetailAdmin, CheckoutBody>("/api/orders/checkout", body, token);
}

export type PaymentDemoConfirmBody = {
  orderNumber: string;
  sessionToken: string;
};

export function confirmPaymentDemo(token: string, body: PaymentDemoConfirmBody) {
  return apiPost<OrderDetailAdmin, PaymentDemoConfirmBody>(
    "/api/orders/payment/demo/confirm",
    body,
    token,
  );
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

export function fetchMyOrders(token: string) {
  return apiGet<OrderSummary[]>("/api/orders/mine", token);
}

export function fetchOrderTrack(orderNumber: string, email: string) {
  const q = new URLSearchParams({
    orderNumber: orderNumber.trim(),
    email: email.trim().toLowerCase(),
  });
  return apiGet<OrderTrackPublic>(`/api/orders/track?${q.toString()}`);
}

export interface AdminDashboard {
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  revenueLast30Days: number;
  unreadContactMessages: number;
}

export function fetchAdminDashboard(token: string) {
  return apiGet<AdminDashboard>("/api/admin/dashboard", token);
}

export type ProductCreateBody = {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  sku: string | null;
  categoryId: number;
  gameId: number | null;
  preorder: boolean;
  preorderReleaseDate: string | null;
  active: boolean;
  featured: boolean;
  imageUrls: string[];
  tagIds: number[];
};

export type CategoryBody = {
  name: string;
  slug: string;
  parentId: number | null;
  sortOrder: number;
};

export type EventBody = {
  title: string;
  description: string | null;
  imageUrl: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number | null;
  entryFee: number | null;
  externalUrl: string | null;
  featuredOnHome: boolean;
  active: boolean;
};

export type BannerBody = {
  title?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder: number;
  active: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type PromotionBody = {
  name: string;
  promoType: PromotionType;
  value: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  productId: number | null;
};

export type AdjustStockBody = {
  productId: number;
  delta: number;
  reason?: "VENTA" | "AJUSTE_MANUAL" | "DEVOLUCION" | "ENTRADA_INICIAL";
};

export function fetchAdminProducts(
  token: string,
  params: {
    search?: string;
    categoryId?: number;
    active?: boolean;
    lowStockOnly?: boolean;
    lowStockThreshold?: number;
    page?: number;
    size?: number;
  } = {},
) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") q.set(k, String(v));
  });
  return apiGet<PageResponse<ProductSummary>>(`/api/admin/products?${q.toString()}`, token);
}

export function fetchAdminProduct(token: string, id: number) {
  return apiGet<ProductDetail>(`/api/admin/products/${id}`, token);
}

export function createAdminProduct(token: string, body: ProductCreateBody) {
  return apiPost<ProductDetail, ProductCreateBody>("/api/admin/products", body, token);
}

export function updateAdminProduct(token: string, id: number, body: ProductCreateBody) {
  return apiPut<ProductDetail, ProductCreateBody>(`/api/admin/products/${id}`, body, token);
}

export function deleteAdminProduct(token: string, id: number) {
  return apiDelete(`/api/admin/products/${id}`, token);
}

export function fetchAdminCategories(token: string) {
  return apiGet<Category[]>("/api/admin/categories", token);
}

export function fetchAdminCategory(token: string, id: number) {
  return apiGet<Category>(`/api/admin/categories/${id}`, token);
}

export function createAdminCategory(token: string, body: CategoryBody) {
  return apiPost<Category, CategoryBody>("/api/admin/categories", body, token);
}

export function updateAdminCategory(token: string, id: number, body: CategoryBody) {
  return apiPut<Category, CategoryBody>(`/api/admin/categories/${id}`, body, token);
}

export function deleteAdminCategory(token: string, id: number) {
  return apiDelete(`/api/admin/categories/${id}`, token);
}

export type GameBody = {
  name: string;
  slug: string;
  logoUrl?: string | null;
};

export function fetchAdminGames(token: string) {
  return apiGet<Game[]>("/api/admin/games", token);
}

export function createAdminGame(token: string, body: GameBody) {
  return apiPost<Game, GameBody>("/api/admin/games", body, token);
}

export function updateAdminGame(token: string, id: number, body: GameBody) {
  return apiPut<Game, GameBody>(`/api/admin/games/${id}`, body, token);
}

export function deleteAdminGame(token: string, id: number) {
  return apiDelete(`/api/admin/games/${id}`, token);
}

export function fetchAdminTags(token: string) {
  return apiGet<AdminTag[]>("/api/admin/tags", token);
}

export function postAdminInventoryAdjust(token: string, body: AdjustStockBody) {
  return apiPost<void, AdjustStockBody>("/api/admin/inventory/adjust", body, token);
}

export function fetchAdminInventoryMovements(token: string, page = 0, size = 30, productId?: number) {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  if (productId != null) q.set("productId", String(productId));
  return apiGet<PageResponse<InventoryMovementRow>>(
    `/api/admin/inventory/movements?${q.toString()}`,
    token,
  );
}

function filenameFromContentDisposition(header: string | null): string | undefined {
  if (!header) return undefined;
  const quoted = /filename="([^"]+)"/i.exec(header);
  if (quoted?.[1]) return quoted[1];
  const bare = /filename=([^;\s]+)/i.exec(header);
  if (bare?.[1]) return bare[1].replace(/^UTF-8''/i, "");
  return undefined;
}

function fallbackOrdersCsvFilename(status?: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const slug = status ? status.toLowerCase() : "todos";
  return `pedidos-${slug}-${day}.csv`;
}

function fallbackInventoryCsvFilename(productId?: number): string {
  const day = new Date().toISOString().slice(0, 10);
  const slug = productId != null ? `producto-${productId}-` : "todos-";
  return `movimientos-stock-${slug}${day}.csv`;
}

/** Descarga CSV (UTF-8) — usa el mismo filtro de estado que la lista. */
export async function downloadAdminOrdersCsv(token: string, status?: string): Promise<void> {
  const q = new URLSearchParams();
  if (status) q.set("status", status);
  const qs = q.toString();
  const url = `${API_URL}/api/admin/orders/export${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { headers: { Accept: "text/csv", Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(await parseError(res));
  const blob = await res.blob();
  const name =
    filenameFromContentDisposition(res.headers.get("Content-Disposition")) ??
    fallbackOrdersCsvFilename(status);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function downloadAdminInventoryMovementsCsv(
  token: string,
  productId?: number,
): Promise<void> {
  const q = new URLSearchParams();
  if (productId != null) q.set("productId", String(productId));
  const qs = q.toString();
  const url = `${API_URL}/api/admin/inventory/movements/export${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { headers: { Accept: "text/csv", Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(await parseError(res));
  const blob = await res.blob();
  const name =
    filenameFromContentDisposition(res.headers.get("Content-Disposition")) ??
    fallbackInventoryCsvFilename(productId);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function fetchAdminOrders(token: string, page = 0, size = 20, status?: string) {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) q.set("status", status);
  return apiGet<PageResponse<OrderSummary>>(`/api/admin/orders?${q.toString()}`, token);
}

export function fetchAdminOrder(token: string, id: number) {
  return apiGet<OrderDetailAdmin>(`/api/admin/orders/${id}`, token);
}

export function patchAdminOrderStatus(token: string, id: number, status: string) {
  return apiPatch<OrderDetailAdmin, { status: string }>(
    `/api/admin/orders/${id}/status`,
    { status },
    token,
  );
}

export function fetchAdminEvents(token: string) {
  return apiGet<EventItem[]>("/api/admin/events", token);
}

export function fetchAdminEvent(token: string, id: number) {
  return apiGet<EventItem>(`/api/admin/events/${id}`, token);
}

export function createAdminEvent(token: string, body: EventBody) {
  return apiPost<EventItem, EventBody>("/api/admin/events", body, token);
}

export function updateAdminEvent(token: string, id: number, body: EventBody) {
  return apiPut<EventItem, EventBody>(`/api/admin/events/${id}`, body, token);
}

export function deleteAdminEvent(token: string, id: number) {
  return apiDelete(`/api/admin/events/${id}`, token);
}

export function fetchAdminBanners(token: string) {
  return apiGet<BannerAdmin[]>("/api/admin/banners", token);
}

export function fetchAdminBanner(token: string, id: number) {
  return apiGet<BannerAdmin>(`/api/admin/banners/${id}`, token);
}

export function createAdminBanner(token: string, body: BannerBody) {
  return apiPost<BannerAdmin, BannerBody>("/api/admin/banners", body, token);
}

export function updateAdminBanner(token: string, id: number, body: BannerBody) {
  return apiPut<BannerAdmin, BannerBody>(`/api/admin/banners/${id}`, body, token);
}

export function deleteAdminBanner(token: string, id: number) {
  return apiDelete(`/api/admin/banners/${id}`, token);
}

export function fetchAdminPromotions(token: string) {
  return apiGet<PromotionAdmin[]>("/api/admin/promotions", token);
}

export function fetchAdminPromotion(token: string, id: number) {
  return apiGet<PromotionAdmin>(`/api/admin/promotions/${id}`, token);
}

export function createAdminPromotion(token: string, body: PromotionBody) {
  return apiPost<PromotionAdmin, PromotionBody>("/api/admin/promotions", body, token);
}

export function updateAdminPromotion(token: string, id: number, body: PromotionBody) {
  return apiPut<PromotionAdmin, PromotionBody>(`/api/admin/promotions/${id}`, body, token);
}

export function deleteAdminPromotion(token: string, id: number) {
  return apiDelete(`/api/admin/promotions/${id}`, token);
}

export function fetchAdminContactMessages(token: string) {
  return apiGet<ContactMessageRow[]>("/api/admin/contact-messages", token);
}

export function fetchAdminContactMessage(token: string, id: number) {
  return apiGet<ContactMessageDetail>(`/api/admin/contact-messages/${id}`, token);
}

export function patchAdminContactRead(token: string, id: number, read: boolean) {
  return apiPatch<ContactMessageDetail, { read: boolean }>(
    `/api/admin/contact-messages/${id}/read`,
    { read },
    token,
  );
}
