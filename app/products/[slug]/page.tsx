// app/products/[slug]/page.tsx
'use client';

import { productAPI } from '@/lib/api';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import AddToCartButton from '@/components/products/AddToCartButton';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/types/product';
import { useEffect, useState } from 'react';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage(props: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);

  // Function to get 4 random products (excluding current product)
  const getRandomProducts = async (currentProductId: string, limit = 4) => {
    try {
      const response = await productAPI.getAll({});
      
      if (response.success && response.data) {
        // Filter out current product and get random products
        const otherProducts = response.data.filter(product => product._id !== currentProductId);
        
        // Shuffle array and get first 4
        const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching random products:', error);
      return [];
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const params = await props.params;
        setSlug(params.slug);
        
        console.log(`Fetching product with slug: ${params.slug}`);
        
        const response = await productAPI.getBySlug(params.slug);
        
        if (!response.success || !response.data) {
          console.warn(`Product not found for slug: ${params.slug}`);
          notFound();
        }
        
        const productData = response.data;
        setProduct(productData);
        console.log(`Product found:`, productData.name);

        // Get 4 random products
        const randomProductsData = await getRandomProducts(productData._id, 4);
        setRandomProducts(randomProductsData);
      } catch (error: any) {
        console.error('Error fetching product for slug:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [props.params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[white] py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F]"></div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[white]">
      <div className="container mx-auto">
        {/* Product Section */}
        <div className="bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
            {/* Product Images */}
            <div className="w-full lg:sticky lg:top-0 lg:h-screen lg:overflow-auto">
              <div className="space-y-0 lg:space-y-4 lg:p-8">
                {/* Main Image Container */}
                  <div className="relative w-full bg-gray-50 overflow-hidden rounded-[2rem] lg:rounded-3xl mt-7">
                    <div 
                    className="relative w-full overflow-hidden rounded-b-[2rem] lg:rounded-3xl"
                    style={{ 
                      height: '60vh',
                      minHeight: '450px',
                      maxHeight: '700px'
                    }}
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}${product.images[0].image}`}
                      alt={product.name}
                      fill
                      className="object-cover rounded-b-[2rem] lg:rounded-3xl"
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6 bg-white p-4 sm:p-6 lg:p-8 lg:pr-12">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h1>
              </div>

            {/* Price and Stock */}
<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
    ₹{product.price.toLocaleString('en-IN')}
  </span>
  {product.stock > 0 ? (
    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium self-start sm:self-auto">
      In Stock ({product.stock} available)
    </span>
  ) : (
    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium self-start sm:self-auto">
      Out of Stock
    </span>
  )}
</div>

              {/* Add to Cart Section - Made SMALLER */}
              <div className="pt-2 lg:pt-4">
                <div className="max-w-md">
                  <AddToCartButton product={product} />
                </div>
              </div>

              {/* Product Details after Add to Cart Button */}
              <div className="space-y-6 lg:space-y-8">
                {/* Product Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-xl lg:text-2xl">Description</h3>
                  <p className="text-gray-700 text-base lg:text-lg leading-relaxed">{product.description}</p>
                </div>

                {/* Sizes - Made MUCH SMALLER */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg lg:text-xl">Available Sizes</h3>
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.map((sizeItem, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs font-medium border border-gray-200 hover:bg-gray-200 transition-colors duration-200"
                        >
                          {sizeItem.size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {randomProducts.length > 0 && (
          <div className="mt-8 lg:mt-16 px-4 lg:px-8 py-8 lg:py-12 bg-gray-50 rounded-t-3xl lg:rounded-3xl">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 lg:mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {randomProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct._id} product={relatedProduct} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}