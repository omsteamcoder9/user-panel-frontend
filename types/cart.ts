import { Product } from './product';

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  // ✅ Add selected size
  selectedSize?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
  // ✅ Add size to AddToCartData
  size?: string;
}

export interface UpdateCartItemData {
  quantity: number;
  // ✅ Add size to UpdateCartItemData
  size?: string;
}