'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderSuccessPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10); // Countdown for auto-redirect

  useEffect(() => {
    // Get orderId from URL parameters using window.location
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdParam = urlParams.get('orderId');
    
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }

    // Clear cart data
    localStorage.removeItem('guestCart');
  }, []);

  // Countdown effect
  useEffect(() => {
    if (!orderId) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId]);

  // Separate effect for redirect when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && orderId) {
      router.push('/');
    }
  }, [countdown, orderId, router]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          
          <p className="text-gray-600 mb-2">
            Thank you for your purchase. Your order has been confirmed and will be shipped soon.
          </p>
          <p className="text-gray-600 mb-6">
            Order ID: <span className="font-mono font-semibold">#{orderId}</span>
          </p>

          <div className="space-y-4 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                You will receive an order confirmation email shortly with all the details.
              </p>
              <p className="text-blue-600 text-sm mt-2 font-medium">
                Redirecting to home page in {countdown} seconds...
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium text-center"
            >
              Continue Shopping
            </Link>
            <Link 
              href="/"
              className="border border-gray-900 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-900 hover:text-white transition-colors font-medium text-center"
            >
              Go to Home Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}