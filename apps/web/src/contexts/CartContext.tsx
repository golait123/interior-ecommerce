import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { cartApi, Cart, CartItem } from '../api/cart';
import { useAuth } from './AuthContext';

export interface PendingCartItem {
  productId: string;
  quantity: number;
  customization?: any;
  productName?: string;
  returnTo?: string;
}

export const setPendingCartItem = (item: PendingCartItem) => {
  try {
    localStorage.setItem('interiorg_pending_cart_item', JSON.stringify(item));
  } catch {}
};

export const getPendingCartItem = (): PendingCartItem | null => {
  try {
    const raw = localStorage.getItem('interiorg_pending_cart_item');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearPendingCartItem = () => {
  try {
    localStorage.removeItem('interiorg_pending_cart_item');
  } catch {}
};

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
  const [cart, setCart] = useState<Cart | null>(() => {
    try {
      const saved = localStorage.getItem('interiorg_cart');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Sync to localStorage whenever cart changes
  const updateCartState = (newCart: Cart | null) => {
    setCart(newCart);
    try {
      if (newCart) {
        localStorage.setItem('interiorg_cart', JSON.stringify(newCart));
      } else {
        localStorage.removeItem('interiorg_cart');
      }
    } catch {}
  };

  const fetch = async () => {
    try {
      let serverCart = await cartApi.get();

      // Check if user had a piece they tried to add before logging in
      if (user) {
        const pending = getPendingCartItem();
        if (pending?.productId) {
          try {
            serverCart = await cartApi.addItem({
              productId: pending.productId,
              quantity: pending.quantity || 1,
              customization: pending.customization,
            });
            toast.success(
              `Added ${pending.productName || 'your selected piece'} to your cart!`,
              { id: 'pending-cart-added', duration: 4000, icon: '🛍️' }
            );
          } catch {}
          clearPendingCartItem();
        }

        // Also merge any local guest cart items into user's account cart
        const localRaw = localStorage.getItem('interiorg_cart');
        if (localRaw) {
          try {
            const localCart = JSON.parse(localRaw);
            if (Array.isArray(localCart.items) && localCart.items.length > 0) {
              for (const item of localCart.items) {
                if (item.product?.id) {
                  const alreadyOnServer = serverCart?.items?.some((si: any) => si.product?.id === item.product.id);
                  if (!alreadyOnServer) {
                    serverCart = await cartApi.addItem({
                      productId: item.product.id,
                      quantity: item.quantity || 1,
                      customization: item.customization,
                    });
                  }
                }
              }
            }
          } catch {}
        }
      }

      if (serverCart && Array.isArray(serverCart.items)) {
        updateCartState(serverCart);
      }
    } catch {}
  };

  useEffect(() => {
    fetch();
  }, [user]);

  const wrap = async (action: () => Promise<Cart>) => {
    setLoading(true);
    try {
      const updated = await action();
      updateCartState(updated);
    } catch {
      // In case server fails, preserve local cart
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId: string, quantity = 1, customization?: any) => {
    setLoading(true);
    try {
      const updated = await cartApi.addItem({ productId, quantity, customization });
      updateCartState(updated);
    } catch {
      // Fallback local cart update so user never loses their item
      setCart((prev) => {
        const curItems = prev?.items ? [...prev.items] : [];
        const existingIdx = curItems.findIndex((it) => it.product?.id === productId);
        if (existingIdx >= 0) {
          curItems[existingIdx] = {
            ...curItems[existingIdx],
            quantity: curItems[existingIdx].quantity + quantity,
          };
        } else {
          curItems.push({
            id: 'item_local_' + Date.now(),
            quantity,
            customization,
            product: {
              id: productId,
              name: 'Curated Artisan Piece',
              price: '2499',
              discountPrice: null,
              images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'],
              unit: 'piece',
            },
          });
        }
        const updatedLocal: Cart = {
          id: prev?.id || 'cart_local',
          items: curItems,
        };
        try {
          localStorage.setItem('interiorg_cart', JSON.stringify(updatedLocal));
        } catch {}
        return updatedLocal;
      });
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (itemId: string) => wrap(() => cartApi.removeItem(itemId));
  const updateItem = (itemId: string, quantity: number) => wrap(() => cartApi.updateItem(itemId, quantity));
  const clearCart = () => wrap(() => cartApi.clear());

  const items: CartItem[] = cart?.items || [];
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.quantity * getItemUnitPrice(i), 0);

  return <Ctx.Provider value={{ cart, itemCount, subtotal, loading, addItem, removeItem, updateItem, clearCart, refetch: fetch }}>{children}</Ctx.Provider>;
}
