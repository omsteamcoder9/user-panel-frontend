'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { fetchProducts } from '@/lib/api';
import ProductCard from '../ui/ProductCard';
import Link from 'next/link';

interface ProductGridProps {
  limit?: number; // Add limit prop
  showViewAll?: boolean; // Add showViewAll prop to control the button visibility
}

export default function ProductGrid({ limit, showViewAll = true }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await fetchProducts();
        
        // Apply limit if provided, otherwise show all products
        const displayedProducts = limit ? data.slice(0, limit) : data;
        setProducts(displayedProducts);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [limit]); // Add limit to dependency array

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#556B2F]"></div>
          <p className="text-gray-600">Loading premium products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-white">
        <div className="bg-gray-50 rounded-3xl p-8 max-w-md mx-auto border border-gray-200 shadow-lg">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-50 rounded-3xl p-12 max-w-md mx-auto border border-gray-200 shadow-lg">
              <p className="text-gray-600 text-lg mb-2">No products available</p>
              <p className="text-gray-500">Check back soon for new arrivals</p>
            </div>
          </div>
        ) : (
          <>
            {/* Premium Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            {/* Enhanced View All Button - Only show if showViewAll is true */}
            {showViewAll && (
              <div className="text-center">
                <Link 
                  href="/products"
                  className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-blue-400 px-12 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden inline-flex items-center gap-3 hover:from-blue-600 hover:to-purple-700"
                >
                  <span className="relative">Explore Full Collection</span>
                  <svg 
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  
                  {/* Hover shine effect */}
                  <div className="absolute inset-0 -inset-x-32 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shine" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom animation for shine effect */}
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shine {
          animation: shine 1.5s ease-in-out;
        }
      `}</style>
    </section>
  );
}