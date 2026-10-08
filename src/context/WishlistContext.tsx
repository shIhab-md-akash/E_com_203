import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Wishlist } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useCart } from './CartContext';

interface WishlistContextType {
  wishlist: Wishlist | null;
  loading: boolean;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<boolean>;
  removeFromWishlist: (itemIdOrProductId: number) => Promise<boolean>;
  moveToCart: (itemId: number) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { refreshCart } = useCart();

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/api/wishlist/');
      if (res.data?.data) {
        setWishlist(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isInWishlist = (productId: number): boolean => {
    if (!wishlist?.items) return false;
    return wishlist.items.some((item) => item.product.id === productId);
  };

  const toggleWishlist = async (productId: number): Promise<boolean> => {
    if (!isAuthenticated) {
      showToast('Please sign in to manage your wishlist.', 'info');
      return false;
    }

    if (isInWishlist(productId)) {
      return removeFromWishlist(productId);
    } else {
      try {
        const res = await api.post('/api/wishlist/', { product_id: productId });
        setWishlist(res.data.data);
        showToast('Added to wishlist', 'success');
        return true;
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Could not add to wishlist.';
        showToast(msg, 'error');
        return false;
      }
    }
  };

  const removeFromWishlist = async (itemIdOrProductId: number): Promise<boolean> => {
    try {
      const res = await api.delete(`/api/wishlist/${itemIdOrProductId}/`);
      setWishlist(res.data.data);
      showToast('Removed from wishlist', 'info');
      return true;
    } catch (err: any) {
      showToast('Failed to update wishlist', 'error');
      return false;
    }
  };

  const moveToCart = async (itemId: number): Promise<boolean> => {
    try {
      const res = await api.post(`/api/wishlist/${itemId}/move-to-cart/`);
      setWishlist(res.data.data);
      await refreshCart();
      showToast('Moved item to shopping cart!', 'success');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to move to cart.';
      showToast(msg, 'error');
      return false;
    }
  };

  const wishlistCount = wishlist?.items?.length || 0;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        moveToCart,
        refreshWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
