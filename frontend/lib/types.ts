export type Role = "ADMIN" | "CLIENTE";
export type AuthProvider = "GOOGLE" | "LOCAL";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: Role;
  profilePictureUrl?: string | null;
  authProvider?: AuthProvider;
  lastLoginAt?: string | null;
  active?: boolean;
  /** Cuentas solo Google no tienen contraseña local. */
  passwordConfigured?: boolean;
  /** 2FA con app autenticador (TOTP). */
  totpEnabled?: boolean;
}

export type ProductType = "SEALED_TCG" | "SINGLE_CARD" | "ACCESSORY" | "BOARD_GAME";

/** Subconjunto en listados para singles */
export interface SingleCardSummary {
  cardName: string | null;
  setName: string | null;
  cardNumber: string | null;
  rarity: string | null;
  condition: string | null;
  language: string | null;
  finishType: string | null;
  bloque: "PE" | "PB" | null;
}

export interface SingleCardDetails {
  cardName: string | null;
  setName: string | null;
  cardNumber: string | null;
  rarity: string | null;
  condition: string | null;
  language: string | null;
  finishType: string | null;
  bloque: "PE" | "PB" | null;
  editionType: string | null;
  artist: string | null;
  manaCostOrCost: string | null;
  attributeOrColor: string | null;
  gradeOrCertification: string | null;
  metadataJson: string | null;
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  /** Ausente en respuestas cacheadas antiguas; tratar como SEALED_TCG */
  productType?: ProductType;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  categoryName: string | null;
  categorySlug: string | null;
  gameName: string | null;
  gameSlug: string | null;
  primaryImageUrl: string | null;
  preorder: boolean;
  preorderReleaseDate: string | null;
  featured: boolean;
  /** Presente en respuestas admin y catálogo */
  active?: boolean;
  /** Admin: unidades reservadas por pedidos pendientes; catálogo suele no enviarlo */
  reservedQuantity?: number | null;
  /** Solo singles; en detalle puede no venir y usarse singleCardDetails */
  singleCard?: SingleCardSummary | null;
}

export interface ProductDetail extends ProductSummary {
  description: string | null;
  sku: string | null;
  categoryId: number | null;
  gameId: number | null;
  active: boolean;
  images: { url: string; sortOrder: number; altText: string | null }[];
  tagSlugs: string[];
  singleCardDetails?: SingleCardDetails | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  parentId: number | null;
}

export interface Game {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface Banner {
  id: number;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
}

/** Banner en panel admin (incluye vigencia y estado) */
export interface BannerAdmin extends Banner {
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export type PromotionType = "PORCENTAJE" | "MONTO_FIJO";

export interface PromotionAdmin {
  id: number;
  name: string;
  promoType: PromotionType;
  value: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  productId: number | null;
}

export interface ContactMessageRow {
  id: number;
  name: string;
  email: string;
  subject: string;
  read: boolean;
  createdAt: string;
}

export interface ContactMessageDetail extends ContactMessageRow {
  phone: string | null;
  body: string;
}

export interface AdminTag {
  id: number;
  name: string;
  slug: string;
}


export interface OrderLineDetail {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderDetailAdmin {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  /** Descuentos por promociones (0 si no aplica o pedido antiguo) */
  discountTotal?: number;
  shippingCost: number;
  total: number;
  recipientName: string;
  recipientPhone: string;
  shippingStreet: string;
  shippingCity: string;
  shippingRegion: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string;
  deliveryMethod: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
  lines: OrderLineDetail[];
  /** Solo en flujo pasarela demo (Mercado Pago simulado): URL absoluta al front. */
  paymentRedirectUrl?: string | null;
}

export interface EventItem {
  id: number;
  title: string;
  description: string | null;
  /** URL de imagen (cartel / flyer), opcional */
  imageUrl: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number | null;
  entryFee: number | null;
  externalUrl: string | null;
  featuredOnHome: boolean;
  active: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CartLine {
  lineId: number;
  productId: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
  lineTotal: number;
}

export interface CartResponse {
  lines: CartLine[];
  /** Suma precio catálogo */
  merchandiseSubtotal: number;
  /** Descuento por promos vigentes */
  promotionDiscount: number;
  /** Neto productos (igual que en pedido confirmado) */
  subtotal: number;
  itemCount: number;
}

export interface InventoryMovementRow {
  id: number;
  productId: number;
  productName: string;
  quantityChange: number;
  reason: string;
  referenceType: string | null;
  referenceId: number | null;
  createdAt: string;
}

/** Consulta pública sin login — mismo email que la cuenta que compró */
export interface OrderTrackLine {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderTrackPublic {
  orderNumber: string;
  status: string;
  subtotal: number;
  discountTotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  lines: OrderTrackLine[];
}
