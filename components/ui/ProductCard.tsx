import { Product, ProductSize } from '@/types/product';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, Eye, Check, X } from 'lucide-react';
import { getProductImageUrl } from '@/lib/productService'; 
import { createPortal } from 'react-dom';

interface ProductCardProps {
  product: Product;
}

// ✅ Format price with commas for thousands
const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// ✅ Type guard for ProductSize
const isValidProductSize = (item: any): item is ProductSize => {
  return (
    item &&
    typeof item === 'object' &&
    'size' in item &&
    'stock' in item &&
    typeof item.size === 'string' &&
    typeof item.stock === 'number'
  );
};

// ✅ Check if product has valid sizes
const hasValidSizes = (product: Product): boolean => {
  if (!product.sizes) return false;
  if (!Array.isArray(product.sizes)) return false;
  if (product.sizes.length === 0) return false;
  return product.sizes.every(isValidProductSize);
};

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showSizePopup, setShowSizePopup] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [popupQuantity, setPopupQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  
  const { addToCart, loading, addingProductId, cart } = useCart();
  const router = useRouter();

  const hasSizes = hasValidSizes(product);
  const availableSizes = hasSizes 
    ? product.sizes!.filter((size: ProductSize) => size.stock > 0)
    : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCardClick = () => {
    router.push(`/products/${product.slug}`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/products/${product.slug}?quickview=true`);
  };

  const handleImageError = () => {
    console.error('Image failed to load for product:', product.name);
    setImageError(true);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If product has sizes, show popup instead of adding directly
    if (hasSizes && availableSizes.length > 0) {
      setShowSizePopup(true);
      
      // Auto-select first available size when popup opens
      if (!selectedSize && availableSizes.length > 0) {
        const mediumSize = availableSizes.find((size: ProductSize) => 
          size.size === 'M' || size.size.includes('M')
        );
        setSelectedSize(mediumSize ? mediumSize.size : availableSizes[0].size);
      }
      return;
    }
    
    // For products without sizes, add directly to cart
    try {
      await addToCart(product, 1);
      console.log('✅ Product added to cart!');
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    }
  };

  const handlePopupAddToCart = async () => {
    if (hasSizes && !selectedSize) {
      alert('Please select a size');
      return;
    }

    try {
      await addToCart(product, popupQuantity, selectedSize || undefined);
      console.log('✅ Product with size added to cart!');
      setShowSizePopup(false);
      setPopupQuantity(1);
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setPopupQuantity(1); // Reset quantity when size changes
  };

  const getMaxQuantity = () => {
    if (hasSizes && selectedSize) {
      const selectedSizeData = product.sizes?.find((size: ProductSize) => 
        size.size === selectedSize
      );
      return selectedSizeData ? Math.max(0, selectedSizeData.stock) : 0;
    }
    return Math.max(0, product.stock);
  };

  const isAddingThisProduct = loading && addingProductId === product._id;
  const isInCart = cart?.items?.some(item => {
    if (item.product._id !== product._id) return false;
    if (hasSizes && item.selectedSize) {
      return item.selectedSize === selectedSize;
    }
    return true;
  }) || false;

  const maxQuantity = getMaxQuantity();
  const isOutOfStock = hasSizes ? availableSizes.length === 0 : product.stock <= 0;

  // Popup Component
  const SizePopup = () => (
    <div className="fixed inset-0 z-[9999]">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          setShowSizePopup(false);
          setSelectedSize('');
          setPopupQuantity(1);
        }}
      ></div>
      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-transform duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 cursor-pointer">Select Size</h3>
            <button 
              onClick={() => {
                setShowSizePopup(false);
                setSelectedSize('');
                setPopupQuantity(1);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer transform hover:scale-110"
            >
              <X size={24} />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-6 border-b border-gray-200 cursor-pointer">
            <div className="flex gap-4">
              <img 
                src={`${process.env.NEXT_PUBLIC_BASE_URL}${product.images[0].image}`}
                alt={product.name}
                className="w-20 h-20 object-contain rounded-lg bg-gray-100 cursor-pointer transform transition-transform duration-300 hover:scale-105"
              />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 cursor-pointer">{product.name}</h4>
                {/* Updated price display */}
                <p className="text-lg font-bold text-gray-900 cursor-pointer">₹{formatPrice(product.price)}</p>
              </div>
            </div>
          </div>

          {/* Size Selection */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 cursor-pointer">Select Size:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableSizes.map((sizeItem: ProductSize, index: number) => {
                const isAvailable = sizeItem.stock > 0;
                const isSelected = selectedSize === sizeItem.size;

                return (
                  <button
                    key={sizeItem.size || `size-${index}`}
                    type="button"
                    onClick={() => handleSizeSelect(sizeItem.size)}
                    disabled={!isAvailable}
                    className={`border-2 rounded-lg p-3 text-center transition-all cursor-pointer transform hover:scale-105 ${
                      isSelected
                        ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : isAvailable
                        ? 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-semibold cursor-pointer">{sizeItem.size}</div>
                    <div className={`text-xs mt-1 cursor-pointer ${
                      isAvailable 
                        ? isSelected ? 'text-blue-100' : 'text-gray-500'
                        : 'text-red-300'
                    }`}>
                      {isAvailable ? `${sizeItem.stock} available` : 'Out of stock'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selection */}
          {selectedSize && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold cursor-pointer">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPopupQuantity(Math.max(1, popupQuantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer transform hover:scale-110"
                    disabled={popupQuantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 min-w-12 text-center cursor-pointer">{popupQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setPopupQuantity(Math.min(maxQuantity, popupQuantity + 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer transform hover:scale-110"
                    disabled={popupQuantity >= maxQuantity}
                  >
                    +
                  </button>
                </div>
                {maxQuantity > 0 && (
                  <span className="text-sm text-gray-500 cursor-pointer">
                    Max: {maxQuantity}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-6 flex gap-3">
            <button
              onClick={() => {
                setShowSizePopup(false);
                setSelectedSize('');
                setPopupQuantity(1);
              }}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={handlePopupAddToCart}
              disabled={!selectedSize || isAddingThisProduct}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed cursor-pointer transform hover:scale-105"
            >
              {isAddingThisProduct ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div 
        className="group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer font-sans transform hover:scale-105"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Cart Badge - Top Right Corner - Using blue color from header */}
        {isInCart && (
          <div className="absolute top-2 right-2 z-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md font-sans cursor-pointer">
            ✓
          </div>
        )}

        {/* Loading Overlay */}
        {isAddingThisProduct && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 rounded-lg font-sans cursor-pointer">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">Adding to cart...</p>
            </div>
          </div>
        )}

        {/* Product Image Container */}
        <div className="relative p-3 sm:p-4 pb-0 overflow-hidden">
          <div className="relative h-32 xs:h-36 sm:h-40 md:h-48 bg-gray-100 flex items-center justify-center overflow-hidden rounded-lg">
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}${product.images[0].image}`}
              alt={product.name}
              className={`object-contain transition-all duration-300 ${
                isHovered ? 'scale-110' : 'scale-100'
              } 
              max-h-28 xs:max-h-32 sm:max-h-32 md:max-h-40 cursor-pointer`}
            />
            
            {/* Quick View Overlay - Hidden on mobile, shown on tablet+ */}
            <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } hidden sm:flex cursor-pointer`}>
              <button 
                onClick={handleQuickView}
                className="bg-white text-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-xs sm:text-sm font-sans cursor-pointer"
              >
                <Eye size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Quick View</span>
              </button>
            </div>

            {imageError && (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded-lg cursor-pointer">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>
        
        {/* Reduced padding and smaller product name */}
        <div className="p-3">
          {/* Product Name - Fixed height with ellipsis for long names */}
          <h3 className="font-semibold text-gray-900 mb-1 leading-tight line-clamp-2 text-xs font-sans h-8 overflow-hidden cursor-pointer min-h-[2rem]">
            {product.name}
          </h3>
          
          {/* Price and Stock Info - Reduced margin */}
          <div className="flex items-center justify-between mb-2 flex-col xs:flex-row gap-1 sm:gap-0 font-sans">
            <div className="flex items-center gap-2 w-full xs:w-auto justify-between xs:justify-start">
              {/* Updated price display */}
              <span className="text-base xs:text-lg sm:text-lg font-bold text-gray-900 font-sans cursor-pointer">
                ₹{formatPrice(product.price)}
              </span>
              
              {/* Stock badge - moved here for mobile */}
              <span className={`px-2 py-1 text-xs rounded-full font-medium xs:hidden font-sans cursor-pointer ${
                !isOutOfStock 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {!isOutOfStock ? 'In stock' : 'Out of stock'}
              </span>
            </div>
            
            {/* Stock badge - hidden on mobile, shown on tablet+ */}
            <span className={`px-2 py-1 text-xs rounded-full font-medium hidden xs:inline-block font-sans cursor-pointer ${
              !isOutOfStock 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {!isOutOfStock ? 'In stock' : 'Out of stock'}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingThisProduct}
            className="w-full py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 text-xs xs:text-sm sm:text-sm font-sans cursor-pointer transform hover:scale-105"
          >
            {isAddingThisProduct ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 xs:h-4 xs:w-4 border-b-2 border-white"></div>
                <span className="text-xs xs:text-sm sm:text-sm">Adding...</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} className="xs:w-4 xs:h-4 sm:w-4 sm:h-4" />
                <span className="text-xs xs:text-sm sm:text-sm">
                  {!isOutOfStock ? 'Add to Cart' : 'Out of Stock'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Render popup as portal */}
      {mounted && showSizePopup && createPortal(
        <SizePopup />,
        document.body
      )}
    </>
  );
}