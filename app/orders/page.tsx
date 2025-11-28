// // app/orders/page.tsx - FULL UPDATED CODE
// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation';
// import { Order } from '@/types/order';
// import Link from 'next/link';

// // Improved Image URL utility function
// const getImageUrl = (imagePath: string | undefined): string => {
//   if (!imagePath) return '/placeholder-product.jpg';
  
//   if (imagePath.startsWith('http')) return imagePath;
  
//   const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
//   if (imagePath.startsWith('/')) {
//     return `${baseUrl}${imagePath}`;
//   } else {
//     return `${baseUrl}/${imagePath}`;
//   }
// };

// // Add the missing getUserOrders function
// const getUserOrders = async (token: string): Promise<Order[]> => {
//   try {
//     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/my-orders`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch orders: ${response.statusText}`);
//     }

//     const data = await response.json();
//     console.log('📦 Orders API Response:', data);
//     return data.orders || [];
//   } catch (error) {
//     console.error('Error fetching user orders:', error);
//     throw error;
//   }
// };

// // Cancel order function with better debugging
// const cancelOrder = async (orderId: string, token: string, cancellationReason?: string): Promise<Order> => {
//   try {
//     const cancelData: any = {};
//     if (cancellationReason) {
//       cancelData.cancellationReason = cancellationReason;
//     }

//     console.log('🔄 Frontend: Sending cancel request', {
//       orderId,
//       hasToken: !!token,
//       cancellationReason
//     });

//     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/${orderId}/cancel`, {
//       method: 'PUT',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(cancelData),
//     });

//     console.log('📥 Frontend: Response status:', response.status);
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.log('❌ Frontend: Cancel error response:', errorText);
//       throw new Error(`Failed to cancel order: ${response.status} - ${errorText}`);
//     }

//     const data = await response.json();
//     console.log('✅ Frontend: Cancel success response:', data);
//     return data.order;
//   } catch (error) {
//     console.error('💥 Frontend: Error cancelling order:', error);
//     throw error;
//   }
// };

// export default function OrdersPage() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
//   const [cancellationReason, setCancellationReason] = useState('');
//   const { user, token } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!user) {
//       router.push('/login');
//       return;
//     }

//     fetchOrders();
//   }, [user, token, router]);

//   const fetchOrders = async () => {
//     if (!token) return;

//     try {
//       setLoading(true);
//       setError('');
//       const userOrders = await getUserOrders(token);
//       // Filter out cancelled orders - only show active orders
//       const activeOrders = userOrders.filter(order => order.orderStatus !== 'cancelled');
//       setOrders(activeOrders);
//     } catch (err: any) {
//       setError(err.message || 'Failed to load orders');
//       console.error('Error fetching orders:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancelOrder = (order: Order) => {
//     setSelectedOrder(order);
//     setShowCancelModal(true);
//   };

//   const confirmCancelOrder = async () => {
//     if (!selectedOrder || !token) return;

//     try {
//       setCancellingOrderId(selectedOrder._id);
//       const updatedOrder = await cancelOrder(selectedOrder._id, token, cancellationReason);
      
//       // Remove the cancelled order from the local state instead of updating its status
//       setOrders(prevOrders => 
//         prevOrders.filter(order => order._id !== selectedOrder._id)
//       );
      
//       // Close modal and reset state
//       setShowCancelModal(false);
//       setSelectedOrder(null);
//       setCancellationReason('');
      
//       console.log('✅ Order cancelled successfully');
      
//     } catch (err: any) {
//       setError(err.message || 'Failed to cancel order');
//       console.error('Error cancelling order:', err);
//     } finally {
//       setCancellingOrderId(null);
//     }
//   };

//   const canCancelOrder = (order: Order): boolean => {
//     const cancellableStatuses = ['pending', 'confirmed', 'processing'];
//     return cancellableStatuses.includes(order.orderStatus);
//   };

//   const getStatusBadge = (status: string, type: 'order' | 'payment') => {
//     const statusColors = {
//       order: {
//         pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
//         confirmed: 'bg-blue-100 text-blue-800 border border-blue-200',
//         processing: 'bg-purple-100 text-purple-800 border border-purple-200',
//         shipped: 'bg-purple-100 text-purple-800 border border-purple-200',
//         delivered: 'bg-green-100 text-green-800 border border-green-200',
//         cancelled: 'bg-red-100 text-red-800 border border-red-200'
//       },
//       payment: {
//         pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
//         completed: 'bg-green-100 text-green-800 border border-green-200',
//         failed: 'bg-red-100 text-red-800 border border-red-200'
//       }
//     };

//     const typeColors = statusColors[type];
//     const colorClass = (typeColors as any)[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
    
//     return (
//       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </span>
//     );
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // Redirect to login if not authenticated
//   if (!user) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white py-12">
//         <div className="container mx-auto px-4">
//           <div className="flex justify-between items-center mb-8">
//             <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
//             <Link 
//               href="/products"
//               className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
//             >
//               Continue Shopping
//             </Link>
//           </div>
//           <div className="flex justify-center items-center py-12">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//               <p className="mt-4 text-gray-600">Loading your orders...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white py-12">
//       <div className="container mx-auto px-4">
//         {/* Header Section - Matching Profile Page Style */}
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
//             <p className="text-gray-600 mt-1">View and manage your orders</p>
//           </div>
//           <Link 
//             href="/products"
//             className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium flex items-center gap-2"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//             </svg>
//             Continue Shopping
//           </Link>
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
//             <div className="flex items-center justify-between">
//               <span>{error}</span>
//               <button 
//                 onClick={fetchOrders}
//                 className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
//               >
//                 Retry
//               </button>
//             </div>
//           </div>
//         )}

//         {orders.length === 0 && !loading ? (
//           <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
//             <div className="max-w-md mx-auto">
//               <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200">
//                 <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
//                 </svg>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h3>
//               <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
//               <Link
//                 href="/products"
//                 className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
//               >
//                 Start Shopping
//               </Link>
//             </div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//             {/* Sidebar - Order Summary */}
//             <div className="lg:col-span-1 space-y-6">
//               {/* Order Summary Card */}
//               <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Total Orders</span>
//                     <span className="font-semibold text-gray-900">{orders.length}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Total Spent</span>
//                     <span className="font-semibold text-gray-900">
//                       ₹{orders.reduce((total, order) => total + order.totalAmount, 0).toFixed(2)}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Quick Actions */}
//               <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
//                 <div className="space-y-3">
//                   <Link
//                     href="/profile"
//                     className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors text-left flex items-center gap-3 border border-gray-200"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                     </svg>
//                     View Profile
//                   </Link>
//                   <Link
//                     href="/products"
//                     className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors text-left flex items-center gap-3 border border-gray-200"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//                     </svg>
//                     Continue Shopping
//                   </Link>
//                 </div>
//               </div>
//             </div>

//             {/* Main Content - Orders List */}
//             <div className="lg:col-span-3">
//               {/* Orders Card */}
//               <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
//                 <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//                   <h2 className="text-xl font-semibold text-gray-900">Your Orders</h2>
//                   <p className="text-gray-600 mt-1 text-sm">
//                     {orders.length} {orders.length === 1 ? 'order' : 'orders'} in total
//                   </p>
//                 </div>
                
//                 <div className="divide-y divide-gray-200">
//                   {orders.map((order) => (
//                     <OrderCard 
//                       key={order._id}
//                       order={order}
//                       onCancelOrder={handleCancelOrder}
//                       canCancelOrder={canCancelOrder}
//                       getStatusBadge={getStatusBadge}
//                       getImageUrl={getImageUrl}
//                       formatDate={formatDate}
//                       cancellingOrderId={cancellingOrderId}
//                     />
//                   ))}
//                 </div>
//               </div>

//               {/* Refresh Button */}
//               {orders.length > 0 && (
//                 <div className="mt-8 text-center">
//                   <button 
//                     onClick={fetchOrders}
//                     className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium flex items-center gap-2 mx-auto"
//                   >
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                     </svg>
//                     Refresh Orders
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Cancel Order Confirmation Modal */}
//         {showCancelModal && selectedOrder && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 Cancel Order #{selectedOrder.orderId || selectedOrder._id?.slice(-8)}
//               </h3>
              
//               <p className="text-gray-600 mb-4">
//                 Are you sure you want to cancel this order? This action cannot be undone.
//               </p>

//               <div className="mb-4">
//                 <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700 mb-2">
//                   Reason for cancellation (optional)
//                 </label>
//                 <textarea
//                   id="cancellationReason"
//                   value={cancellationReason}
//                   onChange={(e) => setCancellationReason(e.target.value)}
//                   placeholder="Please provide a reason for cancellation..."
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   rows={3}
//                 />
//               </div>

//               <div className="flex justify-end gap-3">
//                 <button
//                   onClick={() => {
//                     setShowCancelModal(false);
//                     setSelectedOrder(null);
//                     setCancellationReason('');
//                   }}
//                   className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                   disabled={cancellingOrderId !== null}
//                 >
//                   Keep Order
//                 </button>
//                 <button
//                   onClick={confirmCancelOrder}
//                   disabled={cancellingOrderId !== null}
//                   className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                 >
//                   {cancellingOrderId ? (
//                     <>
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                       Cancelling...
//                     </>
//                   ) : (
//                     'Cancel Order'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // Updated Order Card Component to match Profile Page style and show sizes
// const OrderCard = ({ 
//   order, 
//   onCancelOrder, 
//   canCancelOrder, 
//   getStatusBadge, 
//   getImageUrl,
//   formatDate,
//   cancellingOrderId 
// }: any) => {
//   return (
//     <div
//       className="p-6 hover:bg-gray-50 cursor-pointer transition-all duration-200 group border-b border-gray-200 last:border-b-0"
//     >
//       <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
//         <div className="flex-1">
//           <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
//             <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
//               Order #{order.orderId || order._id?.slice(-8)}
//             </h3>
//             <div className="flex flex-wrap gap-2">
//               {getStatusBadge(order.orderStatus, 'order')}
//               {getStatusBadge(order.paymentStatus, 'payment')}
//             </div>
//           </div>
          
//           <p className="text-gray-600 mb-3 text-sm">
//             Placed on {formatDate(order.createdAt)}
//           </p>
          
//           <div className="flex flex-wrap items-center gap-3 text-sm">
//             <span className="text-gray-600">{order.products?.length || 0} items</span>
//             <span className="text-gray-400">•</span>
//             <span className="font-semibold text-gray-900">
//               ₹{order.totalAmount.toFixed(2)}
//             </span>
//             <span className="text-gray-400">•</span>
//             <span className="text-gray-600 capitalize">{order.paymentMethod}</span>
//           </div>

//           {/* Order Items Preview with Sizes */}
//           <div className="mt-4 flex flex-wrap gap-3">
//             {order.products?.slice(0, 3).map((item: any, index: number) => {
//               const imageUrl = getImageUrl(item.product?.image);
//               return (
//                 <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
//                   <img 
//                     src={imageUrl}
//                     alt={item.product?.name || item.name || 'Product'}
//                     className="w-8 h-8 object-cover rounded border border-gray-200"
//                     onError={(e) => {
//                       (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
//                     }}
//                   />
//                   <span className="text-sm text-gray-700">
//                     {item.product?.name || item.name || 'Product'}
//                   </span>
//                   {item.selectedSize && (
//                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
//                       Size: {item.selectedSize}
//                     </span>
//                   )}
//                   <span className="text-xs text-gray-500 bg-white px-1 rounded border">
//                     x{item.quantity}
//                   </span>
//                 </div>
//               );
//             })}
//             {order.products?.length > 3 && (
//               <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
//                 <span className="text-sm text-gray-700">
//                   +{order.products.length - 3} more
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Order Actions */}
//         <div className="flex flex-col gap-2 lg:items-end">
          
//           {canCancelOrder(order) && (
//             <button 
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onCancelOrder(order);
//               }}
//               disabled={cancellingOrderId === order._id}
//               className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-medium text-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {cancellingOrderId === order._id ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
//                   Cancelling...
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                   Cancel Order
//                 </>
//               )}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };