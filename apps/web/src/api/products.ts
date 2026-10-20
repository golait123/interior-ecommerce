import { api, unwrap } from './client';

export interface RoomCategory {
  slug: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}

export interface SpaceLeafItem {
  id: string;
  slug: string;
  name: string;
  icon: string;
  domain: 'indoor' | 'outdoor';
  parentId: 'indoor' | 'outdoor';
  description: string;
  craftHighlights: string[];
  count: number;
}

export interface SpaceDomainItem {
  id: 'indoor' | 'outdoor';
  slug: 'indoor' | 'outdoor';
  name: string;
  icon: string;
  domain: 'indoor' | 'outdoor';
  description: string;
  count: number;
  children: SpaceLeafItem[];
}

export interface SpacesTreeResponse {
  totalProducts: number;
  domains: SpaceDomainItem[];
}

export const productsApi = {
  list: (params?: { page?: number; limit?: number; q?: string; category?: string; room?: string; space?: string }) =>
    api.get('/products', { params }).then(unwrap<ProductsResponse>),
  categories: () => api.get('/products/categories').then(unwrap<Category[]>),
  roomCategories: () => api.get('/products/room-categories').then(unwrap<RoomCategory[]>),
  spacesTree: () => api.get('/products/spaces-tree').then(unwrap<SpacesTreeResponse>),
  get: (id: string) => api.get(`/products/${id}`).then(unwrap<Product>),
  create: (d: any) => api.post('/products', d).then(unwrap<Product>),
  update: (id: string, d: any) => api.put(`/products/${id}`, d).then(unwrap<Product>),
  delete: (id: string, force?: boolean) => api.delete(`/products/${id}`, { params: { force } }).then(unwrap<{ success: boolean; message: string; deleted?: boolean; archived?: boolean }>),
  updateStock: (id: string, data: { action: 'set' | 'add' | 'deduct'; quantity: number; reason?: string }) =>
    api.patch(`/products/${id}/stock`, data).then(unwrap<Product>),
  toggleOutOfStock: (id: string, outOfStock?: boolean) =>
    api.patch(`/products/${id}/out-of-stock`, { outOfStock }).then(unwrap<Product>),
  toggleStatus: (id: string) => api.patch(`/products/${id}/status`, {}).then(unwrap<Product>),
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  sku: string;
  price: string;
  discountPrice: string | null;
  unit: string;
  pricePerSqFt: string | null;
  material: string | null;
  finish: string | null;
  images: string[];
  isCustomizable: boolean;
  isActive: boolean;
  category: Category;
  inventory?: Inventory;
  inventoryAvailable?: number;
  rooms?: string[];
  spaces?: { id: string; slug: string; name: string; icon: string; domain: string }[];
  spaceSlugs?: string[];
  primaryDomain?: 'indoor' | 'outdoor' | 'both';
  botanicalBenefits?: string[];
  rating?: number;
  reviewCount?: number;
  offerText?: string;
  priceRange?: string;
  productType?: string;
  inStock?: boolean;
};

export type Category = { id: string; name: string; slug: string };
export type Inventory = { totalQuantity: number; reservedQuantity: number; damagedQuantity: number; reorderLevel: number };
export type ProductsResponse = { items: Product[]; total: number; page: number; limit: number; totalPages: number };

