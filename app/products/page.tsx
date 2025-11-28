// app/products/page.tsx
import ProductGrid from '@/components/products/ProductGrid';
import { fetchActiveCategories } from '@/lib/categoryService';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function ProductsPage(props: ProductsPageProps) {
  // Await both the searchParams Promise
  const searchParams = await props.searchParams;
  const categories = await fetchActiveCategories();
  const selectedCategory = searchParams.category;

  return (
    <div className="min-h-screen bg-white">
      {/* Products Grid Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Product Grid */}
          <ProductGrid category={selectedCategory} />
        </div>
      </section>
    </div>
  );
}