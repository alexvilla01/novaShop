export interface ProductSummary {
  id: number;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  categoryName: string;
  categorySlug: string;
  available: boolean;
}

export interface ProductDetail {
  id: number;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrls: string[];
  categoryName: string;
  categorySlug: string;
  stock: number;
  available: boolean;
}

export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
}

export interface ProductPageResponse {
  content: ProductSummary[];
  totalElements: number;
  page: number;
}

export interface AdminProduct {
  id: number;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  origin: "PROPIO" | "DROPSHIPPING";
  isActive: boolean;
  imageUrls: string[];
  categoryName: string;
  categorySlug: string;
  available: boolean;
}

export interface AdminOrder {
  id: number;
  createdAt: string;
  productSlug: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
  channel: "WHATSAPP";
}

export interface OrderCreatedResponse {
  orderId: number;
  whatsappUrl: string;
}

export interface ProductMutationPayload {
  slug?: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  origin: "PROPIO" | "DROPSHIPPING";
  imageUrls: string[];
  categorySlug: string;
}
