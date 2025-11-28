'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/product';
import { Cart, CartItem } from '@/types/cart';
import * as cartAPI from '@/lib/cart';
import { useAuth } from '@/context/AuthContext';

interface CartContextType {
  cart: Cart;
  loading: boolean;
  addingProductId: string | null;
  isGuest: boolean;
  addToCart: (product: Product, quantity: number, size?: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const initialCart: Cart = {
  _id: 'guest-cart',
  user: '',
  items: [],
  totalPrice: 0,
  totalItems: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [loading, setLoading] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const { user } = useAuth();

  // Determine if user is guest (not authenticated)
  const isGuest = !user;

  // Load guest cart from localStorage on initial load
  useEffect(() => {
    if (isGuest) {
      loadGuestCart();
    }
  }, []);

  const loadGuestCart = () => {
    try {
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // ✅ Ensure items array exists
        if (!parsedCart.items) {
          parsedCart.items = [];
        }
        setCart(parsedCart);
        console.log('🛒 Loaded guest cart:', parsedCart);
      } else {
        // ✅ Initialize with empty cart if nothing in localStorage
        setCart(initialCart);
      }
    } catch (error) {
      console.error('Error loading guest cart:', error);
      // ✅ Fallback to initial cart on error
      setCart(initialCart);
    }
  };

  const saveGuestCart = (guestCart: Cart) => {
    try {
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      console.log('🛒 Saved guest cart:', guestCart);
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  };

  const refreshCart = async () => {
    try {
      if (user) {
        // Authenticated user - fetch from API
        const cartData = await cartAPI.getCart();
        setCart(cartData);
        console.log('🛒 Loaded user cart:', cartData);
      } else {
        // Guest user - load from localStorage
        loadGuestCart();
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (isGuest) {
        loadGuestCart(); // Fallback to guest cart
      } else {
        setCart(initialCart);
      }
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  // ✅ FIXED: Guest cart functions with proper item matching and safe array access
  const handleGuestAddToCart = (product: Product, quantity: number, size?: string): Cart => {
    // ✅ FIXED: Ensure cart.items always exists
    const guestCart = { 
      ...cart,
      items: cart.items ? [...cart.items] : [] // Ensure items array exists
    };
    
    console.log('🛒 Guest cart before add:', guestCart);
    
    // Create consistent identifier for product + size combination
    const itemUniqueId = `${product._id}-${size || 'nosize'}`;
    
    // ✅ FIXED: Safe findIndex with fallback
    const existingItemIndex = guestCart.items.findIndex(
      item => item && item.product && item.product._id === product._id && item.selectedSize === size
    );
    
    if (existingItemIndex > -1) {
      // ✅ Update quantity of existing item
      guestCart.items[existingItemIndex].quantity += quantity;
      guestCart.items[existingItemIndex].updatedAt = new Date().toISOString();
      console.log('🛒 Updated existing item quantity:', guestCart.items[existingItemIndex]);
    } else {
      // ✅ Create new item with consistent ID
      const guestItemId = `guest-${itemUniqueId}`;
      
      const newItem: CartItem = {
        _id: guestItemId,
        product,
        quantity,
        selectedSize: size,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      guestCart.items.push(newItem);
      console.log('🛒 Added new item:', newItem);
    }
    
    // Recalculate totals
    guestCart.totalItems = guestCart.items.reduce((sum, item) => sum + item.quantity, 0);
    guestCart.totalPrice = guestCart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    guestCart.updatedAt = new Date().toISOString();
    
    // Save to localStorage
    saveGuestCart(guestCart);
    
    console.log('🛒 Cart after add - Total items:', guestCart.totalItems, 'Items:', guestCart.items);
    return guestCart;
  };

  const handleGuestUpdateCartItem = (itemId: string, quantity: number): Cart => {
    const guestCart = { 
      ...cart,
      items: cart.items ? [...cart.items] : []
    };
    const itemIndex = guestCart.items.findIndex(item => item._id === itemId);
    
    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        guestCart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        guestCart.items[itemIndex].quantity = quantity;
        guestCart.items[itemIndex].updatedAt = new Date().toISOString();
      }
      
      // Recalculate totals
      guestCart.totalItems = guestCart.items.reduce((sum, item) => sum + item.quantity, 0);
      guestCart.totalPrice = guestCart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      guestCart.updatedAt = new Date().toISOString();
      
      // Save to localStorage
      saveGuestCart(guestCart);
    }
    
    return guestCart;
  };

  const handleGuestRemoveFromCart = (itemId: string): Cart => {
    const guestCart = { 
      ...cart,
      items: cart.items ? [...cart.items] : []
    };
    guestCart.items = guestCart.items.filter(item => item._id !== itemId);
    
    // Recalculate totals
    guestCart.totalItems = guestCart.items.reduce((sum, item) => sum + item.quantity, 0);
    guestCart.totalPrice = guestCart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    guestCart.updatedAt = new Date().toISOString();
    
    // Save to localStorage
    saveGuestCart(guestCart);
    
    return guestCart;
  };

  const handleGuestClearCart = (): Cart => {
    const emptyCart = { ...initialCart };
    emptyCart.updatedAt = new Date().toISOString();
    saveGuestCart(emptyCart);
    return emptyCart;
  };

  // ✅ FIXED: addToCart with proper state updates
const addToCart = async (product: Product, quantity: number, size?: string) => {
  try {
    setAddingProductId(product._id);
    setLoading(true);
    
    if (isGuest) {
      const updatedCart = handleGuestAddToCart(product, quantity, size);
      setCart(updatedCart);
    } else {
      // ✅ Simple API call - backend returns updated cart directly
      const updatedCart = await cartAPI.addToCart({
        productId: product._id,
        quantity,
        size
      });
      setCart(updatedCart);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  } finally {
    setLoading(false);
    setAddingProductId(null);
  }
};
const updateCartItem = async (itemId: string, quantity: number) => {
  try {
    setLoading(true);
    
    if (isGuest) {
      setCart(handleGuestUpdateCartItem(itemId, quantity));
    } else {
      await cartAPI.updateCartItem(itemId, { quantity });
      // ✅ Refresh from API
      const updatedCart = await cartAPI.getCart();
      setCart(updatedCart);
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

const removeFromCart = async (itemId: string) => {
  try {
    setLoading(true);
    
    if (isGuest) {
      setCart(handleGuestRemoveFromCart(itemId));
    } else {
      await cartAPI.removeFromCart(itemId);
      // ✅ Refresh from API
      const updatedCart = await cartAPI.getCart();
      setCart(updatedCart);
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

  const clearCart = async () => {
    try {
      setLoading(true);
      
      if (isGuest) {
        const updatedCart = handleGuestClearCart();
        setCart(updatedCart);
      } else {
        await cartAPI.clearCart();
        setCart(initialCart);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: CartContextType = {
    cart,
    loading,
    addingProductId,
    isGuest,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};