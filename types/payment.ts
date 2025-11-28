export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Add new interface for shipment data
export interface ShipmentData {
  shipmentId: string;
  awbNumber: string;
  courierName: string;
  status: string;
  labelUrl: string;
  manifestUrl: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  order: any;
  message: string;
  shipment?: {
    success: boolean;
    message: string;
    data?: ShipmentData;
    error?: string;
    note?: string;
  };
}