import { api, unwrap } from './client';
export const cartApi = {
  get: () => api.get('/cart').then(unwrap<Cart>),
  addItem: (d: { productId: string; quantity: number; customization?: any }) => api.post('/cart/items', d).then(unwrap<Cart>),
  updateItem: (itemId: string, quantity: number) => api.patch(`/cart/items/${itemId}`, { quantity }).then(unwrap<Cart>),
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`).then(unwrap<Cart>),
  clear: () => api.delete('/cart').then(unwrap<Cart>),
};
export type CartItem = { id: string; quantity: number; customization: any; product: { id: string; name: string; price: string; discountPrice: string | null; images: string[]; unit: string } };
export type Cart = { id: string; items: CartItem[]; subtotal?: number };
