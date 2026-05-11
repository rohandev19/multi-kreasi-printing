import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';

const GUEST_CART_KEY = 'mk_guest_cart';

export interface CartItem {
  productId: string;
  quantity: number;
  productName: string;
  unitPrice: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalAmount: number;
}

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuth = !!localStorage.getItem('token');

  const getGuestCart = (): Cart => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    
    return { id: 'guest-cart', items: [], totalAmount: 0 };
  };

  const saveGuestCart = (newCart: Cart) => {
    // Recalculate total amount
    newCart.totalAmount = newCart.items.reduce((sum, item) => sum + item.subtotal, 0);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
    setCart(newCart);
  };

  const fetchCart = useCallback(async () => {
    if (!isAuth) {
      setCart(getGuestCart());
      return;
    }

    setLoading(true);
    try {
      // For authenticated users, merge guest cart first if any exists, then get
      const guestCart = getGuestCart();
      if (guestCart.items.length > 0) {
        const payload = {
          guestCartItems: guestCart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        };
        const response = await axios.post('/api/v1/cart/merge', payload);
        setCart(response.data);
        localStorage.removeItem(GUEST_CART_KEY); // Clear guest cart after merge
      } else {
        const response = await axios.get('/api/v1/cart');
        setCart(response.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, [isAuth]);

  const addToCart = async (product: any, quantity: number) => {
    if (!isAuth) {
      const guestCart = getGuestCart();
      const existingIdx = guestCart.items.findIndex(i => i.productId === product.id);
      
      if (existingIdx >= 0) {
        guestCart.items[existingIdx].quantity += quantity;
        guestCart.items[existingIdx].subtotal = guestCart.items[existingIdx].quantity * product.basePrice;
      } else {
        guestCart.items.push({
          productId: product.id,
          quantity: quantity,
          productName: product.name,
          unitPrice: product.basePrice,
          subtotal: quantity * product.basePrice
        });
      }
      saveGuestCart(guestCart);
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/v1/cart/items', { productId: product.id, quantity });
      await fetchCart();
      setError(null);
    } catch (err) {
      setError('Failed to add to cart');
      throw err; // throw so caller can see error
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isAuth) {
      const guestCart = getGuestCart();
      guestCart.items = guestCart.items.filter(i => i.productId !== productId);
      saveGuestCart(guestCart);
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/api/v1/cart/items/${productId}`);
      await fetchCart();
      setError(null);
    } catch (err) {
      setError('Failed to remove from cart');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    if (!isAuth) {
      const guestCart = getGuestCart();
      const item = guestCart.items.find(i => i.productId === productId);
      if (item) {
        item.quantity = quantity;
        item.subtotal = quantity * item.unitPrice;
        saveGuestCart(guestCart);
      }
      return;
    }

    setLoading(true);
    try {
      await axios.patch(`/api/v1/cart/items/${productId}`, { quantity });
      await fetchCart();
      setError(null);
    } catch (err) {
      setError('Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuth) {
      localStorage.removeItem(GUEST_CART_KEY);
      setCart({ id: 'guest-cart', items: [], totalAmount: 0 });
      return;
    }

    setLoading(true);
    try {
      await axios.delete('/api/v1/cart');
      await fetchCart();
      setError(null);
    } catch (err) {
      setError('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    
    // Listen for storage changes to sync cart across tabs (optional but nice)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === GUEST_CART_KEY && !isAuth) {
        fetchCart();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchCart, isAuth]);

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return {
    cart,
    items: cart?.items || [],
    totalItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    refetch: fetchCart,
  };
}
