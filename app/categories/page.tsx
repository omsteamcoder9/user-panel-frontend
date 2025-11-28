// app/categories/page.tsx
import { fetchActiveCategories } from '@/lib/categoryService';
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // Add this line

export default async function CategoriesPage() {
  const categories = await fetchActiveCategories();

  return (
    <div className="min-h-screen bg-white">
      {/* Categories Grid Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/products?category=${category._id}`}
                  className="group bg-white backdrop-blur-sm rounded-3xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden p-6 text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#556B2F]/10 to-[#D9825B]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-[#556B2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No categories found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}