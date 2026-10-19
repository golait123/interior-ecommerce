import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartApi, Cart, CartItem } from '../api/cart';
import { useAuth } from './AuthContext';

interface CartCtx {
  cart: Cart | null;
  itemCount: number;
  subtotal: number;
  loading: boolean;
  addItem: (productId: string, quantity?: number, customization?: any) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => void;
}

const Ctx = createContext<CartCtx>(null!);
export const useCart = () => useContext(Ctx);

export const getItemUnitPrice = (item: { product: { price: any; discountPrice?: any }; customization?: any }): number => {
  const cust = item.customization;
  if (cust) {
    if (typeof cust.unitPrice === 'number' && cust.unitPrice > 0) return cust.unitPrice;
    if (typeof cust.customPrice === 'number' && cust.customPrice > 0) return cust.customPrice;
    if (typeof cust.materialCost === 'number' && cust.materialCost > 0) return cust.materialCost;
    if (typeof cust.materialSubtotal === 'number' && cust.materialSubtotal > 0) return cust.materialSubtotal;
    if (typeof cust.subtotal === 'number' && cust.subtotal > 0 && (item as any).quantity > 0) {
      return Math.round(cust.subtotal / (item as any).quantity);
    }
  }
  return Number(item.product.discountPrice ?? item.product.price ?? 0);
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    if (!user || user.role !== 'CUSTOMER') return;
    try { setCart(await cartApi.get()); } catch {}
  };

  useEffect(() => { fetch(); }, [user]);

  const wrap = async (action: () => Promise<Cart>) => {
    setLoading(true);
    try { setCart(await action()); } finally { setLoading(false); }
  };

  const addItem = (productId: string, quantity = 1, customization?: any) =>
    wrap(() => cartApi.addItem({ productId, quantity, customization }));
  const removeItem = (itemId: string) => wrap(() => cartApi.removeItem(itemId));
  const updateItem = (itemId: string, quantity: number) => wrap(() => cartApi.updateItem(itemId, quantity));
  const clearCart = () => wrap(() => cartApi.clear());

  const items: CartItem[] = cart?.items || [];
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.quantity * getItemUnitPrice(i), 0);

  return <Ctx.Provider value={{ cart, itemCount, subtotal, loading, addItem, removeItem, updateItem, clearCart, refetch: fetch }}>{children}</Ctx.Provider>;
}
