import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  id: string; // Unique identifier for the cart item (usually productId for local carts)
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  image?: string;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'subtotal'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('mk_cart');
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage on items change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('mk_cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = (newItem: Omit<CartItem, 'id' | 'subtotal'>) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.productId === newItem.productId
      );

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        const newQuantity = existingItem.quantity + newItem.quantity;
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          subtotal: newQuantity * existingItem.unitPrice,
        };
        
        return updatedItems;
      }

      // New item
      return [
        ...prevItems,
        {
          ...newItem,
          id: newItem.productId, // Use productId as id for local cart
          subtotal: newItem.quantity * newItem.unitPrice,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity,
            subtotal: quantity * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + item.subtotal, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
