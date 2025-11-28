// src/lib/cart.ts
import { Cart, AddToCartData, UpdateCartItemData } from '@/types/cart';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to handle API errors
const handleApiError = async (response: Response, defaultMessage: string) => {
  if (!response.ok) {
    let errorMessage = defaultMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
};

export async function getCart(): Promise<Cart> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  await handleApiError(response, 'Failed to fetch cart');
  return response.json();
}

export async function addToCart(cartData: AddToCartData): Promise<Cart> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // ✅ FIXED: Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'POST',
    headers,
    body: JSON.stringify(cartData),
    credentials: 'include', // ✅ ADDED credentials
  });

  await handleApiError(response, 'Failed to add item to cart');
  
  return response.json();
}

export async function updateCartItem(itemId: string, updateData: UpdateCartItemData): Promise<Cart> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updateData),
    credentials: 'include',
  });

  await handleApiError(response, 'Failed to update cart item');
  return response.json();
}

export async function removeFromCart(itemId: string): Promise<Cart> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });

  await handleApiError(response, 'Failed to remove item from cart');
  return response.json();
}

export async function clearCart(): Promise<{ message: string }> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });

  await handleApiError(response, 'Failed to clear cart');
  return response.json();
}