import { api, unwrap } from './client';
export const ordersApi = {
  create: (d: { addressId: string; items: { productId: string; quantity: number; customization?: any }[] }) =>
    api.post('/orders', d).then(unwrap<Order>),
  list: () => api.get('/orders').then(unwrap<Order[]>),
  get: (id: string) => api.get(`/orders/${id}`).then(unwrap<Order>),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }).then(unwrap<Order>),
};
export type Order = {
  id: string; orderNumber: string; status: string; subtotal: string; tax: string; total: string;
  createdAt: string; items: OrderItem[]; payment?: { status: string };
  address?: { line1: string; city: string; state: string; postalCode: string; country?: string };
  user?: { id: string; name: string; email: string };
};
export type OrderItem = { id: string; quantity: number; unitPrice: string; product: { name: string; images: string[] } };
