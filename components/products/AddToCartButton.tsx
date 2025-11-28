// components/products/AddToCartButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Product, ProductSize } from '@/types/product';
import { ShoppingBag, Check } from 'lucide-react';

interface AddToCartButtonProps {
  product: Product;
}

// ✅ UPDATED: Enhanced type guard for ProductSize that matches your model
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

// ✅ UPDATED: Check if product has valid sizes array
const hasValidSizes = (product: Product): boolean => {
  if (!product.sizes) return false;
  if (!Array.isArray(product.sizes)) return false;
  if (product.sizes.length === 0) return false;
  
  // Check if it's an array of ProductSize objects
  return product.sizes.every(isValidProductSize);
};

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { addToCart, loading, addingProductId, cart } = useCart();

  const isAdding = loading && addingProductId === product._id;
  
  // ✅ UPDATED: Check if product has valid sizes
  const hasSizes = hasValidSizes(product);

  // ✅ UPDATED: Available sizes with stock > 0
  const availableSizes = hasSizes 
    ? product.sizes!.filter((size: ProductSize) => size.stock > 0)
    : [];

  // ✅ UPDATED: Auto-select first available size on mount
  useEffect(() => {
    if (hasSizes && availableSizes.length > 0 && !selectedSize) {
      // Try to find 'M' size first, otherwise use first available size
      const mediumSize = availableSizes.find((size: ProductSize) => 
        size.size === 'M' || size.size.includes('M')
      );
      
      if (mediumSize) {
        setSelectedSize(mediumSize.size);
        console.log('🟢 Auto-selected M size:', mediumSize.size);
      } else {
        setSelectedSize(availableSizes[0].size);
        console.log('🟢 Auto-selected first available size:', availableSizes[0].size);
      }
    }
  }, [hasSizes, availableSizes, selectedSize]);

  // ✅ FIXED: Better cart item detection
  const isInCart = cart?.items?.some(item => {
    if (item.product._id !== product._id) return false;
    
    // For products with sizes, check if the same size is in cart
    if (hasSizes) {
      return item.selectedSize === selectedSize;
    }
    
    // For products without sizes, just check product ID
    return true;
  }) || false;

  // ✅ UPDATED: Calculate max quantity based on selected size or product stock
  const getMaxQuantity = () => {
    if (hasSizes && selectedSize) {
      const selectedSizeData = product.sizes?.find((size: ProductSize) => 
        size.size === selectedSize
      );
      return selectedSizeData ? Math.max(0, selectedSizeData.stock) : 0;
    }
    return Math.max(0, product.stock);
  };

  const handleAddToCart = async () => {
    // For products with sizes, use the auto-selected size
    const finalSelectedSize = hasSizes ? selectedSize : undefined;

    if (hasSizes && !finalSelectedSize) {
      alert('Please select a size before adding to cart');
      return;
    }

    console.log('🛒 Button clicked - Adding to cart:', {
      product: product._id,
      productName: product.name,
      quantity,
      size: finalSelectedSize,
      hasSizes
    });

    try {
      await addToCart(product, quantity, finalSelectedSize);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    // Reset quantity to 1 when size changes
    setQuantity(1);
  };

  // ✅ UPDATED: Format size for display - now handles simple sizes like "M", "L", etc.
  const formatSizeForDisplay = (sizeValue: string) => {
    if (!sizeValue || typeof sizeValue !== 'string') return 'N/A';
    return sizeValue; // Just return the size as is (M, L, XL, etc.)
  };

  const maxQuantity = getMaxQuantity();
  const isOutOfStock = hasSizes ? availableSizes.length === 0 : product.stock <= 0;

  // ✅ UPDATED: Render sizes with proper handling for simple size values
  const renderSizeSelection = () => {
    if (!hasSizes) {
      console.log('🟡 Not rendering sizes: hasSizes = false');
      return null;
    }

    console.log('🟢 Rendering sizes, available:', availableSizes.length);

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Size:</span>
          {!selectedSize && availableSizes.length > 0 && (
            <span className="text-red-500 text-sm">Please select a size</span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {product.sizes?.map((sizeItem: ProductSize, index: number) => {
            // Additional safety check for each size item
            if (!isValidProductSize(sizeItem)) {
              console.warn(`Invalid size item at index ${index}:`, sizeItem);
              return null;
            }

            const isAvailable = sizeItem.stock > 0;
            const isSelected = selectedSize === sizeItem.size;
            const displaySize = formatSizeForDisplay(sizeItem.size);

            return (
              <button
                key={sizeItem.size || `size-${index}`}
                type="button"
                onClick={() => handleSizeSelect(sizeItem.size)}
                disabled={!isAvailable}
                className={`border-2 rounded-lg p-3 text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : isAvailable
                    ? 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="font-semibold">{displaySize}</div>
                <div className={`text-xs mt-1 ${
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
    );
  };

  return (
    <div className="space-y-4">
      {/* Size Selection - Only show if product has valid sizes */}
      {renderSizeSelection()}

      {/* Quantity Selector - Only show if product is in stock */}
      {!isOutOfStock && (
        <div className="flex items-center gap-4">
          <span className="font-semibold">Quantity:</span>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="px-4 py-2 min-w-12 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
              disabled={quantity >= maxQuantity}
            >
              +
            </button>
          </div>
          {maxQuantity > 0 && (
            <span className="text-sm text-gray-500">
              Max: {maxQuantity}
            </span>
          )}
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAdding || (hasSizes && !selectedSize)}
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg cursor-pointer"
      >
        {isAdding ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Adding to Cart...
          </>
        ) : isOutOfStock ? (
          'Out of Stock'
        ) : isInCart ? (
          <>
            <Check size={20} />
            Already in Cart
          </>
        ) : (
          <>
            <ShoppingBag size={20} />
            Add to Cart
          </>
        )}
      </button>

      {/* Success Message */}
      {showSuccess && (
        <div className="flex items-center gap-2 text-green-600 font-medium animate-pulse">
          <Check size={20} />
          Added to cart successfully!
        </div>
      )}

      {/* Size selection reminder */}
      {hasSizes && !selectedSize && !isOutOfStock && (
        <div className="text-orange-600 text-sm font-medium">
          ⚠️ Please select a size to add to cart
        </div>
      )}
    </div>
  );
}