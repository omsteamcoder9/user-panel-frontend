'use client';

import ProductGrid from '@/components/products/ProductGrid';
import { Truck, Shield, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Category } from '@/types/category';
import { fetchActiveCategories } from '@/lib/categoryService';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const heroRef = useRef(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const navigateToProducts = () => {
    router.push('/products');
  };

  useEffect(() => {
    // Load categories for the category rows
    async function loadCategories() {
      try {
        const categoriesData = await fetchActiveCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    }

    loadCategories();
  }, []);

  // You can customize which categories to show and in what order
  const featuredCategories = categories.slice(0, 3); // Show first 3 categories

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Preload the hero image */}
      <Head>
        <link 
          rel="preload" 
          href="/images/a7.png" 
          as="image" 
          type="image/jpeg/png/jpg"
          fetchPriority="high"
        />
      </Head>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 animate-pulse-slow delay-1000"></div>
      </div>

      {/* Hero Section with IMMEDIATE Image Loading */}
      <section ref={heroRef} className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image - Using regular img tag for Instant Loading */}
        <div className="absolute inset-0 z-0">
          {/* Main Image - Appears Immediately */}
          <img
            src="/images/a7.png"
            alt="Premium Collection Background"
            className="object-cover w-full h-full"
            style={{ 
              objectPosition: 'center',
              backgroundAttachment: 'fixed'
            }}
            loading="eager"  // Forces browser to load immediately
          />
          
          {/* Light overlay for better text readability */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        {/* Animated Bubble Background Overlay - Reduced opacity */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-300/10 rounded-full opacity-30 animate-float"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-purple-300/10 rounded-full opacity-40 animate-float delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-cyan-300/10 rounded-full opacity-20 animate-float delay-500"></div>
          <div className="absolute bottom-10 right-10 w-12 h-12 bg-pink-300/10 rounded-full opacity-50 animate-float delay-1500"></div>
          <div className="absolute top-1/2 left-1/4 w-18 h-18 bg-indigo-300/10 rounded-full opacity-30 animate-float delay-700"></div>
          <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-teal-300/10 rounded-full opacity-40 animate-float delay-1200"></div>
          <div className="absolute bottom-1/4 left-1/3 w-22 h-22 bg-blue-400/10 rounded-full opacity-20 animate-float delay-900"></div>
          <div className="absolute top-40 left-1/2 w-10 h-10 bg-purple-400/10 rounded-full opacity-50 animate-float delay-300"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Headings with Gradient Text - Enhanced for visibility */}
            <div className="space-y-6 mb-8">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight drop-shadow-2xl">
                <span className="block animate-slide-in-left bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Premium
                </span>
                <span className="block animate-slide-in-right delay-200 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  Collection
                </span>
              </h1>
            </div>

            {/* Description Text */}
            <p className="text-xl text-white mb-12 max-w-3xl mx-auto animate-fade-in-up delay-400 drop-shadow-lg font-medium">
              Discover excellence in every detail
              <span className="block text-white/90 mt-2">
                Elevate your experience with our curated selection
              </span>
            </p>

            {/* Animated CTA Buttons - Single row on all devices */}
            <div className="flex flex-row flex-wrap gap-4 justify-center animate-fade-in-up delay-600">
              <button 
                onClick={navigateToProducts}
                className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 sm:px-12 py-3 sm:py-4 rounded-2xl font-semibold transform hover:scale-105 transition-all cursor-pointer border-2 border-white/40 hover:border-white/80 hover:shadow-2xl shadow-lg text-sm sm:text-base flex-1 min-w-[140px] max-w-[280px]"
              >
                Explore Collection
              </button>
              <button className="bg-white/20 border-2 border-white/60 text-white px-6 sm:px-12 py-3 sm:py-4 rounded-2xl font-semibold hover:bg-white/30 hover:border-white/90 transition-all backdrop-blur-sm text-sm sm:text-base flex-1 min-w-[140px] max-w-[280px]">
                Learn More
              </button>
            </div>

            {/* Stats Section */}
            {/* <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 animate-fade-in-up delay-800">
              <div className="text-center bg-white/25 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg hover:bg-white/35 transition-colors">
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-white/90 text-sm">Happy Customers</div>
              </div>
              <div className="text-center bg-white/25 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg hover:bg-white/35 transition-colors">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-white/90 text-sm">Premium Products</div>
              </div>
              <div className="text-center bg-white/25 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg hover:bg-white/35 transition-colors">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-white/90 text-sm">Expert Support</div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Category-based Products Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">Explore Collections</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Explore our carefully curated collections
            </p>
          </div>

          {/* Categories show immediately one by one with staggered animation */}
          <div className="space-y-16">
            {featuredCategories.map((category, index) => (
              <div 
                key={category._id} 
                className="animate-fade-in-up" 
                style={{ 
                  animationDelay: `${index * 500}ms`, // Staggered loading effect
                  animationFillMode: 'both'
                }}
              >
                {/* Category Header - Shows immediately */}
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-black mb-3">{category.name}</h3>
                </div>

                {/* Products Grid for this Category - FILTERS HIDDEN */}
                <ProductGrid 
                  category={category._id} 
                  limit={6} 
                  hideFilters={true}  // This hides all filters on home page
                />
                
                {/* View More Button */}
                <div className="text-center mt-8">
                  <button 
                    onClick={() => router.push(`/products?category=${category.slug}`)}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl shadow-lg mt-5 cursor-pointer"
                  >
                    View All {category.name}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Interactive Cards */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We're committed to providing the best shopping experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                icon: Truck, 
                color: 'blue',
                gradient: 'from-blue-500 to-blue-600',
                title: 'Free Shipping', 
                desc: 'Free delivery on all orders over $50. Fast and reliable shipping to your doorstep.',
                highlight: 'No hidden fees'
              },
              { 
                icon: Shield, 
                color: 'blue',
                gradient: 'from-blue-500 to-purple-600',
                title: 'Secure Payment', 
                desc: 'Your data is protected with bank-level security. Shop with complete peace of mind.',
                highlight: '100% secure'
              },
              { 
                icon: Clock, 
                color: 'purple',
                gradient: 'from-purple-500 to-purple-600',
                title: 'Easy Returns', 
                desc: 'Not happy? Return within 30 days for a full refund. No questions asked.',
                highlight: '30-day policy'
              },
            ].map((feature, index) => (
              <div 
                key={index}
                className="group relative rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-white/20 hover:border-white/40 overflow-hidden"
              >
                {/* Card Background matching hero */}
                <div className="absolute inset-0 z-0">
                  <div className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{backgroundImage: 'url("/api/placeholder/1920/1080")'}}>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 to-purple-600/60"></div>
                  </div>
                </div>

                {/* Floating circles for card */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-4 right-4 w-4 h-4 bg-blue-400 rounded-full opacity-40 animate-float"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 bg-purple-400 rounded-full opacity-30 animate-float delay-1000"></div>
                </div>

                {/* Hover Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}>
                    <feature.icon className="text-white" size={28} />
                    <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
                  </div>

                  {/* Text Content */}
                  <h3 className="text-xl font-bold text-white mb-3 text-center group-hover:text-blue-100 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-blue-100 text-center mb-4 leading-relaxed">
                    {feature.desc}
                  </p>
                  <div className="text-center">
                    <span className="inline-block bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full border border-white/30">
                      {feature.highlight}
                    </span>
                  </div>
                </div>

                {/* Hover Effect Line */}
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r ${feature.gradient} group-hover:w-3/4 transition-all duration-500 rounded-full z-10`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }

        .delay-800 {
          animation-delay: 0.8s;
          opacity: 0;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}