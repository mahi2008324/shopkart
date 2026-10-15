import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart, updateCartQuantity, removeFromCart } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  // ── Derived values ─────────────────────────────────────────────────────────
  // Total number of individual units across all line items
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Total rupee value
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

  // ── Fetch cart from backend ────────────────────────────────────────────────
  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    setCartLoading(true);
    setCartError(null);
    try {
      const res = await getCart();
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
      }
    } catch {
      setCartError('Unable to load cart.');
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  // Fetch on mount and whenever the logged-in user changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  /**
   * Add product to cart. Returns { success, message }.
   */
  const addItem = async (productId) => {
    try {
      const res = await addToCart(productId);
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add to cart';
      return { success: false, message };
    }
  };

  /**
   * Change the quantity of an item already in the cart.
   */
  const changeQuantity = async (productId, quantity) => {
    try {
      const res = await updateCartQuantity(productId, quantity);
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update quantity';
      return { success: false, message };
    }
  };

  /**
   * Remove a product from the cart entirely.
   */
  const removeItem = async (productId) => {
    try {
      const res = await removeFromCart(productId);
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove item';
      return { success: false, message };
    }
  };

  /**
   * Check whether a product is currently in the cart.
   */
  const isInCart = (productId) =>
    cartItems.some((item) => item.product?._id === productId);

  /**
   * Get the quantity for a specific product in the cart.
   */
  const getQuantity = (productId) => {
    const item = cartItems.find((item) => item.product?._id === productId);
    return item?.quantity ?? 0;
  };

  /**
   * Clear local cart state after successful payment verification.
   */
  const clearCartState = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartError,
        cartCount,
        cartSubtotal,
        refreshCart,
        clearCartState,
        addItem,
        changeQuantity,
        removeItem,
        isInCart,
        getQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
