import { api, unwrap } from './client';
export const inventoryApi = {
  list: () => api.get('/inventory').then(unwrap<InventoryRow[]>),
  alerts: () => api.get('/inventory/alerts').then(unwrap<InventoryRow[]>),
  transactions: (params?: { productId?: string; page?: number; limit?: number }) =>
    api.get('/inventory/transactions', { params }).then(unwrap<any>),
  mutate: (d: { productId: string; quantity: number; type: string; reason?: string }) =>
    api.post('/inventory/mutate', d).then(unwrap<InventoryRow>),
};
export type InventoryRow = {
  id: string; productId: string; totalQuantity: number; reservedQuantity: number;
  damagedQuantity: number; reorderLevel: number; warehouseLocation: string;
  available: number; isLowStock: boolean;
  product: { id: string; name: string; sku: string };
};
