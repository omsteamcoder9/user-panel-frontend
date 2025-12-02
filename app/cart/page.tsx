'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, updateCartItem, removeFromCart, clearCart, isGuest } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  // Use cart data directly from backend response
  const itemCount = cart.totalItems || 0;
  const subtotal = cart.totalPrice || 0;
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-8 sm:py-12 cursor-pointer">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Add some products to your cart to see them here.</p>
            <Link 
              href="/products"
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm sm:text-base shadow-lg hover:shadow-blue-500/25"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12 ">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          {isGuest && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm">
              <p>
                🛒 Shopping as Guest •{' '}
                <Link href="/signup" className="font-semibold underline hover:text-blue-800 transition-colors duration-200">
                  Sign up to save your cart
                </Link>
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Cart Items ({itemCount})
                </h2>
                <button 
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium transition-colors duration-200 cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-b border-gray-200 pb-4 sm:pb-6">
                    {/* Product Image and Info - Mobile Layout */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <img 
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}${item.product.images[0].image}`}
                        alt={item.product.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      
                      {/* Product Info - Mobile Layout */}
                      <div className="sm:hidden flex-grow">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.product.name}</h3>
                        <p className="text-gray-600 text-xs">₹{item.product.price}</p>
                        {item.product.stock < 10 && (
                          <p className="text-orange-600 text-xs mt-1">
                            Only {item.product.stock} left
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Product Info - Desktop Layout */}
                    <div className="hidden sm:block flex-grow">
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-gray-600 text-sm">₹{item.product.price}</p>
                      {item.product.stock < 10 && (
                        <p className="text-orange-600 text-xs mt-1">
                          Only {item.product.stock} left in stock
                        </p>
                      )}
                    </div>
                    
                    {/* Quantity Controls and Price - Mobile Layout */}
                    <div className="flex items-center justify-between sm:justify-center sm:space-x-2">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateCartItem(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all duration-200 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 sm:w-12 text-center text-sm sm:text-base">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartItem(item._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all duration-200 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Price and Remove - Mobile Layout */}
                      <div className="sm:hidden text-right">
                        <p className="font-semibold text-gray-900 text-sm">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                        <button 
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-600 hover:text-red-800 text-xs transition-colors duration-200 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    {/* Price and Remove - Desktop Layout */}
                    <div className="hidden sm:block text-right min-w-[100px]">
                      <p className="font-semibold text-gray-900">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 hover:text-red-800 text-sm transition-colors duration-200 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 sticky top-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Order Summary</h2>
              
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Tax (18%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 sm:pt-3 flex justify-between text-base sm:text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-blue-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium mb-3 sm:mb-4 text-sm sm:text-base shadow-lg hover:shadow-blue-500/25 cursor-pointer"
              >
                Proceed to Checkout
              </button>

              {isGuest && (
                <div className="text-center mb-3 sm:mb-4 space-y-2">
                  <p className="text-xs sm:text-sm text-gray-600">Want faster checkout?</p>
                  <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                    <Link 
                      href="/login"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-center text-xs sm:text-sm shadow-lg hover:shadow-blue-500/25"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/signup"
                      className="border border-blue-500 text-blue-500 py-2 px-4 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-200 font-medium text-center text-xs sm:text-sm"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
              
              <Link 
                href="/products"
                className="w-full border border-blue-500 text-blue-500 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-200 font-medium text-center block text-sm sm:text-base"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get product image URL
// function getProductImageUrl(product: any): string {
//   if (!product.images || product.images.length === 0) {
//     return `${process.env.NEXT_PUBLIC_IMG_URL}`;
//   }

//   const imagePath = product.images[0].image;
  
//   if (imagePath.startsWith('http')) {
//     return imagePath;
//   }
  
//   const baseUrl = process.env.NEXT_PUBLIC_IMG_URL;
//   return `${baseUrl}${imagePath}`;
// }