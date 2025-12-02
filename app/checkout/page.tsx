'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  createRazorpayOrder, 
  verifyPayment, 
  createGuestOrder, 
  createUserOrder 
} from '@/lib/payment-api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Auto-fill email if user is logged in
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user, formData.email]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart.items.length, router]);

  // Check authentication status
  useEffect(() => {
    if (user && !token) {
      setAuthError('Authentication token is missing. Please log in again.');
    } else {
      setAuthError('');
    }
  }, [user, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Helper function to handle user authentication issues
  const handleAuthError = () => {
    setAuthError('Your session has expired. Please log in again.');
  };

  // Payment handler for Razorpay
  const handleRazorpayPayment = async (): Promise<void> => {
    try {
      setPaymentLoading(true);
      setAuthError('');

      // Validate form
      if (!formData.firstName || !formData.lastName || !formData.email || 
          !formData.phone || !formData.address || !formData.city || 
          !formData.state || !formData.pincode) {
        alert('Please fill all the required fields');
        setPaymentLoading(false);
        return;
      }

      // Check authentication for logged-in users
      if (user && !token) {
        handleAuthError();
        setPaymentLoading(false);
        return;
      }

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setPaymentLoading(false);
        return;
      }

      // STEP 1: Create order in database first (gets orderId)
      let orderId: string;
      let finalAmount: number;

      try {
        // Correct shipping address structure
        const shippingAddress = {
          fullName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.pincode,
          country: formData.country
        };

        if (user && token) {
          // Registered user - verify token is available
          if (!token) {
            handleAuthError();
            setPaymentLoading(false);
            return;
          }

          const orderData = {
            products: cart.items.map(item => ({
              product: item.product._id,
              quantity: item.quantity
            })),
            shippingAddress: shippingAddress,
            paymentMethod: 'razorpay' as const
          };

          console.log('Creating user order with data:', orderData);
          const orderResult = await createUserOrder(orderData, token);
          orderId = orderResult.orderId;
          finalAmount = orderResult.finalAmount;
        } else {
          // Guest user
          const orderData = {
            products: cart.items.map(item => ({
              product: item.product._id,
              quantity: item.quantity
            })),
            shippingAddress: shippingAddress,
            guestUser: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone
            },
            paymentMethod: 'razorpay' as const
          };

          console.log('Creating guest order with data:', orderData);
          const orderResult = await createGuestOrder(orderData);
          orderId = orderResult.orderId;
          finalAmount = orderResult.finalAmount;
        }

        console.log('Database order created with ID:', orderId, 'Final amount:', finalAmount);

        // STEP 2: Create Razorpay order using the database orderId
        console.log('Creating Razorpay order with orderId:', orderId);
        const razorpayOrder = await createRazorpayOrder(orderId);

        // Validate Razorpay order response
        if (!razorpayOrder || !razorpayOrder.id || !razorpayOrder.amount) {
          console.error('Invalid Razorpay order:', razorpayOrder);
          throw new Error('Invalid Razorpay order response - missing required fields');
        }

        console.log('Razorpay order created:', razorpayOrder);

        // STEP 3: Open Razorpay checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || 'INR',
          name: 'EcoStore',
          description: 'Order Payment',
          image: '/logo.png',
          order_id: razorpayOrder.id,
          handler: async function (response: any) {
            try {
              console.log('Razorpay payment response:', response);
              
              // STEP 4: Verify payment
              const verificationData = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              };

              console.log('Verifying payment with data:', verificationData);
              const verificationResult = await verifyPayment(verificationData);

              if (verificationResult.success) {
                // Payment successful
                console.log('Payment verified successfully');
                clearCart();
                
                // FIXED: Redirect based on user authentication status
                if (user && token) {
                  // Logged-in user - redirect to profile/orders page
                  console.log('Redirecting logged-in user to profile page with orderId:', orderId);
                  window.location.href = `/profile?orderSuccess=true&orderId=${orderId}`;
                } else {
                  // Guest user - redirect to order success page
                  console.log('Redirecting guest user to order success page with orderId:', orderId);
                  window.location.href = `/order-success?orderId=${orderId}`;
                }
              } else {
                console.error('Payment verification failed');
                alert('Payment verification failed. Please contact support.');
                setPaymentLoading(false);
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              alert('Payment processing failed. Please contact support.');
              setPaymentLoading(false);
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone,
          },
          notes: {
            orderId: orderId,
            address: formData.address,
          },
          theme: {
            color: '#4F46E5', // Changed to blue color
          },
          modal: {
            ondismiss: function() {
              setPaymentLoading(false);
              alert('Payment cancelled. You can try again.');
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        
        razorpay.on('payment.failed', function (response: any) {
          console.error('Payment failed:', response.error);
          alert(`Payment failed: ${response.error.description}`);
          setPaymentLoading(false);
        });

        razorpay.open();

      } catch (orderError: any) {
        console.error('Order creation error:', orderError);
        
        // Handle token expiration specifically
        if (orderError.message?.includes('token') || orderError.message?.includes('auth') || orderError.message?.includes('unauthorized')) {
          handleAuthError();
        } else {
          alert(orderError.message || 'Failed to create order. Please try again.');
        }
        setPaymentLoading(false);
      }
      
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment initialization failed. Please try again.');
      setPaymentLoading(false);
    }
  };

  // Cash on Delivery handler
  const handleCashOnDelivery = async (): Promise<void> => {
    try {
      setLoading(true);
      setAuthError('');

      // Validate form
      if (!formData.firstName || !formData.lastName || !formData.email || 
          !formData.phone || !formData.address || !formData.city || 
          !formData.state || !formData.pincode) {
        alert('Please fill all the required fields');
        setLoading(false);
        return;
      }

      // Check authentication for logged-in users
      if (user && !token) {
        handleAuthError();
        setLoading(false);
        return;
      }

      // Correct shipping address structure
      const shippingAddress = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.pincode,
        country: formData.country
      };

      // Create COD order
      let orderId: string;
      
      if (user && token) {
        // Registered user - verify token is available
        if (!token) {
          handleAuthError();
          setLoading(false);
          return;
        }

        const orderData = {
          products: cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity
          })),
          shippingAddress: shippingAddress,
          paymentMethod: 'cod' as const
        };

        console.log('Creating COD user order:', orderData);
        const orderResult = await createUserOrder(orderData, token);
        orderId = orderResult.orderId;
      } else {
        const orderData = {
          products: cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity
          })),
          shippingAddress: shippingAddress,
          guestUser: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone
          },
          paymentMethod: 'cod' as const
        };

        console.log('Creating COD guest order:', orderData);
        const orderResult = await createGuestOrder(orderData);
        orderId = orderResult.orderId;
      }

      // Clear cart and redirect based on user type
      clearCart();
      console.log('COD order created successfully');
      
      // FIXED: Redirect based on user authentication status
      if (user && token) {
        // Logged-in user - redirect to profile/orders page
        console.log('Redirecting logged-in user to profile page with orderId:', orderId);
        window.location.href = `/profile?orderSuccess=true&orderId=${orderId}`;
      } else {
        // Guest user - redirect to order success page
        console.log('Redirecting guest user to order success page with orderId:', orderId);
        window.location.href = `/order-success?orderId=${orderId}`;
      }
      
    } catch (error: any) {
      console.error('COD order error:', error);
      
      // Handle token expiration specifically
      if (error.message?.includes('token') || error.message?.includes('auth') || error.message?.includes('unauthorized')) {
        handleAuthError();
      } else {
        alert(error.message || 'Order creation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading if cart is empty (will redirect)
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const tax = (cart.totalPrice || 0) * 0.18;
  const shippingFee = (cart.totalPrice || 0) > 500 ? 0 : 50;
  const total = (cart.totalPrice || 0) + tax + shippingFee;

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header with responsive flex layout */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
          {!user && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm">
              <p>
                🛒 Shopping as Guest •{' '}
                <Link href="/signup" className="font-semibold underline hover:text-blue-800 transition-colors duration-200">
                  Create account for faster checkout
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Authentication Error - responsive text */}
        {authError && (
          <div className="mb-4 sm:mb-6 bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm sm:text-base">{authError}</span>
            </div>
            <div className="mt-2">
              <Link href="/login" className="text-red-600 underline font-semibold hover:text-red-700 transition-colors duration-200 text-sm sm:text-base">
                Click here to log in again
              </Link>
            </div>
          </div>
        )}
        
        {/* Grid layout - stacked on mobile, side-by-side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-sm sm:shadow-md p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              {user ? 'Shipping Information' : 'Guest Checkout'}
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Name fields - stacked on mobile, side-by-side on medium+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Email field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>

              {/* Phone field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Address field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your complete address"
                />
              </div>

              {/* City/State/PIN - stacked on mobile, 3-column on medium+ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="PIN Code"
                  />
                </div>
              </div>

              {/* Country field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <select
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Order Summary & Payment */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm sm:shadow-md p-4 sm:p-6 border border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm sm:text-base">₹{((item.product.price || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Subtotal</span>
                  <span>₹{(cart.totalPrice || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Tax (18%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-semibold border-t pt-2">
                  <span>Total</span>
                  <span className="text-blue-600">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm sm:shadow-md p-4 sm:p-6 border border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleRazorpayPayment}
                  disabled={paymentLoading || loading || !!authError}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-blue-500/25 cursor-pointer text-sm sm:text-base"
                >
                  {paymentLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Pay ₹${total.toFixed(2)}`
                  )}
                </button>

                <button
                  onClick={handleCashOnDelivery}
                  disabled={loading || paymentLoading || !!authError}
                  className="w-full border border-blue-500 text-blue-500 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:shadow-lg text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-500 mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Cash on Delivery'
                  )}
                </button>
              </div>

              {/* User Status */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                {user ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-xs sm:text-sm">Logged in as {user.name}</span>
                    {!token && (
                      <span className="text-xs text-red-600">(Token missing!)</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-xs sm:text-sm">Checking out as guest</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}