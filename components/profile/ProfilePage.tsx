// app/profile/page.tsx - UPDATED CODE WITH CANCELLED ORDERS POPUP
'use client';

import { useState, useEffect } from 'react';
import { getUserOrders, getOrderById } from '@/lib/order-api';
import { Order } from '@/types/order';
import { useRouter } from 'next/navigation';

// Cancel order function for profile page
const cancelOrder = async (orderId: string, token: string, cancellationReason?: string): Promise<Order> => {
  try {
    const cancelData: any = {};
    if (cancellationReason) {
      cancelData.cancellationReason = cancellationReason;
    }

    console.log('🔄 Profile: Sending cancel request', {
      orderId,
      hasToken: !!token,
      cancellationReason
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cancelData),
    });

    console.log('📥 Profile: Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Profile: Cancel error response:', errorText);
      throw new Error(`Failed to cancel order: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Profile: Cancel success response:', data);
    return data.order;
  } catch (error) {
    console.error('💥 Profile: Error cancelling order:', error);
    throw error;
  }
};

export default function UserProfile() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelledOrdersModal, setShowCancelledOrdersModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        console.log('🔑 Token from localStorage:', token ? 'Present' : 'Missing');
        
        if (!token) {
          setError('Please log in to view your orders');
          setLoading(false);
          return;
        }

        console.log('🔄 Starting to fetch orders...');
        const userOrders = await getUserOrders(token);
        console.log('✅ Orders received:', userOrders);
        
        setOrders(userOrders);
        
        // Separate active and cancelled orders
        const nonCancelledOrders = userOrders.filter(order => order.orderStatus !== 'cancelled');
        const cancelledOrdersList = userOrders.filter(order => order.orderStatus === 'cancelled');
        
        setActiveOrders(nonCancelledOrders);
        setCancelledOrders(cancelledOrdersList);
        
      } catch (err: any) {
        console.error('❌ Error fetching orders:', err);
        setError(err.message || 'Failed to load orders. Please check if the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view order details');
        return;
      }
      
      console.log('🔄 Fetching order details for:', orderId);
      const order = await getOrderById(orderId, token);
      setSelectedOrder(order);
    } catch (err: any) {
      console.error('❌ Error fetching order details:', err);
      setError('Failed to load order details: ' + err.message);
    }
  };

  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to cancel order');
        return;
      }

      setCancellingOrderId(selectedOrder._id);
      const updatedOrder = await cancelOrder(selectedOrder._id, token, cancellationReason);
      
      // Update the orders state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === selectedOrder._id 
            ? { ...order, orderStatus: 'cancelled' }
            : order
        )
      );
      
      // Move from active to cancelled
      setActiveOrders(prevOrders => 
        prevOrders.filter(order => order._id !== selectedOrder._id)
      );
      
      setCancelledOrders(prevOrders => [
        { ...selectedOrder, orderStatus: 'cancelled' },
        ...prevOrders
      ]);
      
      // Close modal and reset state
      setShowCancelModal(false);
      setSelectedOrder(null);
      setCancellationReason('');
      
      console.log('✅ Order cancelled successfully');
      
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order');
      console.error('Error cancelling order:', err);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const canCancelOrder = (order: Order): boolean => {
    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    return cancellableStatuses.includes(order.orderStatus);
  };

  const getStatusBadge = (status: string, type: 'order' | 'payment') => {
    const statusColors = {
      order: {
        pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        confirmed: 'bg-blue-100 text-blue-800 border border-blue-200',
        processing: 'bg-purple-100 text-purple-800 border border-purple-200',
        shipped: 'bg-purple-100 text-purple-800 border border-purple-200',
        delivered: 'bg-green-100 text-green-800 border border-green-200',
        cancelled: 'bg-red-100 text-red-800 border border-red-200'
      },
      payment: {
        pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        completed: 'bg-green-100 text-green-800 border border-green-200',
        failed: 'bg-red-100 text-red-800 border border-red-200'
      }
    };

    const typeColors = statusColors[type];
    const colorClass = (typeColors as any)[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
            <div className="text-red-600 mb-4 font-medium">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and orders</p>
        </div>

        {activeOrders.length === 0 && cancelledOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
              <button
                onClick={() => router.push('/products')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Profile Summary */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-6 space-y-6">
                {/* Profile Summary Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Orders</span>
                      <span className="font-semibold text-gray-900">{activeOrders.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cancelled Orders</span>
                      <span className="font-semibold text-gray-900">{cancelledOrders.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Orders</span>
                      <span className="font-semibold text-gray-900">{orders.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Spent</span>
                      <span className="font-semibold text-gray-900">
                        ₹{orders.reduce((total, order) => total + order.totalAmount, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {cancelledOrders.length > 0 && (
                      <button
                        onClick={() => setShowCancelledOrdersModal(true)}
                        className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors text-left flex items-center gap-3 border border-gray-200"
                      >
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        View Cancelled Orders ({cancelledOrders.length})
                      </button>
                    )}
                    <button
                      onClick={() => router.push('/products')}
                      className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors text-left flex items-center gap-3 border border-gray-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Active Orders */}
            <div className="lg:col-span-3">
              {/* Active Orders Card */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Active Orders</h2>
                      <p className="text-gray-600 mt-1 text-sm">
                        {activeOrders.length} {activeOrders.length === 1 ? 'active order' : 'active orders'}
                      </p>
                    </div>
                    {cancelledOrders.length > 0 && (
                      <button
                        onClick={() => setShowCancelledOrdersModal(true)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        View Cancelled ({cancelledOrders.length})
                      </button>
                    )}
                  </div>
                </div>
                
                {activeOrders.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No active orders</h3>
                    <p className="text-gray-600 mb-4">All your current orders are completed or cancelled</p>
                    <button
                      onClick={() => router.push('/products')}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {activeOrders.map((order) => (
                      <div
                        key={order._id}
                        className={`p-6 hover:bg-gray-50 cursor-pointer transition-all duration-200 group ${
                          selectedOrder?._id === order._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => fetchOrderDetails(order._id)}
                      >
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
                              <h3 className={`text-lg font-semibold group-hover:text-blue-600 transition-colors ${
                                selectedOrder?._id === order._id ? 'text-blue-700' : 'text-gray-900'
                              }`}>
                                Order #{order.orderId || order._id?.slice(-8)}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {getStatusBadge(order.orderStatus, 'order')}
                                {getStatusBadge(order.paymentStatus, 'payment')}
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-3 text-sm">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <span className="text-gray-600">{order.products?.length || 0} items</span>
                              <span className="text-gray-400">•</span>
                              <span className="font-semibold text-gray-900">
                                ₹{order.totalAmount.toFixed(2)}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600 capitalize">{order.paymentMethod}</span>
                            </div>

                            {/* Order Items Preview with Sizes */}
                            <div className="mt-4 flex flex-wrap gap-3">
                              {order.products?.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                                  <span className="text-sm text-gray-700">
                                    {item.product?.name || item.name || 'Product'}
                                  </span>
                                  {item.selectedSize && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                      Size: {item.selectedSize}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500 bg-white px-1 rounded border">
                                    x{item.quantity}
                                  </span>
                                </div>
                              ))}
                              {order.products?.length > 3 && (
                                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                                  <span className="text-sm text-gray-700">
                                    +{order.products.length - 3} more
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Cancel Button */}
                          {canCancelOrder(order) && (
                            <div className="flex flex-col gap-2 lg:items-end">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelOrder(order);
                                }}
                                disabled={cancellingOrderId === order._id}
                                className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-medium text-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {cancellingOrderId === order._id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel Order
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Order Details */}
              {selectedOrder && (
                <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Order Details #{selectedOrder.orderId || selectedOrder._id?.slice(-8)}
                    </h2>
                    <div className="flex items-center gap-3">
                      {canCancelOrder(selectedOrder) && (
                        <button 
                          onClick={() => handleCancelOrder(selectedOrder)}
                          disabled={cancellingOrderId === selectedOrder._id}
                          className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-medium text-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingOrderId === selectedOrder._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel Order
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Order Items */}
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h3>
                      <div className="space-y-4">
                        {selectedOrder.products?.map((item, index) => (
                          <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="relative">
                                {item.product?.image ? (
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {item.quantity}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {item.product?.name || item.name || 'Product'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</p>
                                  {item.selectedSize && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                      Size: {item.selectedSize}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-blue-600">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Order Summary */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                          </div>
                          {selectedOrder.shippingFee && selectedOrder.shippingFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping</span>
                              <span className="font-medium">₹{selectedOrder.shippingFee.toFixed(2)}</span>
                            </div>
                          )}
                          {selectedOrder.taxAmount && selectedOrder.taxAmount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax</span>
                              <span className="font-medium">₹{selectedOrder.taxAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                            <span>Total Amount</span>
                            <span className="text-blue-600">
                              ₹{(selectedOrder.finalAmount || selectedOrder.totalAmount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Information */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                          <p className="font-medium text-gray-900">
                            {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                          </p>
                          <p className="text-gray-600">{selectedOrder.shippingAddress.email}</p>
                          <p className="text-gray-600">{selectedOrder.shippingAddress.phone}</p>
                          <p className="text-gray-600">{selectedOrder.shippingAddress.address}</p>
                          <p className="text-gray-600">
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancel Order Confirmation Modal */}
        {showCancelModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cancel Order #{selectedOrder.orderId || selectedOrder._id?.slice(-8)}
              </h3>
              
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>

              <div className="mb-4">
                <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  id="cancellationReason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedOrder(null);
                    setCancellationReason('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={cancellingOrderId !== null}
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancelOrder}
                  disabled={cancellingOrderId !== null}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {cancellingOrderId ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancelled Orders Modal */}
        {showCancelledOrdersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Cancelled Orders ({cancelledOrders.length})
                </h3>
                <button
                  onClick={() => setShowCancelledOrdersModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                {cancelledOrders.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No cancelled orders</h3>
                    <p className="text-gray-600">You haven't cancelled any orders yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {cancelledOrders.map((order) => (
                      <div
                        key={order._id}
                        className="p-6 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowCancelledOrdersModal(false);
                        }}
                      >
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Order #{order.orderId || order._id?.slice(-8)}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {getStatusBadge(order.orderStatus, 'order')}
                                {getStatusBadge(order.paymentStatus, 'payment')}
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-3 text-sm">
                              Cancelled on {formatDate(order.updatedAt || order.createdAt)}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <span className="text-gray-600">{order.products?.length || 0} items</span>
                              <span className="text-gray-400">•</span>
                              <span className="font-semibold text-gray-900">
                                ₹{order.totalAmount.toFixed(2)}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600 capitalize">{order.paymentMethod}</span>
                            </div>

                            {/* Order Items Preview with Sizes */}
                            <div className="mt-4 flex flex-wrap gap-3">
                              {order.products?.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                                  <span className="text-sm text-gray-700">
                                    {item.product?.name || item.name || 'Product'}
                                  </span>
                                  {item.selectedSize && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                      Size: {item.selectedSize}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500 bg-white px-1 rounded border">
                                    x{item.quantity}
                                  </span>
                                </div>
                              ))}
                              {order.products?.length > 3 && (
                                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                                  <span className="text-sm text-gray-700">
                                    +{order.products.length - 3} more
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}