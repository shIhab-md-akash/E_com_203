import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Cart } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (itemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/api/cart/');
      if (res.data?.data) {
        setCart(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: number, quantity: number = 1): Promise<boolean> => {
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart.', 'info');
      return false;
    }
    try {
      const res = await api.post('/api/cart/items/', { product_id: productId, quantity });
      setCart(res.data.data);
      showToast(res.data.message || 'Added to cart!', 'success');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not add product to cart.';
      showToast(msg, 'error');
      return false;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number): Promise<boolean> => {
    try {
      const res = await api.patch(`/api/cart/items/${itemId}/`, { quantity });
      setCart(res.data.data);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update item quantity.';
      showToast(msg, 'error');
      return false;
    }
  };

  const removeFromCart = async (itemId: number): Promise<boolean> => {
    try {
      const res = await api.delete(`/api/cart/items/${itemId}/`);
      setCart(res.data.data);
      showToast('Item removed from cart', 'info');
      return true;
    } catch (err: any) {
      showToast('Failed to remove item', 'error');
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    try {
      const res = await api.delete('/api/cart/clear/');
      setCart(res.data.data);
      showToast('Cart cleared', 'info');
      return true;
    } catch (err: any) {
      showToast('Failed to clear cart', 'error');
      return false;
    }
  };

  const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
