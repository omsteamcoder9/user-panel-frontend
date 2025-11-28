// types/order.ts - FULL UPDATED CODE
export interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string; // Backend uses 'image' not 'images'
  };
  quantity: number;
  price: number;
  name?: string; // Backend includes name
  selectedSize?: string; // ✅ ADDED: Selected size field
}

export interface Order {
  _id: string;
  orderId: string; // Backend uses 'orderId' not 'orderNumber'
  user: string;
  products: OrderItem[]; // Backend uses 'products' not 'items'
  totalAmount: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed'; // Backend uses 'completed' not 'paid'
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingFee?: number;
  taxAmount?: number;
  finalAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[]; // Backend returns 'orders' not 'data'
  message?: string;
}

export interface OrderResponse {
  success: boolean;
  order: Order; // Backend returns 'order' not 'data'
  message?: string;
}