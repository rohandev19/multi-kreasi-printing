import { useState, useEffect } from 'react';
import axios from '../api/axios';

interface CartItem {
  productId: string;
  quantity: number;
  productName: string;
  unitPrice: number;
  subtotal: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  totalAmount: number;
}

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/cart');
      setCart(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    setLoading(true);
    try {
      await axios.post('/api/v1/cart/items', { productId, quantity });
      await fetchCart();
      setError(null);
    } catch (err) {
      setError('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
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
  }, []);

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
